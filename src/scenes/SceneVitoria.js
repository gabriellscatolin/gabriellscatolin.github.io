export default class SceneVitoria extends Phaser.Scene {
  constructor() {
    super("SceneVitoria");
  }

  preload() {
    this.load.image(
      "imagemVitoria",
      "src/assets/imagens/imagensPopUps/imagemVitoria.jpeg",
    );
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Fundo preto
    this.add
      .rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000)
      .setDepth(0);

    // Imagem de vitória
    this.add.image(cx, cy, "imagemVitoria").setDepth(1);

    // Botão "Fechar"
    const botaoFechar = this.add
      .text(cx, cy + 430, "Fechar", {
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 32, y: 14 },
      })
      .setDepth(2)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    botaoFechar.on("pointerover", () =>
      botaoFechar.setStyle({ backgroundColor: "#555555" }),
    );
    botaoFechar.on("pointerout", () =>
      botaoFechar.setStyle({ backgroundColor: "#333333" }),
    );
    botaoFechar.on("pointerdown", () => {
      this.scene.start("SceneInicial");
    });
  }
}
