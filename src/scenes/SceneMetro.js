export default class SceneMetro extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMetro" });
    this.zoomBaseMetro = 4;
    this.resolucaoBaseMetro = { width: 1920, height: 1080 };
  }

  // Recebe os dados do spritePersonagem vindos da cena anterior
  init(dados) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
  }

  // Carrega mapa, tilesets grandes e sprites do spritePersonagem
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    // Carrega áudio da cena
    this.load.audio(
      "trilhaSceneMetro",
      "src/assets/audios/trilhaSceneMetro.mp3",
    );

    // Loga erros de carregamento
    this.load.on("loaderror", (arquivo) => {
      console.error("[SceneMetro] Erro ao carregar:", arquivo.key, arquivo.src);
    });

    // Tilemap da estação de metrô
    this.load.tilemapTiledJSON(
      "metro",
      "src/assets/imagens/mapsjson/tileMaps/metro.tmj?v=2",
    );

    // Tilesets divididos (versões grandes quebradas em partes)
    this.load.image(
      "metro_mod_s1",
      "src/assets/imagens/mapsjson/tileSets/Modern_S1_4096.png",
    );
    this.load.image(
      "metro_mod_s2",
      "src/assets/imagens/mapsjson/tileSets/Modern_S2_4096.png",
    );
    this.load.image(
      "metro_mod_s3",
      "src/assets/imagens/mapsjson/tileSets/Modern_S3_32.png",
    );

    this.load.image(
      "metro_int_s1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png",
    );
    this.load.image(
      "metro_int_s2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png",
    );
    this.load.image(
      "metro_int_s3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png",
    );
    this.load.image(
      "metro_int_s4",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png",
    );
    this.load.image(
      "metro_int_s5",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png",
    );

    this.load.image(
      "imagemTutorialMetro",
      "src/assets/imagens/imagensPopUps/imagemTutorialMetro.jpeg",
    );

    // Sprites do spritePersonagem (4 direções × 4 frames)
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `farm_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `farm_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `farm_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `farm_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  // Ajusta dinamicamente os tilesets muito grandes, dividindo em partes menores
  prepararTilesetsMetro() {
    const cacheMapa = this.cache.tilemap.get("metro");
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    // Evita recriar os tilesets caso já estejam processados
    if (dadosMapa.tilesets.some((ts) => ts.name === "ME_Complete_S1")) return;

    const novosTilesets = [];

    dadosMapa.tilesets.forEach((ts) => {
      // Divide tileset externo grande em 3 partes
      if (ts.name === "ME_Complete") {
        const base = ts.firstgid;
        const comuns = {
          tilewidth: 16,
          tileheight: 16,
          spacing: 0,
          margin: 0,
          columns: 176,
        };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: "ME_Complete_S1",
          tilecount: 45056,
          image: "../tileSets/Modern_S1_4096.png",
          imagewidth: 2816,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 45056,
          name: "ME_Complete_S2",
          tilecount: 45056,
          image: "../tileSets/Modern_S2_4096.png",
          imagewidth: 2816,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 90112,
          name: "ME_Complete_S3",
          tilecount: 352,
          image: "../tileSets/Modern_S3_32.png",
          imagewidth: 2816,
          imageheight: 32,
        });
        return;
      }

      // Divide tileset interno em várias partes menores
      if (ts.name === "Interior_P1") {
        const base = ts.firstgid;
        const comuns = {
          tilewidth: 16,
          tileheight: 16,
          spacing: 0,
          margin: 0,
          columns: 16,
        };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: "Interior_P1_S1",
          tilecount: 4096,
          image: "../tileSets/Interiors_S1_4096.png",
          imagewidth: 256,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 4096,
          name: "Interior_P1_S2",
          tilecount: 4096,
          image: "../tileSets/Interiors_S2_4096.png",
          imagewidth: 256,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 8192,
          name: "Interior_P1_S3",
          tilecount: 4096,
          image: "../tileSets/Interiors_S3_4096.png",
          imagewidth: 256,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 12288,
          name: "Interior_P1_S4",
          tilecount: 4096,
          image: "../tileSets/Interiors_S4_4096.png",
          imagewidth: 256,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 16384,
          name: "Interior_P1_S5",
          tilecount: 640,
          image: "../tileSets/Interiors_S5_640.png",
          imagewidth: 256,
          imageheight: 640,
        });
        return;
      }

      novosTilesets.push(ts);
    });

    dadosMapa.tilesets = novosTilesets;
  }

  create() {
    // Prepara tilesets antes de criar o mapa
    this.prepararTilesetsMetro();

    const mapa = this.make.tilemap({ key: "metro" });
    this.mapa = mapa;

    // Adiciona áudios a cena
    this.musica = this.sound.add("trilhaSceneMetro", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    // Associa os tilesets já divididos
    const tiles = [
      mapa.addTilesetImage("ME_Complete_S1", "metro_mod_s1"),
      mapa.addTilesetImage("ME_Complete_S2", "metro_mod_s2"),
      mapa.addTilesetImage("ME_Complete_S3", "metro_mod_s3"),
      mapa.addTilesetImage("Interior_P1_S1", "metro_int_s1"),
      mapa.addTilesetImage("Interior_P1_S2", "metro_int_s2"),
      mapa.addTilesetImage("Interior_P1_S3", "metro_int_s3"),
      mapa.addTilesetImage("Interior_P1_S4", "metro_int_s4"),
      mapa.addTilesetImage("Interior_P1_S5", "metro_int_s5"),
    ].filter(Boolean);

    // Cria camada com verificação de existência no mapa
    const criarCamada = (nome) => {
      const existe = mapa.layers.some((layer) => layer.name === nome);
      return existe ? mapa.createLayer(nome, tiles, 0, 0) : null;
    };

    // Camadas base do mapa (visuais e de colisão)
    const chaoN = criarCamada("N - chão");
    const chaoC = criarCamada("C - chão com colid");
    criarCamada("N- Trilho");
    criarCamada("N - ObjetSemColid_embaixo");
    const objC = criarCamada("C - ObjetComColid");
    const vagaoC = criarCamada("C - Vagão");
    criarCamada("N - Vagão");
    criarCamada("N - Parede sem Colid");
    const paredeC = criarCamada("C - Parede");

    // Ativa colisão nas camadas sólidas
    [chaoC, paredeC, objC, vagaoC]
      .filter(Boolean)
      .forEach((camada) => camada.setCollisionByExclusion([-1]));

    // Calcula limites reais do mapa dinamicamente
    const bounds = chaoN.getBounds();

    // Fundo neutro
    this.add
      .rectangle(
        bounds.x - 200,
        bounds.y - 200,
        bounds.width + 400,
        bounds.height + 400,
        0x555555,
      )
      .setOrigin(0, 0)
      .setDepth(-10);

    // Animações do spritePersonagem
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`farm_andar_${dir}`)) {
        this.anims.create({
          key: `farm_andar_${dir}`,
          frames: [
            { key: `farm_${dir}_1` },
            { key: `farm_${dir}_2` },
            { key: `farm_${dir}_3` },
            { key: `farm_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Personagem
    const spawnX = 273;
    const spawnY = 250;

    this.spritePersonagem = this.physics.add.sprite(
      spawnX,
      spawnY,
      "farm_frente_1",
    );
    this.spritePersonagem.setCollideWorldBounds(true);

    this.spritePersonagem.setScale(0.028);
    this.spritePersonagem.body.setSize(
      this.spritePersonagem.width * 0.35,
      this.spritePersonagem.height * 0.35,
    );

    [paredeC, chaoC, objC, vagaoC]
      .filter(Boolean)
      .forEach((camada) =>
        this.physics.add.collider(this.spritePersonagem, camada),
      );

    // Camadas que devem ficar acima do spritePersonagem
    criarCamada("N - Pixos");
    criarCamada("N- Pixos2");
    criarCamada("N - Pixos 3");
    criarCamada("N - ObjetSemColid_cima");
    criarCamada("N - ObjetSemColid_cima_2");
    criarCamada("N- ObjetSemColid_cima_3");

    // Controles
    this.teclas = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Zonas interativas e labels de entrada
    this.zonaMiniGame = new Phaser.Geom.Rectangle(676, 200, 90, 80);
    this.labelE = this.add
      .text(676, 200, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    // HUD de orientação do metrô para guiar o jogador até o minigame.
    this.hudMiniGameTexto = this.add
      .text(this.scale.width / 2, 20, "Suba para jogar o minigame.", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#000000bb",
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(30);

    // Exclamação destacando o botão de entrada do minigame.
    this.exclamacaoMiniGame = this.add
      .text(676, 178, "!", {
        fontSize: "24px",
        color: "#ffeb3b",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(21)
      .setVisible(false);

    this.tweenExclamacaoMiniGame = this.tweens.add({
      targets: this.exclamacaoMiniGame,
      alpha: { from: 1, to: 0.25 },
      duration: 450,
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    // Câmera segue o spritePersonagem
    this.cameras.main.startFollow(this.spritePersonagem);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
    );
    this.physics.world.setBounds(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
    );
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Aplica zoom responsivo inicial e reage a resize/fullscreen.
    this._ajustarLayoutResponsivoMetro(this.scale.width, this.scale.height);
    this._onResizeMetro = (gameSize) => {
      const largura = gameSize?.width ?? this.scale.width;
      const altura = gameSize?.height ?? this.scale.height;
      this._ajustarLayoutResponsivoMetro(largura, altura);
      this._reposicionarTutorialMetro(largura, altura);
      this._reposicionarHudMetro(largura);
    };
    this.scale.on("resize", this._onResizeMetro, this);

    this.direcaoAtual = "frente";

    // Zona de saída (entrada da estação)
    const saidaX = 295;
    const saidaY = 165;
    this.zonaSaida = new Phaser.Geom.Rectangle(
      saidaX - 30,
      saidaY - 18,
      60,
      36,
    );
    this.labelSair = this.add
      .text(saidaX, saidaY, "[E] Sair", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.transicionando = false;
    this.dentroZonaSaida = false;
    this.entrarMiniGame = false;

    // Pausa a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
      if (this.tweenExclamacaoMiniGame) {
        this.tweenExclamacaoMiniGame.stop();
        this.tweenExclamacaoMiniGame = null;
      }
      if (this._onResizeMetro) {
        this.scale.off("resize", this._onResizeMetro, this);
        this._onResizeMetro = null;
      }
    });

    this.mostrarTutorialMetro();
  }

  mostrarTutorialMetro() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.elementosTutorialMetro = [];
    this.tutorialMetroAtivo = true;

    // Fundo escuro semi-transparente
    this.tutorialMetroOverlay = this.add
      .rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setDepth(50)
      .setScrollFactor(0);
    this.elementosTutorialMetro.push(this.tutorialMetroOverlay);

    // Imagem do tutorial do metrô (proporcional, máx 70% da tela)
    this.tutorialMetroImagem = this.add
      .image(cx, cy, "imagemTutorialMetro")
      .setDepth(51)
      .setScrollFactor(0);
    const src = this.textures.get("imagemTutorialMetro").source[0];
    const ratio = src.width / src.height;
    const maxW = 240,
      maxH = 160;
    let dW = maxW,
      dH = maxW / ratio;
    if (dH > maxH) {
      dH = maxH;
      dW = maxH * ratio;
    }
    this.tutorialMetroImagem.setDisplaySize(dW, dH);
    this.elementosTutorialMetro.push(this.tutorialMetroImagem);

    const btnY = cy + dH / 2 + 30;

    // Botão "Fechar"
    this.tutorialMetroBotaoFechar = this.add
      .text(cx, btnY, "Fechar", {
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 24, y: 10 },
      })
      .setDepth(52)
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.elementosTutorialMetro.push(this.tutorialMetroBotaoFechar);

    this.tutorialMetroBotaoFechar.on("pointerover", () =>
      this.tutorialMetroBotaoFechar.setStyle({ backgroundColor: "#555555" }),
    );
    this.tutorialMetroBotaoFechar.on("pointerout", () =>
      this.tutorialMetroBotaoFechar.setStyle({ backgroundColor: "#333333" }),
    );
    this.tutorialMetroBotaoFechar.on("pointerdown", () =>
      this.fecharTutorialMetro(),
    );

    this._reposicionarTutorialMetro(this.scale.width, this.scale.height);
  }

  fecharTutorialMetro() {
    this.elementosTutorialMetro.forEach((el) => el.destroy());
    this.elementosTutorialMetro = [];
    this.tutorialMetroAtivo = false;
    this.tutorialMetroOverlay = null;
    this.tutorialMetroImagem = null;
    this.tutorialMetroBotaoFechar = null;
  }

  _ajustarLayoutResponsivoMetro(largura, altura) {
    if (!this.cameras?.main) return;

    const fatorEscala = Math.min(
      largura / this.resolucaoBaseMetro.width,
      altura / this.resolucaoBaseMetro.height,
    );
    const novoZoom = Phaser.Math.Clamp(this.zoomBaseMetro * fatorEscala, 2.8, 5);
    this.cameras.main.setZoom(novoZoom);
  }

  _reposicionarTutorialMetro(largura, altura) {
    if (!this.tutorialMetroAtivo) return;
    if (
      !this.tutorialMetroOverlay ||
      !this.tutorialMetroImagem ||
      !this.tutorialMetroBotaoFechar
    ) {
      return;
    }

    const cx = largura / 2;
    const cy = altura / 2;
    this.tutorialMetroOverlay
      .setPosition(cx, cy)
      .setDisplaySize(largura, altura);

    this.tutorialMetroImagem.setPosition(cx, cy);
    const src = this.textures.get("imagemTutorialMetro").source[0];
    const ratio = src.width / src.height;
    const maxW = Math.min(largura * 0.72, 900);
    const maxH = Math.min(altura * 0.62, 560);
    let dW = maxW;
    let dH = maxW / ratio;
    if (dH > maxH) {
      dH = maxH;
      dW = maxH * ratio;
    }
    this.tutorialMetroImagem.setDisplaySize(dW, dH);

    this.tutorialMetroBotaoFechar.setPosition(cx, cy + dH / 2 + 30);
  }

  _reposicionarHudMetro(largura) {
    if (this.hudMiniGameTexto) {
      this.hudMiniGameTexto.setPosition(largura / 2, 20);
    }
  }

  update() {
    const velocidade = 100;
    const { teclas, spritePersonagem } = this;

    if (!teclas || !spritePersonagem) return;

    spritePersonagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown) {
      spritePersonagem.setVelocityX(-velocidade);
      spritePersonagem.anims.play("farm_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown) {
      spritePersonagem.setVelocityX(velocidade);
      spritePersonagem.anims.play("farm_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown) {
      spritePersonagem.setVelocityY(-velocidade);
      if (!movendo) spritePersonagem.anims.play("farm_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown) {
      spritePersonagem.setVelocityY(velocidade);
      if (!movendo) spritePersonagem.anims.play("farm_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      spritePersonagem.anims.stop();
      spritePersonagem.setTexture(`farm_${this.direcaoAtual}_1`);
    }

    // Verifica entrada na zona de saída
    const dentroSaida = Phaser.Geom.Rectangle.Contains(
      this.zonaSaida,
      spritePersonagem.x,
      spritePersonagem.y,
    );

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    const entrarMiniGame = Phaser.Geom.Rectangle.Contains(
      this.zonaMiniGame, // ← G maiúsculo, igual ao create()
      spritePersonagem.x,
      spritePersonagem.y,
    );

    if (entrarMiniGame !== this.entrarMiniGame) {
      this.entrarMiniGame = entrarMiniGame; // ← G maiúsculo
      this.labelE.setVisible(entrarMiniGame);
      this.exclamacaoMiniGame.setVisible(entrarMiniGame);
      if (this.tweenExclamacaoMiniGame) {
        if (entrarMiniGame) {
          this.tweenExclamacaoMiniGame.resume();
        } else {
          this.tweenExclamacaoMiniGame.pause();
        }
      }
    }

    if (entrarMiniGame) {
      this.exclamacaoMiniGame.setPosition(this.labelE.x, this.labelE.y - 12);
    }

    if (
      entrarMiniGame &&
      !this.transicionando &&
      Phaser.Input.Keyboard.JustDown(this.teclaE)
    ) {
      this.transicionando = true;
      this.labelE.setVisible(false);
      this.exclamacaoMiniGame.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneMiniGame", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
        });
      });
    }

    // Transição para a cidade ao pressionar E
    if (
      dentroSaida &&
      !this.transicionando &&
      Phaser.Input.Keyboard.JustDown(this.teclaE)
    ) {
      this.transicionando = true;
      this.labelSair.setVisible(false);

      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.registry.set("ag02_escolta_pj_metro", false);
        this.registry.set("ag02_pj_metro_retorno", true);
        this.registry.set("ag02_escolta_pj_restaurante", true);
        this.registry.set("ag02_pj_restaurante_retorno", false);
        this.registry.set(
          "missaoCidadeTexto",
          "Missão: Siga a PJ Camila até o Restaurante.",
        );

        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2632,
          spawnY: 471,
          escoltaPJRestaurante: true,
          missaoCidadeTexto: "Missão: Siga a PJ Camila até o Restaurante.",
        });
      });
    }

    this._atualizarCamara();
  }

  _atualizarCamara() {
    if (!this.cameras?.main || !this.spritePersonagem) return;

    const camera = this.cameras.main;
    if (camera.scrollX === undefined || camera.scrollY === undefined) return;

    camera.startFollow(this.spritePersonagem);
  }
}
