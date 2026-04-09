export default class SceneAgencia03 extends Phaser.Scene {
  constructor() {
    super({ key: "SceneAgencia03" });
  }

  // Registra os dados do spritePersonagem para uso na cena
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

    // Carrega o áudio da cena
    this.load.audio("trilhaAgencia03", "src/assets/audios/trilhaAgencia03.mp3");

    // ── Tilemap ──────────────────────────────────────────────────────────────
    this.load.tilemapTiledJSON(
      "agencia03",
      "src/assets/imagens/mapsjson/tileMaps/agencia03.tmj",
    );

    // O tilemap da agência usa Room_Builder + interiores fatiados (S1..S5)
    this.load.image(
      "agencia_roombuilder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "agencia_interiors_s1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png",
    );
    this.load.image(
      "agencia_interiors_s2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png",
    );
    this.load.image(
      "agencia_interiors_s3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png",
    );
    this.load.image(
      "agencia_interiors_s4",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png",
    );
    this.load.image(
      "agencia_interiors_s5",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png",
    );
    this.load.image(
      "npc_agencia03",
      "src/assets/imagens/imagensPersonagens/NPC/npcPJ1.png",
    );
    this.load.image(
      "npc_leticia",
      "src/assets/imagens/imagensPersonagens/NPC/Leticia/leticia_parado01.png",
    );
    this.load.image(
      "npc_pricila",
      "src/assets/imagens/imagensPersonagens/NPC/Pricila/pricila_andandofrente01 (parado01).png",
    );

    // ── Spritesheet do spritePersonagem ─────────────────────────────────────────────
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

  // Cria a cena, o mapa, o spritePersonagem e as interações
  create() {
    const mapa = this.make.tilemap({ key: "agencia03" });
    this.mapa = mapa;
    this._camadasCriadas = [];

    // Adiciona áudios a cena
    this.musica = this.sound.add("trilhaAgencia03", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    this._otimizarTilesetsPorUso(mapa);

    const OX = 1000;
    const OY = 1000;
    this.OX = OX;
    this.OY = OY;

    const tsRoomBuilder = mapa.addTilesetImage(
      "Room_Builder_16x16",
      this._keyTileset("Room_Builder_16x16", "agencia_roombuilder"),
    );
    const tsInteriorS1 = mapa.addTilesetImage(
      "interior_s1",
      this._keyTileset("interior_s1", "agencia_interiors_s1"),
    );
    const tsInteriorS2 = mapa.addTilesetImage(
      "interior_s2",
      this._keyTileset("interior_s2", "agencia_interiors_s2"),
    );
    const tsInteriorS3 = mapa.addTilesetImage(
      "interior_s3",
      this._keyTileset("interior_s3", "agencia_interiors_s3"),
    );
    const tsInteriorS4 = mapa.addTilesetImage(
      "interior_s4",
      this._keyTileset("interior_s4", "agencia_interiors_s4"),
    );
    const tsInteriorS5 = mapa.addTilesetImage(
      "interior_s5",
      this._keyTileset("interior_s5", "agencia_interiors_s5"),
    );

    const tilesets = [
      tsRoomBuilder,
      tsInteriorS1,
      tsInteriorS2,
      tsInteriorS3,
      tsInteriorS4,
      tsInteriorS5,
    ].filter(Boolean);

    // Definimos uma cor de fundo sólida e elegante para a cena
    this.cameras.main.setBackgroundColor("#3b3e4f");

    // ── Camadas sem colisão (ordem de profundidade / render) ──────────────────
    // Nomes extraídos do TMJ fornecido
    this._criarCamada(mapa, "N - Chao", tilesets, OX, OY);
    this._criarCamada(mapa, "N - Tapete", tilesets, OX, OY);
    this._criarCamada(mapa, "N - PardeSemColid", tilesets, OX, OY);
    this._criarCamada(mapa, "N - Linha", tilesets, OX, OY);
    this._criarCamada(mapa, "N - Escada", tilesets, OX, OY);
    this._criarCamada(mapa, "N - ObjetSemColid_baixo", tilesets, OX, OY);
    this._criarCamada(mapa, "N - ObjetSemColid_cima", tilesets, OX, OY);
    this._criarCamada(mapa, "PLAYER", tilesets, OX, OY);

    // ── Camadas COM colisão ───────────────────────────────────────────────────
    // O TMJ usa "C - ParedeComColid" e "C - LinhaDaParede" no lugar de
    // ParedeComColisão / Bordas. "C - Escada" também tem colisão no mapa.
    const paredeC = this._criarCamada(
      mapa,
      "C - ParedeComColid",
      tilesets,
      OX,
      OY,
    );
    const linhaC = this._criarCamada(
      mapa,
      "C - LinhaDaParede",
      tilesets,
      OX,
      OY,
    );
    const escadaC = this._criarCamada(mapa, "C - Escada", tilesets, OX, OY);
    const objetC = this._criarCamada(
      mapa,
      "C - ObjetComColid_cima",
      tilesets,
      OX,
      OY,
    );

    [paredeC, linhaC, escadaC, objetC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));

    // ── Animações do spritePersonagem ───────────────────────────────────────────────
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

    const limitesCena = this._calcularLimitesCena(mapa, OX, OY);

    // ── Spawn do spritePersonagem ───────────────────────────────────────────────────
    // Usa a posição passada por outra cena; caso contrário, usa o centro visual
    // do mapa já compensado pelo offset aplicado nas camadas (OX/OY).
    const temSpawnCustom =
      Number.isFinite(this.spawnXInicial) &&
      Number.isFinite(this.spawnYInicial);

    const SPAWN_PADRAO_X = OX + 443;
    const SPAWN_PADRAO_Y = OY + 262;

    const spawnX = temSpawnCustom
      ? this.spawnXInicial < 500 // Se vier de outra cena com coord baixa, provavelmente precisa de offset
        ? this.spawnXInicial + OX
        : this.spawnXInicial
      : SPAWN_PADRAO_X;
    const spawnY = temSpawnCustom
      ? this.spawnYInicial < 500
        ? this.spawnYInicial + OY
        : this.spawnYInicial
      : SPAWN_PADRAO_Y;

    // ── Personagem e física ───────────────────────────────────────────────────
    this.spritePersonagem = this.physics.add.sprite(
      spawnX,
      spawnY,
      "esp_frente_1",
    );
    this.spritePersonagem.setCollideWorldBounds(true);

    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.spritePersonagem.width;
    const alturaSprite = this.spritePersonagem.height;

    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.spritePersonagem.setScale(Math.max(escala, 0.04));
    this.spritePersonagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    // Colisões com camadas
    [paredeC, linhaC, escadaC, objetC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.spritePersonagem, c));

    // ── NPC Leticia ───────────────────────────────────────────────────────────
    this.npcLeticia = this.physics.add
      .staticImage(OX + 447, OY + 194, "npc_leticia")
      .setDepth(5);

    this.npcLeticia.setScale(0.045);
    this.npcLeticia.refreshBody();
    this.physics.add.collider(this.spritePersonagem, this.npcLeticia);

    // ── NPC Pricila ───────────────────────────────────────────────────────────
    this.npcPricila = this.physics.add
      .staticImage(OX + 227, OY + 126, "npc_pricila")
      .setDepth(5);

    this.npcPricila.setScale(0.045);
    this.npcPricila.refreshBody();
    this.physics.add.collider(this.spritePersonagem, this.npcPricila);

    this.labelNpcPricila = this.add
      .text(this.npcPricila.x, this.npcPricila.y, "[E] Falar", {
        fontSize: "5px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 2 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.exclamacaoNpcPricila = this.add
      .text(
        this.npcPricila.x,
        this.npcPricila.y - this.npcPricila.displayHeight * 0.5,
        "!",
        {
          fontSize: "24px",
          color: "#ffeb3b",
          stroke: "#000000",
          strokeThickness: 2,
          resolution: 4,
        },
      )
      .setDepth(21)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.tweenExclamacaoPricila = this.tweens.add({
      targets: this.exclamacaoNpcPricila,
      alpha: { from: 1, to: 0.25 },
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

    this.labelNpcLeticia = this.add
      .text(this.npcLeticia.x, this.npcLeticia.y, "[E] Falar", {
        fontSize: "5px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 2 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.exclamacaoNpcLeticia = this.add
      .text(
        this.npcLeticia.x,
        this.npcLeticia.y - this.npcLeticia.displayHeight * 0.5,
        "!",
        {
          fontSize: "24px",
          color: "#ffeb3b",
          stroke: "#000000",
          strokeThickness: 2,
          resolution: 4,
        },
      )
      .setDepth(21)
      .setOrigin(0.5, 1);

    this.tweenExclamacaoLeticia = this.tweens.add({
      targets: this.exclamacaoNpcLeticia,
      alpha: { from: 1, to: 0.25 },
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

    // ── Controles ─────────────────────────────────────────────────────────────
    this.teclas = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // ── Câmera ────────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.spritePersonagem);
    this.cameras.main.setZoom(5);
    
    // Assegura que a câmera mostre o mapa com um recuo (padding) de 100px para o fundo ser visível
    const padding = 100;
    this.cameras.main.setBounds(
      limitesCena.x - padding,
      limitesCena.y - padding,
      limitesCena.width + padding * 2,
      limitesCena.height + padding * 2,
    );
    const alturaLimite = 1306 - limitesCena.y;
    this.physics.world.setBounds(
      limitesCena.x,
      limitesCena.y,
      limitesCena.width,
      alturaLimite,
    );
    this.cameras.main.centerOn(spawnX, spawnY);

    // ── Zona de saída ─────────────────────────────────────────────────────────
    // TODO: ajuste x/y/raio depois de testar no jogo e localizar a porta real
    this.zonasSaida = this._criarZonasSaida();

    this.labelSair = this.add
      .text(0, 0, "[E] Sair", {
        fontSize: "5px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 2 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.transicionando = false;
    this.dentroZonaSaida = false;
    this.direcaoAtual = "frente";
    this.falouComLeticia = false;
    this.falouComPricila =
      this.registry.get("agencia03_dialogo_concluido") === true;

    // Se o diálogo já foi concluído anteriormente (conforme registry), remove exclamacoes
    if (this.falouComPricila) {
      this.falouComLeticia = true; 
      this.exclamacaoNpcLeticia.setVisible(false);
      if (this.tweenExclamacaoLeticia) this.tweenExclamacaoLeticia.stop();
      this.exclamacaoNpcPricila.setVisible(false);
      if (this.tweenExclamacaoPricila) this.tweenExclamacaoPricila.stop();
    }

    // Pausa  a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
    });

  }

  // ── Funções auxiliares ────────────────────────────────────────────────────

  _criarCamada(mapa, nome, tilesets, ox = 0, oy = 0) {
    try {
      const camada = mapa.createLayer(nome, tilesets, ox, oy);
      if (!camada)
        console.warn("[SceneAgencia03] Camada não encontrada:", nome);
      if (camada && this._camadasCriadas) this._camadasCriadas.push(camada);
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

  _calcularLimitesCena(mapa, ox, oy) {
    const fallback = {
      x: ox,
      y: oy,
      width: Math.max(1, mapa.widthInPixels),
      height: Math.max(1, mapa.heightInPixels),
    };

    const camadas = (this._camadasCriadas || []).filter(Boolean);
    if (!camadas.length) return fallback;

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    camadas.forEach((camada) => {
      const b = camada.getBounds();
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.right);
      maxY = Math.max(maxY, b.bottom);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return fallback;

    return {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }

  _coletarGidsUsados(mapa) {
    const usados = new Set();
    (mapa.layers || []).forEach((layer) => {
      const data = layer.data || [];
      for (let y = 0; y < data.length; y++) {
        const row = data[y] || [];
        for (let x = 0; x < row.length; x++) {
          const cell = row[x];
          const gid = typeof cell === "number" ? cell : cell?.index || 0;
          if (gid > 0) usados.add(gid);
        }
      }
    });
    return usados;
  }

  _otimizarTilesetsPorUso(mapa) {
    // Tilesets usados pelo mapa da agência
    const defs = [
      { tmjName: "Room_Builder_16x16", baseKey: "agencia_roombuilder" },
      { tmjName: "interior_s1", baseKey: "agencia_interiors_s1" },
      { tmjName: "interior_s2", baseKey: "agencia_interiors_s2" },
      { tmjName: "interior_s3", baseKey: "agencia_interiors_s3" },
      { tmjName: "interior_s4", baseKey: "agencia_interiors_s4" },
      { tmjName: "interior_s5", baseKey: "agencia_interiors_s5" },
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

      const tileW = ts.tilewidth || 16;
      const tileH = ts.tileheight || 16;
      const margin = ts.margin || 0;
      const spacing = ts.spacing || 0;

      const columns =
        ts.columns ||
        Math.max(
          1,
          Math.floor((source.width - margin * 2 + spacing) / (tileW + spacing)),
        );

      const tilesNecessarios = maiorGidUsado - startGid + 1;
      const linhasNecessarias = Math.max(
        1,
        Math.ceil(tilesNecessarios / columns),
      );

      const cropWCalc = margin + columns * (tileW + spacing) - spacing + margin;
      const cropHCalc =
        margin + linhasNecessarias * (tileH + spacing) - spacing + margin;

      const cropW = Math.min(source.width, Math.max(tileW, cropWCalc));
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

  // TODO: ajuste x/y/raio ao localizar a porta real no mapa da agência
  _criarZonasSaida() {
    return [
      {
        x: 1436,
        y: 1289,
        raio: 20,
        destino: "SceneCidade",
        spawnX: 2486,
        spawnY: 792,
      },
    ];
  }

  // ── Loop principal ────────────────────────────────────────────────────────

  update() {
    const velocidade = 150;
    const { teclas, spritePersonagem } = this;

    if (Phaser.Input.Keyboard.JustDown(this.teclaF)) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }

    spritePersonagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown) {
      spritePersonagem.setVelocityX(-velocidade);
      spritePersonagem.anims.play("esp_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown) {
      spritePersonagem.setVelocityX(velocidade);
      spritePersonagem.anims.play("esp_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown) {
      spritePersonagem.setVelocityY(-velocidade);
      if (!movendo) spritePersonagem.anims.play("esp_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown) {
      spritePersonagem.setVelocityY(velocidade);
      if (!movendo) spritePersonagem.anims.play("esp_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      spritePersonagem.anims.stop();
      spritePersonagem.setTexture(`esp_${this.direcaoAtual}_1`);
    }

    // ── Interação com Leticia ───────────────────────────────────────────────
    const distLeticia = Phaser.Math.Distance.Between(
      spritePersonagem.x,
      spritePersonagem.y,
      this.npcLeticia.x,
      this.npcLeticia.y,
    );
    const pertoLeticia = distLeticia < 60;

    if (pertoLeticia !== this.perto_leticia) {
      this.perto_leticia = pertoLeticia;
      this.labelNpcLeticia.setVisible(pertoLeticia && !this.dentroZonaSaida);
    }

    if (pertoLeticia) {
      this.labelNpcLeticia.setPosition(this.npcLeticia.x, this.npcLeticia.y + 15);
    }

    if (pertoLeticia && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.falouComLeticia = true;
      this.exclamacaoNpcLeticia.setVisible(false);
      if (this.tweenExclamacaoLeticia) this.tweenExclamacaoLeticia.stop();
      this.scene.pause();
      this.scene.launch("SceneDialogoAgencia03", {
        cenaOrigem: "SceneAgencia03",
        npc: "GG", // Leticia Gerente
      });
    }

    if (!this.falouComLeticia && this.exclamacaoNpcLeticia) {
      this.exclamacaoNpcLeticia.setPosition(
        this.npcLeticia.x,
        this.npcLeticia.y - this.npcLeticia.displayHeight * 0.5,
      );
    }

    // ── Interação com Pricila ────────────────────────────────────────────────
    if (this.falouComLeticia) {
      const distPricila = Phaser.Math.Distance.Between(
        spritePersonagem.x,
        spritePersonagem.y,
        this.npcPricila.x,
        this.npcPricila.y,
      );
      const pertoPricila = distPricila < 60;

      if (!this.falouComPricila) {
        this.exclamacaoNpcPricila.setVisible(true);
      }

      if (pertoPricila !== this.perto_pricila) {
        this.perto_pricila = pertoPricila;
        this.labelNpcPricila.setVisible(pertoPricila && !this.dentroZonaSaida);
      }

      if (pertoPricila) {
        this.labelNpcPricila.setPosition(this.npcPricila.x, this.npcPricila.y + 15);
      }

      if (pertoPricila && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
        this.falouComPricila = true;
        this.registry.set("agencia03_dialogo_concluido", true);
        this.exclamacaoNpcPricila.setVisible(false);
        if (this.tweenExclamacaoPricila) this.tweenExclamacaoPricila.stop();
        this.scene.pause();
        this.scene.launch("SceneDialogoAgencia03", {
          cenaOrigem: "SceneAgencia03",
          npc: "PJ", // Priscila PJ
        });
      }

      if (!this.falouComPricila && this.exclamacaoNpcPricila) {
        this.exclamacaoNpcPricila.setPosition(
          this.npcPricila.x,
          this.npcPricila.y - this.npcPricila.displayHeight * 0.5,
        );
      }
    }

    // ── Detecção da zona de saída ─────────────────────────────────────────────
    const zonaSaidaAtual = (this.zonasSaida || []).find((z) => {
      const d = Phaser.Math.Distance.Between(
        spritePersonagem.x,
        spritePersonagem.y,
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
      this.labelSair.setPosition(spritePersonagem.x, spritePersonagem.y + 15);
    }

    // Transição manual ao apertar [E] na zona de saída
    if (
      !this.transicionando &&
      dentroSaida &&
      zonaSaidaAtual &&
      Phaser.Input.Keyboard.JustDown(this.teclaE)
    ) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start(zonaSaidaAtual.destino || "SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: zonaSaidaAtual.spawnX ?? 0,
          spawnY: zonaSaidaAtual.spawnY ?? 0,
        });
      });
    }

  }
}
