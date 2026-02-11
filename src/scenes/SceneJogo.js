// Cena do jogo - Mapa da ponte com personagem controlável
export default class SceneJogo extends Phaser.Scene {
  constructor() {
    super("SceneJogo");
  }

  preload() {
    this.load.image("mapaPonte", "src/assets/imagens/imagensMapa/mapaPonte.png");
    this.load.image("wasd", "src/assets/imagens/imagensBotoes/wasd.png");

    const caminho = "src/assets/imagens/imagensPersonagens/homem_banco_VF";
    for (let i = 1; i <= 4; i++) {
      this.load.image(`hb_frente_${i}`, `${caminho}/HB_frente_${i}.png`);
      this.load.image(`hb_tras_${i}`, `${caminho}/HB_tras_${i}.png`);
      this.load.image(`hb_direita_${i}`, `${caminho}/HB_direita_${i}.png`);
      this.load.image(`hb_esquerda_${i}`, `${caminho}/HB_esquerda_${i}.png`);
    }
  }

  create() {
    this.fundo = this.add.image(0, 0, "mapaPonte").setOrigin(0, 0);
    this.fundo.displayWidth = this.scale.width;
    this.fundo.displayHeight = this.scale.height;

    this.criarAnimacoes();

    this.personagem = this.add.sprite(
      this.scale.width / 2,
      684,
      "hb_frente_1"
    ).setScale(0.15);
    this.physics.add.existing(this.personagem);

    this.teclas = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.velocidade = 300;

    this.input.keyboard.on("keydown-F", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    this.add.image(90, 80, "wasd").setScale(0.12).setScrollFactor(0).setDepth(10);

    // transição aqui
    this.transicaoEntradaPixel();
  }

  transicaoEntradaPixel() {
    const cam = this.cameras.main;
    const pixelated = cam.postFX.addPixelate(60);

    this.add.tween({
      targets: pixelated,
      amount: 1,
      duration: 1000,
      onComplete: () => {
        cam.postFX.remove(pixelated);
      }
    });
  }

  criarAnimacoes() {
    this.anims.create({
      key: "andar_frente",
      frames: [
        { key: "hb_frente_1" },
        { key: "hb_frente_2" },
        { key: "hb_frente_3" },
        { key: "hb_frente_4" }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "andar_tras",
      frames: [
        { key: "hb_tras_1" },
        { key: "hb_tras_2" },
        { key: "hb_tras_3" },
        { key: "hb_tras_4" }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "andar_direita",
      frames: [
        { key: "hb_direita_1" },
        { key: "hb_direita_2" },
        { key: "hb_direita_3" },
        { key: "hb_direita_4" }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "andar_esquerda",
      frames: [
        { key: "hb_esquerda_1" },
        { key: "hb_esquerda_2" },
        { key: "hb_esquerda_3" },
        { key: "hb_esquerda_4" }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  update() {
    const body = this.personagem.body;
    body.setVelocity(0);

    let andando = false;

    if (this.teclas.a.isDown) {
      body.setVelocityX(-this.velocidade);
      this.personagem.anims.play("andar_esquerda", true);
      andando = true;
    } else if (this.teclas.d.isDown) {
      body.setVelocityX(this.velocidade);
      this.personagem.anims.play("andar_direita", true);
      andando = true;
    }

    if (this.teclas.w.isDown) {
      body.setVelocityY(-this.velocidade);
      if (!andando) this.personagem.anims.play("andar_tras", true);
      andando = true;
    } else if (this.teclas.s.isDown) {
      body.setVelocityY(this.velocidade);
      if (!andando) this.personagem.anims.play("andar_frente", true);
      andando = true;
    }

    if (!andando) {
      this.personagem.anims.stop();
    }

    this.personagem.y = Phaser.Math.Clamp(this.personagem.y, 578, 690);
    this.personagem.x = Phaser.Math.Clamp(this.personagem.x, 0, 1920);
  }
}
