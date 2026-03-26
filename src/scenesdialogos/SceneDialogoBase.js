// Classe base para todos os diálogos de NPC.
// Subclasses devem definir:
//   this.imagemKey  — chave da textura a exibir
//   this.promptLLM  — prompt para futura integração com LLM
//
// Para abrir: this.scene.pause(); this.scene.launch('SceneDialogoXxx', { cenaOrigem: 'SceneXxx' });
// Para fechar: pressione E ou clique em qualquer lugar.

export default class SceneDialogoBase extends Phaser.Scene {
  init(dados) {
    this.cenaOrigem = dados?.cenaOrigem || null;

    // Remove image-rendering: pixelated do canvas enquanto o diálogo estiver aberto
    // (necessário para texto nítido — será restaurado ao fechar)
    const canvas = this.game?.canvas;
    if (canvas) {
      this._imageRenderingAnterior = canvas.style.imageRendering;
      canvas.style.imageRendering = "auto";
    }
  }

  create() {
    const { width, height } = this.scale;

    // Fundo escuro semitransparente — bloqueia cliques na cena abaixo
    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
      .setScrollFactor(0)
      .setDepth(0)
      .setInteractive();

    // Imagem principal do diálogo
    const img = this.add
      .image(width / 2, height / 2, this.imagemKey)
      .setScrollFactor(0)
      .setDepth(1);

    // Redimensiona para caber na tela com margem de 5%
    const escala = Math.min(
      (width * 0.95) / img.width,
      (height * 0.95) / img.height,
    );
    img.setScale(escala);

    // Instrução de fechamento
    this.add
      .text(width / 2, height - 30, "[E] ou clique para fechar", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2);

    // Fechar com clique
    this.input.on("pointerdown", () => this._fechar());

    // Tecla E
    this.teclaE = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this._fechar();
    }
  }

  _fechar() {
    // Restaura o image-rendering original dos sprites pixel art
    const canvas = this.game?.canvas;
    if (canvas && this._imageRenderingAnterior !== undefined) {
      canvas.style.imageRendering = this._imageRenderingAnterior;
    }
    if (this.cenaOrigem) this.scene.resume(this.cenaOrigem);
    this.scene.stop();
  }

  // Hook para LLM — sobrescrever nas subclasses quando for integrar
  _chamarLLM(mensagem) {
    // TODO: integrar com LLM
    console.log("[SceneDialogoBase] LLM não integrado ainda. Mensagem:", mensagem);
  }
}
