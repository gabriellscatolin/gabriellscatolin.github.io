import {
  GameSettings,
  aplicarConfiguracoes,
  abrirPopupConfig as abrirPopupConfigModule,
} from "../settings.js";

export default class SceneJogo extends Phaser.Scene {
  constructor() {
    super("SceneJogo");
  }

  // Recebe dados da cena anterior (personagem escolhido)
  init(data) {
    this.nomePastaEscolhida = data.nomePasta || "Gabriel";
    this.prefixoEscolhido = data.prefixo || "HB";

    // Salva no registry para que cenas futuras (SceneCidade, SceneEscritorio, etc.) possam acessar
    this.registry.set("nomePasta", this.nomePastaEscolhida);
    this.registry.set("prefixo", this.prefixoEscolhido);

    // Seleciona um NPC aleatório que NÃO seja o personagem escolhido
    const todosPersonagens = [
      { id: "Pedro", prefixo: "HB" },
      { id: "Maya", prefixo: "ML" },
      { id: "Joao", prefixo: "HM" },
      { id: "Dandara", prefixo: "MM" },
    ];
    const outrosPersonagens = todosPersonagens.filter(
      (p) => p.id !== this.nomePastaEscolhida,
    );
    this.npcDados =
      outrosPersonagens[Math.floor(Math.random() * outrosPersonagens.length)];
  }

