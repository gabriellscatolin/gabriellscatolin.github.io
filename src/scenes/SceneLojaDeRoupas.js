export default class SceneLojaDeRoupas extends Phaser.Scene {
  constructor() {
    super({ key: "SceneLojaDeRoupas" });
  }

  init(dados = {}) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    // Carrega o áudio da cena
    this.load.audio(
      "trilhaLojaDeRoupa",
      "src/assets/audios/trilhaLojaDeRoupa.mp3",
    );

    // Mapa
    this.load.tilemapTiledJSON(
      "lojaDeRoupas",
      "src/assets/imagens/mapsjson/tileMaps/salaoDeBeleza.tmj",
    );

    // Tilesets
    this.load.image(
      "loja_tile_rb",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "loja_tile_int",
      "src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png",
    );

    // Sprites do personagem
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `loja_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `loja_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `loja_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `loja_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  create() {

    // Adiciona áudios a cena
    this.musica = this.sound.add('trilhaLojaDeRoupa', { loop: true, volume: 0.5});
    this.musica.play();

    // Carrega o mapa
    const mapa = this.make.tilemap({ key: "lojaDeRoupas" });

    // Adiciona tilesets
    const roomBuilder = mapa.addTilesetImage(
      "Room_Builder_16x16",
      "loja_tile_rb",
    );
    const interiors = mapa.addTilesetImage(
      "Interiors_16x16",
      "loja_tile_int",
    );

    const tiles = [roomBuilder, interiors].filter(Boolean);

    // Fundo cinza
    this.add
      .rectangle(
        0,
        0,
        mapa.widthInPixels + 100,
        mapa.heightInPixels + 100,
        0x666666,
      )
      .setOrigin(0, 0);

    // Cria layers sem colisão (cada layer em sua ordem)
    const layersNormais = [
      "N - Chão",
      "N - ParedeSemColid",
      "N - ObjetsoSemColid_0",
      "PLAYER",
      "N - ObjetosSemColid",
      "N - ObjetosSemColid_02",
      "N - ObjetosSemColid_3",
    ];

    layersNormais.forEach((name) => {
      mapa.createLayer(name, tiles, 0, 0);
    });

    // Layers com colisão
    const layersColisao = [
      "C - ParedeComColid_embaixo",
      "C - ParedeComColid",
      "C - Objetos ComColid",
    ];

    const coliders = [];
    layersColisao.forEach((name) => {
      const layer = mapa.createLayer(name, tiles, 0, 0);
      if (layer) {
        layer.setCollisionByExclusion([-1]);
        coliders.push(layer);
      }
    });

    // Animações
    ["frente", "tras", "direita", "esquerda"].forEach((dir) => {
      if (!this.anims.exists(`loja_walk_${dir}`)) {
        this.anims.create({
          key: `loja_walk_${dir}`,
          frames: [
            { key: `loja_${dir}_1` },
            { key: `loja_${dir}_2` },
            { key: `loja_${dir}_3` },
            { key: `loja_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Personagem spawn
    this.player = this.physics.add.sprite(100, 160, "loja_frente_1");
    this.player.setCollideWorldBounds(true);

    const escala = (mapa.tileWidth || 16) / Math.max(
      this.player.width,
      this.player.height,
    ) * 0.4;
    this.player.setScale(Math.max(0.05, escala));
    this.player.body.setSize(50, 50);

    // Colisões
    coliders.forEach((c) => {
      this.physics.add.collider(this.player, c);
    });

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Câmera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(5);
    this.cameras.main.roundPixels = true;
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direction = "frente";

    // Zona de saida
    this.exitZone = { x: 100, y: 50, radius: 40 };
    this.nearExit = false;
    this.isTransitioning = false;

    this.exitLabel = this.add
      .text(100, 50, "[E] Sair", {
        fontSize: "3px",
        color: "#fff",
        backgroundColor: "#000c",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.debugText = this.add
      .text(0, 0, "", {
        fontSize: "4px",
        color: "#ff0",
        backgroundColor: "#000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);

    // Pausa  a trilha sonora ao iniciar nova cena
     this.events.on("shutdown", () => {
     this.musica.stop();
    });
  }

  update() {
    const speed = 150;
    const { player, cursors, wasd } = this;

    player.setVelocity(0);
    let moving = false;

    if (cursors.left.isDown || wasd.A.isDown) {
      player.setVelocityX(-speed);
      player.anims.play("loja_walk_esquerda", true);
      this.direction = "esquerda";
      moving = true;
    } else if (cursors.right.isDown || wasd.D.isDown) {
      player.setVelocityX(speed);
      player.anims.play("loja_walk_direita", true);
      this.direction = "direita";
      moving = true;
    }

    if (cursors.up.isDown || wasd.W.isDown) {
      player.setVelocityY(-speed);
      if (!moving) player.anims.play("loja_walk_tras", true);
      this.direction = "tras";
      moving = true;
    } else if (cursors.down.isDown || wasd.S.isDown) {
      player.setVelocityY(speed);
      if (!moving) player.anims.play("loja_walk_frente", true);
      this.direction = "frente";
      moving = true;
    }

    if (!moving) {
      player.anims.stop();
      player.setTexture(`loja_${this.direction}_1`);
    }

    // Exit detection
    const dist = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      this.exitZone.x,
      this.exitZone.y,
    );
    const inExit = dist <= this.exitZone.radius;

    if (inExit !== this.nearExit) {
      this.nearExit = inExit;
      this.exitLabel.setVisible(inExit);
    }

    if (inExit) {
      this.exitLabel.setPosition(player.x, player.y - 15);

      if (!this.isTransitioning && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
        this.isTransitioning = true;
        this.exitLabel.setVisible(false);
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneCidade", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
            spawnX: 2248,
            spawnY: 1568,
          });
        });
      }
    }

    this.debugText.setText(
      `x: ${Math.round(player.x).toString().padStart(4)} y: ${Math.round(player.y).toString().padStart(4)}`,
    );
    this.debugText.setPosition(player.x - 20, player.y - 20);
  }
}
