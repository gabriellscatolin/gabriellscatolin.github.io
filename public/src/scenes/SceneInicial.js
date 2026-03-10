// Cena inicial do jogo com menu principal
import { GameSettings, aplicarConfiguracoes, abrirPopupConfig } from "../settings.js";

export default class SceneInicial extends Phaser.Scene {
  constructor() {
    super("SceneInicial");

// Configurações da cena (Partes fixas)
    this.CONFIG = {
      //Efeito de pixelado ao trocar de cena
      FADE_DURATION: 1000, // Duração do fade
      PIXELATE_AMOUNT: 40, // Pixelização máxima
      PIXELATE_DURATION: 800, // Duração da pixelização
      ASSETS: {
        botaoJogar: "src/assets/imagens/imagensBotoes/botaoJogar.png",        //Botão "jogar 
        fundo: "src/assets/imagens/imagensMapa/mapaInicial.png",              //Fundo de tela inicial
        botaoConfig: "src/assets/imagens/imagensBotoes/botaoConfig.png",      //Botão "configurações"
        botaoCreditos: "src/assets/imagens/imagensBotoes/botaoCreditos.png",  //Botão "créditos"
        configFundo: "src/assets/imagens/imagensPopUps/fundoConfig.png",      //Tela de fundo das configurações
        imagemCreditos: "src/assets/imagens/imagensPopUps/imagemCreditos.png", //Imagem de créditos
        logoCielo:      "src/assets/imagens/imagensPopUps/cielo.png"           //Logo da Cielo
      },

//Definição de posição e tamanho dos botões
     BOTOES: [
    { key: "botaoConfig", x: "center", y: 870, scale: 0.48, action: "openSettings" },
    { key: "botaoJogar", x: "center", y: 600, scale: 0.5, action: "startGame" },
    { key: "botaoCreditos", x: "center", y: 730, scale: 0.85, action: "abrirCreditos" }]
    };
  }

// Carrega os assets
  preload() {
    this.load.image("fundo", this.CONFIG.ASSETS.fundo);
    this.load.image("botaoJogar", this.CONFIG.ASSETS.botaoJogar);
    this.load.image("botaoConfig", this.CONFIG.ASSETS.botaoConfig);
    this.load.image("botaoCreditos", this.CONFIG.ASSETS.botaoCreditos);
    this.load.image("configFundo", this.CONFIG.ASSETS.configFundo);
    this.load.image("imagemCreditos", this.CONFIG.ASSETS.imagemCreditos);
    this.load.image("logoCielo",      this.CONFIG.ASSETS.logoCielo);
  }
//Configura os elementos visuais e interativos das cenas
  create() {
    // Fundo
    this.fundo = this.add.image(0, 0, "fundo").setOrigin(0, 0);
    this.redimensionarFundo();

    // Aplica configurações salvas (brilho, daltonismo, etc.)
    this.sound.volume = GameSettings.volume;
    aplicarConfiguracoes();

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
    // Se animações desativadas (acessibilidade), pula a transição
    if (!GameSettings.animacoes) {
      this.scene.start("ScenePersonagem");
      return;
    }
    // Transição com efeito de pixelado antes de iniciar o jogo
    const cam = this.cameras.main;
    const pixelated = cam.postFX.addPixelate(1);
    this.add.tween({
      targets: pixelated,
      duration: this.CONFIG.PIXELATE_DURATION,
      amount: this.CONFIG.PIXELATE_AMOUNT,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.scene.start("ScenePersonagem"); //Inicia a cena do jogo após a transição
      }
    });
  }

  openSettings() {
    this.abrirPopupConfig();
  }

  abrirPopupConfig() {
    this._elementosConfig = abrirPopupConfig(this, {
      depth: 102,
      onFechar: () => { this._elementosConfig = null; }
    });
  }

  fecharPopupConfig() {
    if (this._elementosConfig) {
      this._elementosConfig.forEach(el => { if (el && el.active) el.destroy(); });
      this._elementosConfig = null;
    }
  }

  abrirCreditos() {
    if (this._elementosCreditos) return; // já aberto

    const w  = this.scale.width;
    const h  = this.scale.height;
    const cx = w / 2;
    const cy = h / 2;
    const depth = 200;
    const d1 = depth + 1;
    const els = [];
    const add = obj => { els.push(obj); return obj; };

    // ── Dimensões do painel ───────────────────────────────────────────────────
    const PW             = Math.min(w * 0.92, 980);
    const PH             = Math.min(h * 0.94, 860);
    const TITLE_H        = 54;
    const FOOTER_H       = 64;
    const PARTNER_SECTION_H = 98; // separador + label + cartão da logo

    // ── Estrutura base ────────────────────────────────────────────────────────
    add(this.add.rectangle(cx, cy, w, h, 0x000000, 0.78)
      .setDepth(depth).setScrollFactor(0));

    add(this.add.rectangle(cx, cy, PW, PH, 0x10141e)
      .setDepth(depth + 0.1).setScrollFactor(0));

    add(this.add.rectangle(cx, cy, PW, PH)
      .setStrokeStyle(2, 0x3a5ba0).setDepth(depth + 0.2).setScrollFactor(0));

    // Barra de título
    add(this.add.rectangle(cx, cy - PH / 2 + TITLE_H / 2, PW, TITLE_H, 0x1d2b4a)
      .setDepth(depth + 0.3).setScrollFactor(0));

    add(this.add.text(cx, cy - PH / 2 + TITLE_H / 2, 'CRÉDITOS', {
      fontSize: '28px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5, 0.5).setDepth(d1).setScrollFactor(0));

    // ── Imagem ────────────────────────────────────────────────────────────────
    // Área disponível entre título e seção da equipe
    const innerTop    = cy - PH / 2 + TITLE_H + 12;
    const teamSectionH = 196; // separador + label + 4 linhas + espaço
    const imgAreaH    = PH - TITLE_H - teamSectionH - PARTNER_SECTION_H - FOOTER_H - 12;
    const imgAreaCY   = innerTop + imgAreaH / 2;

    const img = add(this.add.image(cx, imgAreaCY, 'imagemCreditos')
      .setDepth(d1).setScrollFactor(0));

    const imgScale = Math.min((PW - 40) / img.width, imgAreaH / img.height, 1);
    img.setScale(imgScale);

    // ── Separador + label "NOSSA EQUIPE" ─────────────────────────────────────
    const sepY = innerTop + imgAreaH + 10;

    add(this.add.rectangle(cx, sepY, PW - 40, 1, 0x2a3f6a)
      .setDepth(d1).setScrollFactor(0));

    add(this.add.text(cx, sepY + 10, 'NOSSA EQUIPE', {
      fontSize: '15px', fontStyle: 'bold', color: '#5a8fd4'
    }).setOrigin(0.5, 0).setDepth(d1).setScrollFactor(0));

    // ── Membros da equipe ─────────────────────────────────────────────────────
    const equipe = [
      { nome: 'Sofia Farias Brandão',  url: 'https://www.linkedin.com/in/sofia-farias-brand%C3%A3o-8602b7391/', tipo: 'li' },
      { nome: 'Nicolas Dely',          url: 'https://www.linkedin.com/in/nicolas-dely-4b287b252/',               tipo: 'li' },
      { nome: 'Ana Alícia Medina',     url: 'https://www.linkedin.com/in/ana-al%C3%ADcia-medina-5261431aa/',     tipo: 'li' },
      { nome: 'Eduardo Melquiades',    url: 'https://www.linkedin.com/in/eduardomelquiades/',                    tipo: 'li' },
      { nome: 'Rachel D. Silvestre',   url: 'https://www.linkedin.com/in/racheldurantesilvestre/',               tipo: 'li' },
      { nome: 'Lucas Borten',          url: 'https://www.linkedin.com/in/lucas-borten-744421215/',               tipo: 'li' },
      { nome: 'Gabriel Scatolin',      url: 'https://git.inteli.edu.br/gabriel.scatolin/',                      tipo: 'gl' },
    ];

    const COLS      = 2;
    const CELL_H    = 36;
    const CELL_W    = (PW - 60) / COLS;
    const teamTop   = sepY + 34;

    equipe.forEach((m, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      // Centraliza a última linha caso tenha menos colunas
      const itemsInRow = Math.min(COLS, equipe.length - row * COLS);
      const rowW       = itemsInRow * CELL_W;
      const rowLeft    = cx - rowW / 2;
      const cellLeft   = rowLeft + col * CELL_W;
      const y          = teamTop + row * CELL_H + CELL_H / 2;

      // Badge "in" (LinkedIn) ou "GL" (GitLab)
      const isLi       = m.tipo === 'li';
      const badgeColor = isLi ? 0x0a8af0 : 0xfc6d26;
      const badgeLabel = isLi ? 'in' : 'GL';

      add(this.add.rectangle(cellLeft + 22, y, 30, 22, 0x10141e)
        .setStrokeStyle(1.5, badgeColor).setDepth(d1).setScrollFactor(0));

      add(this.add.text(cellLeft + 22, y, badgeLabel, {
        fontSize: '12px', fontStyle: 'bold',
        color: isLi ? '#0a8af0' : '#fc6d26'
      }).setOrigin(0.5, 0.5).setDepth(d1 + 0.5).setScrollFactor(0));

      // Nome clicável
      const nameText = add(this.add.text(cellLeft + 42, y, m.nome, {
        fontSize: '17px', color: '#c8d8f0'
      }).setOrigin(0, 0.5).setDepth(d1 + 0.5).setScrollFactor(0)
        .setInteractive({ useHandCursor: true }));

      nameText.on('pointerover', () => nameText.setColor('#ffffff'));
      nameText.on('pointerout',  () => nameText.setColor('#c8d8f0'));
      nameText.on('pointerdown', () => window.open(m.url, '_blank'));
    });

    // ── Parceiro institucional (Cielo) ────────────────────────────────────────
    const partnerSepY = teamTop + Math.ceil(equipe.length / COLS) * CELL_H + 10;

    add(this.add.rectangle(cx, partnerSepY, PW - 40, 1, 0x2a3f6a)
      .setDepth(d1).setScrollFactor(0));

    add(this.add.text(cx, partnerSepY + 10, 'PARCEIRO INSTITUCIONAL', {
      fontSize: '13px', fontStyle: 'bold', color: '#5a8fd4'
    }).setOrigin(0.5, 0).setDepth(d1).setScrollFactor(0));

    // Cartão branco que abraça a logo (a logo tem fundo branco)
    const cardW  = 210;
    const cardH  = 58;
    const cardY  = partnerSepY + 38;

    const cieloCard = add(this.add.rectangle(cx, cardY, cardW, cardH, 0xffffff)
      .setStrokeStyle(1.5, 0xdddddd).setDepth(d1).setScrollFactor(0)
      .setInteractive({ useHandCursor: true }));

    const cieloLogo = add(this.add.image(cx, cardY, 'logoCielo')
      .setDepth(d1 + 0.5).setScrollFactor(0));

    const cieloScale = Math.min((cardW - 20) / cieloLogo.width, (cardH - 12) / cieloLogo.height, 1);
    cieloLogo.setScale(cieloScale);

    cieloCard.on('pointerover', () => cieloCard.setFillStyle(0xeaf6ff));
    cieloCard.on('pointerout',  () => cieloCard.setFillStyle(0xffffff));
    cieloCard.on('pointerdown', () => window.open('https://www.cielo.com.br/', '_blank'));

    // ── Botão FECHAR ──────────────────────────────────────────────────────────
    const fchY  = cy + PH / 2 - FOOTER_H / 2;
    const fchBg = add(this.add.rectangle(cx, fchY, 200, 44, 0x6a1a1a)
      .setStrokeStyle(1, 0x9a3a3a).setDepth(d1).setScrollFactor(0)
      .setInteractive({ useHandCursor: true }));

    add(this.add.text(cx, fchY, 'FECHAR', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5, 0.5).setDepth(d1 + 0.5).setScrollFactor(0));

    fchBg.on('pointerover', () => fchBg.setFillStyle(0x8a2a2a));
    fchBg.on('pointerout',  () => fchBg.setFillStyle(0x6a1a1a));
    fchBg.on('pointerdown', () => {
      els.forEach(el => { if (el && el.active) el.destroy(); });
      this._elementosCreditos = null;
    });

    this._elementosCreditos = els;
  }
}
