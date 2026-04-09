export default class SceneMiniGame extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMiniGame" });
  }

  init(dados = {}) {
    this.retornoSpawnX = Number.isFinite(Number(dados.spawnX))
      ? Number(dados.spawnX)
      : 676;
    this.retornoSpawnY = Number.isFinite(Number(dados.spawnY))
      ? Number(dados.spawnY)
      : 200;
  }

  preload() {
    this.load.image(
      "background1",
      "src/assets/imagens/imagensMiniGame/parque.png",
    );
    this.load.image(
      "background2",
      "src/assets/imagens/imagensMiniGame/praia.png",
    );
    this.load.image(
      "background3",
      "src/assets/imagens/imagensMiniGame/cidade.png",
    );
    this.load.image(
      "background4",
      "src/assets/imagens/imagensMiniGame/noite.png",
    );

    this.load.image(
      "moedaComum",
      "src/assets/imagens/imagensMiniGame/moedaComum.png",
    );
    this.load.image(
      "moedaExtra",
      "src/assets/imagens/imagensMiniGame/moedaExtra.png",
    );
    this.load.image("bomba", "src/assets/imagens/imagensMiniGame/bomba.png");

    this.load.image(
      "plataformaNuvem",
      "src/assets/imagens/imagensMiniGame/plataformaNuvem.png",
    );

    this.load.spritesheet(
      "patoBAndandoDireita",
      "src/assets/imagens/imagensMiniGame/sprite/patoBAnadandoDireita.png",
      { frameWidth: 1024, frameHeight: 1024 },
    );
    this.load.spritesheet(
      "patoBAndandoEsquerda",
      "src/assets/imagens/imagensMiniGame/sprite/patoBAndandoEsquerda.png",
      { frameWidth: 1024, frameHeight: 1024 },
    );
    this.load.spritesheet(
      "personagemPulando",
      "src/assets/imagens/imagensMiniGame/sprite/personagemPulando.png",
      { frameWidth: 1024, frameHeight: 1024 },
    );
    this.load.spritesheet(
      "personagemParado",
      "src/assets/imagens/imagensMiniGame/sprite/personagemParado.png",
      { frameWidth: 1024, frameHeight: 1024 },
    );

    this.load.audio(
      "musicaFase1",
      "src/assets/imagens/imagensMiniGame/musicas/musicaCenaParque.mp3",
    );
    this.load.audio(
      "musicaFase2",
      "src/assets/imagens/imagensMiniGame/musicas/musicaCenaPraia.mp3",
    );
    this.load.audio(
      "musicaFase3",
      "src/assets/imagens/imagensMiniGame/musicas/musicaCenaCidade.mp3",
    );
    this.load.audio(
      "musicaFase4",
      "src/assets/imagens/imagensMiniGame/musicas/musicaCenaNoite.mp3",
    );
    this.load.audio(
      "somColeta",
      "src/assets/imagens/imagensMiniGame/musicas/somColetaitem.mp3",
    );
  }

  create() {
    this._onResize = null;

    const GW = this.scale.width;
    const GH = this.scale.height;
    const zoomMinigame = 0.62;
    const worldWidth = Math.round(GW / zoomMinigame);
    const worldHeight = Math.round(GH / zoomMinigame);

    ["andar_direita", "andar_esquerda", "pulo", "parado"].forEach((key) => {
      if (this.anims.exists(key)) this.anims.remove(key);
    });

    this.physics.world.gravity.y = 1200;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.faseAtual = 1;
    this.pontuacao = 0;
    this.direcao = "direita";
    this.jogoAcabou = false;

    this.tempoTotal = 120;
    this.tempoRestante = this.tempoTotal;
    this.tempoFaseAtual = 0;

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: this._tickTimer,
      callbackScope: this,
    });

    this.musica = this.sound.add("musicaFase1", { loop: true, volume: 0.5 });
    this.somColeta = this.sound.add("somColeta", { volume: 0.7 });

    this.input.keyboard.once("keydown", () => {
      if (this.musica && !this.musica.isPlaying) this.musica.play();
    });
    this.input.once("pointerdown", () => {
      if (this.musica && !this.musica.isPlaying) this.musica.play();
    });

    this.fundo1 = this.add
      .image(worldWidth / 2, worldHeight / 2, "background1")
      .setDisplaySize(worldWidth, worldHeight);

    this.patoBranco = this.physics.add
      .sprite(worldWidth * 0.2, worldHeight * 0.5, "patoBAndandoDireita")
      .setScale(0.3)
      .setCollideWorldBounds(true);
    this.patoBranco.body.setSize(500, 700);
    this.patoBranco.body.setOffset(262, 280);

    this.teclado = this.input.keyboard.createCursorKeys();

    this.chao1 = this.physics.add.staticImage(worldWidth / 2, worldHeight + 10, null);
    this.chao1.displayWidth = worldWidth;
    this.chao1.displayHeight = 60;
    this.chao1.refreshBody();
    this.chao1.setVisible(false);
    this.physics.add.collider(this.patoBranco, this.chao1);

    this.plataformaNuvem = this.physics.add.sprite(
      worldWidth * 0.28,
      worldHeight * 0.62,
      "plataformaNuvem",
    );
    this.plataformaNuvem.setScale(1.5);
    this.plataformaNuvem.body.setImmovable(true);
    this.plataformaNuvem.body.allowGravity = false;
    this.plataformaNuvem.body.setSize(650, 80);
    this.plataformaNuvem.body.setOffset(450, 500);
    this.physics.add.collider(this.patoBranco, this.plataformaNuvem);

    this.plataformaNuvem2 = this.physics.add.sprite(
      worldWidth * 0.72,
      worldHeight * 0.42,
      "plataformaNuvem",
    );
    this.plataformaNuvem2.setScale(1.5);
    this.plataformaNuvem2.body.setImmovable(true);
    this.plataformaNuvem2.body.allowGravity = false;
    this.plataformaNuvem2.body.setSize(650, 80);
    this.plataformaNuvem2.body.setOffset(450, 500);
    this.physics.add.collider(this.patoBranco, this.plataformaNuvem2);

    this.moedaComum = this.physics.add.sprite(worldWidth / 2, 0, "moedaComum");
    this.moedaComum.setScale(0.23);
    this.moedaComum.body.setSize(
      this.moedaComum.width * 0.6,
      this.moedaComum.height * 0.6,
    );
    this.moedaComum.setCollideWorldBounds(true);
    this.moedaComum.setBounce(0.5);
    this.physics.add.collider(this.moedaComum, this.plataformaNuvem);
    this.physics.add.collider(this.moedaComum, this.plataformaNuvem2);
    this.physics.add.collider(this.moedaComum, this.chao1);

    this.moedaExtra = this.physics.add.sprite(0, 0, "moedaExtra");
    this.moedaExtra.setScale(0.23);
    this.moedaExtra.body.setSize(
      this.moedaExtra.width * 0.6,
      this.moedaExtra.height * 0.6,
    );
    this.moedaExtra.setCollideWorldBounds(true);
    this.moedaExtra.setBounce(0.5);
    this.moedaExtra.setVisible(false);
    this.moedaExtra.setActive(false);
    this.physics.add.collider(this.moedaExtra, this.plataformaNuvem);
    this.physics.add.collider(this.moedaExtra, this.plataformaNuvem2);
    this.physics.add.collider(this.moedaExtra, this.chao1);

    this.bomba = this.physics.add.sprite(0, 0, "bomba");
    this.bomba.setScale(0.23);
    this.bomba.body.setSize(this.bomba.width * 0.6, this.bomba.height * 0.6);
    this.bomba.setCollideWorldBounds(true);
    this.bomba.setBounce(0.5);
    this.bomba.disableBody(true, true);
    this.physics.add.collider(this.bomba, this.plataformaNuvem);
    this.physics.add.collider(this.bomba, this.plataformaNuvem2);
    this.physics.add.collider(this.bomba, this.chao1);

    this.hudBg = this.add
      .rectangle(20, 20, 420, 80, 0x000000, 0.45)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.placar = this.add.text(30, 28, "Cielocoins: " + this.pontuacao, {
      fontSize: "90px",
      fontFamily: "poppins",
      fontStyle: "bold",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 6,
    });
    this.placar.setScrollFactor(0);

    this.timerBg = this.add
      .rectangle(GW - 20, 20, 320, 80, 0x000000, 0.45)
      .setOrigin(1, 0)
      .setScrollFactor(0);

    this.timerTexto = this.add
      .text(GW - 30, 28, this._formatarTempo(this.tempoRestante), {
        fontSize: "90px",
        fontFamily: "poppins",
        fontStyle: "bold",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    this._ajustarHud();

    this.time.addEvent({
      delay: 20000,
      callback: this.spawnMoedaExtra,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => {
        this.spawnBomba();
      },
    });

    this.physics.add.overlap(this.patoBranco, this.moedaExtra, () => {
      if (!this.moedaExtra.active) return;
      this.somColeta.play();
      this.moedaExtra.disableBody(true, true);
      this.pontuacao += 3;
      this._atualizarPlacar();
    });

    this.physics.add.overlap(this.patoBranco, this.bomba, () => {
      if (!this.bomba.active) return;
      this.somColeta.play();
      this.bomba.disableBody(true, true);
      this.pontuacao = Math.max(0, this.pontuacao - 1);
      this._atualizarPlacar();
    });

    this.physics.add.overlap(this.patoBranco, this.moedaComum, () => {
      this.moedaComum.setVisible(false);
      this.somColeta.play();
      const posicaoX = Phaser.Math.Between(50, worldWidth - 50);
      this.moedaComum.setPosition(posicaoX, 50);
      this.pontuacao += 1;
      this._atualizarPlacar();
      this.moedaComum.setVisible(true);
    });

    this.anims.create({
      key: "andar_direita",
      frames: this.anims.generateFrameNumbers("patoBAndandoDireita", {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "andar_esquerda",
      frames: this.anims.generateFrameNumbers("patoBAndandoEsquerda", {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "pulo",
      frames: this.anims.generateFrameNumbers("personagemPulando", {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "parado",
      frames: this.anims.generateFrameNumbers("personagemParado", {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.cameras.main.startFollow(this.patoBranco);
    this.cameras.main.setZoom(zoomMinigame);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.events.on("shutdown", () => {
      if (this.musica) this.musica.stop();
      ["andar_direita", "andar_esquerda", "pulo", "parado"].forEach((key) => {
        if (this.anims.exists(key)) this.anims.remove(key);
      });
    });
  }

  // ─── TICK DO TIMER (chamado a cada 1 segundo) ─────────────────────
  _tickTimer() {
    if (this.jogoAcabou) return;

    this.tempoRestante -= 1;
    this.tempoFaseAtual += 1;

    // Atualiza texto do timer
    this.timerTexto.setText(this._formatarTempo(this.tempoRestante));

    // Deixa o timer vermelho nos últimos 10 segundos
    if (this.tempoRestante <= 10) {
      this.timerTexto.setStyle({ fill: "#ff3333" });
    }

    // Troca de fase a cada 30 segundos
    if (this.tempoFaseAtual >= 30) {
      this.tempoFaseAtual = 0;
      if (this.faseAtual === 1)
        this.trocarFase(2, "background2", "musicaFase2");
      else if (this.faseAtual === 2)
        this.trocarFase(3, "background3", "musicaFase3");
      else if (this.faseAtual === 3)
        this.trocarFase(4, "background4", "musicaFase4");
    }

    // Tempo esgotado → fim de jogo
    if (this.tempoRestante <= 0) {
      this.gameOver();
    }
  }

  // ─── FORMATA mm:ss ────────────────────────────────────────────────
  _formatarTempo(segundos) {
    const m = Math.floor(segundos / 60)
      .toString()
      .padStart(2, "0");
    const s = (segundos % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // ─── HELPERS HUD ─────────────────────────────────────────────────
  _atualizarPlacar() {
    this.placar.setText("Cielocoins: " + this.pontuacao);
    this._ajustarHud();
  }

  _ajustarHud() {
    const padding = 20;
    this.hudBg.setSize(
      this.placar.width + padding * 2,
      this.placar.height + padding,
    );
    this.timerBg.setSize(
      this.timerTexto.width + padding * 2,
      this.timerTexto.height + padding,
    );
  }

  update() {
    if (this.jogoAcabou) return;

    // ─── Movimento horizontal — levemente mais rápido (500) ───────
    this.patoBranco.setVelocityX(0);

    if (this.teclado.left.isDown) {
      this.patoBranco.setVelocityX(-700);
      this.direcao = "esquerda";
    } else if (this.teclado.right.isDown) {
      this.patoBranco.setVelocityX(700);
      this.direcao = "direita";
    }

    // ─── Pulo muito mais alto (-1300) ─────────────────────────────
    if (this.teclado.up.isDown && this.patoBranco.body.touching.down) {
      this.patoBranco.setVelocityY(-1350);
    }

    // ─── Animações ────────────────────────────────────────────────
    if (this.patoBranco.body.velocity.y !== 0) {
      this.patoBranco.anims.play("pulo", true);
    } else if (this.patoBranco.body.velocity.x > 0) {
      this.patoBranco.anims.play("andar_direita", true);
    } else if (this.patoBranco.body.velocity.x < 0) {
      this.patoBranco.anims.play("andar_esquerda", true);
    } else {
      this.patoBranco.anims.play("parado", true);
    }
  }

  trocarFase(novaFase, novaImagem, novaMusicaKey) {
    if (this.faseAtual === novaFase) return;
    this.faseAtual = novaFase;

    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.fundo1.setTexture(novaImagem);
      if (this.musica) this.musica.stop();
      this.musica = this.sound.add(novaMusicaKey, { loop: true, volume: 0.5 });
      this.musica.play();
      this.cameras.main.fadeIn(400, 0, 0, 0);
    });
  }

  gameOver() {
    if (this.jogoAcabou) return;
    this.jogoAcabou = true;

    if (this.musica) this.musica.stop();
    this.physics.pause();

    const coinsGanhas = Math.max(0, this.pontuacao) * 50;
    const totalAtual = Number(this.registry.get("cieloCoins") ?? 0);
    this.registry.set("cieloCoins", totalAtual + coinsGanhas);

    const GW = this.scale.width;
    const GH = this.scale.height;

    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x000000, 0.6);

    this.add
      .text(GW / 2, GH / 2 - 70, "Você concluiu o Desafio!", {
        fontSize: "90px",
        fontFamily: "poppins",
        fontStyle: "bold",
        fill: "#0099ff",
        stroke: "#000033",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(GW / 2, GH / 2 + 80, `+${coinsGanhas} Cielo Coins acumulados!`, {
        fontSize: "60px",
        fontFamily: "poppins",
        fontStyle: "bold",
        fill: "#ffd700",
        stroke: "#000000",
        strokeThickness: 6,
        resolution: 4,
      })
      .setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneMetro", {
          nomePasta: this.registry.get("nomePasta"),
          prefixo: this.registry.get("prefixo"),
          spawnX: this.retornoSpawnX,
          spawnY: this.retornoSpawnY,
        });
      });
    });
  }

  spawnMoedaExtra() {
    if (this.jogoAcabou) return;
    if (!this.moedaExtra.active) {
      const posicaoX = Phaser.Math.Between(100, this.scale.width - 100);
      this.moedaExtra.enableBody(true, posicaoX, 0, true, true);
      this.moedaExtra.setAlpha(1);

      this.time.delayedCall(6000, () => {
        if (!this.moedaExtra.active) return;
        this.tweens.add({
          targets: this.moedaExtra,
          alpha: 0.2,
          duration: 200,
          yoyo: true,
          repeat: 9,
        });
      });

      this.time.delayedCall(8000, () => {
        if (this.moedaExtra.active) this.moedaExtra.disableBody(true, true);
      });
    }
  }

  spawnBomba() {
    if (this.jogoAcabou) return;
    if (!this.bomba.active) {
      const posicaoX = Phaser.Math.Between(100, this.scale.width - 100);
      this.bomba.enableBody(true, posicaoX, 0, true, true);
      this.bomba.setAlpha(1);

      this.time.delayedCall(4000, () => {
        if (!this.bomba.active) return;
        this.tweens.add({
          targets: this.bomba,
          alpha: 0.2,
          duration: 150,
          yoyo: true,
          repeat: 9,
        });
      });

      this.time.delayedCall(6000, () => {
        if (this.bomba.active) this.bomba.disableBody(true, true);
      });
    }
  }
}
