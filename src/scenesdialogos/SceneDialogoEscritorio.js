import SceneDialogoBase from "./SceneDialogoBase.js";
import {
  initScoring,
  handleAnswer,
  checkGoal,
  getScore,
  goalEscalado,
} from "../scoring.js";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const ROTEIRO = [
  {
    titulo: "CENA 1 - ABORDAGEM",
    narracao:
      "Ambiente: Escritório silencioso, organizado. Gabriel está concentrado no computador. A representante se aproxima e aguarda um momento. Gabriel levanta os olhos rapidamente, percebendo a presença dela.",
    npcInicial: "Bom dia. Pode falar... só peço objetividade.",
    escolhas: [
      {
        letra: "A",
        texto: "Perfeito. Vou ser direto. Hoje você olha mais o total no final, ou costuma conferir venda por venda?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Direto, respeita o perfil do cliente e introduz o ponto central sem parecer técnico demais.",
      },
      {
        letra: "B",
        texto: "Bom dia. Queria entender como você acompanha os recebimentos no dia a dia.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas amplo e pouco direcionado.",
      },
      {
        letra: "C",
        texto: "Bom dia, vim te mostrar algumas soluções de pagamento que podem melhorar sua operação.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Genérico e desalinhado com o perfil analítico do cliente.",
      },
    ],
    npcResposta:
      "Eu olho mais o total... não entro tanto no detalhe de cada venda.",
  },
  {
    titulo: "CENA 2 - IDENTIFICAÇÃO DO GAP REAL",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Entendi... então pode acontecer de o total fechar, mas alguma venda específica ter diferença e passar batido.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Introduz risco real de forma lógica e sem confronto.",
      },
      {
        letra: "B",
        texto: "Entendi, então você tem um controle mais geral, mas não tão detalhado.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas não evidencia o problema.",
      },
      {
        letra: "C",
        texto: "Se o total fecha, normalmente não tem problema relevante.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Incorreto e perigoso. Ignora divergências por transação.",
      },
    ],
    npcResposta: "Que tipo de diferença você está falando?",
  },
  {
    titulo: "CENA 3 - EXPLORAÇÃO COM EXEMPLO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Por exemplo, você vende R$ 1.000, mas recebe R$ 970. Sem cruzar a venda, você não sabe se foi taxa, antecipação ou algum erro.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Simples, direto e técnico na medida certa. Traz três conceitos técnicos: taxa (MDR), antecipação e erro, mostrando a necessidade de validação.",
      },
      {
        letra: "B",
        texto: "Pode existir diferença entre o valor vendido e o recebido, dependendo das condições.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas abstrato.",
      },
      {
        letra: "C",
        texto: "Essas diferenças normalmente são só taxa, então não precisa aprofundar tanto.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Simplificação incorreta.",
      },
    ],
    npcResposta: "E como eu consigo ter essa visibilidade em cada caso?",
  },
  {
    titulo: "CENA 4 - MÉTODO DE VALIDAÇÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Você precisa olhar cada venda com três pontos juntos: quanto foi vendido, qual taxa foi aplicada e quanto entrou líquido.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Estrutura clara e prática. Ensina sem parecer aula. Define o processo de conciliação: valor bruto, taxa e valor líquido.",
      },
      {
        letra: "B",
        texto: "O ideal é acompanhar com mais detalhe e entender como os valores são calculados.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas sem método. Não explica como validar.",
      },
      {
        letra: "C",
        texto: "O extrato já dá uma boa ideia geral do que está acontecendo.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Frágil. Não permite validação por venda. O extrato mostra o que entrou, mas não mostra claramente a origem de cada valor nem o cálculo por venda.",
      },
    ],
    npcResposta: "Mas fazer isso venda a venda fica inviável no dia a dia.",
  },
  {
    titulo: "CENA 5 - OBJEÇÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Exato... por isso o ideal é já ter isso organizado, com cada venda vinculada ao que entrou. Quando a maquininha já está integrada com o banco, você não precisa conciliar manualmente, porque a informação já chega estruturada na conta.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Resolve a objeção com eficiência e adiciona o benefício real da integração Cielo + banco.",
      },
      {
        letra: "B",
        texto: "Dá trabalho mesmo, mas com organização dá pra acompanhar melhor.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Ajuda, mas não resolve. Verdade, mas ineficiente. Controle manual aumenta risco de erro e perda de tempo.",
      },
      {
        letra: "C",
        texto: "Você pode ir olhando aos poucos quando tiver tempo.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Inviável para o perfil do cliente. Sem estrutura, a conciliação perde confiabilidade e pode gerar erro acumulado.",
      },
    ],
    npcResposta:
      "Se eu tivesse isso estruturado, eu teria muito mais confiança no controle.",
  },
  {
    titulo: "CENA 6 - PRÓXIMO PASSO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Se fizer sentido, eu te mostro isso na prática em 10 minutos, já integrado com o banco e com as vendas organizadas por entrada. Quando fica melhor pra você, agora ou mais tarde?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "CTA direto, reforça integração como diferencial e conduz para ação concreta.",
      },
      {
        letra: "B",
        texto: "Posso te explicar melhor isso em outro momento.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Vago e sem compromisso.",
      },
      {
        letra: "C",
        texto: "A gente pode configurar isso agora e você vai vendo como funciona depois.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Desorganizado e desalinhado com perfil analítico.",
      },
    ],
    npcResposta:
      "Perfeito. Se eu conseguir validar assim, faz bastante sentido pra mim.",
  },
];

