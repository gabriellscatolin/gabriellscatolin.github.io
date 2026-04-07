export default class SceneEscritorio extends Phaser.Scene {
  constructor() {
    super({ key: "SceneEscritorio" });
  }

  // Recebe os dados do personagem vindos da cena anterior
  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || "Pedro";
    this.prefixoEscolhido = dados.prefixo || "HB";
  }

  // Carrega mapa,áudios, tileset e sprites do personagem escolhido
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    // Loga erros de carregamento para facilitar debug
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneEscritorio] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Tilemap do escritório
    this.load.tilemapTiledJSON(
      "escritorio",
      "src/assets/imagens/mapsjson/tileMaps/escritorio.tmj",
    );
    this.load.image(
      "escritorio_tiles",
      "src/assets/imagens/mapsjson/tileSets/escritorio.png",
    );

    //Carrega o áudio
    this.load.audio(
      "trilhaSceneEscritorio",
      "src/assets/audios/trilhaSceneEscritorio.mp3",
    );

    // Sprite do NPC do escritório
    this.load.image(
      "npc_escritorio",
      "src/assets/imagens/imagensPersonagens/NPC/npcEscritorio.png",
    );

    // Carrega os frames de animação do personagem em todas as direções
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

  // Monta o mapa, personagem, áudios, colisões, câmera e saída com tecla E
  create() {
    // Adiciona áudios a cena
    this.musica = this.sound.add("trilhaSceneEscritorio", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    // Cria o tilemap e associa o tileset
    const mapa = this.make.tilemap({ key: "escritorio" });
    const tiles = mapa.addTilesetImage("escritorio", "escritorio_tiles");

    // Fundo neutro para evitar áreas vazias fora do mapa
    this.add
      .rectangle(
        0,
        0,
        mapa.widthInPixels + 200,
        mapa.heightInPixels + 200,
        0x888888,
      )
      .setOrigin(0, 0);

    // Camadas visuais sem colisão
    mapa.createLayer("chao", tiles, 0, 0);
    mapa.createLayer("semcolis", tiles, 0, 0);

    // Camadas com colisão (bloqueiam o personagem)
    const objcomcolis = mapa.createLayer("objcomcolis", tiles, 0, 0);
    const obcomcolis2 = mapa.createLayer("obcomcolis2", tiles, 0, 0);
    const borda = mapa.createLayer("borda", tiles, 0, 0);

    objcomcolis.setCollisionByExclusion([-1]);
    obcomcolis2.setCollisionByExclusion([-1]);
    borda.setCollisionByExclusion([-1]);

    // Remove colisao nas faixas de saida (x=312,y=280 e x=280,y=248)
    const tileW = mapa.tileWidth || 16;
    const tileH = mapa.tileHeight || 16;
    const colInicio = Math.floor(280 / tileW);
    const colFim = Math.ceil(324 / tileW);
    const linInicio = Math.floor(248 / tileH);
    const linFim = Math.ceil(292 / tileH);

    [objcomcolis, obcomcolis2, borda].forEach((camada) => {
      for (let col = colInicio; col <= colFim; col++) {
        for (let lin = linInicio; lin <= linFim; lin++) {
          const tile = camada.getTileAt(col, lin);
          if (tile) tile.setCollision(false, false, false, false);
        }
      }
    });

    // Cria as animações de movimento do personagem
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

    // Define posição inicial fixa dentro do escritório
    const spawnX = 340;
    const spawnY = 392;

    // Cria o personagem com física
    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);

    // Ajusta escala e hitbox para melhor encaixe no tilemap
    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite = this.personagem.height;
    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    // Aplica colisões com as camadas sólidas
    this.physics.add.collider(this.personagem, objcomcolis);
    this.physics.add.collider(this.personagem, obcomcolis2);
    this.physics.add.collider(this.personagem, borda);

    // NPC do escritório
    this.npcEscritorio = this.physics.add
      .staticImage(338, 258, "npc_escritorio")
      .setDepth(5);
    const alturaAlvoNpc = this.personagem.displayHeight;
    this.npcEscritorio.setDisplaySize(
      (this.npcEscritorio.width / this.npcEscritorio.height) *
        (alturaAlvoNpc * 1.2),
      alturaAlvoNpc * 1.2,
    );
    this.npcEscritorio.refreshBody();

    this.physics.add.collider(this.personagem, this.npcEscritorio);

    this.labelNpc = this.add
      .text(338, 277, "[E] Falar", {
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
        this.npcEscritorio.x,
        this.npcEscritorio.y - this.npcEscritorio.displayHeight * 0.5,
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

    console.log(
      "[SceneEscritorio] NPC criado em:",
      this.npcEscritorio.x,
      this.npcEscritorio.y,
    );
    console.log("[SceneEscritorio] Label NPC criado:", !!this.labelNpc);

    // Controles de movimento (setas + WASD)
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Configura a câmera para seguir o personagem
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = "frente";

    // Define zona de saída próxima à porta
    this.zonaSaida = new Phaser.Geom.Rectangle(310, 372, 60, 40);
    this.labelSair = this.add
      .text(340, 392, "[E] Sair", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.dentroZonaSaida = false;
    this.transicionando = false;
    this.perto_npc = false;
    this.falouComNpc =
      this.registry.get("escritorio_dialogo_concluido") === true;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // Texto de debug com coordenadas do personagem
    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "4px",
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

  // Atualiza movimento, animações, interação com NPC e saída por tecla E
  update() {
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    if (Phaser.Input.Keyboard.JustDown(this.teclaF)) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }

    // Zera a velocidade a cada frame para controle preciso
    personagem.setVelocity(0);

    let movendo = false;

    // Movimento horizontal
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

    // Movimento vertical
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

    // Mantém sprite parado na última direção quando não há movimento
    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`esp_${this.direcaoAtual}_1`);
    }

    // Interação com NPC por proximidade
    const distNpc = Phaser.Math.Distance.Between(
      personagem.x,
      personagem.y,
      this.npcEscritorio.x,
      this.npcEscritorio.y,
    );
    const pertoNpc = distNpc < 50;

    console.log(
      `[Debug] Dist NPC: ${distNpc.toFixed(0)}px, Perto: ${pertoNpc}, Label visível: ${this.labelNpc ? this.labelNpc.visible : "null"}`,
    );

    this.perto_npc = pertoNpc;
    this.labelNpc.setVisible(pertoNpc);

    if (pertoNpc) {
      this.labelNpc.setPosition(this.npcEscritorio.x, this.npcEscritorio.y + 2);
    }

    if (!this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setPosition(
        this.npcEscritorio.x,
        this.npcEscritorio.y - this.npcEscritorio.displayHeight * 0.5,
      );
    } else if (this.exclamacaoNpc) {
      this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
    }

    if (pertoNpc && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      if (this.registry.get("escritorio_dialogo_concluido") === true) {
        this.falouComNpc = true;
        this.exclamacaoNpc.setVisible(false);
        if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
      } else {
        this.scene.pause();
        this.scene.launch("SceneDialogoEscritorio", {
          cenaOrigem: "SceneEscritorio",
        });
      }
      return;
    }

    // Verifica se o personagem entrou na zona de saída
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

    // Ao pressionar E na zona, inicia a transição para a cidade
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
          spawnX: 1741,
          spawnY: 1256,
        });
      });
    }

    // Atualiza debug com posição atual do personagem
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
