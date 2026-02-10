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
      this.scale.width / 2,  // posição X inicial (centro)
      this.scale.height / 2, // posição Y inicial (centro)
      40, 60,                // largura e altura do retângulo
      0x3498db               // cor azul
    );
    this.physics.add.existing(this.personagem);
    this.personagem.body.setCollideWorldBounds(true);

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

    // Resizez
    window.addEventListener("resize", () => {
      this.fundo.displayWidth = this.scale.width;
      this.fundo.displayHeight = this.scale.height;
    });
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
