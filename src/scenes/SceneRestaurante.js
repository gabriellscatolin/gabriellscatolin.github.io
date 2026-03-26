export default class SceneRestaurante extends Phaser.Scene {
  constructor() {
    super({ key: "SceneRestaurante" });
  }

  // Recebe os dados do personagem e possível posição customizada de spawn
  init(dados) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
    this.spawnXCustom = dados.spawnX ?? null;
    this.spawnYCustom = dados.spawnY ?? null;
  }

  // Carrega mapa, tilesets grandes e sprites do personagem
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


    // Sprites do personagem
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
    this.musica = this.sound.add('trilhaSceneRestaurante', { loop: true, volume: 0.5});
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

    // Animações do personagem
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

    this.personagem = this.physics.add.sprite(spawnX, spawnY, "rest_frente_1");
    this.personagem.setScale(0.028);
    this.personagem.setCollideWorldBounds(true);

    this.physics.add.collider(this.personagem, paredeC);
    this.physics.add.collider(this.personagem, objC);

    // NPC do restaurante
    this.npcRestaurante = this.physics.add
      .staticImage(375, 310, "npc_restaurante")
      .setDepth(50);
    const alturaAlvo = this.personagem.displayHeight;
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
    this.physics.add.collider(this.personagem, this.npcRestaurante);

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
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Câmera
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(6);
    this.cameras.main.setBounds(area.x, area.y, area.width, area.height);
    this.physics.world.setBounds(area.x, area.y, area.width, area.height);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = "frente";

    // Zona de saída
    this.zonaSaida = new Phaser.Geom.Rectangle(
      spawnX - 30,
      spawnY - 18,
      60,
      36,
    );
    this.labelSair = this.add
      .text(spawnX, spawnY - 2, "[E] Sair", {
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
    this.perto_npc = false;
    this.falouComNpc = false; 


    // Debug
    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "3px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);

    // Pausa a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
    this.musica.stop();
      });
  }

  update() {
    const velocidade = 100;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("rest_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("rest_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("rest_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play("rest_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`rest_${this.direcaoAtual}_1`);
    }

    // Interação com NPC por proximidade
    const distNpc = Phaser.Math.Distance.Between(
      personagem.x,
      personagem.y,
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
    const dentroSaida = Phaser.Geom.Rectangle.Contains(
      this.zonaSaida,
      personagem.x,
      personagem.y,
    );

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
      if (dentroSaida) this.labelNpc.setVisible(false);
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
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2660,
          spawnY: 310,
        });
      });
    }

    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
