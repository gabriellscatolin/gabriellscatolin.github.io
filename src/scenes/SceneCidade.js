export default class SceneCidade extends Phaser.Scene {
  constructor() {
    super({ key: "SceneCidade" });
  }

  // Recebe dados do personagem e do ponto de spawn
  init(dados = {}) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
    this.spawnXCustom = dados.spawnX || null;
    this.spawnYCustom = dados.spawnY || null;
    this.missaoCidadeIdCustom = Number.isFinite(Number(dados.missaoCidadeId))
      ? Math.floor(Number(dados.missaoCidadeId))
      : null;
    this.missaoCidadeTextoCustom =
      typeof dados.missaoCidadeTexto === "string"
        ? dados.missaoCidadeTexto.trim()
        : "";
    this.ocultarSetaAgencia01 =
      Boolean(dados.ocultarSetaAgencia01) ||
      Boolean(this.registry.get("ocultarSetaAgencia01"));
  }

  // Carrega mapa, tilesets e sprites
  preload() {
    const nomePasta = this.registry.get("nomePasta") || "Pedro";
    const prefixo = this.registry.get("prefixo") || "HB";

    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneCidade] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    this.load.tilemapTiledJSON(
      "mapaGeral",
      "src/assets/imagens/mapsjson/tileMaps/mapaMiniMundoVF.tmj?v=5",
    );
    this.load.image(
      "tilesMapaTopo",
      "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Top.png?v=1",
    );
    this.load.image(
      "tilesMapaBase",
      "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Bottom.png?v=1",
    );
    this.load.image("maquininhaCielo", "src/assets/imagens/HUD/maquininha.png");
    this.load.image("cieloCoinsHud", "src/assets/imagens/HUD/cieloCoinHUD.png");
    this.load.image("botaoMapaHud", "src/assets/imagens/HUD/botaoMapa.png");

    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `sprite_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `sprite_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `sprite_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `sprite_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  // Monta mapa, personagem e interfaces
  create() {
    // Área jogável usada por câmera e física
    const MAPA_X = 720;
    const MAPA_Y = 100;
    const MAPA_LARGURA = 2432;
    const MAPA_ALTURA = 1760;

    // Mapa principal e tilesets exportados do Tiled
    const mapa = this.make.tilemap({ key: "mapaGeral" });
    const tileset1 = mapa.addTilesetImage("ME_Top_1", "tilesMapaTopo");
    const tileset2 = mapa.addTilesetImage("ME_Bottom_1", "tilesMapaBase");
    const tileset3 = mapa.addTilesetImage("ME_Top_2", "tilesMapaTopo");
    const tileset4 = mapa.addTilesetImage("ME_Bottom_2", "tilesMapaBase");
    const tilesets = [tileset1, tileset2, tileset3, tileset4].filter(Boolean);

    let caminhoInferior;
    let carrosVeiculos;
    let objetosInferior2;
    let estabelecimentos;

    if (tilesets.length > 0) {
      // Camadas visuais de base
      this._criarCamada(mapa, "objetosSemColid_em_cima_2", tilesets);
      this._criarCamada(mapa, "contorno_preto_do_mapa", tilesets);
      this._criarCamada(mapa, "chao_inferior_de_areia", tilesets);
      this._criarCamada(mapa, "chao", tilesets);
      this._criarCamada(mapa, "n_conchinhas_toalhas_matinhos", tilesets);
      this._criarCamada(mapa, "n_agua_do_mar", tilesets);
      this._criarCamada(mapa, "n_sombras", tilesets);
      this._criarCamada(mapa, "n_objetosSemColid_em_baixo", tilesets);
      this._criarCamada(mapa, "n_objetosSemColi_em_baixo_2", tilesets);
      this._criarCamada(mapa, "n_linhas da rua", tilesets);

      // Camadas com colisão
      caminhoInferior = this._criarCamada(
        mapa,
        "c_objetosComColid_em_baixo",
        tilesets,
      );
      carrosVeiculos = this._criarCamada(mapa, "c_carros e Veículos", tilesets);
      objetosInferior2 = this._criarCamada(
        mapa,
        "c_objetosComColid_em_baixo_2",
        tilesets,
      );
      estabelecimentos = this._criarCamada(
        mapa,
        "c_estabelecimentos_Com_Colid",
        tilesets,
      );

      if (caminhoInferior) caminhoInferior.setCollisionByExclusion([-1]);
      if (carrosVeiculos) carrosVeiculos.setCollisionByExclusion([-1]);
      if (objetosInferior2) objetosInferior2.setCollisionByExclusion([-1]);
      if (estabelecimentos) estabelecimentos.setCollisionByExclusion([-1]);
    }

    // Cria as animações de caminhada apenas uma vez
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`andar_${dir}`)) {
        this.anims.create({
          key: `andar_${dir}`,
          frames: [
            { key: `sprite_${dir}_1` },
            { key: `sprite_${dir}_2` },
            { key: `sprite_${dir}_3` },
            { key: `sprite_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    const spawnX = this.spawnXCustom || 840;
    const spawnY = this.spawnYCustom || 900;

    // Jogador
    this.personagem = this.physics.add.sprite(
      spawnX,
      spawnY,
      "sprite_frente_1",
    );
    this.personagem.setCollideWorldBounds(true);

    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite = this.personagem.height;
    const escala = Math.min(
      (tamTile * 0.6) / larguraSprite,
      (tamTile * 0.6) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.03));
    this.personagem.body.setSize(larguraSprite * 0.5, alturaSprite * 0.5);

    if (caminhoInferior)
      this.physics.add.collider(this.personagem, caminhoInferior);
    if (carrosVeiculos)
      this.physics.add.collider(this.personagem, carrosVeiculos);
    if (objetosInferior2)
      this.physics.add.collider(this.personagem, objetosInferior2);
    if (estabelecimentos)
      this.physics.add.collider(this.personagem, estabelecimentos);

    // Camadas acima do personagem para efeito de profundidade
    if (tilesets.length > 0) {
      const decSup1 = this._criarCamada(
        mapa,
        "n_estabelecimento_Sem_colid",
        tilesets,
      );
      const decSup2 = this._criarCamada(
        mapa,
        "n_objetosSemColid_em_cima",
        tilesets,
      );
      const decSup3 = this._criarCamada(
        mapa,
        "n_objetosSemColid_em_cima_2",
        tilesets,
      );

      if (decSup1) decSup1.setDepth(10);
      if (decSup2) decSup2.setDepth(11);
      if (decSup3) decSup3.setDepth(12);
    }

    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Câmera principal seguindo o personagem
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(MAPA_X, MAPA_Y, MAPA_LARGURA, MAPA_ALTURA);
    this.physics.world.setBounds(MAPA_X, MAPA_Y, MAPA_LARGURA, MAPA_ALTURA);

    // Zonas interativas e labels de entrada
    this.zonaAgencia = new Phaser.Geom.Rectangle(976, 856, 90, 80);
    this.labelE = this.add
      .text(976, 856, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaEscritorio = new Phaser.Geom.Rectangle(1741, 1256, 90, 80);
    this.labelEscritorio = this.add
      .text(1741, 1256, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaPadaria = new Phaser.Geom.Rectangle(1425, 818, 100, 80);
    this.labelPadaria = this.add
      .text(1484, 840, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaFarmacia = new Phaser.Geom.Rectangle(1081, 1181, 80, 80);
    this.labelFarmacia = this.add
      .text(1121, 1179, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaRestaurante = new Phaser.Geom.Rectangle(2622, 250, 80, 80);
    this.labelRestaurante = this.add
      .text(2662, 290, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.zonaMetro = new Phaser.Geom.Rectangle(3040, 1128, 80, 80);
    this.labelMetro = this.add
      .text(3080, 1168, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.zonaLojaDeRoupas = new Phaser.Geom.Rectangle(2208, 1530, 80, 80);
    this.labelLojaDeRoupas = this.add
      .text(2248, 1568, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaSupermercado = new Phaser.Geom.Rectangle(2926, 349, 80, 60);
    this.labelSupermercado = this.add
      .text(2925, 320, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaPostoDeGasolina = new Phaser.Geom.Rectangle(2759, 1310, 80, 60);
    this.labelPostoDeGasolina = this.add
      .text(2759, 1310, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaAgencia02 = new Phaser.Geom.Rectangle(1806, 1590, 80, 60);
    this.labelAgencia02 = this.add
      .text(1806, 1590, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaAgencia03 = new Phaser.Geom.Rectangle(2486, 792, 80, 60);
    this.labelAgencia03 = this.add
      .text(2486, 792, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.transicionando = false;
    this.dentroZonaAgencia = false;
    this.dentroZonaEscritorio = false;
    this.dentroZonaFarmacia = false;
    this.dentroZonaRestaurante = false;
    this.dentroZonaMetro = false;
    this.dentroZonaLojaDeRoupas = false;
    this.dentroZonaSupermercado = false;
    this.dentroZonaPadaria = false;
    this.dentroZonaPostoDeGasolina = false;
    this.dentroZonaAgencia02 = false;
    this.dentroZonaAgencia03 = false;

    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "4px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);

    this.direcaoAtual = "frente";

    // Minimapa com câmera separada
    const MM_X = 10;
    const MM_Y = 10;
    const TM_W = 3328;
    const TM_H = 2048;
    const MM_W = 335;
    const MM_H = Math.round((MM_W * TM_H) / TM_W);

    this.minimapPlayerDot = this.add.graphics();
    this.minimapPlayerDot.fillStyle(0x00ff44, 1);
    this.minimapPlayerDot.fillCircle(0, 0, 55);
    this.minimapPlayerDot.setDepth(52);

    this.minimapDestDot = this.add.graphics();
    this.minimapDestDot.fillStyle(0xff2222, 1);
    this.minimapDestDot.fillCircle(0, 0, 55);
    this.minimapDestDot.setPosition(987, 881);
    this.minimapDestDot.setDepth(51);

    // Seta guia no chão para entrada da Agência 01
    this.setaGuiaAgencia = this.add
      .triangle(997, 815, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaAgencia.setStrokeStyle(2, 0x000000, 0.5);

    if (this.ocultarSetaAgencia01) {
      this.setaGuiaAgencia.setVisible(false);
    } else {
      this.tweens.add({
        targets: this.setaGuiaAgencia,
        y: 809,
        alpha: { from: 1, to: 0.45 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    this.tweens.add({
      targets: this.minimapDestDot,
      alpha: { from: 1, to: 0.1 },
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

    this.borderCam = this.cameras.add(MM_X - 2, MM_Y - 2, MM_W + 4, MM_H + 4);
    this.borderCam.setBackgroundColor(0x222222);
    this.borderCam.ignore(this.children.list);

    const zoomFit = Math.min(MM_W / TM_W, MM_H / TM_H);
    this.miniMapCam = this.cameras.add(MM_X, MM_Y, MM_W, MM_H);
    this.miniMapCam.setZoom(zoomFit);
    this.miniMapCam.scrollX = TM_W / 2;
    this.miniMapCam.scrollY = TM_H / 2;
    this.miniMapCam.setBackgroundColor(0x000000);

    this.cameras.main.ignore([this.minimapPlayerDot, this.minimapDestDot]);
    this.miniMapCam.ignore([
      this.setaGuiaAgencia,
      this.labelE,
      this.labelEscritorio,
      this.labelPadaria,
      this.labelFarmacia,
      this.labelRestaurante,
      this.labelMetro,
      this.labelLojaDeRoupas,
      this.labelSupermercado,
      this.labelPostoDeGasolina,
      this.labelAgencia02,
      this.labelAgencia03,
      this.debugTxt,
    ]);

    // HUD da maquininha e das moedas
    this._criarHudCidade();
    this._criarHudCoins();
    this._criarPopupMissaoCidade();

    // Cena de chuva em paralelo
    this.scene.launch("SceneChuva");
  }

  // Cria camada do tilemap com segurança
  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) console.warn("[SceneCidade] Camada não encontrada:", nome);
      return camada;
    } catch (erro) {
      console.error(
        "[SceneCidade] Erro ao criar camada",
        nome,
        ":",
        erro.message,
      );
      return null;
    }
  }

  _criarHudCidade() {
    // Estado inicial da maquininha (canto e compacta)
    this.hudMargemDireita = 34;
    this.hudMargemBaixo = 44;
    this.hudUiScale = 1 / this.cameras.main.zoom;
    this.hudNoCentro = false;
    this.hudAnimando = false;
    this.hudIconBaseScale = 0.45 * this.hudUiScale;
    this.hudIconZoomScale = 1.25 * this.hudUiScale;

    this.hudIcon = this.add
      .image(0, 0, "maquininhaCielo")
      .setScale(this.hudIconBaseScale)
      .setOrigin(0.5)
      .setDepth(200)
      .setInteractive({ useHandCursor: true });

    const closeRadius = 12 * this.hudUiScale;
    this.hudCloseBg = this.add
      .circle(0, 0, closeRadius, 0xcf1f1f, 0.95)
      .setStrokeStyle(Math.max(1, Math.round(2 * this.hudUiScale)), 0x7a0000, 1)
      .setDepth(210)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    const closeFont = Math.max(8, Math.round(14 * this.hudUiScale));
    this.hudCloseTxt = this.add
      .text(0, 0, "X", {
        fontSize: `${closeFont}px`,
        color: "#ffecec",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(211)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    // A HUD não aparece no minimapa
    this.miniMapCam.ignore(this.hudIcon);
    this.borderCam.ignore(this.hudIcon);
    this.miniMapCam.ignore([this.hudCloseBg, this.hudCloseTxt]);
    this.borderCam.ignore([this.hudCloseBg, this.hudCloseTxt]);

    this.hudIcon.on("pointerover", () => {
      if (!this.hudNoCentro && !this.hudAnimando) {
        this.hudIcon.setScale(0.5 * this.hudUiScale);
      }
    });
    this.hudIcon.on("pointerout", () => {
      if (!this.hudNoCentro && !this.hudAnimando) {
        this.hudIcon.setScale(this.hudIconBaseScale);
      }
    });

    this.hudIcon.on("pointerdown", () => {
      if (this.hudAnimando) return;

      if (!this.hudNoCentro) {
        // Primeiro clique: vai para o centro e aumenta
        this.hudAnimando = true;
        const cam = this.cameras.main;

        this.tweens.add({
          targets: this.hudIcon,
          x: cam.worldView.centerX,
          y: cam.worldView.centerY,
          scale: this.hudIconZoomScale,
          duration: 260,
          ease: "Quad.Out",
          onComplete: () => {
            this.hudNoCentro = true;
            this.hudAnimando = false;
          },
        });
        return;
      }

      // Clique no centro: feedback rápido
      this.tweens.add({
        targets: this.hudIcon,
        scale: this.hudIconZoomScale * 1.08,
        duration: 90,
        yoyo: true,
        ease: "Sine.Out",
      });
      console.log("[HUD] Maquininha clicada no centro");
    });

    const fecharHud = () => {
      if (!this.hudNoCentro || this.hudAnimando) return;

      // Retorna para o canto
      this.hudAnimando = true;
      this.hudCloseBg.setVisible(false);
      this.hudCloseTxt.setVisible(false);

      const cam = this.cameras.main;
      const alvoX = cam.worldView.right - this.hudMargemDireita;
      const alvoY = cam.worldView.bottom - this.hudMargemBaixo;

      this.tweens.add({
        targets: this.hudIcon,
        x: alvoX,
        y: alvoY,
        scale: this.hudIconBaseScale,
        duration: 240,
        ease: "Quad.InOut",
        onComplete: () => {
          this.hudNoCentro = false;
          this.hudAnimando = false;
        },
      });
    };

    this.hudCloseBg.on("pointerdown", fecharHud);
    this.hudCloseTxt.on("pointerdown", fecharHud);

    this.hudDebugTxt = this.add
      .text(0, 0, "", {
        fontSize: "16px",
        fontFamily: "monospace",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#000000ee",
        padding: { x: 8, y: 6 },
      })
      .setDepth(1000)
      .setScrollFactor(0)
      .setVisible(false);

    this.hudDebugMarker = this.add
      .text(0, 0, "+", {
        fontSize: "18px",
        fontFamily: "monospace",
        fontStyle: "bold",
        color: "#00ff66",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setDepth(1001)
      .setOrigin(0.5)
      .setVisible(false);

    this.miniMapCam.ignore(this.hudDebugTxt);
    this.borderCam.ignore(this.hudDebugTxt);
    this.miniMapCam.ignore(this.hudDebugMarker);
    this.borderCam.ignore(this.hudDebugMarker);
    this._hudDebugWorldPoint = new Phaser.Math.Vector2();

    this.hudBotao1Area = this.add
      .image(0, 0, "botaoMapaHud")
      .setDepth(206)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.hudBotao1Glow = this.add
      .rectangle(0, 0, 1, 1, 0x66ffd9, 0.18)
      .setStrokeStyle(2, 0xb8fff0, 0.95)
      .setDepth(207)
      .setVisible(false);
    this.hudBotao1OffsetX = 4;
    this.hudBotao1OffsetY = -121;
    this.hudBotao1Largura = 314;
    this.hudBotao1Altura = 56;
    this.hudBotao1Hover = false;

    this.hudBotao1Area.on("pointerover", () => {
      if (!this.hudNoCentro || this.hudAnimando || !this.hudBotao1Glow) return;

      this.hudBotao1Hover = true;
      this.hudBotao1Glow.setVisible(true);
      this.hudBotao1Glow.alpha = 0.14;

      if (this.hudBotao1GlowTween) this.hudBotao1GlowTween.stop();
      this.hudBotao1GlowTween = this.tweens.add({
        targets: this.hudBotao1Glow,
        alpha: { from: 0.14, to: 0.42 },
        duration: 260,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    });

    this.hudBotao1Area.on("pointerout", () => {
      this.hudBotao1Hover = false;
      if (this.hudBotao1GlowTween) {
        this.hudBotao1GlowTween.stop();
        this.hudBotao1GlowTween = null;
      }
      if (this.hudBotao1Glow) this.hudBotao1Glow.setVisible(false);
    });

    this.hudBotao1Area.on("pointerdown", () => {
      if (!this.hudNoCentro || this.hudAnimando) return;
      this.registry.events.emit("hud-maquininha-botao", "botao_1");
      this.scene.start("SceneMapainterativo");
      console.log("[HUD] Botao maquininha clicado: botao_1");
    });

    this.miniMapCam.ignore(this.hudBotao1Area);
    this.borderCam.ignore(this.hudBotao1Area);
    this.miniMapCam.ignore(this.hudBotao1Glow);
    this.borderCam.ignore(this.hudBotao1Glow);

    this._atualizarHudCidade();
  }

  _criarHudCoins() {
    // Saldo de moedas (valor global no registry)
    if (typeof this.registry.get("cieloCoins") === "undefined") {
      this.registry.set("cieloCoins", 0);
    }

    this.hudCoinsUiScale = 1 / this.cameras.main.zoom;
    this.hudCoinsValorAtual = -1;
    this.hudCoinsScale = 0.42 * this.hudCoinsUiScale;
    this.hudCoinsOffsetRight = 90 * this.hudCoinsUiScale;
    this.hudCoinsOffsetTop = 6 * this.hudCoinsUiScale;

    this.hudCoinsBg = this.add
      .image(0, 0, "cieloCoinsHud")
      .setOrigin(1, 0)
      .setScale(this.hudCoinsScale)
      .setDepth(230);

    const coinFont = Math.max(5, Math.round(14 * this.hudCoinsUiScale));
    this.hudCoinsTxt = this.add
      .text(0, 0, "", {
        fontSize: `${coinFont}px`,
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(231);

    // HUD de moedas também fica fora do minimapa
    this.miniMapCam.ignore([this.hudCoinsBg, this.hudCoinsTxt]);
    this.borderCam.ignore([this.hudCoinsBg, this.hudCoinsTxt]);

    this._atualizarHudCoins();
  }

  _atualizarHudCidade() {
    if (!this.hudIcon) return;

    const cam = this.cameras.main;
    if (this.hudAnimando) return;

    if (this.hudNoCentro) {
      // Enquanto estiver aberta, acompanha o centro da câmera
      const centerX = cam.worldView.centerX;
      const centerY = cam.worldView.centerY;
      this.hudIcon.setPosition(centerX, centerY);

      const closeOffsetX = 112 * this.hudUiScale;
      const closeOffsetY = 292 * this.hudUiScale;
      this.hudCloseBg
        .setPosition(centerX + closeOffsetX, centerY - closeOffsetY)
        .setVisible(true);
      this.hudCloseTxt
        .setPosition(centerX + closeOffsetX, centerY - closeOffsetY - 1)
        .setVisible(true);
      this._atualizarBotao1Hud(centerX, centerY, true);
      this._atualizarHudDebugCoords();
      return;
    }

    const hudX = cam.worldView.right - this.hudMargemDireita;
    const hudY = cam.worldView.bottom - this.hudMargemBaixo;
    this.hudIcon.setPosition(hudX, hudY);
    this.hudCloseBg.setVisible(false);
    this.hudCloseTxt.setVisible(false);
    if (this.hudDebugTxt) this.hudDebugTxt.setVisible(false);
    if (this.hudDebugMarker) this.hudDebugMarker.setVisible(false);
    this._atualizarBotao1Hud(hudX, hudY, false);
  }

  _atualizarBotao1Hud(centerX, centerY, visivel) {
    if (!this.hudBotao1Area) return;

    const largura = this.hudBotao1Largura * this.hudUiScale;
    const altura = this.hudBotao1Altura * this.hudUiScale;
    const posX = centerX + this.hudBotao1OffsetX * this.hudUiScale;
    const posY = centerY + this.hudBotao1OffsetY * this.hudUiScale;

    this.hudBotao1Area
      .setDisplaySize(largura, altura)
      .setPosition(posX, posY)
      .setVisible(visivel);

    if (this.hudBotao1Glow) {
      this.hudBotao1Glow
        .setSize(largura, altura)
        .setPosition(posX, posY)
        .setVisible(visivel && this.hudBotao1Hover);
    }

    if (this.hudBotao1Area.input) {
      this.hudBotao1Area.input.enabled = visivel;
    }

    if (!visivel) {
      this.hudBotao1Hover = false;
      if (this.hudBotao1GlowTween) {
        this.hudBotao1GlowTween.stop();
        this.hudBotao1GlowTween = null;
      }
      if (this.hudBotao1Glow) this.hudBotao1Glow.setVisible(false);
    }
  }

  _atualizarHudDebugCoords() {
    if (!this.hudDebugTxt || !this.hudIcon || !this._hudDebugWorldPoint) return;
    if (!this.hudNoCentro || this.hudAnimando) {
      this.hudDebugTxt.setVisible(false);
      if (this.hudDebugMarker) this.hudDebugMarker.setVisible(false);
      return;
    }

    const pointer = this.input.activePointer;
    if (!pointer) {
      this.hudDebugTxt.setVisible(false);
      if (this.hudDebugMarker) this.hudDebugMarker.setVisible(false);
      return;
    }

    pointer.positionToCamera(this.cameras.main, this._hudDebugWorldPoint);

    const localX =
      (this._hudDebugWorldPoint.x - this.hudIcon.x) / this.hudUiScale;
    const localY =
      (this._hudDebugWorldPoint.y - this.hudIcon.y) / this.hudUiScale;

    this.hudDebugLocalX = Math.round(localX);
    this.hudDebugLocalY = Math.round(localY);

    this.hudDebugTxt
      .setText(`HUD local\nX: ${this.hudDebugLocalX}  Y: ${this.hudDebugLocalY}`)
      .setPosition(14, 140)
      .setVisible(true);

    if (this.hudDebugMarker) {
      this.hudDebugMarker
        .setPosition(this._hudDebugWorldPoint.x, this._hudDebugWorldPoint.y)
        .setVisible(true);
    }
  }

  _atualizarHudCoins() {
    if (!this.hudCoinsBg || !this.hudCoinsTxt) return;

    const cam = this.cameras.main;
    const posX = cam.worldView.right - this.hudCoinsOffsetRight;
    const posY = cam.worldView.top + this.hudCoinsOffsetTop;

    this.hudCoinsBg.setPosition(posX, posY);

    const txtX = posX + 8 * this.hudCoinsUiScale;
    const txtY = posY + this.hudCoinsBg.displayHeight * 0.5;
    this.hudCoinsTxt.setPosition(txtX, txtY);

    const bruto = Number(this.registry.get("cieloCoins") ?? 0);
    const saldo = Number.isFinite(bruto) ? Math.max(0, Math.floor(bruto)) : 0;
    if (saldo !== this.hudCoinsValorAtual) {
      this.hudCoinsValorAtual = saldo;
      this.hudCoinsTxt.setText(`${saldo}`);
    }
  }

  _criarPopupMissaoCidade() {
    if (
      typeof this.registry.get("missaoCidadeId") === "undefined" &&
      !Number.isFinite(this.missaoCidadeIdCustom)
    ) {
      this.registry.set("missaoCidadeId", 1);
    }

    if (Number.isFinite(this.missaoCidadeIdCustom)) {
      this.registry.set("missaoCidadeId", this.missaoCidadeIdCustom);
    }

    if (this.missaoCidadeTextoCustom) {
      this.registry.set("missaoCidadeTexto", this.missaoCidadeTextoCustom);
    }

    this.popupMissaoUiScale = 1 / this.cameras.main.zoom;
    this.popupMissaoOffsetTopo = 92 * this.popupMissaoUiScale;

    const cam = this.cameras.main;
    const popupY = cam.worldView.top + this.popupMissaoOffsetTopo;
    const popupX = cam.worldView.centerX;

    this.missaoCidadeBg = this.add
      .rectangle(popupX, popupY, 300, 44, 0x000000, 0.55)
      .setDepth(240)
      .setScale(this.popupMissaoUiScale);

    this.missaoCidadeTexto = this.add
      .text(popupX, popupY, "", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(241)
      .setScale(this.popupMissaoUiScale);

    this.miniMapCam.ignore([this.missaoCidadeBg, this.missaoCidadeTexto]);
    this.borderCam.ignore([this.missaoCidadeBg, this.missaoCidadeTexto]);

    this._atualizarPopupMissaoCidade(true);

    this._onMissaoCidadeMudou = () => this._atualizarPopupMissaoCidade(true);
    this.registry.events.on(
      "changedata-missaoCidadeId",
      this._onMissaoCidadeMudou,
      this,
    );
    this.registry.events.on(
      "changedata-missaoCidadeTexto",
      this._onMissaoCidadeMudou,
      this,
    );

    this.events.once("shutdown", () => {
      this.registry.events.off(
        "changedata-missaoCidadeId",
        this._onMissaoCidadeMudou,
        this,
      );
      this.registry.events.off(
        "changedata-missaoCidadeTexto",
        this._onMissaoCidadeMudou,
        this,
      );
      if (this.missaoCidadeTimer) {
        this.missaoCidadeTimer.remove();
        this.missaoCidadeTimer = null;
      }
    });
  }

  _textoMissaoCidadePorId(id) {
    const missoes = {
      1: "Missão: Vá até a Agência e fale com o gerente",
      2: "Missao: Fale com o atendente para iniciar o atendimento.",
      3: "Missao: Va para a Padaria e converse com o comerciante.",
      4: "Missao: Confira seu saldo de Cielo Coins na cidade.",
    };

    return (
      missoes[id] || "Missao: Explore a cidade e conclua seu proximo objetivo."
    );
  }

  _resolverTextoMissaoCidade() {
    const textoCustom = this.registry.get("missaoCidadeTexto");
    if (typeof textoCustom === "string" && textoCustom.trim()) {
      return textoCustom.trim();
    }

    const idBruto = this.registry.get("missaoCidadeId");
    const id = Number.isFinite(Number(idBruto))
      ? Math.floor(Number(idBruto))
      : 1;

    return this._textoMissaoCidadePorId(id);
  }

  _medirLarguraPopupMissaoCidade(texto) {
    const medidor = this.add.text(-9999, -9999, texto, {
      fontSize: "20px",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });
    const largura = medidor.displayWidth + 48;
    medidor.destroy();
    return Phaser.Math.Clamp(largura, 260, this.scale.width - 40);
  }

  _atualizarPopupMissaoCidade(animarTexto) {
    if (!this.missaoCidadeBg || !this.missaoCidadeTexto) return;

    const texto = this._resolverTextoMissaoCidade();
    if (!texto) return;

    const larguraFinal = this._medirLarguraPopupMissaoCidade(texto);
    this.missaoCidadeBg.setSize(larguraFinal, this.missaoCidadeBg.height);

    if (this.missaoCidadeMensagemAtual === texto && !animarTexto) return;
    this.missaoCidadeMensagemAtual = texto;

    if (this.missaoCidadeTimer) {
      this.missaoCidadeTimer.remove();
      this.missaoCidadeTimer = null;
    }

    if (!animarTexto) {
      this.missaoCidadeTexto.setText(texto);
      return;
    }

    let charIndex = 0;
    this.missaoCidadeTexto.setText("");
    this.missaoCidadeTimer = this.time.addEvent({
      delay: 35,
      repeat: texto.length - 1,
      callback: () => {
        charIndex++;
        this.missaoCidadeTexto.setText(texto.substring(0, charIndex));
      },
    });
  }

  _reposicionarPopupMissaoCidade() {
    if (!this.missaoCidadeBg || !this.missaoCidadeTexto) return;
    const cam = this.cameras.main;
    const popupX = cam.worldView.centerX;
    const popupY = cam.worldView.top + this.popupMissaoOffsetTopo;
    this.missaoCidadeBg.setX(popupX);
    this.missaoCidadeBg.setY(popupY);
    this.missaoCidadeTexto.setX(popupX);
    this.missaoCidadeTexto.setY(popupY);
  }

  // Atualiza movimento, zonas e transições
  update() {
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    // Movimento do jogador
    personagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play("andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`sprite_${this.direcaoAtual}_1`);
    }

    // Mostra ou oculta labels ao entrar nas zonas
    const dentroAgencia = Phaser.Geom.Rectangle.Contains(
      this.zonaAgencia,
      personagem.x,
      personagem.y,
    );
    if (dentroAgencia !== this.dentroZonaAgencia) {
      this.dentroZonaAgencia = dentroAgencia;
      this.labelE.setVisible(dentroAgencia);
    }

    const dentroEscritorio = Phaser.Geom.Rectangle.Contains(
      this.zonaEscritorio,
      personagem.x,
      personagem.y,
    );
    if (dentroEscritorio !== this.dentroZonaEscritorio) {
      this.dentroZonaEscritorio = dentroEscritorio;
      this.labelEscritorio.setVisible(dentroEscritorio);
    }

    const dentroPadaria = Phaser.Geom.Rectangle.Contains(
      this.zonaPadaria,
      personagem.x,
      personagem.y,
    );
    if (dentroPadaria !== this.dentroZonaPadaria) {
      this.dentroZonaPadaria = dentroPadaria;
      this.labelPadaria.setVisible(dentroPadaria);
    }

    const dentroFarmacia = Phaser.Geom.Rectangle.Contains(
      this.zonaFarmacia,
      personagem.x,
      personagem.y,
    );
    if (dentroFarmacia !== this.dentroZonaFarmacia) {
      this.dentroZonaFarmacia = dentroFarmacia;
      this.labelFarmacia.setVisible(dentroFarmacia);
    }

    const dentroRestaurante = Phaser.Geom.Rectangle.Contains(
      this.zonaRestaurante,
      personagem.x,
      personagem.y,
    );
    if (dentroRestaurante !== this.dentroZonaRestaurante) {
      this.dentroZonaRestaurante = dentroRestaurante;
      this.labelRestaurante.setVisible(dentroRestaurante);
    }

    const dentroMetro = Phaser.Geom.Rectangle.Contains(
      this.zonaMetro,
      personagem.x,
      personagem.y,
    );
    if (dentroMetro !== this.dentroZonaMetro) {
      this.dentroZonaMetro = dentroMetro;
      this.labelMetro.setVisible(dentroMetro);
    }

    const dentroLojaDeRoupas = Phaser.Geom.Rectangle.Contains(
      this.zonaLojaDeRoupas,
      personagem.x,
      personagem.y,
    );
    if (dentroLojaDeRoupas !== this.dentroZonaLojaDeRoupas) {
      this.dentroZonaLojaDeRoupas = dentroLojaDeRoupas;
      this.labelLojaDeRoupas.setVisible(dentroLojaDeRoupas);
    }

    const dentroSupermercado = Phaser.Geom.Rectangle.Contains(
      this.zonaSupermercado,
      personagem.x,
      personagem.y,
    );
    if (dentroSupermercado !== this.dentroZonaSupermercado) {
      this.dentroZonaSupermercado = dentroSupermercado;
      this.labelSupermercado.setVisible(dentroSupermercado);
    }

    const dentroPostoDeGasolina = Phaser.Geom.Rectangle.Contains(
      this.zonaPostoDeGasolina,
      personagem.x,
      personagem.y,
    );
    if (dentroPostoDeGasolina !== this.dentroZonaPostoDeGasolina) {
      this.dentroZonaPostoDeGasolina = dentroPostoDeGasolina;
      this.labelPostoDeGasolina.setVisible(dentroPostoDeGasolina);
    }

    const dentroAgencia02 = Phaser.Geom.Rectangle.Contains(
      this.zonaAgencia02,
      personagem.x,
      personagem.y,
    );
    if (dentroAgencia02 !== this.dentroZonaAgencia02) {
      this.dentroZonaAgencia02 = dentroAgencia02;
      this.labelAgencia02.setVisible(dentroAgencia02);
    }

    const dentroAgencia03 = Phaser.Geom.Rectangle.Contains(
      this.zonaAgencia03,
      personagem.x,
      personagem.y,
    );
    if (dentroAgencia03 !== this.dentroZonaAgencia03) {
      this.dentroZonaAgencia03 = dentroAgencia03;
      this.labelAgencia03.setVisible(dentroAgencia03);
    }

    const hudLocalInfo =
      this.hudNoCentro && Number.isFinite(this.hudDebugLocalX)
        ? `\nhudX:${this.hudDebugLocalX} hudY:${this.hudDebugLocalY}`
        : "";

    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}${hudLocalInfo}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 18);
    this.minimapPlayerDot.setPosition(personagem.x, personagem.y);
    this._atualizarHudCidade();
    this._atualizarHudDebugCoords();
    this._atualizarHudCoins();
    this._reposicionarPopupMissaoCidade();

    // Tecla E para transição entre cenas
    if (!this.transicionando && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      if (dentroAgencia) {
        this.transicionando = true;
        this.labelE.setVisible(false);
        if (this.setaGuiaAgencia) this.setaGuiaAgencia.setVisible(false);
        this.registry.set("ocultarSetaAgencia01", true);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneAg", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
            spawnX: 165,
            spawnY: 185,
          });
        });
      } else if (dentroEscritorio) {
        this.transicionando = true;
        this.labelEscritorio.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneEscritorio", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroPadaria) {
        this.transicionando = true;
        this.labelPadaria.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("ScenePadaria", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroFarmacia) {
        this.transicionando = true;
        this.labelFarmacia.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneFarmacia", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroRestaurante) {
        this.transicionando = true;
        this.labelRestaurante.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneRestaurante", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroMetro) {
        this.transicionando = true;
        this.labelMetro.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneMetro", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
            spawnX: 273,
            spawnY: 250,
          });
        });
      } else if (dentroLojaDeRoupas) {
        this.transicionando = true;
        this.labelLojaDeRoupas.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneLojaDeRoupas", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroSupermercado) {
        this.transicionando = true;
        this.labelSupermercado.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneSupermercado", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroPostoDeGasolina) {
        this.transicionando = true;
        this.labelPostoDeGasolina.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("ScenePostoDeGasolina", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroAgencia02) {
        this.transicionando = true;
        this.labelAgencia02.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneAgencia02", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroAgencia03) {
        this.transicionando = true;
        this.labelAgencia03.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneAgencia03", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
            spawnX: 955,
            spawnY: 518,
          });
        });
      }
    }
  }
}
