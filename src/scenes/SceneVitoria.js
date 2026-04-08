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

    // Imagem de vitória (máx 480x320 canvas pixels = ~25% da largura da tela)
    const imgVitoria = this.add.image(cx, cy, "imagemVitoria").setDepth(1);
    const src = this.textures.get("imagemVitoria").source[0];
    const ratio = src.width / src.height;
    const maxW = 240, maxH = 160;
    let dW = maxW, dH = maxW / ratio;
    if (dH > maxH) { dH = maxH; dW = maxH * ratio; }
    imgVitoria.setDisplaySize(dW, dH);

    const btnY = cy + dH / 2 + 30;

    // Botão "Fechar"
    const botaoFechar = this.add
      .text(cx, btnY, "Fechar", {
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
