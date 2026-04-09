export default class SceneMetro extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMetro" });
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
    });

    this.mostrarTutorialMetro();
  }

  mostrarTutorialMetro() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.elementosTutorialMetro = [];

    // Fundo escuro semi-transparente
    this.elementosTutorialMetro.push(
      this.add
        .rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7)
        .setDepth(50)
        .setScrollFactor(0),
    );

    // Imagem do tutorial do metrô (proporcional, máx 70% da tela)
    const imgMetro = this.add
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
    imgMetro.setDisplaySize(dW, dH);
    this.elementosTutorialMetro.push(imgMetro);

    const btnY = cy + dH / 2 + 30;

    // Botão "Fechar"
    const botaoFechar = this.add
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
    this.elementosTutorialMetro.push(botaoFechar);

    botaoFechar.on("pointerover", () =>
      botaoFechar.setStyle({ backgroundColor: "#555555" }),
    );
    botaoFechar.on("pointerout", () =>
      botaoFechar.setStyle({ backgroundColor: "#333333" }),
    );
    botaoFechar.on("pointerdown", () => this.fecharTutorialMetro());
  }

  fecharTutorialMetro() {
    this.elementosTutorialMetro.forEach((el) => el.destroy());
    this.elementosTutorialMetro = [];
  }

  update() {
    const velocidade = 100;
    const { teclas, spritePersonagem } = this;

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
    }

    if (
      entrarMiniGame &&
      !this.transicionando &&
      Phaser.Input.Keyboard.JustDown(this.teclaE)
    ) {
      this.transicionando = true;
      this.labelE.setVisible(false);
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
          spawnX: 3080,
          spawnY: 1230,
          escoltaPJRestaurante: true,
          missaoCidadeTexto: "Missão: Siga a PJ Camila até o Restaurante.",
        });
      });
    }

    this._atualizarCamara();
  }
}
