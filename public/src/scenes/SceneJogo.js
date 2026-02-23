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
    // Carrega o mapa e imagens do tutorial
    this.load.image("mapaPonteImage", "src/assets/imagens/imagensMapa/mapaPonte.png");
    this.load.image("imagemTutorial", "src/assets/imagens/imagensPopUps/imagemTutorial.png");
    this.load.image("botaoJogarTutorial", "src/assets/imagens/imagensBotoes/botaoJogarTutorial.png");

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
    // Fundo escuro semi-transparente
    this.fundoTutorial = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.7
    ).setDepth(50).setScrollFactor(0);

    // Imagem do pop-up de tutorial (título, teclas WASD e instruções)
    this.imagemTutorial = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2 - 20,
      "imagemTutorial"
    ).setScale(0.7).setDepth(51).setScrollFactor(0);

    // Botão "Jogar!" para fechar o tutorial
    this.botaoJogarTutorial = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2 + 105,
      "botaoJogarTutorial"
    ).setScale(0.25).setDepth(52).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    // Efeito visual quando passa o mouse no botão
    this.botaoJogarTutorial.on("pointerover", () => this.botaoJogarTutorial.setScale(0.33));
    this.botaoJogarTutorial.on("pointerout", () => this.botaoJogarTutorial.setScale(0.3));

    // Fecha o tutorial ao clicar no botão
    this.botaoJogarTutorial.on("pointerdown", () => {
      this.fecharTutorial();
    });
  }

  fecharTutorial() { //Fecha o pop-up e libera os controles
    this.fundoTutorial.destroy();
    this.imagemTutorial.destroy();
    this.botaoJogarTutorial.destroy();
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

  executarTransicaoEntrada() {
  // Efeito de pixelado ao entrar na cena
  const cam = this.cameras.main;
  const pixelated = cam.postFX.addPixelate(40);

    this.add.tween({
      targets: pixelated,
      amount: 1,
      duration: 800,
      ease: "Sine.easeOut",
      onComplete: () => { cam.postFX.remove(pixelated); }
    });
  }
}
