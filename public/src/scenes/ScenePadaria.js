export default class ScenePadaria extends Phaser.Scene {
  constructor() {
    super({ key: 'ScenePadaria' });
  }
 
  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
  }
 
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;
 
    this.load.maxParallelDownloads = 2;
 
    this.load.on("loaderror", (arquivo) => {
      console.error("[ScenePadaria] Erro ao carregar:", arquivo.key, arquivo.src);
    });
 
    this.load.tilemapTiledJSON("padaria", "src/assets/imagens/mapsjson/tileMaps/padaria.tmj");
 
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
    // ✅ FIX: mapa declarado PRIMEIRO, antes de qualquer uso
    const mapa = this.make.tilemap({ key: "padaria" });
    this.mapa = mapa;
 
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
 
    // ✅ mapa já declarado, sem erro
    this.add
      .rectangle(0, 0, mapa.widthInPixels + 200, mapa.heightInPixels + 200, 0x888888)
      .setOrigin(0, 0);
 
    // Sem colisão
this._criarCamada(mapa, "Chão",              tilesets);
this._criarCamada(mapa, "ParedeSemColisão1", tilesets); // ✅ com "1"
this._criarCamada(mapa, "ParedeSemColisão2", tilesets); // ✅ com "2"
this._criarCamada(mapa, "ObjSemColisao1",    tilesets); // ✅ sem acento no "a"
this._criarCamada(mapa, "ObjSemColisao2",    tilesets); // ✅ sem acento no "a"
this._criarCamada(mapa, "Itens",             tilesets);
this._criarCamada(mapa, "Itens2",            tilesets);
this._criarCamada(mapa, "Vidro",             tilesets);

// Com colisão
const paredeC = this._criarCamada(mapa, "ParedeComColisão", tilesets);
const objC    = this._criarCamada(mapa, "ObjComColisao",    tilesets); // ✅ sem acento no "a"
const bordaC  = this._criarCamada(mapa, "Bordas",           tilesets);


    [paredeC, objC, objC2, bordaC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));
 
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`esp_andar_${dir}`)) {
        this.anims.create({
          key: `esp_andar_${dir}`,
          frames: [
            { key: `esp_${dir}_1` },
            { key: `esp_${dir}_2` },
            { key: `esp_${dir}_3` },
            { key: `esp_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });
 
    const spawnX = 124;
    const spawnY = 183;
 
    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);
 
    const pontosColisao = [
      { x: 100, y: 56, w: 16, h: 16 },
      { x: 91,  y: 59, w: 16, h: 16 },
      { x: 65,  y: 84, w: 16, h: 16 },
      { x: 45,  y: 84, w: 16, h: 16 },
      { x: 25,  y: 84, w: 16, h: 16 },
    ];
 
    this.colisoesExtras = [];
    pontosColisao.forEach(({ x, y, w, h }) => {
      const zona = this.add.zone(x, y, w, h).setOrigin(0, 0);
      this.physics.add.existing(zona, true);
      this.physics.add.collider(this.personagem, zona);
      this.colisoesExtras.push(zona);
    });
 
    const tamTile      = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite  = this.personagem.height;
 
    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);
 
    [paredeC, objC, objC2, bordaC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));
 
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima:     Phaser.Input.Keyboard.KeyCodes.W,
      baixo:    Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita:  Phaser.Input.Keyboard.KeyCodes.D,
    });
 
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.centerOn(mapa.widthInPixels / 2, mapa.heightInPixels / 2);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);
 
    this.zonasSaida = this._criarZonasSaida(mapa);
    console.log('[ScenePadaria] Zonas de saída:', this.zonasSaida);
 
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
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
 
    this.direcaoAtual = "frente";
 
    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "4px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);
  }
 
  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) console.warn("[ScenePadaria] Camada não encontrada:", nome);
      return camada;
    } catch (erro) {
      console.error("[ScenePadaria] Erro ao criar camada", nome, ":", erro.message);
      return null;
    }
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
          const gid = typeof cell === "number" ? cell : (cell?.index || 0);
          if (gid > 0) usados.add(gid);
        }
      }
    });
    return usados;
  }
 
  _otimizarTilesetsPorUso(mapa) {
    const defs = [
      { tmjName: "Interiors_16x16",                    baseKey: "super_interiors"   },
      { tmjName: "Room_Builder_16x16",                 baseKey: "super_roombuilder" },
      { tmjName: "Modern_Exteriors_Complete_Tileset",  baseKey: "super_exteriors"   },
    ];
 
    this._tilesetKeys = {};
    const usados = this._coletarGidsUsados(mapa);
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
 
      const idx = tilesetsOrdenados.findIndex((t) => t.name === def.tmjName);
      const startGid = ts.firstgid || 1;
      const endGid =
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
 
      const tilesNecessarios = maiorGidUsado - startGid + 1;
      const linhasNecessarias = Math.max(1, Math.ceil(tilesNecessarios / columns));
 
      const cropWCalc = margin + columns * (tileW + spacing) - spacing + margin;
      const cropHCalc = margin + linhasNecessarias * (tileH + spacing) - spacing + margin;
 
      const cropW = Math.min(source.width,  Math.max(tileW, cropWCalc));
      const cropH = Math.min(source.height, Math.max(tileH, cropHCalc));
 
      if (cropW >= source.width && cropH >= source.height) return;
 
      const cutKey = `${def.baseKey}_cut`;
      if (this.textures.exists(cutKey)) this.textures.remove(cutKey);
 
      const canvasTex = this.textures.createCanvas(cutKey, cropW, cropH);
      const ctx = canvasTex.getContext();
      ctx.clearRect(0, 0, cropW, cropH);
      ctx.drawImage(source, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
      canvasTex.refresh();
 
      this._tilesetKeys[def.tmjName] = cutKey;
    });
  }
 
  _criarZonasSaida(mapa) {
    const zonas = [];
    const nomes = new Set(["Saida", "Saídas", "Saidas", "PortaSaida", "PortaSaída", "saida", "saidas"]);
 
    const camadaObj = (mapa.objects || []).find((o) => nomes.has(o.name));
    if (camadaObj?.objects?.length) {
      camadaObj.objects.forEach((obj) => {
        const w = obj.width  || 24;
        const h = obj.height || 14;
        const x = obj.x || 0;
        const y = obj.gid ? (obj.y || 0) - h : (obj.y || 0);
        zonas.push(new Phaser.Geom.Rectangle(x, y, w, h));
      });
    }
 
    // ✅ fallback manual na posição conhecida da porta
    if (!zonas.length) {
      zonas.push(new Phaser.Geom.Rectangle(112, 176, 24, 14));
      console.warn('[ScenePadaria] Zona de saída não encontrada no mapa, usando fallback manual.');
    }
 
    return zonas;
  }
 
  update() {
    const velocidade = 150;
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
 
    const sairComE = dentroSaida && Phaser.Input.Keyboard.JustDown(this.teclaE);
 
    if (!this.transicionando && sairComE) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        // ✅ Spawn correto ao voltar para SceneCidade
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo:   this.prefixoEscolhido,
          spawnX:    76,
          spawnY:    232,
        });
      });
    }
 
    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
 