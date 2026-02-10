// Cena do jogo - Mapa da ponte com personagem controlável
export default class SceneJogo extends Phaser.Scene {
  constructor() {
    super("SceneJogo");
  }

  preload() {
    this.load.image("mapaPonte", "src/assets/imagens/imagensMapa/mapaPonte.png");
  }

  create() {
    // Fundo - mapa da ponte
    this.fundo = this.add.image(0, 0, "mapaPonte").setOrigin(0, 0);
    this.fundo.displayWidth = this.scale.width;
    this.fundo.displayHeight = this.scale.height;

    // Personagem (placeholder - trocar por sprite depois)
    this.personagem = this.add.rectangle(
      this.scale.width / 2, // posição X inicial (centro)
      684,                   // posição Y inicial (meio da faixa de terra)
      30, 45,               // largura e altura
      0x3498db              // cor azul
    );
    this.physics.add.existing(this.personagem);
    this.personagem.body.setCollideWorldBounds(true);

    // Paredes invisíveis - só permite andar na faixa de terra horizontal
    this.paredes = this.physics.add.staticGroup();

    // Parede de cima (tudo acima de Y=618)
    this.criarParede(960, 309, 1920, 618);

    // Parede de baixo (tudo abaixo de Y=750)
    this.criarParede(960, 915, 1920, 330);

    // Colisão personagem com paredes
    this.physics.add.collider(this.personagem, this.paredes);

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

  criarParede(x, y, largura, altura) {
    const parede = this.add.rectangle(x, y, largura, altura, 0xff0000, 0);
    this.physics.add.existing(parede, true); // true = estática
    this.paredes.add(parede);
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

        // Encolhe cada bloco com delay aleatório (abre a tela)
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

    // Reset velocidade
    body.setVelocity(0);

    // Movimento WASD
    if (this.teclas.a.isDown) {
      body.setVelocityX(-this.velocidade);
    } else if (this.teclas.d.isDown) {
      body.setVelocityX(this.velocidade);
    }

    if (this.teclas.w.isDown) {
      body.setVelocityY(-this.velocidade);
    } else if (this.teclas.s.isDown) {
      body.setVelocityY(this.velocidade);
    }
  }
}
