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

    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneLojaDeRoupas] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

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
      "loja_tile_int_s1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png",
    );
    this.load.image(
      "loja_tile_int_s2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png",
    );
    this.load.image(
      "loja_tile_int_s3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png",
    );
    this.load.image(
      "loja_tile_int_s4",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png",
    );
    this.load.image(
      "loja_tile_int_s5",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png",
    );
    this.load.image(
      "npc_loja_roupas",
      "src/assets/imagens/imagensPersonagens/NPC/npcLoja_Roupas.png",
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

  prepararTilesetsLoja() {
    const cacheMapa = this.cache.tilemap.get("lojaDeRoupas");
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    if (dadosMapa.tilesets.some((ts) => ts.name === "Interiors_16x16_S1")) {
      return;
    }

    const novosTilesets = [];

    dadosMapa.tilesets.forEach((ts) => {
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

      novosTilesets.push(ts);
    });

    dadosMapa.tilesets = novosTilesets;
  }

  create() {
    // Adiciona áudios a cena
    this.musica = this.sound.add("trilhaLojaDeRoupa", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    this.prepararTilesetsLoja();

    // Carrega o mapa
    const mapa = this.make.tilemap({ key: "lojaDeRoupas" });

    // Adiciona tilesets
    const roomBuilder = mapa.addTilesetImage(
      "Room_Builder_16x16",
      "loja_tile_rb",
    );
    const interiorsS1 = mapa.addTilesetImage(
      "Interiors_16x16_S1",
      "loja_tile_int_s1",
    );
    const interiorsS2 = mapa.addTilesetImage(
      "Interiors_16x16_S2",
      "loja_tile_int_s2",
    );
    const interiorsS3 = mapa.addTilesetImage(
      "Interiors_16x16_S3",
      "loja_tile_int_s3",
    );
    const interiorsS4 = mapa.addTilesetImage(
      "Interiors_16x16_S4",
      "loja_tile_int_s4",
    );
    const interiorsS5 = mapa.addTilesetImage(
      "Interiors_16x16_S5",
      "loja_tile_int_s5",
    );

    const tiles = [
      roomBuilder,
      interiorsS1,
      interiorsS2,
      interiorsS3,
      interiorsS4,
      interiorsS5,
    ].filter(Boolean);

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

    // Cria layers na ordem do TMJ (bottom → top), aplicando colisão nas certas
    const coliders = [];
    const ordemTMJ = [
      { name: "N - Chão", colide: false },
      { name: "C - ParedeComColid_embaixo", colide: true },
      { name: "C - ParedeComColid", colide: true },
      { name: "N - ParedeSemColid", colide: false },
      { name: "N - ObjetsoSemColid_0", colide: false },
      { name: "PLAYER", colide: false },
      { name: "C - Objetos ComColid", colide: true },
      { name: "N - ObjetosSemColid", colide: false },
      { name: "N - ObjetosSemColid_02", colide: false },
      { name: "N - ObjetosSemColid_3", colide: false },
    ];

    ordemTMJ.forEach(({ name, colide }) => {
      const layer = mapa.createLayer(name, tiles, 0, 0);
      if (layer && colide) {
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
    this.player = this.physics.add.sprite(76, 246, "loja_frente_1");
    this.player.setCollideWorldBounds(true);

    const escala =
      ((mapa.tileWidth || 16) /
        Math.max(this.player.width, this.player.height)) *
      0.4;
    this.player.setScale(Math.max(0.05, escala));
    this.player.body.setSize(50, 50);

    // Colisões
    coliders.forEach((c) => {
      this.physics.add.collider(this.player, c);
    });

    this.npcLoja = this.add.image(226, 109, "npc_loja_roupas").setDepth(5);
    const alturaAlvoNpc = this.player.displayHeight;
    this.npcLoja.setDisplaySize(
      (this.npcLoja.width / this.npcLoja.height) * alturaAlvoNpc,
      alturaAlvoNpc,
    );

    this.labelNpc = this.add
      .text(226, 131, "[E] Falar", {
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
        this.npcLoja.x,
        this.npcLoja.y - this.npcLoja.displayHeight * 0.5,
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
    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Câmera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(5);
    this.cameras.main.roundPixels = true;
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direction = "frente";

    this._criarPopupMissaoLoja();
    this.registry.set("missaoLojaDeRoupasTexto", "Missão: Fale com o Eduardo.");
    this._atualizarPopupMissaoLoja(true);

    // Zona de saída (principal + tolerância para garantir interação)
    this.zonasSaida = this._criarZonasSaida();
    this.nearExit = false;
    this.perto_npc = false;
    this.falouComNpc =
      this.registry.get("loja_roupas_dialogo_concluido") === true;
    this.isTransitioning = false;
    this.podeSairLoja = false;

    if (this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
    }

    this.exitLabel = this.add
      .text(73, 279, "[Saída]", {
        fontSize: "6px",
        color: "#fff",
        backgroundColor: "#000c",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    // Pausa  a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
      if (this.missaoLojaTimer) {
        this.missaoLojaTimer.remove();
        this.missaoLojaTimer = null;
      }
    });
  }

  _criarPopupMissaoLoja() {
    const popupX = this.scale.width / 2;
    const popupY = 56;

    this.missaoLojaBg = this.add
      .rectangle(popupX, popupY, 340, 44, 0x000000, 0.8)
      .setDepth(240)
      .setScrollFactor(0)
      .setOrigin(0.5);

    this.missaoLojaTexto = this.add
      .text(popupX, popupY, "", {
        fontSize: "24px",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(241)
      .setScrollFactor(0);
  }

  _medirLarguraPopupMissaoLoja(texto) {
    const medidor = this.add.text(-9999, -9999, texto, {
      fontSize: "24px",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });
    const largura = medidor.displayWidth + 64;
    medidor.destroy();
    return Phaser.Math.Clamp(largura, 340, this.scale.width - 40);
  }

  _atualizarPopupMissaoLoja(animarTexto) {
    if (!this.missaoLojaBg || !this.missaoLojaTexto) return;

    const texto =
      this.registry.get("missaoLojaDeRoupasTexto") ||
      "Missão: Fale com o Eduardo.";
    if (!texto) return;

    const larguraFinal = this._medirLarguraPopupMissaoLoja(texto);
    this.missaoLojaBg.setSize(larguraFinal, this.missaoLojaBg.height);

    if (this.missaoLojaMensagemAtual === texto && !animarTexto) return;
    this.missaoLojaMensagemAtual = texto;

    if (this.missaoLojaTimer) {
      this.missaoLojaTimer.remove();
      this.missaoLojaTimer = null;
    }

    if (!animarTexto) {
      this.missaoLojaTexto.setText(texto);
      return;
    }

    let charIndex = 0;
    this.missaoLojaTexto.setText("");
    this.missaoLojaTimer = this.time.addEvent({
      delay: 25,
      repeat: texto.length - 1,
      callback: () => {
        charIndex++;
        this.missaoLojaTexto.setText(texto.substring(0, charIndex));
      },
    });
  }

  _criarZonasSaida() {
    return [
      new Phaser.Geom.Rectangle(43, 259, 60, 40),
      new Phaser.Geom.Rectangle(46, 269, 60, 40),
    ];
  }

  update() {
    const speed = 150;
    const { player, cursors } = this;

    player.setVelocity(0);
    let moving = false;

    if (cursors.left.isDown) {
      player.setVelocityX(-speed);
      player.anims.play("loja_walk_esquerda", true);
      this.direction = "esquerda";
      moving = true;
    } else if (cursors.right.isDown) {
      player.setVelocityX(speed);
      player.anims.play("loja_walk_direita", true);
      this.direction = "direita";
      moving = true;
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-speed);
      if (!moving) player.anims.play("loja_walk_tras", true);
      this.direction = "tras";
      moving = true;
    } else if (cursors.down.isDown) {
      player.setVelocityY(speed);
      if (!moving) player.anims.play("loja_walk_frente", true);
      this.direction = "frente";
      moving = true;
    }

    if (!moving) {
      player.anims.stop();
      player.setTexture(`loja_${this.direction}_1`);
    }

    // Detecção da zona de saída
    const inExit = (this.zonasSaida || []).some((zona) =>
      Phaser.Geom.Rectangle.Contains(zona, player.x, player.y),
    );

    const distNpc = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      this.npcLoja.x,
      this.npcLoja.y,
    );
    const pertoNpc = distNpc < 30;

    if (pertoNpc !== this.perto_npc) {
      this.perto_npc = pertoNpc;
      this.labelNpc.setVisible(pertoNpc && !this.nearExit);
    }

    if (pertoNpc) {
      this.labelNpc.setPosition(this.npcLoja.x, this.npcLoja.y + 2);
    }

    if (!this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setPosition(
        this.npcLoja.x,
        this.npcLoja.y - this.npcLoja.displayHeight * 0.5,
      );
    }

    if (
      !this.falouComNpc &&
      pertoNpc &&
      Phaser.Input.Keyboard.JustDown(this.teclaE)
    ) {
      this.falouComNpc = true;
      this.registry.set("loja_roupas_dialogo_concluido", true);
      this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
      this.scene.pause();
      this.scene.launch("SceneDialogoLojaDeRoupas", {
        cenaOrigem: "SceneLojaDeRoupas",
      });
    }

    if (inExit !== this.nearExit) {
      this.nearExit = inExit;
      this.exitLabel.setVisible(inExit && this.falouComNpc);
      if (inExit) this.labelNpc.setVisible(false);
    }

    if (inExit) {
      this.exitLabel.setPosition(player.x, player.y - 15);

    }

    if (!this.podeSairLoja && !inExit) {
      this.podeSairLoja = true;
    }

    if (inExit && !this.isTransitioning && this.podeSairLoja) {
        this.isTransitioning = true;
        this.exitLabel.setVisible(false);
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.registry.set("ag02_escolta_pj_salao", false);
          this.registry.set("ag02_escolta_pj_metro", true);
          this.registry.set("ag02_pj_metro_retorno", false);
          this.registry.set(
            "missaoCidadeTexto",
            "Missão: Siga a PJ Camila até o Metrô.",
          );

          this.scene.start("SceneCidade", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
            spawnX: 2248,
            spawnY: 1568,
            escoltaPJMetro: true,
            missaoCidadeTexto: "Missão: Siga a PJ Camila até o Metrô.",
          });
        });
    }
  }
}
