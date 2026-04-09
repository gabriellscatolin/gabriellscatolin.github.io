export default class SceneRestaurante extends Phaser.Scene {
  constructor() {
    super({ key: "SceneRestaurante" });
  }

  // Recebe os dados do spritePersonagem e possível posição customizada de spawn
  init(dados) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
    this.spawnXCustom = dados.spawnX ?? null;
    this.spawnYCustom = dados.spawnY ?? null;
  }

  // Carrega mapa, tilesets grandes e sprites do spritePersonagem
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    // Carrega o áudio da cena
    this.load.audio(
      "trilhaSceneRestaurante",
      "src/assets/audios/trilhaSceneRestaurante.mp3",
    );

    // Log de erro de carregamento
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneRestaurante] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Tilemap e tilesets do restaurante
    this.load.tilemapTiledJSON(
      "restaurante",
      "src/assets/imagens/mapsjson/tileMaps/restauranteJapones.tmj?v=1",
    );

    this.load.image(
      "rest_room_builder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );

    // Tilesets grandes divididos em partes (necessário para performance)
    this.load.image(
      "rest_int_s1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png",
    );
    this.load.image(
      "rest_int_s2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png",
    );
    this.load.image(
      "rest_int_s3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png",
    );
    this.load.image(
      "rest_int_s4",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png",
    );
    this.load.image(
      "rest_int_s5",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png",
    );

    this.load.image(
      "rest_mod_s1",
      "src/assets/imagens/mapsjson/tileSets/Modern_S1_4096.png",
    );
    this.load.image(
      "rest_mod_s2",
      "src/assets/imagens/mapsjson/tileSets/Modern_S2_4096.png",
    );
    this.load.image(
      "rest_mod_s3",
      "src/assets/imagens/mapsjson/tileSets/Modern_S3_32.png",
    );
    // Sprite do NPC do restaurante
    this.load.image(
      "npc_restaurante",
      "src/assets/imagens/imagensPersonagens/NPC/npcRestaurante.png",
    );

    // Sprites do spritePersonagem
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `rest_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `rest_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `rest_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `rest_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  // Divide tilesets grandes em partes menores para evitar limites de textura
  prepararTilesetsRestaurante() {
    const cacheMapa = this.cache.tilemap.get("restaurante");
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    // Evita processar duas vezes
    if (dadosMapa.tilesets.some((ts) => ts.name === "Interiors_16x16_S1"))
      return;

    const novosTilesets = [];

    dadosMapa.tilesets.forEach((ts) => {
      // Divide tileset de interiores
      if (ts.name === "Interiors_16x16") {
        const base = ts.firstgid;
        const comuns = {
          tilewidth: 16,
          tileheight: 16,
          spacing: 0,
          margin: 0,
          columns: 16,
        };

        for (let i = 0; i < 5; i++) {
          novosTilesets.push({
            ...comuns,
            firstgid: base + i * 4096,
            name: `Interiors_16x16_S${i + 1}`,
            tilecount: i === 4 ? 640 : 4096,
            image: `../tileSets/Interiors_S${i + 1}_${i === 4 ? 640 : 4096}.png`,
            imagewidth: 256,
            imageheight: i === 4 ? 640 : 4096,
          });
        }
        return;
      }

      // Divide tileset externo
      if (ts.name === "Modern_Exteriors_Complete_Tileset") {
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
          name: "Modern_Exteriors_S1",
          tilecount: 45056,
          image: "../tileSets/Modern_S1_4096.png",
          imagewidth: 2816,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 45056,
          name: "Modern_Exteriors_S2",
          tilecount: 45056,
          image: "../tileSets/Modern_S2_4096.png",
          imagewidth: 2816,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 90112,
          name: "Modern_Exteriors_S3",
          tilecount: 352,
          image: "../tileSets/Modern_S3_32.png",
          imagewidth: 2816,
          imageheight: 32,
        });
        return;
      }

      novosTilesets.push(ts);
    });

    dadosMapa.tilesets = novosTilesets;
  }

  // Ajusta tiles que ficaram fora do limite visual
  descerTilesForaDoLimite(camada, deslocamentoTiles = 4) {
    if (!camada) return;

    const mover = [];
    camada.forEachTile((tile) => {
      if (!tile || tile.index < 0) return;
      if (tile.y < 0) mover.push({ x: tile.x, y: tile.y, index: tile.index });
    });

    mover.forEach((t) => {
      camada.removeTileAt(t.x, t.y);
      camada.putTileAt(t.index, t.x, t.y + deslocamentoTiles, true);
    });
  }

  create() {
    // Adiciona áudios a cena
    this.musica = this.sound.add("trilhaSceneRestaurante", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    // Prepara tilesets antes de montar o mapa
    this.prepararTilesetsRestaurante();

    const mapa = this.make.tilemap({ key: "restaurante" });

    // Associa todos os tilesets divididos
    const tiles = [
      mapa.addTilesetImage("Room_Builder_16x16", "rest_room_builder"),
      mapa.addTilesetImage("Interiors_16x16_S1", "rest_int_s1"),
      mapa.addTilesetImage("Interiors_16x16_S2", "rest_int_s2"),
      mapa.addTilesetImage("Interiors_16x16_S3", "rest_int_s3"),
      mapa.addTilesetImage("Interiors_16x16_S4", "rest_int_s4"),
      mapa.addTilesetImage("Interiors_16x16_S5", "rest_int_s5"),
      mapa.addTilesetImage("Modern_Exteriors_S1", "rest_mod_s1"),
      mapa.addTilesetImage("Modern_Exteriors_S2", "rest_mod_s2"),
      mapa.addTilesetImage("Modern_Exteriors_S3", "rest_mod_s3"),
    ].filter(Boolean);

    // Cria camadas do mapa
    const chaoN = mapa.createLayer("N- Chão", tiles, 0, 0);
    const paredeSemC = mapa.createLayer("N - ParedesSemColid", tiles, 0, 0);
    const plantasN = mapa.createLayer("N -Plantas", tiles, 0, 0);
    const cozinhaN = mapa.createLayer("N - OjetosCosinha", tiles, 0, 0);

    const paredeC = mapa.createLayer("C - ParedesComColid", tiles, 0, 0);
    const objC = mapa.createLayer("C- ObjetsColid", tiles, 0, 0);

    paredeC.setCollisionByExclusion([-1]);
    objC.setCollisionByExclusion([-1]);

    // Ajustes visuais finos
    this.descerTilesForaDoLimite(plantasN, 4);
    this.descerTilesForaDoLimite(cozinhaN, 4);

    // Calcula limites reais do restaurante
    const bounds = chaoN.getBounds();

    const area = new Phaser.Geom.Rectangle(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
    );

    // Máscara para esconder partes fora da área útil
    const maskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    maskGfx.fillStyle(0xffffff, 1);
    maskGfx.fillRect(area.x, area.y, area.width, area.height);

    const mask = maskGfx.createGeometryMask();
    [chaoN, paredeSemC, plantasN, cozinhaN, paredeC, objC]
      .filter(Boolean)
      .forEach((c) => c.setMask(mask));

    // Fundo neutro
    this.add
      .rectangle(
        area.x - 200,
        area.y - 200,
        area.width + 400,
        area.height + 400,
        0x555555,
      )
      .setOrigin(0, 0)
      .setDepth(-10);

    // Animações do spritePersonagem
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`rest_andar_${dir}`)) {
        this.anims.create({
          key: `rest_andar_${dir}`,
          frames: [
            { key: `rest_${dir}_1` },
            { key: `rest_${dir}_2` },
            { key: `rest_${dir}_3` },
            { key: `rest_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Personagem
    const spawnX = this.spawnXCustom ?? 377;
    const spawnY = this.spawnYCustom ?? 425;

    this.spritePersonagem = this.physics.add.sprite(
      spawnX,
      spawnY,
      "rest_frente_1",
    );
    this.spritePersonagem.setScale(0.028);
    this.spritePersonagem.setCollideWorldBounds(true);

    this.physics.add.collider(this.spritePersonagem, paredeC);
    this.physics.add.collider(this.spritePersonagem, objC);

    // NPC do restaurante
    this.npcRestaurante = this.physics.add
      .staticImage(375, 310, "npc_restaurante")
      .setDepth(50);
    const alturaAlvo = this.spritePersonagem.displayHeight;
    this.npcRestaurante.setDisplaySize(
      (this.npcRestaurante.width / this.npcRestaurante.height) *
        (alturaAlvo * 1.2),
      alturaAlvo * 1.2,
    );
    this.npcRestaurante.refreshBody();
    this.npcRestaurante.body.setSize(
      this.npcRestaurante.width * 0.6,
      this.npcRestaurante.height * 0.75,
    );
    this.npcRestaurante.body.setOffset(
      this.npcRestaurante.width * 0.2,
      this.npcRestaurante.height * 0.2,
    );
    this.physics.add.collider(this.spritePersonagem, this.npcRestaurante);

    this.labelNpc = this.add
      .text(375, 330, "[E] Falar", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.exclamacaoNpc = this.add
      .text(
        this.npcRestaurante.x,
        this.npcRestaurante.y - this.npcRestaurante.displayHeight * 0.5,
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

    this.tweenExclamacaoNpc = this.tweens.add({
      targets: this.exclamacaoNpc,
      alpha: { from: 1, to: 0.25 },
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

    // Controles
    this.teclas = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Câmera
    this.cameras.main.startFollow(this.spritePersonagem);
    this.cameras.main.setZoom(6);
    this.cameras.main.setBounds(area.x, area.y, area.width, area.height);
    this.physics.world.setBounds(area.x, area.y, area.width, area.height);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = "frente";

    // Zona de saída
    this.zonasSaida = this._criarZonasSaida(spawnX, spawnY);
    this.labelSair = this.add
      .text(spawnX, spawnY - 2, "[Saída]", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.transicionando = false;
    this.dentroZonaSaida = false;
    this.podeSairRestaurante = false;
    this.perto_npc = false;
    this.falouComNpc = false;

    // Pausa a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
    });
  }

  _criarZonasSaida(saidaX, saidaY) {
    return [new Phaser.Geom.Rectangle(saidaX - 30, saidaY - 20, 60, 40)];
  }

  update() {
    const velocidade = 100;
    const { teclas, spritePersonagem } = this;

    spritePersonagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown) {
      spritePersonagem.setVelocityX(-velocidade);
      spritePersonagem.anims.play("rest_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown) {
      spritePersonagem.setVelocityX(velocidade);
      spritePersonagem.anims.play("rest_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown) {
      spritePersonagem.setVelocityY(-velocidade);
      if (!movendo) spritePersonagem.anims.play("rest_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown) {
      spritePersonagem.setVelocityY(velocidade);
      if (!movendo) spritePersonagem.anims.play("rest_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      spritePersonagem.anims.stop();
      spritePersonagem.setTexture(`rest_${this.direcaoAtual}_1`);
    }

    // Interação com NPC por proximidade
    const distNpc = Phaser.Math.Distance.Between(
      spritePersonagem.x,
      spritePersonagem.y,
      this.npcRestaurante.x,
      this.npcRestaurante.y,
    );
    const pertoNpc = distNpc < 30;

    if (pertoNpc !== this.perto_npc) {
      this.perto_npc = pertoNpc;
      this.labelNpc.setVisible(pertoNpc && !this.dentroZonaSaida);
    }

    if (pertoNpc) {
      this.labelNpc.setPosition(375, 330);
    }

    if (pertoNpc && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.scene.pause();
      this.scene.launch("SceneDialogoRestaurante", {
        cenaOrigem: "SceneRestaurante",
      });
      this.falouComNpc = true;
      this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
      console.log("[SceneRestaurante] Interagiu com o NPC do Restaurante");
    }

    if (!this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setPosition(
        this.npcRestaurante.x,
        this.npcRestaurante.y - this.npcRestaurante.displayHeight * 0.5,
      );
    }

    // Detecção da zona de saída
    const dentroSaida = (this.zonasSaida || []).some((z) =>
      Phaser.Geom.Rectangle.Contains(z, spritePersonagem.x, spritePersonagem.y),
    );

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida && this.falouComNpc);
      if (dentroSaida) this.labelNpc.setVisible(false);
    }

    // Transição para a cidade ao pressionar E
    if (!this.podeSairRestaurante && !dentroSaida) {
      this.podeSairRestaurante = true;
    }

    if (dentroSaida && !this.transicionando && this.podeSairRestaurante) {
      this.transicionando = true;
      this.labelSair.setVisible(false);

      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        const missaoPosRestaurante = "Missão: Siga a PJ Camila até o Mercado.";
        this.registry.set("ag02_escolta_pj_restaurante", false);
        this.registry.set("ag02_escolta_pj_supermercado", true);
        this.registry.set("ag02_pj_supermercado_retorno", false);
        this.registry.set("missaoCidadeTexto", missaoPosRestaurante);

        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2684,
          spawnY: 350,
          escoltaPJSupermercado: true,
          missaoCidadeTexto: missaoPosRestaurante,
        });
      });
    }
  }
}
