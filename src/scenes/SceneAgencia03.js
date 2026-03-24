export default class SceneAgencia03 extends Phaser.Scene {
  constructor() {
    super({ key: "SceneAgencia03" });
  }

  // Registra os dados do personagem para uso na cena
  init(dados = {}) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";

    // Posição de spawn opcional (vinda de outra cena)
    this.spawnXInicial = dados.spawnX || null;
    this.spawnYInicial = dados.spawnY || null;
  }

  // Carrega os recursos necessários para a cena
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneAgencia03] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // ── Tilemap ──────────────────────────────────────────────────────────────
    this.load.tilemapTiledJSON(
      "agencia03",
      "src/assets/imagens/mapsjson/tileMaps/agencia03.tmj",
    );

    // O tilemap da agência usa apenas dois tilesets (Room_Builder + Interiors)
    this.load.image(
      "agencia_roombuilder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "agencia_interiors",
      "src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png",
    );

    // ── Spritesheet do personagem ─────────────────────────────────────────────
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `esp_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `esp_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `esp_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `esp_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  // Cria a cena, o mapa, o personagem e as interações
  create() {
    const mapa = this.make.tilemap({ key: "agencia03" });
    this.mapa = mapa;

    this._otimizarTilesetsPorUso(mapa);

    // O tilemap da agência declara os tilesets nesta ordem:
    //   firstgid:    1 → Room_Builder_16x16
    //   firstgid: 8589 → Interiors_16x16
    const tsRoomBuilder = mapa.addTilesetImage(
      "Room_Builder_16x16",
      this._keyTileset("Room_Builder_16x16", "agencia_roombuilder"),
    );
    const tsInteriors = mapa.addTilesetImage(
      "Interiors_16x16",
      this._keyTileset("Interiors_16x16", "agencia_interiors"),
    );

    const tilesets = [tsRoomBuilder, tsInteriors].filter(Boolean);

    // Fundo neutro para evitar bordas pretas em telas maiores que o mapa
    this.add
      .rectangle(
        0,
        0,
        mapa.widthInPixels + 200,
        mapa.heightInPixels + 200,
        0x888888,
      )
      .setOrigin(0, 0);

    // ── Camadas sem colisão (ordem de profundidade / render) ──────────────────
    // Nomes extraídos do TMJ fornecido
    this._criarCamada(mapa, "N - Chao",                   tilesets);
    this._criarCamada(mapa, "N - Tapete",                 tilesets);
    this._criarCamada(mapa, "N - PardeSemColid",          tilesets);
    this._criarCamada(mapa, "N - Linha",                  tilesets);
    this._criarCamada(mapa, "N - Escada",                 tilesets);
    this._criarCamada(mapa, "N - ObjetSemColid_baixo",    tilesets);
    this._criarCamada(mapa, "N - ObjetSemColid_cima",     tilesets);
    this._criarCamada(mapa, "PLAYER",                     tilesets); // camada de referência de spawn

    // ── Camadas COM colisão ───────────────────────────────────────────────────
    // O TMJ usa "C - ParedeComColid" e "C - LinhaDaParede" no lugar de
    // ParedeComColisão / Bordas. "C - Escada" também tem colisão no mapa.
    const paredeC  = this._criarCamada(mapa, "C - ParedeComColid",  tilesets);
    const linhaC   = this._criarCamada(mapa, "C - LinhaDaParede",   tilesets);
    const escadaC  = this._criarCamada(mapa, "C - Escada",          tilesets);
    const objetC   = this._criarCamada(mapa, "C - ObjetComColid_cima", tilesets);

    [paredeC, linhaC, escadaC, objetC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));

    // ── Animações do personagem ───────────────────────────────────────────────
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

    // ── Spawn do personagem ───────────────────────────────────────────────────
    // Usa a posição passada por outra cena; caso contrário, usa o centro do mapa
    const spawnX = this.spawnXInicial ?? mapa.widthInPixels  / 2;
    const spawnY = this.spawnYInicial ?? mapa.heightInPixels / 2;

    // ── Personagem e física ───────────────────────────────────────────────────
    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);

    const tamTile     = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite  = this.personagem.height;

    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    // Colisões com camadas
    [paredeC, linhaC, escadaC, objetC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));

    // ── Controles ─────────────────────────────────────────────────────────────
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd   = this.input.keyboard.addKeys({
      cima:     Phaser.Input.Keyboard.KeyCodes.W,
      baixo:    Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita:  Phaser.Input.Keyboard.KeyCodes.D,
    });

    // ── Câmera ────────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // ── Zona de saída ─────────────────────────────────────────────────────────
    // TODO: ajuste x/y/raio depois de testar no jogo e localizar a porta real
    this.zonasSaida = this._criarZonasSaida();

    this.labelSair = this.add
      .text(0, 0, "[Saída]", {
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
    this.direcaoAtual    = "frente";

    // ── Debug de coordenadas ──────────────────────────────────────────────────
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

  // ── Funções auxiliares ────────────────────────────────────────────────────

  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) {
        console.warn("[SceneAgencia03] Camada não encontrada:", nome);
      }
      return camada;
    } catch (erro) {
      console.error(
        "[SceneAgencia03] Erro ao criar camada",
        nome,
        ":",
        erro.message,
      );
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
          const gid  = typeof cell === "number" ? cell : cell?.index || 0;
          if (gid > 0) usados.add(gid);
        }
      }
    });
    return usados;
  }

  _otimizarTilesetsPorUso(mapa) {
    // Apenas os dois tilesets usados pelo mapa da agência
    const defs = [
      { tmjName: "Room_Builder_16x16", baseKey: "agencia_roombuilder" },
      { tmjName: "Interiors_16x16",    baseKey: "agencia_interiors"   },
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
        Math.max(
          1,
          Math.floor(
            (source.width - margin * 2 + spacing) / (tileW + spacing),
          ),
        );

      const tilesNecessarios = maiorGidUsado - startGid + 1;
      const linhasNecessarias = Math.max(
        1,
        Math.ceil(tilesNecessarios / columns),
      );

      const cropWCalc =
        margin + columns * (tileW + spacing) - spacing + margin;
      const cropHCalc =
        margin + linhasNecessarias * (tileH + spacing) - spacing + margin;

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

  // TODO: ajuste x/y/raio ao localizar a porta real no mapa da agência
  _criarZonasSaida() {
    return [
      { x: 0, y: 0, raio: 14, destino: "SceneCidade", spawnX: 0, spawnY: 0 },
    ];
  }

  // ── Loop principal ────────────────────────────────────────────────────────

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

    // ── Detecção da zona de saída ─────────────────────────────────────────────
    const zonaSaidaAtual = (this.zonasSaida || []).find((z) => {
      const d = Phaser.Math.Distance.Between(
        personagem.x,
        personagem.y,
        z.x,
        z.y,
      );
      return d <= z.raio;
    });

    const dentroSaida = !!zonaSaidaAtual;

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    if (dentroSaida) {
      this.labelSair.setPosition(personagem.x, personagem.y - 10);
    }

    // Transição automática ao entrar na zona de saída
    if (!this.transicionando && dentroSaida && zonaSaidaAtual) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start(zonaSaidaAtual.destino || "SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo:   this.prefixoEscolhido,
          spawnX:    zonaSaidaAtual.spawnX ?? 0,
          spawnY:    zonaSaidaAtual.spawnY ?? 0,
        });
      });
    }

    // ── Debug de coordenadas ──────────────────────────────────────────────────
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}