const CAPITULO = "chapter1";
const FASE = "escritorio";
const N_CENAS = ROTEIRO.length;

const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoEscritorio extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoEscritorio" });
    this.imagemKey = "falaEscritorio";
    this.respostaRoteiroEstrita = true;
    this.promptLLM =
      "VocÃª Ã© Gabriel, um cliente de escritÃ³rio organizado, analÃ­tico e objetivo. " +
      "Valoriza clareza, validaÃ§Ã£o, precisÃ£o e previsibilidade.";
  }

  init(dados) {
    super.init(dados);
    this.cenaIdx = 0;
    this.pontuacaoFase = 0;
    this.cieloCoinsGanhasDialogo = 0;
    this.estado = "tutorial";
    this.aguardandoLLM = false;
    this.escolhaAtual = null;
    this.respostaAtualNpc = "";
    initScoring(this.registry);
  }

  preload() {
    if (!this.textures.exists("falaEscritorio")) {
      this.load.image(
        "falaEscritorio",
        "src/assets/imagens/imagensFalas/Escritorio - F.png",
      );
    }
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const CX = W / 2;

    const IMG_H = 660;
    const IMG_CY = IMG_H / 2;
    const PANEL_TOP = IMG_H + 10;
    const PANEL_H = H - PANEL_TOP - 10;
    const PANEL_CY = PANEL_TOP + PANEL_H / 2;

    const NOME_Y = PANEL_TOP + 22;
    const TEXTO_NPC_Y = PANEL_TOP + PANEL_H / 2 - 10;
    const NAR_Y = PANEL_TOP + 26;
    const BTN_Y = [PANEL_TOP + 28, PANEL_TOP + 118, PANEL_TOP + 208];
    const BTN_W = W - 120;
    const BTN_H = 82;
    const CONT_Y = PANEL_TOP + PANEL_H - 38;

    this._CONT_Y = CONT_Y;

    this.add.rectangle(CX, H / 2, W, H, 0x000000, 0.78)
      .setScrollFactor(0).setDepth(0).setInteractive();

    const img = this.add.image(CX, IMG_CY, "falaEscritorio")
      .setScrollFactor(0).setDepth(1).setOrigin(0.5);
    const escala = Math.min(W / img.width, IMG_H / img.height);
    img.setScale(escala);

    this.add.rectangle(CX, PANEL_CY, W, PANEL_H, 0x060d1a, 0.96)
      .setScrollFactor(0).setDepth(2);
    this.add.rectangle(CX, PANEL_TOP, W, 3, 0x2a5ba0)
      .setScrollFactor(0).setDepth(3);

    this.textoNome = this.add.text(
      CX - BTN_W / 2,
      NOME_Y,
      "Gabriel  -  EscritÃ³rio",
      {
        fontSize: "20px",
        color: "#5a9fd4",
        fontStyle: "bold",
        resolution: 4,
      },
    ).setScrollFactor(0).setDepth(3).setVisible(false);

    this.textoNarracao = this.add.text(CX, NAR_Y + 30, "", {
      fontSize: "40px",
      color: "#e8f4ff",
      fontStyle: "italic",
      wordWrap: { width: BTN_W },
      align: "center",
      resolution: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(3);

    this.textoNpc = this.add.text(CX, TEXTO_NPC_Y, "", {
      fontSize: "40px",
      color: "#e8f4ff",
      wordWrap: { width: BTN_W },
      align: "center",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3);

    this.textoFeedbackTitulo = this.add.text(CX, PANEL_TOP + 60, "", {
      fontSize: "38px",
      color: "#ffd166",
      fontStyle: "bold",
      align: "center",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    this.textoFeedback = this.add.text(CX, TEXTO_NPC_Y, "", {
      fontSize: "32px",
      color: "#e8f4ff",
      wordWrap: { width: BTN_W },
      align: "center",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    this.botoesEscolha = BTN_Y.map((by, i) => {
      const letra = ["A", "B", "C"][i];

      const bg = this.add.rectangle(CX, by + BTN_H / 2, BTN_W, BTN_H, COR_NEUTRO)
        .setScrollFactor(0)
        .setDepth(3)
        .setStrokeStyle(1, 0x3a5ba0)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      const labelLetra = this.add.text(CX - BTN_W / 2 + 16, by + BTN_H / 2, `[${letra}]`, {
        fontSize: "20px",
        color: "#776fe6",
        fontStyle: "bold",
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(4).setVisible(false);

      const txtEscolha = this.add.text(CX - BTN_W / 2 + 70, by + BTN_H / 2, "", {
        fontSize: "30px",
        color: "#ffffff",
        wordWrap: { width: BTN_W - 80 },
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(4).setVisible(false);

      bg.on("pointerover", () => {
        if (!this.aguardandoLLM) bg.setFillStyle(COR_HOVER);
      });
      bg.on("pointerout", () => {
        if (!this.aguardandoLLM) bg.setFillStyle(COR_NEUTRO);
      });
      bg.on("pointerdown", () => {
        if (!this.aguardandoLLM) this._aoEscolher(i);
      });

      return { bg, labelLetra, txtEscolha };
    });

    this.btnContinuar = this.add.rectangle(CX, CONT_Y, 340, 56, 0x1a5c1a)
      .setScrollFactor(0)
      .setDepth(3)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.txtContinuar = this.add.text(CX, CONT_Y, "", {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    this.btnContinuar.on("pointerover", () => this.btnContinuar.setFillStyle(0x2a7c2a));
    this.btnContinuar.on("pointerout", () => this.btnContinuar.setFillStyle(0x1a5c1a));
    this.btnContinuar.on("pointerdown", () => this._aoContinuar());

    this.textoCarregando = this.add.text(CX, CONT_Y, "Gabriel estÃ¡ pensando...", {
      fontSize: "21px",
      color: "#99bbdd",
      fontStyle: "italic",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    this.textoCieloCoin = this.add.text(W - 20, 16, "Cielo Coins: 0 / 600", {
      fontSize: "30px",
      color: "#ffd700",
      backgroundColor: "#000000bb",
      padding: { x: 10, y: 5 },
      resolution: 4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);

    this.textoCena = this.add.text(20, 16, "", {
      fontSize: "40px",
      color: "#ffffff",
      backgroundColor: "#000000bb",
      padding: { x: 10, y: 5 },
      resolution: 4,
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(10);

    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._criarTutorial(W, H, CX, H / 2);
  }

  update() {
    if (this.estado === "fim" && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this._fechar();
    }
  }

  _criarTutorial(W, H, CX, CY) {
    const els = [];
    const D = 5;

    els.push(this.add.rectangle(CX, CY, W, H, 0x000000, 0.88)
      .setScrollFactor(0).setDepth(D).setInteractive());
    els.push(this.add.rectangle(CX, CY, 1100, 640, 0x08101e)
      .setScrollFactor(0).setDepth(D + 0.1).setStrokeStyle(2, 0x2a5ba0));
    els.push(this.add.text(CX, CY - 270, "Como funciona esta conversa", {
      fontSize: "25px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
    els.push(this.add.rectangle(CX, CY - 230, 1000, 2, 0x2a5ba0)
      .setScrollFactor(0).setDepth(D + 1));

    const linhas = [
      {
        icone: "ðŸŽ¯",
        texto: "VocÃª vai conduzir uma conversa tÃ©cnica com o Gabriel, gerando confianÃ§a por clareza, mÃ©todo e validaÃ§Ã£o.",
      },
      {
        icone: "ðŸ’¬",
        texto: "A cada cena, escolha entre trÃªs opÃ§Ãµes de resposta a que mais fizer sentido para avanÃ§ar a conversa.",
      },
      {
        icone: "ðŸª™",
        texto: "Cada escolha vale Cielo Coins. Resposta correta = +100. Neutra = +50. Errada = +0",
      },
    ];

    linhas.forEach(({ icone, texto }, i) => {
      els.push(this.add.text(CX - 480, CY - 125 + i * 120, icone, {
        fontSize: "26px",
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1));
      els.push(this.add.text(CX - 430, CY - 110 + i * 120, texto, {
        fontSize: "30px",
        color: "#c8d8f0",
        wordWrap: { width: 900 },
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1));
    });

    const btnY = CY + 255;
    const btnBg = this.add.rectangle(CX, btnY, 300, 58, 0x1a5c1a)
      .setScrollFactor(0)
      .setDepth(D + 1)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true });
    els.push(btnBg);
    els.push(this.add.text(CX, btnY, "ComeÃ§ar  ->", {
      fontSize: "24px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2));

    btnBg.on("pointerover", () => btnBg.setFillStyle(0x2a7c2a));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x1a5c1a));
    btnBg.on("pointerdown", () => {
      els.forEach((el) => el?.destroy?.());
      this._mostrarCena(0);
    });

    this._tutorialEls = els;
  }

  _mostrarCena(idx) {
    const cena = ROTEIRO[idx];
    this.cenaIdx = idx;
    this.estado = "intro";
    this.aguardandoLLM = false;
    this.escolhaAtual = null;
    this.respostaAtualNpc = "";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);

    this.textoCena.setText(`${cena.titulo}  (${idx + 1} / ${ROTEIRO.length})`);
    this._esconderBotoes();
    this._ocultarContinuar();
    this.textoCarregando.setVisible(false);
    this.textoNome.setVisible(false);

    this.textoNarracao.setText(cena.narracao || "");
    this.textoNpc.setText(cena.npcInicial ? `"${cena.npcInicial}"` : "");

    if (!cena.narracao && !cena.npcInicial) {
      this._mostrarEscolhas();
    } else {
      this.textoNome.setVisible(!!cena.npcInicial);
      this._mostrarContinuar("Responder  ->");
    }
  }

  _mostrarEscolhas() {
    const cena = ROTEIRO[this.cenaIdx];
    this.estado = "escolha";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);

    this.textoNarracao.setText("");
    this.textoNpc.setText("O que vocÃª diz?");
    this.textoNome.setVisible(false);
    this._ocultarContinuar();

    this.escolhasOrdenadas = shuffleArray(cena.escolhas);
    this.escolhasOrdenadas.forEach(({ texto }, i) => {
      const { bg, labelLetra, txtEscolha } = this.botoesEscolha[i];
      txtEscolha.setText(texto);
      bg.setFillStyle(COR_NEUTRO).setVisible(true);
      labelLetra.setVisible(true);
      txtEscolha.setVisible(true);
    });
  }

  _mostrarFeedbackEscolha(escolha) {
    this.estado = "feedback";

    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoNpc.setVisible(false);

    this.textoFeedbackTitulo
      .setText(escolha.feedbackTitulo || "Feedback")
      .setVisible(true);

    this.textoFeedback
      .setText(escolha.feedbackTexto || "VocÃª fez uma escolha.")
      .setVisible(true);

    this._mostrarContinuar("Continuar  ->");
  }

  _mostrarRespostaNpc(resposta) {
    this.estado = "resposta";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);

    this.textoNarracao.setText("");
    this.textoNome.setVisible(true);
    this.textoNpc.setVisible(true);
    this.textoNpc.setText(`"${resposta}"`);

    const ultimo = this.cenaIdx >= ROTEIRO.length - 1;
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "PrÃ³xima cena  ->");
  }

  async _aoEscolher(indice) {
    if (this.aguardandoLLM || this.estado !== "escolha") return;

    const cena = ROTEIRO[this.cenaIdx];
    const escolha = this.escolhasOrdenadas[indice];

    this.escolhaAtual = escolha;

    const ganhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);
    this.pontuacaoFase += ganhos;
    this.cieloCoinsGanhasDialogo += ganhos;
    this.textoCieloCoin.setText(
      `Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
    );

    if (escolha.tipo === "correta") {
      this.botoesEscolha[indice].bg.setFillStyle(COR_CORRETA);
    } else if (escolha.tipo === "errada") {
      this.botoesEscolha[indice].bg.setFillStyle(COR_ERRADA);
    } else {
      this.botoesEscolha[indice].bg.setFillStyle(COR_NEUTRA);
    }

    this.aguardandoLLM = true;
    this._esconderBotoes(indice);
    this.textoCarregando.setVisible(true);

    await esperar(350);

    const resposta = await this._chamarLLM(escolha, cena);
    this.respostaAtualNpc = resposta;

    this.aguardandoLLM = false;
    this.textoCarregando.setVisible(false);
    this._esconderBotoes();

    this._mostrarFeedbackEscolha(escolha);
  }

  _aoContinuar() {
    if (this.estado === "intro") {
      this._mostrarEscolhas();
    } else if (this.estado === "feedback") {
      this._mostrarRespostaNpc(this.respostaAtualNpc);
    } else if (this.estado === "resposta") {
      if (this.cenaIdx >= ROTEIRO.length - 1) {
        this._mostrarResultadoFinal();
      } else {
        this._mostrarCena(this.cenaIdx + 1);
      }
    } else if (this.estado === "fim") {
      this._fechar();
    }
  }

  _mostrarResultadoFinal() {
    this.estado = "fim";
    this.registry.set("escritorio_dialogo_concluido", true);
    this._esconderBotoes();
    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);
    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");

    const meta = goalEscalado(FASE);
    const maxPts = N_CENAS * 100;
    const atingiu = checkGoal(FASE, this.pontuacaoFase);
    const pct = Math.round((this.pontuacaoFase / maxPts) * 100);

    let avaliacao;
    let cor;
    if (pct >= 67) {
      avaliacao = "Excelente! ArgumentaÃ§Ã£o impecÃ¡vel.";
      cor = "#44ff88";
    } else {
      avaliacao = "Precisa melhorar. Tente novamente.";
      cor = "#ff6644";
    }

    const statusMeta = atingiu
      ? "Meta atingida!"
      : `Meta nÃ£o atingida (precisava de ${meta} coins)`;

    this.textoNpc
      .setText(
        `Conversa encerrada!\n\n` +
        `Coins desta fase: ${this.pontuacaoFase} / ${maxPts}  (${pct}%)\n` +
        `Total da sessÃ£o: ${getScore(this.registry)}\n\n` +
        `${statusMeta}\n\n${avaliacao}`,
      )
      .setStyle({
        color: cor,
        fontSize: "32px",
      });

    this._mostrarContinuar("Fechar  [E]");
  }

  _mostrarContinuar(label) {
    this.btnContinuar.setVisible(true);
    this.txtContinuar.setVisible(true).setText(label);
  }

  _ocultarContinuar() {
    this.btnContinuar.setVisible(false);
    this.txtContinuar.setVisible(false);
  }

  _esconderBotoes(manter = -1) {
    this.botoesEscolha.forEach(({ bg, labelLetra, txtEscolha }, i) => {
      if (i !== manter) {
        bg.setVisible(false);
        labelLetra.setVisible(false);
        txtEscolha.setVisible(false);
      }
    });
  }

  async _chamarLLM(escolha, cena) {
    if (this.respostaRoteiroEstrita) {
      return cena.npcResposta;
    }

    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
      return cena.npcResposta;
    }

    const guias = {
      correta:
        "O vendedor fez uma abordagem excelente. Responda de forma receptiva, avanÃ§ando a conversa.",
      neutra:
        "O vendedor foi aceitÃ¡vel, porÃ©m genÃ©rico. Responda de forma neutra, sem entusiasmo mas sem fechar portas.",
      errada:
        "O vendedor errou a abordagem. Responda de forma mais fria ou cÃ©tica, mas sem encerrar a conversa.",
    };

    const system =
      `${this.promptLLM}\n` +
      "Responda de forma natural e breve (1-2 frases) em portuguÃªs do Brasil.\n" +
      `Contexto desta cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de referÃªncia (adapte para soar natural): "${cena.npcResposta}"\n` +
      `${guias[escolha.tipo]}`;

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: `O vendedor disse: "${escolha.texto}"` },
          ],
          max_tokens: 120,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || cena.npcResposta;
    } catch (err) {
      console.warn("[SceneDialogoEscritorio] Falha na LLM, usando roteiro:", err.message);
      return cena.npcResposta;
    }
  }
}
