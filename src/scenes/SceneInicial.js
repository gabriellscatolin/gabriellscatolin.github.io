// Cena inicial do jogo com menu principal
export default class SceneInicial extends Phaser.Scene {
  constructor() {
    super("SceneInicial");

// Configurações da cena (Partes fixas)
    this.CONFIG = {
      ASSETS: {
        botaoJogar: "src/assets/imagens/imagensBotoes/botaoJogar.png",        //Botão "jogar 
        fundo: "src/assets/imagens/imagensMapa/mapaInicial.png",              //Fundo de tela inicial
        botaoConfig: "src/assets/imagens/imagensBotoes/botaoConfig.png",      //Botão "configurações"
        botaoCreditos: "src/assets/imagens/imagensBotoes/botaoCreditos.png",  //Botão "créditos"
        configFundo: "src/assets/imagens/imagensPopUps/fundoConfig.png"       //Tela de fundo das configurações
      },

//Definição de posição e tamanho dos botões
     BOTOES: [
    { key: "botaoConfig", x: "center", y: 870, scale: 0.48, action: "openSettings" },
    { key: "botaoJogar", x: "center", y: 600, scale: 0.5, action: "startGame" },
    { key: "botaoCreditos", x: "center", y: 730, scale: 0.85, action: "fecharJogo" }
]
    };
  }
  

// Carrega os assets
  preload() {
    this.load.image("fundo", this.CONFIG.ASSETS.fundo);
    this.load.image("botaoJogar", this.CONFIG.ASSETS.botaoJogar);
    this.load.image("botaoConfig", this.CONFIG.ASSETS.botaoConfig);
    this.load.image("botaoCreditos", this.CONFIG.ASSETS.botaoCreditos);
  }
//Configura os elementos visuais e interativos das cenas
  create() {
    // Fundo
    this.fundo = this.add.image(0, 0, "fundo").setOrigin(0, 0);
    this.redimensionarFundo();

    // Botões
    this.adicionarBotoes();

    this.input.keyboard.on("keydown-F", () => {
  if (this.scale.isFullscreen) {
    this.scale.stopFullscreen();  //Ao apertar "F" entra em tela cheia
  } else {
    this.scale.startFullscreen();
  }
});

// Resize
    window.addEventListener("resize", this.redimensionarFundo.bind(this));
  } //Redimensionar fundo de tela

  

  adicionarBotoes() {
    this.CONFIG.BOTOES.forEach(botao => {
      let x = botao.x === "center" ? this.scale.width / 2 : botao.x;//Centraliza x se "Center"
      let y = botao.y;

      const btn = this.add.image(x, y, botao.key)
        .setScale(botao.scale)
        .setInteractive({ useHandCursor: true });

    //Define ações ao clicar nos botões
      btn.on("pointerdown", () => {
        this[botao.action](); //Executa a ação associada
      });

      // efeito visual quando passa o mouse
      btn.on("pointerover", () => btn.setScale(botao.scale * 1.07)); //Botão aumenta em x1.05 ao aproximar o mouse
      btn.on("pointerout", () => btn.setScale(botao.scale));  //Ao tirar o mouse botão retorna ao tamanho normal
    });
  }
  

  redimensionarFundo() {
    const largura = this.scale.width;  //Redimensionar largura
    const altura = this.scale.height;  // Redimensionar altura

    this.fundo.displayWidth = largura;
    this.fundo.displayHeight = altura;
  }

  

  startGame() {
    this.scene.start("SceneJogo");
  }

  openSettings() {
    console.log("Abrir configurações");
  }

  fecharJogo() {
    console.log("Fechar jogo");
    // window.close(); // navegador bloqueia normalmente
  }
}


