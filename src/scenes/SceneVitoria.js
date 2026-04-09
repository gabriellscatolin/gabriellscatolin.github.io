export default class SceneVitoria extends Phaser.Scene {
  constructor() {
    super("SceneVitoria");
  }

  preload() {
    this.load.image(
      "imagemVitoria",
      "src/assets/imagens/imagensPopUps/imagemVitoria.jpeg",
    );
    this.load.image(
      "celebratoryBg",
      "src/assets/imagens/imagensPopUps/celebratory_bg.png",
    );
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // 1. Fundo Corporativo Profissional (Limpo e Moderno)
    const bg = this.add.image(cx, cy, "celebratoryBg").setDepth(0);
    const escalaBg = Math.max(
      this.scale.width / bg.width,
      this.scale.height / bg.height,
    );
    bg.setScale(escalaBg);

    // 2. Sistema de Confetes (Mantido como pedido, mas elegante)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 8, 4);
    g.generateTexture("confete", 8, 4);

    const particles = this.add.particles(0, -10, "confete", {
      x: { min: 0, max: this.scale.width },
      quantity: 2,
      lifespan: 5000,
      gravityY: 150,
      scale: { min: 0.5, max: 1.5 },
      rotate: { min: 0, max: 360 },
      alpha: { start: 1, end: 0 },
      tint: [0x004c99, 0x00994d, 0xffcc00, 0x00aaff], // Cores mais institucionais
      frequency: 60,
    });
    particles.setDepth(5);

    // 3. Foto do jogador (Destaque Principal)
    const imgVitoria = this.add.image(cx, cy + 60, "imagemVitoria").setDepth(10);
    const src = this.textures.get("imagemVitoria").source[0];
    const ratio = src.width / src.height;
    const maxW = 1200,
      maxH = 1000;
    let dW = maxW,
      dH = maxW / ratio;
    if (dH > maxH) {
      dH = maxH;
      dW = maxH * ratio;
    }
    imgVitoria.setDisplaySize(dW, dH);

    // 4. Efeito de Brilho no Título (Melhorando o Parabéns da própria foto)
    const brilhoTitulo = this.add.circle(cx, cy - (dH * 0.38) + 60, 50, 0xffffff, 0.2);
    brilhoTitulo.setDepth(11).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: brilhoTitulo,
      alpha: 0.5,
      scale: 1.5,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // 5. Botão Interativo Invisível (em cima do "Continuar" da foto)
    const btnPosRelY = dH * 0.38; 
    const areaBotao = this.add.rectangle(cx, cy + 60 + btnPosRelY, dW * 0.3, dH * 0.15, 0xffffff, 0)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });

    // Feedback visual sutil ao passar o mouse (brilho no botão da foto)
    const overlayBrilhoBtn = this.add.rectangle(cx, cy + 60 + btnPosRelY, dW * 0.3, dH * 0.1, 0xffffff, 0)
      .setDepth(11)
      .setBlendMode(Phaser.BlendModes.ADD);

    areaBotao.on("pointerover", () => {
      overlayBrilhoBtn.setFillStyle(0xffffff, 0.15);
    });

    areaBotao.on("pointerout", () => {
      overlayBrilhoBtn.setFillStyle(0xffffff, 0);
    });

    areaBotao.on("pointerdown", () => {
      this.scene.start("SceneInicial");
    });
  }
}
