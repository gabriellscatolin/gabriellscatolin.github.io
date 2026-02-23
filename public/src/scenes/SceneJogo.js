// Cena principal do jogo com movimentação do personagem
export default class SceneJogo extends Phaser.Scene {
  constructor() {
    super("SceneJogo");
  }

  // Recebe dados da cena anterior (personagem escolhido)
  init(data) {
    this.nomePastaEscolhida = data.nomePasta || "Gabriel";
    this.prefixoEscolhido = data.prefixo || "HB";
  }

  preload() {
    // Carrega o mapa, imagens do tutorial e configurações
    this.load.image("mapaPonteImage", "src/assets/imagens/imagensMapa/mapaPonte.png");
    this.load.image("botaoJogarTutorial", "src/assets/imagens/imagensBotoes/botaoJogarTutorial.png");
    this.load.image("configFundo", "src/assets/imagens/imagensPopUps/fundoConfig.png");
    this.load.image("imagemTutorial", "src/assets/imagens/imagensPopUps/imagemTutorial.png");

    // Carrega os sprites do personagem selecionado
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${this.nomePastaEscolhida}`;
    const pre = this.prefixoEscolhido;

    for (let i = 1; i <= 4; i++) {
      this.load.image(`sprite_frente_${i}`, `${caminhoBase}/${pre}_frente_${i}.png`);
      this.load.image(`sprite_tras_${i}`, `${caminhoBase}/${pre}_tras_${i}.png`);
      this.load.image(`sprite_direita_${i}`, `${caminhoBase}/${pre}_direita_${i}.png`);
      this.load.image(`sprite_esquerda_${i}`, `${caminhoBase}/${pre}_esquerda_${i}.png`);
    }
  }

  create() {
    // Fundo
    this.fundoImage = this.add.image(0, 0, "mapaPonteImage").setOrigin(0, 0);
    this.fundoImage.displayWidth = this.scale.width;
    this.fundoImage.displayHeight = this.scale.height;

    this.criarAnimacoes();

    // Personagem com fisica
    this.personagemSprite = this.add.sprite(100, 684, "sprite_frente_1").setScale(0.15);
    this.physics.add.existing(this.personagemSprite);

    // Teclas WASD
    this.teclasControl = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.velocidadePersonagem = 300;
    this.podeMover = false; //Bloqueado até fechar o tutorial
    this.menuPausaAberto = false; //Controle do menu de pausa
    this.configAberta = false; //Controle do popup de configurações

    // Tecla ESC para abrir/fechar o menu de pausa
    this.input.keyboard.on("keydown-ESC", () => {
      if (this.configAberta) return; //Ignora ESC se config estiver aberta
      if (this.menuPausaAberto) {
        this.fecharMenuPausa();
      } else if (this.podeMover) {
        this.abrirMenuPausa();
      }
    });

    this.executarTransicaoEntrada();
    this.mostrarTutorial();
  }

  criarAnimacoes() {
    // Cria animações de andar para cada direção
    const direcoes = ['frente', 'tras', 'direita', 'esquerda'];
    direcoes.forEach(dir => {
      this.anims.create({
        key: `andar_${dir}`,
        frames: [
          { key: `sprite_${dir}_1` },
          { key: `sprite_${dir}_2` },
          { key: `sprite_${dir}_3` },
          { key: `sprite_${dir}_4` }
        ],
        frameRate: 8,
        repeat: -1
      });
    });
  }

//Pop-up de tutorial que aparece ao iniciar a fase
  mostrarTutorial() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.elementosTutorial = [];

    // Fundo escuro semi-transparente
    this.elementosTutorial.push(this.add.rectangle(
      cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7
    ).setDepth(50).setScrollFactor(0));

    // Imagem do tutorial
    this.elementosTutorial.push(this.add.image(
      cx, cy, "imagemTutorial"
    ).setDepth(51).setScrollFactor(0));

    // Botão "Jogar!" para fechar o tutorial
    this.botaoJogarTutorial = this.add.image(
      cx, cy + 170,
      "botaoJogarTutorial"
    ).setScale(0.25).setDepth(52).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    this.elementosTutorial.push(this.botaoJogarTutorial);

    // Efeito visual quando passa o mouse no botão
    this.botaoJogarTutorial.on("pointerover", () => this.botaoJogarTutorial.setScale(0.27));
    this.botaoJogarTutorial.on("pointerout", () => this.botaoJogarTutorial.setScale(0.25));

    // Fecha o tutorial ao clicar no botão
    this.botaoJogarTutorial.on("pointerdown", () => {
      this.fecharTutorial();
    });
  }

  fecharTutorial() { //Fecha o pop-up e libera os controles
    this.elementosTutorial.forEach(el => el.destroy()); //Destrói todos os elementos do tutorial
    this.elementosTutorial = [];
    this.podeMover = true;
  }

  update() {
    if (!this.podeMover) return; //Não move enquanto tutorial estiver aberto

    const corpoFisico = this.personagemSprite.body;
    corpoFisico.setVelocity(0);
    let estaAndando = false;

    if (this.teclasControl.a.isDown) {
      corpoFisico.setVelocityX(-this.velocidadePersonagem);
      this.personagemSprite.anims.play("andar_esquerda", true);
      estaAndando = true;
    } else if (this.teclasControl.d.isDown) {
      corpoFisico.setVelocityX(this.velocidadePersonagem);
      this.personagemSprite.anims.play("andar_direita", true);
      estaAndando = true;
    }

    if (this.teclasControl.w.isDown) {
      corpoFisico.setVelocityY(-this.velocidadePersonagem);
      if (!estaAndando) this.personagemSprite.anims.play("andar_tras", true);
      estaAndando = true;
    } else if (this.teclasControl.s.isDown) {
      corpoFisico.setVelocityY(this.velocidadePersonagem);
      if (!estaAndando) this.personagemSprite.anims.play("andar_frente", true);
      estaAndando = true;
    }

    // Pausa animação se o jogador parou
    if (!estaAndando) {
      this.personagemSprite.anims.pause();
    } else {
      this.personagemSprite.anims.resume();
    }

    // Limites do mapa (Boundaries)
    this.personagemSprite.y = Phaser.Math.Clamp(this.personagemSprite.y, 578, 690);
    this.personagemSprite.x = Phaser.Math.Clamp(this.personagemSprite.x, 0, 1920);
  }

//Menu de pausa ao apertar ESC
  abrirMenuPausa() {
    this.menuPausaAberto = true;
    this.podeMover = false; //Bloqueia movimentação enquanto menu está aberto

    // Fundo escuro semi-transparente
    this.fundoPausa = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.5
    ).setDepth(100).setScrollFactor(0);

    // Imagem de fundo do painel de pausa
    this.caixaPausa = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      "configFundo"
    ).setScale(2.5).setDepth(100).setScrollFactor(0);

    // Título do menu de pausa
    this.tituloPausa = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 150,
      "PAUSADO",
      { fontSize: "42px", color: "#ffffff", fontStyle: "bold" }
    ).setOrigin(0.5).setDepth(101).setScrollFactor(0);

    // Botão "Retomar"
    this.botaoRetomar = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 40,
      "RETOMAR",
      { fontSize: "28px", color: "#ffffff" }
    ).setOrigin(0.5).setDepth(101).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    // Botão "Configurações"
    this.botaoConfigPausa = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 30,
      "CONFIGURAÇÕES",
      { fontSize: "28px", color: "#ffffff" }
    ).setOrigin(0.5).setDepth(101).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    // Botão "Voltar ao Início"
    this.botaoVoltarInicio = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      "VOLTAR AO INÍCIO",
      { fontSize: "28px", color: "#ff5555" } //Vermelho para indicar saída
    ).setOrigin(0.5).setDepth(101).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    //Define ações ao clicar nos botões
    this.botaoRetomar.on("pointerdown", () => {
      this.fecharMenuPausa(); //Fecha o menu e retoma o jogo
    });

    this.botaoConfigPausa.on("pointerdown", () => {
      this.abrirPopupConfig(); //Abre o popup de configurações
    });

    this.botaoVoltarInicio.on("pointerdown", () => {
      this.voltarAoInicio(); //Volta para a cena inicial
    });

    // Efeito visual quando passa o mouse nos botões
    this.botaoRetomar.on("pointerover", () => this.botaoRetomar.setScale(1.07));
    this.botaoRetomar.on("pointerout", () => this.botaoRetomar.setScale(1));

    this.botaoConfigPausa.on("pointerover", () => this.botaoConfigPausa.setScale(1.07));
    this.botaoConfigPausa.on("pointerout", () => this.botaoConfigPausa.setScale(1));

    this.botaoVoltarInicio.on("pointerover", () => this.botaoVoltarInicio.setScale(1.07));
    this.botaoVoltarInicio.on("pointerout", () => this.botaoVoltarInicio.setScale(1));
  }

  fecharMenuPausa() { //Fecha o menu de pausa e retoma o jogo
    this.fundoPausa.destroy();
    this.caixaPausa.destroy();
    this.tituloPausa.destroy();
    this.botaoRetomar.destroy();
    this.botaoConfigPausa.destroy();
    this.botaoVoltarInicio.destroy();
    this.menuPausaAberto = false;
    this.podeMover = true; //Libera movimentação
  }

  abrirPopupConfig() { //Abre o popup de configurações (igual à SceneInicial)
    this.configAberta = true;

    // Esconde os elementos do menu de pausa
    this.caixaPausa.setVisible(false);
    this.tituloPausa.setVisible(false);
    this.botaoRetomar.setVisible(false);
    this.botaoConfigPausa.setVisible(false);
    this.botaoVoltarInicio.setVisible(false);

    //Configurações do pop-up
    this.caixaConfig = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      "configFundo"
    ).setScale(2.5).setDepth(101).setScrollFactor(0);

    // Título do pop-up
    this.textoConfig = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 150,
      "CONFIGURAÇÕES",
      { fontSize: "36px", color: "#ffffff" }
    ).setOrigin(0.5).setDepth(102).setScrollFactor(0);

    // Texto Volume
    this.textVolume = this.add.text(
      this.scale.width / 2 - 200,
      this.scale.height / 2,
      "VOLUME:",
      { fontSize: "26px", color: "#ffffff" } //Detalhes da fonte do texto
    ).setDepth(102).setScrollFactor(0);

    // Botão de diminuir volume
    this.botaoMenos = this.add.text(
      this.scale.width / 2 - 20,
      this.scale.height / 2,
      "-",
      { fontSize: "36px", color: "#ffffff" } //Fonte e cor dos textos
    ).setDepth(102).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    // Botão de aumentar volume
    this.botaoMais = this.add.text(
      this.scale.width / 2 + 40,
      this.scale.height / 2,
      "+",
      { fontSize: "36px", color: "#ffffff" }
    ).setDepth(102).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.botaoMais.on("pointerdown", () => { //Aumenta o volume ao clicar
      this.sound.volume = Phaser.Math.Clamp(this.sound.volume + 0.1, 0, 1);
    });

    this.botaoMenos.on("pointerdown", () => { //Diminui o volume ao clicar
      this.sound.volume = Phaser.Math.Clamp(this.sound.volume - 0.1, 0, 1);
    });

    // Botão fechar
    this.botaoFecharConfig = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 150,
      "FECHAR",
      { fontSize: "28px", color: "#ff5555" } //Cor do botão fechar
    ).setOrigin(0.5).setDepth(102).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.botaoFecharConfig.on("pointerdown", () => {
      this.fecharPopupConfig(); //Fecha as configurações e volta ao menu de pausa
    });
  }

  fecharPopupConfig() { //Fecha o popup de configurações e volta ao menu de pausa
    this.caixaConfig.destroy();
    this.textoConfig.destroy();
    this.textVolume.destroy();
    this.botaoMais.destroy();
    this.botaoMenos.destroy();
    this.botaoFecharConfig.destroy();
    this.configAberta = false;

    // Mostra novamente os elementos do menu de pausa
    this.caixaPausa.setVisible(true);
    this.tituloPausa.setVisible(true);
    this.botaoRetomar.setVisible(true);
    this.botaoConfigPausa.setVisible(true);
    this.botaoVoltarInicio.setVisible(true);
  }

  voltarAoInicio() { //Volta para a cena inicial com fade out
    this.cameras.main.fadeOut(800, 0, 0, 0);

    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("SceneInicial");
    });
  }

  executarTransicaoEntrada() {
    // Efeito de fade in suave ao entrar na cena
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }
}
