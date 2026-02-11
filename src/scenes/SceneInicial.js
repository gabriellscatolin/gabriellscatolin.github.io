// Cena inicial do jogo com menu principal
export default class SceneInicial extends Phaser.Scene {
  constructor() {
    super("SceneInicial");

// Configurações da cena (Partes fixas)
    this.CONFIG = {
      //Efeito de pixelado ao trocar de cena
      FADE_DURATION: 1000, // Duração do fade
      PIXELATE_AMOUNT: 60, // Pixelização inicial
      PIXELATE_DURATION: 1100, // Duração da pixelização
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
    { key: "botaoCreditos", x: "center", y: 730, scale: 0.85, action: "fecharJogo" }]
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
      let x = botao.x === "center" ? this.scale.width / 2 : botao.x;//Centralizar os botões horizontalmente, ou usar a posição definida
      let y = botao.y;

      const btn = this.add.image(x, y, botao.key) //Adicionar o botão à cena
        .setScale(botao.scale)     //tamanho botão
        .setInteractive({ useHandCursor: true }); //Função phaser para ações interativas

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

    this.fundo.displayWidth = largura;  // Ajusta a largura do fundo para preencher a tela
    this.fundo.displayHeight = altura;
  }

  startGame() {
  // Transição com efeito de pixelado antes de iniciar o jogo
  const cam = this.cameras.main;

  const pixelated = cam.postFX.addPixelate(this.CONFIG.PIXELATE_AMOUNT);

  this.add.tween({
    targets: pixelated,
    duration: this.CONFIG.PIXELATE_DURATION, //Duração do pixelado
    amount: 1,
    onComplete: () => {
      this.scene.start("SceneJogo");
    }
  });
}

  openSettings() {
    this.abrirPopupConfig();  //Abre o pop-up de configurações
  }

  abrirPopupConfig(){ //Função para tornar o botão Configurações executavel
    // Fundo escuro
    this.fundoPopup = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.5
    ).setDepth(100);
   //Configurações do pop-up
    this.caixaPopup = this.add.rectangle(
      this.scale.width / 2,   
      this.scale.height / 2,
      700,
      400,                //Tamanho do pop-up
      0x1e1e1e
    ).setDepth(101);

    // Título do pop-up
    this.textoPopup = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 150,
      "CONFIGURAÇÕES",              
      { fontSize: "36px", color: "#ffffff" }
    ).setOrigin(0.5).setDepth(102);

     // Texto Volume
    this.textVolume = this.add.text(
      this.scale.width / 2 - 200,
      this.scale.height / 2,
      "VOLUME:",
      { fontSize: "26px", color: "#ffffff" }  //Detalhes da fonte do texto
    ).setDepth(102);

     // Botão de diminuir volume
    this.botaoMenos = this.add.text(  //Configurações do botão de diminuir volume
      this.scale.width / 2 - 20,
      this.scale.height / 2,
      "-",
      { fontSize: "36px", color: "#ffffff" } //Fonte e cor dos textos
    ).setDepth(102).setInteractive({ useHandCursor: true });  //cria uma função interativa no phaser

    // Botão de aumentar volume
    this.botaoMais = this.add.text(
      this.scale.width / 2 + 40,     //Escalas e tamanho do botão de aumentar volume
      this.scale.height / 2,
      "+",
      { fontSize: "36px", color: "#ffffff" }
    ).setDepth(102).setInteractive({ useHandCursor: true });

    this.botaoMais.on("pointerdown", () => {      //configurações ao clicar no botão de aumentar volume
      this.sound.volume = Phaser.Math.Clamp(this.sound.volume + 0.1, 0, 1);
    });

    this.botaoMenos.on("pointerdown", () => {   //configurações ao clicar no botão de diminuir volume
      this.sound.volume = Phaser.Math.Clamp(this.sound.volume - 0.1, 0, 1);
    });

    // Botão fechar
    this.botaoFechar = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 150,
      "FECHAR",
      { fontSize: "28px", color: "#ff5555" }   //Cor do botão fechar
    ).setOrigin(0.5).setDepth(102).setInteractive({ useHandCursor: true });

    this.botaoFechar.on("pointerdown", () => {
      this.fecharPopupConfig();
    });
  }

  fecharPopupConfig() {   //Função para fechar o pop-up de configurações
    this.fundoPopup.destroy();
    this.caixaPopup.destroy();   //Destrói os elementos do pop-up para fechar
    this.textoPopup.destroy();
    this.textVolume.destroy();
    this.botaoMais.destroy();
    this.botaoMenos.destroy();
    this.botaoFechar.destroy();
  }

  fecharJogo() {
    console.log("Fechar jogo");
    // window.close(); // navegador bloqueia normalmente
  }
}
