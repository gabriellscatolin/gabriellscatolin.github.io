export default class ScenePersonagem extends Phaser.Scene {
  constructor() {
    super("ScenePersonagem");

    // Lista de configuração dos personagens: define chaves, posições e prefixos dos arquivos
    this.listaPersonagens = [
      { id: "Pedro", x: 300, y: 700, escala: 0.42, prefixoArquivo: "HB" },
      { id: "Maya", x: 1600, y: 700, escala: 0.42, prefixoArquivo: "ML" },
      { id: "Joao", x: 1170, y: 700, escala: 0.42, prefixoArquivo: "HM" },
      { id: "Dandara", x: 730, y: 700, escala: 0.42, prefixoArquivo: "MM" },
    ];
  }

  preload() {
    // Carregamento dos recursos visuais da interface de seleção
    this.load.image(
      "fundoSelecaoImage",
      "src/assets/imagens/imagensMapa/fundoSelecaoPersonagem.png",
    );
    this.load.setPath(
      "src/assets/imagens/imagensPersonagens/selecaoPersonagens/",
    );

    // Loop para carregar dinamicamente as imagens de visualização de cada personagem
    this.listaPersonagens.forEach((p) => this.load.image(p.id, `${p.id}.png`));
  }

  create() {
    // Configuração do plano de fundo da cena
    this.add
      .image(0, 0, "fundoSelecaoImage")
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.criarMenuSelecao();
    this.executarTransicaoEntrada();

    this.input.keyboard.on("keydown-F", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });
  }

  criarMenuSelecao() {
    // Instancia os botões de personagem e configura a interatividade
    this.listaPersonagens.forEach((dados) => {
      const personagemButton = this.add
        .image(dados.x, dados.y, dados.id)
        .setScale(dados.escala)
        .setInteractive({ useHandCursor: true });

      this.configurarEventos(personagemButton, dados);
    });
  }

  configurarEventos(botao, dados) {
    // Inicia a cena do jogo com efeito de fade out
    botao.on("pointerdown", () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);

      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneJogo", {
          nomePasta: dados.id,
          prefixo: dados.prefixoArquivo,
        });
      });
    });

    // Efeitos visuais ao passar o mouse (hover)
    botao.on("pointerover", () => {
      botao.setScale(dados.escala * 1.1).setDepth(1);
    });

    botao.on("pointerout", () => {
      botao.setScale(dados.escala).setDepth(0);
    });
  }

  executarTransicaoEntrada() {
    // Efeito de fade in suave ao entrar na cena
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }
}