  preload() {
    // Carrega o mapa, imagens do tutorial e configurações
    this.load.image(
      "mapaPonteImage",
      "src/assets/imagens/imagensMapa/mapaPonte.png",
    );
    this.load.image(
      "botaoJogarTutorial",
      "src/assets/imagens/imagensBotoes/botaoJogarTutorial.png",
    );
    this.load.image(
      "configFundo",
      "src/assets/imagens/imagensPopUps/fundoConfig.png",
    );
    this.load.image(
      "imagemTutorial",
      "src/assets/imagens/imagensPopUps/imagemTutorial.jpeg",
    );
    this.load.image(
      "falaVanessa",
      "src/assets/imagens/imagensFalas/falaVanessa.png",
    );
    this.load.image("onibus", "src/assets/imagens/sprites/onibus.png");
    this.load.audio(
      "trilhaSceneInicial",
      "src/assets/audios/trilhaSceneInicial.mp3",
    );

    // Carrega os sprites do personagem selecionado
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${this.nomePastaEscolhida}`;
    const pre = this.prefixoEscolhido;

    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `sprite_frente_${i}`,
        `${caminhoBase}/${pre}_frente_${i}.png`,
      );
      this.load.image(
        `sprite_tras_${i}`,
        `${caminhoBase}/${pre}_tras_${i}.png`,
      );
      this.load.image(
        `sprite_direita_${i}`,
        `${caminhoBase}/${pre}_direita_${i}.png`,
      );
      this.load.image(
        `sprite_esquerda_${i}`,
        `${caminhoBase}/${pre}_esquerda_${i}.png`,
      );
    }

    // Carrega as sprites fixas da Vanessa (NPC)
    const caminhoNpc = `src/assets/imagens/imagensPersonagens/Vanessa`;
    this.load.image("npc_frente", `${caminhoNpc}/MR_frente.png`);
    this.load.image("npc_direita_1", `${caminhoNpc}/MR_direito_1.png`);
    this.load.image("npc_direita_2", `${caminhoNpc}/MR_direita_2.png`);
    this.load.image("npc_direita_3", `${caminhoNpc}/MR_direita_3.png`);
    this.load.image("npc_direita_4", `${caminhoNpc}/MR_direita_4.png`);
  }

  create() {
    // Fundo
    this.fundoImage = this.add.image(0, 0, "mapaPonteImage").setOrigin(0, 0);
    this.fundoImage.displayWidth = this.scale.width;
    this.fundoImage.displayHeight = this.scale.height;

    // Adiciona audios a cena
    this.musica = this.sound.add("trilhaSceneInicial", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    // Ônibus estático com só a traseira aparecendo na borda direita
    this.onibusSprite = this.add
      .image(2100, 620, "onibus")
      .setScale(0.9)
      .setDepth(6);

    this.criarAnimacoes();

    // Personagem com fisica
    this.personagemSprite = this.add
      .sprite(100, 684, "sprite_frente_1")
      .setScale(0.15);
    this.physics.add.existing(this.personagemSprite);

    // Bloco invisível de colisão na ponte
    this.colisaoBlocoPonte = this.add.zone(1400, 677, 150, 101).setOrigin(0, 0);
    this.physics.add.existing(this.colisaoBlocoPonte, true);
    this.physics.add.collider(this.personagemSprite, this.colisaoBlocoPonte);

    // Teclas de movimento
    this.teclasControl = this.input.keyboard.createCursorKeys();

    // Variáveis de controle de estado
    this.velocidadePersonagem = 300;
    this.podeMover = false;
    this.menuPausaAberto = false;
    this.configAberta = false;
    this.transicaoAtiva = false;
    this.dialogoNpcAberto = false;
    this.npcPartiu = false;

    // NPC parado no início da ponte
    this.npcSprite = this.add
      .sprite(430, 615, "npc_frente")
      .setScale(0.15)
      .setDepth(5);

    // Indicador [E] que aparece quando o jogador está perto do NPC
    this.indicadorE = this.add
      .text(430, 615, "[E]", {
        fontSize: "36px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(6)
      .setVisible(false);

    // Tecla E para interagir com o NPC
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Tecla ESC para abrir/fechar o menu de pausa
    this.input.keyboard.on("keydown-ESC", () => {
      if (this.configAberta) return; //Ignora ESC se config estiver aberta
      if (this.menuPausaAberto) {
        this.fecharMenuPausa();
      } else if (this.podeMover) {
        this.abrirMenuPausa();
      }
    });

    // Tecla F para tela cheia
    this.input.keyboard.on("keydown-F", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // ...existing code...

    // Aplica configurações salvas (brilho, daltonismo, etc.)
    this.sound.volume = GameSettings.volume;
    aplicarConfiguracoes();

    this.executarTransicaoEntrada();
    this.mostrarTutorial();
  }

  criarAnimacoes() {
    // Cria animações de andar para cada direção
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      this.anims.create({
        key: `andar_${dir}`,
        frames: [
          { key: `sprite_${dir}_1` },
          { key: `sprite_${dir}_2` },
          { key: `sprite_${dir}_3` },
          { key: `sprite_${dir}_4` },
        ],
        frameRate: 8,
        repeat: -1,
      });
    });

    // Animação de caminhada do NPC para a direita
    this.anims.create({
      key: "npc_andar_direita",
      frames: [
        { key: "npc_direita_1" },
        { key: "npc_direita_2" },
        { key: "npc_direita_3" },
        { key: "npc_direita_4" },
      ],
      frameRate: 8,
      repeat: -1,
    });
  }

  //Pop-up de tutorial que aparece ao iniciar a fase
  mostrarTutorial() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.elementosTutorial = [];

    // Fundo escuro semi-transparente
    this.elementosTutorial.push(
      this.add
        .rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7)
        .setDepth(50)
        .setScrollFactor(0),
    );

    // Imagem do tutorial
    this.elementosTutorial.push(
      this.add.image(cx, cy, "imagemTutorial").setDepth(51).setScrollFactor(0),
    );

    // Botão "Jogar!" para fechar o tutorial
    this.botaoJogarTutorial = this.add
      .image(cx - 17, cy + 145, "botaoJogarTutorial")
      .setScale(0.25)
      .setDepth(52)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    this.elementosTutorial.push(this.botaoJogarTutorial);

    // Efeito visual quando passa o mouse no botão
    this.botaoJogarTutorial.on("pointerover", () =>
      this.botaoJogarTutorial.setScale(0.27),
    );
    this.botaoJogarTutorial.on("pointerout", () =>
      this.botaoJogarTutorial.setScale(0.25),
    );

    // Fecha o tutorial ao clicar no botão
    this.botaoJogarTutorial.on("pointerdown", () => {
      this.fecharTutorial();
    });
  }

  fecharTutorial() {
    //Fecha o pop-up e libera os controles
    this.elementosTutorial.forEach((el) => el.destroy()); //Destrói todos os elementos do tutorial
    this.elementosTutorial = [];
    this.podeMover = true;
    this.mostrarMissao();
  }

  mostrarMissao() {
    const cx = this.scale.width / 2;
    const mensagem = "Missão: Fale com a Vanessa e embarque no ônibus!";

    // Mede a largura real do texto final antes de criar o fundo
    const medidor = this.add.text(-9999, -9999, mensagem, {
      fontSize: "20px",
      fontStyle: "bold",
    });
    const larguraFinal = medidor.displayWidth + 48;
    medidor.destroy();

    this.missaoBg = this.add
      .rectangle(cx, 110, larguraFinal, 50, 0x000000, 0.55)
      .setDepth(10)
      .setScrollFactor(0);

    this.missaoTexto = this.add
      .text(cx, 110, "", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(11)
      .setScrollFactor(0);

    let charIndex = 0;
    this.missaoTimer = this.time.addEvent({
      delay: 40,
      repeat: mensagem.length - 1,
      callback: () => {
        charIndex++;
        this.missaoTexto.setText(mensagem.substring(0, charIndex));
      },
    });
  }

  fecharMissao() {
    if (this.missaoTimer) {
      this.missaoTimer.remove();
      this.missaoTimer = null;
    }
    if (this.missaoBg) {
      this.missaoBg.destroy();
      this.missaoBg = null;
    }
    if (this.missaoTexto) {
      this.missaoTexto.destroy();
      this.missaoTexto = null;
    }
  }

  mostrarDialogoObjetivo() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const mensagem =
      "Atravesse a ponte e pegue o ônibus para a cidade. Me siga!";

    this.bannerFundo = this.add
      .image(cx, cy, "falaVanessa")
      .setDisplaySize(860, 333)
      .setDepth(20)
      .setScrollFactor(0);

    const iW = this.bannerFundo.displayWidth; // 860
    const iH = this.bannerFundo.displayHeight; // 333

    // Texto com efeito typewriter — centralizado na área de fala
    this.bannerTexto = this.add
      .text(800, cy - iH * 0.08, "", {
        fontSize: "26px",
        color: "#000000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 1,
        wordWrap: { width: iW * 0.48, useAdvancedWrap: true },
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(21)
      .setScrollFactor(0);

    // Botão "Vamos!" — abaixo do texto, relativo ao centro da imagem
    this.bannerBotaoVamos = this.add
      .text(800, cy + iH * 0.25, "  Vamos!  ", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#3a7bd5",
        padding: { x: 22, y: 12 },
        stroke: "#1a4fa0",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(22)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.bannerBotaoVamos.on("pointerover", () =>
      this.bannerBotaoVamos.setStyle({
        backgroundColor: "#1a55b8",
        color: "#ffffff",
      }),
    );
    this.bannerBotaoVamos.on("pointerout", () =>
      this.bannerBotaoVamos.setStyle({
        backgroundColor: "#3a7bd5",
        color: "#ffffff",
      }),
    );
    this.bannerBotaoVamos.on("pointerdown", () => {
      this.fecharDialogoObjetivo();
      this.npcCaminharESair();
    });

    let charIndex = 0;
    this.bannerTimer = this.time.addEvent({
      delay: 45,
      repeat: mensagem.length - 1,
      callback: () => {
        charIndex++;
        this.bannerTexto.setText(mensagem.substring(0, charIndex));
        // Quando o texto terminar de aparecer, mostra o botão "Vamos!"
        if (charIndex >= mensagem.length) {
          this.bannerBotaoVamos.setVisible(true);
          this.input.keyboard.once("keydown-ENTER", () => {
            if (this.dialogoNpcAberto) {
              this.fecharDialogoObjetivo();
              this.npcCaminharESair();
            }
          });
        }
      },
    });
  }

  fecharDialogoObjetivo() {
    if (this.bannerTimer) {
      this.bannerTimer.remove();
      this.bannerTimer = null;
    }
    if (this.bannerAutoFechar) {
      this.bannerAutoFechar.remove();
      this.bannerAutoFechar = null;
    }
    if (this.bannerFundo) {
      this.bannerFundo.destroy();
      this.bannerFundo = null;
    }
    if (this.bannerTexto) {
      this.bannerTexto.destroy();
      this.bannerTexto = null;
    }
    if (this.bannerBotaoVamos) {
      this.bannerBotaoVamos.destroy();
      this.bannerBotaoVamos = null;
    }
    this.dialogoNpcAberto = false;
  }

  npcCaminharESair() {
    this.npcPartiu = true;
    this.indicadorE.setVisible(false);

    this.npcSprite.anims.play("npc_andar_direita");

    // Calcula a duração da caminhada com base na distância para a borda direita (1920px) e uma velocidade de 200px/s
    const distancia = this.scale.width + 100 - this.npcSprite.x;
    const duracao = (distancia / 200) * 1000;

    this.tweens.add({
      targets: this.npcSprite,
      x: this.scale.width + 100,
      duration: duracao,
      ease: "Linear",
      onComplete: () => {
        this.npcSprite.destroy();
        this.npcSprite = null;
      },
    });

    // Pausa a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
    });
  }

  update() {
    // ...existing code...

    if (!this.podeMover) return; //Não move enquanto tutorial estiver aberto

    const corpoFisico = this.personagemSprite.body;
    corpoFisico.setVelocity(0);
    let estaAndando = false;

    if (this.teclasControl.left.isDown) {
      corpoFisico.setVelocityX(-this.velocidadePersonagem);
      this.personagemSprite.anims.play("andar_esquerda", true);
      estaAndando = true;
    } else if (this.teclasControl.right.isDown) {
      corpoFisico.setVelocityX(this.velocidadePersonagem);
      this.personagemSprite.anims.play("andar_direita", true);
      estaAndando = true;
    }

    if (this.teclasControl.up.isDown) {
      corpoFisico.setVelocityY(-this.velocidadePersonagem);
      if (!estaAndando) this.personagemSprite.anims.play("andar_tras", true);
      estaAndando = true;
    } else if (this.teclasControl.down.isDown) {
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
    this.personagemSprite.y = Phaser.Math.Clamp(
      this.personagemSprite.y,
      578,
      690,
    );
    this.personagemSprite.x = Phaser.Math.Clamp(
      this.personagemSprite.x,
      0,
      1920,
    );

    // Colisão com o NPC — impede o personagem de passar pelo NPC (bloqueia só X)
    // Permanece ativa enquanto o sprite do NPC existir (inclusive durante a caminhada)
    if (this.npcSprite) {
      const limiteX = this.npcSprite.x - 60; // 60px à esquerda do centro do NPC
      if (this.personagemSprite.x > limiteX) {
        this.personagemSprite.x = limiteX;
      }
    }

    // Proximidade ao NPC: mostra indicador [E] e abre diálogo ao pressionar E
    if (this.npcSprite) {
      const distNpc = Phaser.Math.Distance.Between(
        this.personagemSprite.x,
        this.personagemSprite.y,
        this.npcSprite.x,
        this.npcSprite.y,
      );
      const pertoDoNpc = distNpc < 150;
      this.indicadorE.setVisible(
        pertoDoNpc && !this.dialogoNpcAberto && !this.npcPartiu,
      );

      if (
        pertoDoNpc &&
        !this.dialogoNpcAberto &&
        !this.npcPartiu &&
        Phaser.Input.Keyboard.JustDown(this.teclaE)
      ) {
        this.dialogoNpcAberto = true;
        this.fecharMissao();
        this.mostrarDialogoObjetivo();
      }
    }

    // Detecta quando o personagem chega na borda direita da tela
    if (this.personagemSprite.x >= 1880 && !this.transicaoAtiva) {
      this.transicaoAtiva = true;
      this.podeMover = false;
      this.personagemSprite.body.setVelocity(0);
      this.personagemSprite.anims.pause();
      this.fecharDialogoObjetivo();
      this.iniciarClockWipe();
    }
  }

  // Transição clock wipe sentido horário antes de ir para a cutscene
  iniciarClockWipe() {
    // Se animações desativadas (acessibilidade), pula direto para a cutscene
    if (!GameSettings.animacoes) {
      this.scene.start("SceneCutscene");
      return;
    }
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const raio = Math.hypot(this.scale.width, this.scale.height) / 2;

    const maskGraphics = this.make.graphics();
    const mask = maskGraphics.createGeometryMask();
    this.cameras.main.setMask(mask);

    this.tweens.add({
      targets: { progress: 0 },
      progress: 1,
      duration: 1000,
      ease: "Sine.easeInOut",
      onUpdate: (tween) => {
        const progress = tween.getValue();
        maskGraphics.clear();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.beginPath();
        maskGraphics.moveTo(cx, cy);

        // Sentido horário: área visível encolhe no sentido horário
        const startAngle = -Math.PI / 2 + progress * Math.PI * 2;
        const endAngle = -Math.PI / 2 + Math.PI * 2;
        maskGraphics.arc(cx, cy, raio, startAngle, endAngle, false);

        maskGraphics.closePath();
        maskGraphics.fillPath();
      },
      onComplete: () => {
        this.cameras.main.clearMask(true);
        maskGraphics.destroy();
        this.scene.start("SceneCutscene");
      },
    });
  }

  //Menu de pausa ao apertar ESC
  abrirMenuPausa() {
    this.menuPausaAberto = true;
    this.podeMover = false; //Bloqueia movimentação enquanto menu está aberto

    // Fundo escuro semi-transparente
    this.fundoPausa = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0.5,
      )
      .setDepth(100)
      .setScrollFactor(0);

    // Imagem de fundo do painel de pausa
    this.caixaPausa = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "configFundo")
      .setScale(2.5)
      .setDepth(100)
      .setScrollFactor(0);

    // Título do menu de pausa
    this.tituloPausa = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 150, "PAUSADO", {
        fontSize: "42px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setScrollFactor(0);

    // Botão "Retomar"
    this.botaoRetomar = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 40, "RETOMAR", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    // Botão "Configurações"
    this.botaoConfigPausa = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 30, "CONFIGURAÇÕES", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    // Botão "Voltar ao Início"
    this.botaoVoltarInicio = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 100,
        "VOLTAR AO INÍCIO",
        { fontSize: "28px", color: "#ff5555" }, //Vermelho para indicar saída
      )
      .setOrigin(0.5)
      .setDepth(101)
      .setScrollFactor(0)
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

    this.botaoConfigPausa.on("pointerover", () =>
      this.botaoConfigPausa.setScale(1.07),
    );
    this.botaoConfigPausa.on("pointerout", () =>
      this.botaoConfigPausa.setScale(1),
    );

    this.botaoVoltarInicio.on("pointerover", () =>
      this.botaoVoltarInicio.setScale(1.07),
    );
    this.botaoVoltarInicio.on("pointerout", () =>
      this.botaoVoltarInicio.setScale(1),
    );
  }

  fecharMenuPausa() {
    //Fecha o menu de pausa e retoma o jogo
    this.fundoPausa.destroy();
    this.caixaPausa.destroy();
    this.tituloPausa.destroy();
    this.botaoRetomar.destroy();
    this.botaoConfigPausa.destroy();
    this.botaoVoltarInicio.destroy();
    this.menuPausaAberto = false;
    this.podeMover = true; //Libera movimentação
  }

  abrirPopupConfig() {
    this.configAberta = true;

    // Esconde os elementos do menu de pausa
    this.caixaPausa.setVisible(false);
    this.tituloPausa.setVisible(false);
    this.botaoRetomar.setVisible(false);
    this.botaoConfigPausa.setVisible(false);
    this.botaoVoltarInicio.setVisible(false);

    this._elementosConfig = abrirPopupConfigModule(this, {
      depth: 102,
      scrollFactor: 0,
      onFechar: () => {
        this._elementosConfig = null;
        this.configAberta = false;
        // Restaura o menu de pausa
        this.caixaPausa.setVisible(true);
        this.tituloPausa.setVisible(true);
        this.botaoRetomar.setVisible(true);
        this.botaoConfigPausa.setVisible(true);
        this.botaoVoltarInicio.setVisible(true);
      },
    });
  }

  fecharPopupConfig() {
    //Fecha o popup externamente se necessário
    if (this._elementosConfig) {
      this._elementosConfig.forEach((el) => {
        if (el && el.active) el.destroy();
      });
      this._elementosConfig = null;
      this.configAberta = false;
      this.caixaPausa.setVisible(true);
      this.tituloPausa.setVisible(true);
      this.botaoRetomar.setVisible(true);
      this.botaoConfigPausa.setVisible(true);
      this.botaoVoltarInicio.setVisible(true);
    }
  }

  voltarAoInicio() {
    //Volta para a cena inicial com fade out
    if (!GameSettings.animacoes) {
      this.scene.start("SceneInicial");
      return;
    }
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("SceneInicial");
    });
  }

  executarTransicaoEntrada() {
    // Efeito de fade in suave ao entrar na cena
    if (!GameSettings.animacoes) return;
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }
}
