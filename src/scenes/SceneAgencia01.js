export default class SceneAgencia extends Phaser.Scene {
  constructor() {
    super({ key: "SceneAg" });
  }

  init(dados = {}) {
    // Dados do personagem definidos pela cena anterior
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
    this.spawnXCustom = dados.spawnX ?? null;
    this.spawnYCustom = dados.spawnY ?? null;
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneAgencia] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Mapa e tilesets da agência
    this.load.tilemapTiledJSON(
      "agencia",
      "src/assets/imagens/mapsjson/tileMaps/Agência01.tmj",
    );
    this.load.image(
      "ag_roombuilder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "ag_interior_s1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png",
    );
    this.load.image(
      "ag_interior_s2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png",
    );
    this.load.image(
      "ag_interior_s3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png",
    );
    this.load.image(
      "ag_interior_s4",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png",
    );
    this.load.image(
      "ag_interior_s5",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png",
    );

    // Sprite do NPC da agência
    this.load.image(
      "npc_agencia",
      "src/assets/imagens/imagensPersonagens/NPC/npcAgencia01.png",
    );

    // Sprites do personagem selecionado
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

  create() {
    // ── MAPA ──────────────────────────────────────────────────────────────────
    const mapa = this.make.tilemap({ key: "agencia" });
    this.mapa = mapa;

    const spawnX = this.spawnXCustom ?? 297;
    const spawnY = this.spawnYCustom ?? 395;
    const saidaX = spawnX;
    const saidaY = spawnY;

    // Garante que câmera e mundo incluam a posição pedida, mesmo fora do tamanho base do mapa.
    const limiteLargura = Math.max(mapa.widthInPixels, spawnX + 64);
    const limiteAltura = Math.max(mapa.heightInPixels, spawnY + 64);

    const tsRoomBuilder = mapa.addTilesetImage("roombuilder", "ag_roombuilder");
    const tsInteriorS1 = mapa.addTilesetImage("interior_s1", "ag_interior_s1");
    const tsInteriorS2 = mapa.addTilesetImage("interior_s2", "ag_interior_s2");
    const tsInteriorS3 = mapa.addTilesetImage("interior_s3", "ag_interior_s3");
    const tsInteriorS4 = mapa.addTilesetImage("interior_s4", "ag_interior_s4");
    const tsInteriorS5 = mapa.addTilesetImage("interior_s5", "ag_interior_s5");

    const tilesets = [
      tsRoomBuilder,
      tsInteriorS1,
      tsInteriorS2,
      tsInteriorS3,
      tsInteriorS4,
      tsInteriorS5,
    ].filter(Boolean);

    this.add
      .rectangle(0, 0, limiteLargura + 200, limiteAltura + 200, 0x888888)
      .setOrigin(0, 0);

    // ── CAMADAS SEM COLISÃO ───────────────────────────────────────────────────
    this._criarCamada(mapa, "chao", tilesets);
    this._criarCamada(mapa, "tapete", tilesets);
    this._criarCamada(mapa, "parede", tilesets);
    this._criarCamada(mapa, "quadro", tilesets);
    this._criarCamada(mapa, "cadeira - n", tilesets);
    this._criarCamada(mapa, "cadeira 2 - n", tilesets);
    this._criarCamada(mapa, "objetos - n", tilesets);
    this._criarCamada(mapa, "objetos2 - n", tilesets);
    this._criarCamada(mapa, "spawn", tilesets);

    // ── CAMADAS COM COLISÃO ───────────────────────────────────────────────────
    const objC = this._criarCamada(mapa, "objetos - c", tilesets);
    const decC = this._criarCamada(mapa, "decoracao - c", tilesets);
    const decC2 = this._criarCamada(mapa, "decoracao2 - c", tilesets);
    const bordas = this._criarCamada(mapa, "bordas", tilesets);
    const borda2 = this._criarCamada(mapa, "borda2", tilesets);

    const camadasColisao = [objC, decC, decC2, bordas, borda2].filter(Boolean);
    camadasColisao.forEach((c) => c.setCollisionByExclusion([-1]));

    // ── REMOVER COLISÃO NA FAIXA BLOQUEADA ───────────────────────────────────
    // Região problemática: y≈108, x de 40 até 168
    // Em tiles (16px cada): linhas 6-7, colunas 2-10
    // Usamos Math.floor/ceil para cobrir a faixa completa informada
    const tileW = mapa.tileWidth || 16;
    const tileH = mapa.tileHeight || 16;

    const linhaInicio = Math.floor(96 / tileH); // 6
    const linhaFim = Math.ceil(120 / tileH); // 7 (um tile a mais por segurança)
    const colunaInicio = Math.floor(40 / tileW); // 2
    const colunaFim = Math.ceil(168 / tileW); // 10 (inclusive)

    camadasColisao.forEach((camada) => {
      for (let linha = linhaInicio; linha <= linhaFim; linha++) {
        for (let col = colunaInicio; col <= colunaFim; col++) {
          const tile = camada.getTileAt(col, linha);
          if (tile) tile.setCollision(false, false, false, false);
        }
      }
    });

    // Garante espaço livre no ponto de spawn para não empurrar o personagem.
    const colSpawn = Math.floor(spawnX / tileW);
    const linSpawn = Math.floor(spawnY / tileH);
    camadasColisao.forEach((camada) => {
      for (let lin = linSpawn - 1; lin <= linSpawn + 1; lin++) {
        for (let col = colSpawn - 1; col <= colSpawn + 1; col++) {
          const tile = camada.getTileAt(col, lin);
          if (tile) tile.setCollision(false, false, false, false);
        }
      }
    });

    // ── ANIMAÇÕES ─────────────────────────────────────────────────────────────
    ["frente", "tras", "direita", "esquerda"].forEach((dir) => {
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

    // ── PERSONAGEM ────────────────────────────────────────────────────────────
    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);

    const larguraSprite = this.personagem.width;
    const alturaSprite = this.personagem.height;
    const escala = Math.min(
      (tileW * 0.4) / larguraSprite,
      (tileW * 0.4) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    camadasColisao.forEach((c) =>
      this.physics.add.collider(this.personagem, c),
    );

    // ── NPC ───────────────────────────────────────────────────────────────────
    this.npcAgencia = this.physics.add
      .staticImage(65, 57, "npc_agencia")
      .setDepth(5);
    const alturaAlvo = this.personagem.displayHeight;
    this.npcAgencia.setDisplaySize(
      (this.npcAgencia.width / this.npcAgencia.height) * (alturaAlvo * 1.2),
      alturaAlvo * 1.2,
    );
    this.npcAgencia.refreshBody();

    this.physics.add.collider(this.personagem, this.npcAgencia);

    this.labelNpc = this.add
      .text(65, 76, "[E] Falar", {
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
        this.npcAgencia.x,
        this.npcAgencia.y - this.npcAgencia.displayHeight * 0.5,
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

    // ── CONTROLES ─────────────────────────────────────────────────────────────
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // ── CÂMERA ────────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(6.5);
    const larguraVisivel = this.cameras.main.width / this.cameras.main.zoom;
    const alturaVisivel = this.cameras.main.height / this.cameras.main.zoom;
    const meiaLargura = larguraVisivel * 0.5;
    const meiaAltura = alturaVisivel * 0.5;

    // Trava o scroll para a direita: a câmera só pode ir para a esquerda a partir do spawn.
    const limiteCameraLargura = Math.max(larguraVisivel, spawnX + meiaLargura);
    const limiteCameraAltura = Math.max(limiteAltura, spawnY + meiaAltura);

    this.cameras.main.setBounds(0, 0, limiteCameraLargura, limiteCameraAltura);
    this.physics.world.setBounds(0, 0, limiteLargura, limiteAltura);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.scrollXMaxInicial = this.cameras.main.scrollX;
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = "frente";

    // ── SAÍDA COM TECLA E ─────────────────────────────────────────────────────
    // A saída fica no mesmo ponto do spawn
    this.zonasSaida = [{ x: saidaX, y: saidaY, raio: 25 }];
    this.labelSair = this.add
      .text(saidaX, saidaY, "[E] Sair", {
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
    this.falouComNpc = false;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // ── DEBUG ─────────────────────────────────────────────────────────────────
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

  // ── HELPERS ───────────────────────────────────────────────────────────────

  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) console.warn("[SceneAgencia] Camada não encontrada:", nome);
      return camada;
    } catch (erro) {
      console.error(
        "[SceneAgencia] Erro ao criar camada",
        nome,
        ":",
        erro.message,
      );
      return null;
    }
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────

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

    // ── INTERAÇÃO COM NPC ───────────────────────────────────────────────────
    const distNpc = Phaser.Math.Distance.Between(
      personagem.x,
      personagem.y,
      this.npcAgencia.x,
      this.npcAgencia.y,
    );
    const pertoNpc = distNpc < 30;

    this.perto_npc = pertoNpc;
    this.labelNpc.setVisible(pertoNpc);

    if (pertoNpc) {
      this.labelNpc.setPosition(this.npcAgencia.x, this.npcAgencia.y + 2);
    }

    if (!this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setPosition(
        this.npcAgencia.x,
        this.npcAgencia.y - this.npcAgencia.displayHeight * 0.5,
      );
    }

    if (pertoNpc && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.falouComNpc = true;
      this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
      console.log("[SceneAgencia] Interagiu com o NPC da agência");
    }

    // ── SAÍDA AUTOMÁTICA ─────────────────────────────────────────────────────
    const dentroSaida = (this.zonasSaida || []).some((z) => {
      const d = Phaser.Math.Distance.Between(
        personagem.x,
        personagem.y,
        z.x,
        z.y,
      );
      return d <= z.raio;
    });

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
      if (dentroSaida) this.labelNpc.setVisible(false);
    }

    // Mantém a câmera sem scroll para a direita (apenas para esquerda).
    if (typeof this.scrollXMaxInicial === "number") {
      this.cameras.main.scrollX = Math.min(
        this.cameras.main.scrollX,
        this.scrollXMaxInicial,
      );
    }

    // Transição para a cidade ao pressionar E na saída
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
          spawnX: 976,
          spawnY: 856,
        });
      });
    }

    // ── Debug ─────────────────────────────────────────────────────────────
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
