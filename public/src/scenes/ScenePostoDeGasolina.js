export default class ScenePostoDeGasolina extends Phaser.Scene {
  constructor() {
    super({ key: 'ScenePostoDeGasolina' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    this.load.on("loaderror", (arquivo) => {
      console.error("[ScenePostoGasolina] Erro ao carregar:", arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON("posto", "src/assets/imagens/mapsjson/tileMaps/postoGasolina.tmj");

    this.load.image("super_interiors",   "src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png");
    this.load.image("super_roombuilder", "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png");
    this.load.image("super_exteriors",   "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Complete_Tileset.png");

    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`esp_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`esp_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`esp_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`esp_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  create() {
    const mapa = this.make.tilemap({ key: "posto" });
    this.mapa  = mapa;

    // Mapa infinite com startx:-16 starty:-16 — chunks comecam 16 tiles antes da origem
    const offsetX = 16 * (mapa.tileWidth  || 16); // 256px
    const offsetY = 16 * (mapa.tileHeight || 16); // 256px

    this._otimizarTilesetsPorUso(mapa);

    const tsInteriors = mapa.addTilesetImage(
      "Interiors_16x16",
      this._keyTileset("Interiors_16x16", "super_interiors"),
    );
    const tsRoomBuilder = mapa.addTilesetImage(
      "Room_Builder_16x16",
      this._keyTileset("Room_Builder_16x16", "super_roombuilder"),
    );
    const tsExteriors = mapa.addTilesetImage(
      "Modern_Exteriors_Complete_Tileset",
      this._keyTileset("Modern_Exteriors_Complete_Tileset", "super_exteriors"),
    );

    const tilesets = [tsInteriors, tsRoomBuilder, tsExteriors].filter(Boolean);

    // Fundo escuro atras do mapa
    this.add
      .rectangle(-256, -256, mapa.widthInPixels + 512, mapa.heightInPixels + 512, 0x222222)
      .setOrigin(0, 0);

    // -----------------------------------------------------------------
    // Ordem de renderizacao (baixo -> cima):
    //   1. N- Chao                      sem colisao
    //   2. N - ParedeSemColid           sem colisao
    //   3. N - ObjetosSemColid_embaixo  sem colisao, atras do player
    //   4. C- ParedeComColid            COM colisao
    //   5. C - Objetos com Colid        COM colisao
    //   6. N - ObjetosSemColid_emcima   sem colisao, na frente do player (depth 10)
    //   7. N - ProdutosSemColid         sem colisao, na frente do player (depth 10)
    // -----------------------------------------------------------------

    this._criarCamada(mapa, "N- Ch\u00e3o",                   tilesets, offsetX, offsetY);
    this._criarCamada(mapa, "N - ParedeSemColid",             tilesets, offsetX, offsetY);
    this._criarCamada(mapa, "N - ObjetosSemColid_embaixo",    tilesets, offsetX, offsetY);

    const paredeC = this._criarCamada(mapa, "C- ParedeComColid",     tilesets, offsetX, offsetY);
    const objC    = this._criarCamada(mapa, "C - Objetos com Colid", tilesets, offsetX, offsetY);

    [paredeC, objC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));

    const emCima   = this._criarCamada(mapa, "N - ObjetosSemColid_emcima", tilesets, offsetX, offsetY);
    const produtos = this._criarCamada(mapa, "N - ProdutosSemColid",       tilesets, offsetX, offsetY);

    if (emCima)   emCima.setDepth(10);
    if (produtos) produtos.setDepth(10);

    // --- Animacoes do personagem ---
    ["frente", "tras", "direita", "esquerda"].forEach((dir) => {
      if (!this.anims.exists(`esp_andar_${dir}`)) {
        this.anims.create({
          key: `esp_andar_${dir}`,
          frames: [1, 2, 3, 4].map((i) => ({ key: `esp_${dir}_${i}` })),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // --- Personagem ---
    // Spawn no centro da area com conteudo (offset + meio do mapa)
    const spawnX = offsetX + (mapa.width  * mapa.tileWidth)  / 2;
    const spawnY = offsetY + (mapa.height * mapa.tileHeight) / 2;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);
    this.personagem.setDepth(5);

    // Tamanho: 1 tile largura (16px) x 2 tiles altura (32px)
    const tamTile = mapa.tileWidth || 16;
    this.personagem.setDisplaySize(tamTile, tamTile * 2);

    // Hitbox nos pes
    const sx  = this.personagem.scaleX;
    const sy  = this.personagem.scaleY;
    const hbW = 10 / sx;
    const hbH =  8 / sy;
    this.personagem.body.setSize(hbW, hbH);
    this.personagem.body.setOffset(
      (this.personagem.width  - hbW) / 2,
       this.personagem.height - hbH,
    );

    [paredeC, objC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));

    // --- Controles ---
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd   = this.input.keyboard.addKeys({
      cima:     Phaser.Input.Keyboard.KeyCodes.W,
      baixo:    Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita:  Phaser.Input.Keyboard.KeyCodes.D,
    });

    // --- Camera ---
    const cam = this.cameras.main;
    cam.setZoom(4);
    cam.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    cam.startFollow(this.personagem, true, 0.1, 0.1);
    cam.fadeIn(600, 0, 0, 0);

    // --- Zona de saida ---
    this.zonasSaida = this._criarZonasSaida(offsetX, offsetY);

    this.labelSair = this.add
      .text(0, 0, "[E] Sair", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.transicionando  = false;
    this.dentroZonaSaida = false;
    this.teclaE          = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.direcaoAtual    = "frente";

    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "4px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);

    console.log("[ScenePostoGasolina] widthInPixels:", mapa.widthInPixels, "heightInPixels:", mapa.heightInPixels);
    console.log("[ScenePostoGasolina] offsetX:", offsetX, "offsetY:", offsetY);
    console.log("[ScenePostoGasolina] Spawn: x =", spawnX, "y =", spawnY);
  }

  _criarCamada(mapa, nome, tilesets, offsetX = 0, offsetY = 0) {
    try {
      const existe = mapa.layers.some((l) => l.name === nome);
      if (!existe) {
        console.warn(`[ScenePostoGasolina] AUSENTE no TMJ: "${nome}"`);
        console.log("[ScenePostoGasolina] Camadas disponiveis:", mapa.layers.map((l) => l.name));
        return null;
      }
      const camada = mapa.createLayer(nome, tilesets, offsetX, offsetY);
      if (!camada) {
        console.error(`[ScenePostoGasolina] FALHA ao criar: "${nome}"`);
        return null;
      }
      console.log(`[ScenePostoGasolina] OK: "${nome}"`);
      return camada;
    } catch (erro) {
      console.error(`[ScenePostoGasolina] ERRO "${nome}":`, erro.message);
      return null;
    }
  }

  // Zona de saida manual — ajuste portaTileX/portaTileY conforme
  // a posicao real da porta no seu mapa (use o debugTxt x/y para descobrir)
  _criarZonasSaida(offsetX, offsetY) {
    const tileW = this.mapa.tileWidth  || 16;
    const tileH = this.mapa.tileHeight || 16;

    // Porta inferior do posto — ajuste estes valores se necessario
    const portaTileX = 4;
    const portaTileY = 11;

    const zona = new Phaser.Geom.Rectangle(
      offsetX + portaTileX * tileW,
      offsetY + portaTileY * tileH,
      tileW * 2,
      tileH,
    );

    console.log("[ScenePostoGasolina] Zona de saida:", zona);
    return [zona];
  }

  _keyTileset(tmjName, fallbackKey) {
    return (this._tilesetKeys && this._tilesetKeys[tmjName]) || fallbackKey;
  }

  _coletarGidsUsados(mapa) {
    const usados = new Set();
    (mapa.layers || []).forEach((layer) => {
      const data = layer.data || [];
      for (let y = 0; y < data.length; y++) {
        const row = data[y] || [];
        for (let x = 0; x < row.length; x++) {
          const cell = row[x];
          const gid  = typeof cell === "number" ? cell : (cell?.index || 0);
          if (gid > 0) usados.add(gid);
        }
      }
    });
    return usados;
  }

  _otimizarTilesetsPorUso(mapa) {
    const defs = [
      { tmjName: "Interiors_16x16",                   baseKey: "super_interiors"   },
      { tmjName: "Room_Builder_16x16",                baseKey: "super_roombuilder" },
      { tmjName: "Modern_Exteriors_Complete_Tileset", baseKey: "super_exteriors"   },
    ];

    this._tilesetKeys = {};
    const usados            = this._coletarGidsUsados(mapa);
    const tilesetsOrdenados = [...(mapa.tilesets || [])].sort(
      (a, b) => (a.firstgid || 0) - (b.firstgid || 0),
    );

    defs.forEach((def) => {
      this._tilesetKeys[def.tmjName] = def.baseKey;

      if (!this.textures.exists(def.baseKey)) return;
      const ts = tilesetsOrdenados.find((t) => t.name === def.tmjName);
      if (!ts) return;

      const source = this.textures.get(def.baseKey).getSourceImage();
      if (!source?.width || !source?.height) return;

      const idx      = tilesetsOrdenados.findIndex((t) => t.name === def.tmjName);
      const startGid = ts.firstgid || 1;
      const endGid   =
        idx < tilesetsOrdenados.length - 1
          ? tilesetsOrdenados[idx + 1].firstgid - 1
          : Number.MAX_SAFE_INTEGER;

      let maiorGidUsado = 0;
      usados.forEach((gid) => {
        if (gid >= startGid && gid <= endGid && gid > maiorGidUsado) {
          maiorGidUsado = gid;
        }
      });

      if (!maiorGidUsado) return;

      const tileW   = ts.tilewidth  || 16;
      const tileH   = ts.tileheight || 16;
      const margin  = ts.margin     || 0;
      const spacing = ts.spacing    || 0;

      const columns =
        ts.columns ||
        Math.max(1, Math.floor((source.width - margin * 2 + spacing) / (tileW + spacing)));

      const tilesNecessarios  = maiorGidUsado - startGid + 1;
      const linhasNecessarias = Math.max(1, Math.ceil(tilesNecessarios / columns));

      const cropWCalc = margin + columns           * (tileW + spacing) - spacing + margin;
      const cropHCalc = margin + linhasNecessarias * (tileH + spacing) - spacing + margin;

      const cropW = Math.min(source.width,  Math.max(tileW, cropWCalc));
      const cropH = Math.min(source.height, Math.max(tileH, cropHCalc));

      if (cropW >= source.width && cropH >= source.height) return;

      const cutKey = `${def.baseKey}_cut`;
      if (this.textures.exists(cutKey)) this.textures.remove(cutKey);

      const canvasTex = this.textures.createCanvas(cutKey, cropW, cropH);
      const ctx       = canvasTex.getContext();
      ctx.clearRect(0, 0, cropW, cropH);
      ctx.drawImage(source, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
      canvasTex.refresh();

      this._tilesetKeys[def.tmjName] = cutKey;
    });
  }

  update() {
    const velocidade = 80;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("esp_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("esp_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("esp_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play("esp_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`esp_${this.direcaoAtual}_1`);
    }

    const dentroSaida = (this.zonasSaida || []).some((z) =>
      Phaser.Geom.Rectangle.Contains(z, personagem.x, personagem.y),
    );

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    if (dentroSaida) {
      this.labelSair.setPosition(personagem.x, personagem.y - 10);
    }

    if (!this.transicionando && dentroSaida && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo:   this.prefixoEscolhido,
          spawnX:    76,   // ajuste para o ponto de retorno correto na SceneCidade
          spawnY:    232,
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
