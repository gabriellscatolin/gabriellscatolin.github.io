// Cena do jogo - Mapa da ponte com personagem controlável
export default class SceneJogo extends Phaser.Scene {
  constructor() {
    super("SceneJogo");
  }

  preload() {
    this.load.image("mapaPonte", "src/assets/imagens/imagensMapa/mapaPonte.png");

    // Sprites do personagem (4 frames por direção)
    const caminho = "src/assets/imagens/imagensPersonagens/homem_banco_VF";
    for (let i = 1; i <= 4; i++) {
      this.load.image(`hb_frente_${i}`, `${caminho}/HB_frente_${i}.png`);
      this.load.image(`hb_tras_${i}`, `${caminho}/HB_tras_${i}.png`);
      this.load.image(`hb_direita_${i}`, `${caminho}/HB_direita_${i}.png`);
      this.load.image(`hb_esquerda_${i}`, `${caminho}/HB_esquerda_${i}.png`);
    }
  }

  create() {
    // Fundo - mapa da ponte
    this.fundo = this.add.image(0, 0, "mapaPonte").setOrigin(0, 0);
    this.fundo.displayWidth = this.scale.width;
    this.fundo.displayHeight = this.scale.height;

    // Criar animações do personagem
    this.criarAnimacoes();

    // Personagem com sprite
    this.personagem = this.add.sprite(
      this.scale.width / 2, // posição X inicial (centro)
      684,                   // posição Y inicial (meio da faixa de terra)
      "hb_frente_1"         // imagem inicial (olhando pra frente)
    ).setScale(0.15);
    this.physics.add.existing(this.personagem);

    // Controles WASD
    this.teclas = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Velocidade do personagem
    this.velocidade = 300;

    // Tela cheia com F
    this.input.keyboard.on("keydown-F", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Transição de entrada (desfaz os pixels pretos)
    this.transicaoEntrada();
  }

  criarAnimacoes() {
    // Frente (S - pra baixo)
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

    // Trás (W - pra cima)
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

    // Direita (D)
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

    // Esquerda (A)
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

  transicaoEntrada() {
    const colunas = 24;
    const linhas = 14;
    const larguraBloco = Math.ceil(this.scale.width / colunas);
    const alturaBloco = Math.ceil(this.scale.height / linhas);

    for (let i = 0; i < colunas; i++) {
      for (let j = 0; j < linhas; j++) {
        const bloco = this.add.rectangle(
          i * larguraBloco + larguraBloco / 2,
          j * alturaBloco + alturaBloco / 2,
          larguraBloco + 2, alturaBloco + 2,
          0x000000
        ).setDepth(100);

        this.tweens.add({
          targets: bloco,
          width: 0,
          height: 0,
          duration: 300,
          delay: Math.random() * 500,
          ease: "Cubic.easeOut",
          onComplete: () => bloco.destroy()
        });
      }
    }
  }

  update() {
    const body = this.personagem.body;
    body.setVelocity(0);

    let andando = false;

    // Movimento WASD com animação
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

    // Parado = para a animação no primeiro frame
    if (!andando) {
      this.personagem.anims.stop();
    }

    // Limita o personagem à faixa de terra
    this.personagem.y = Phaser.Math.Clamp(this.personagem.y, 578, 690);
    this.personagem.x = Phaser.Math.Clamp(this.personagem.x, 0, 1920);
  }
}
