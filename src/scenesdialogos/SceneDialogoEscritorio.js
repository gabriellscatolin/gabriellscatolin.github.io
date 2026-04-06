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
    narracao: "Ambiente: Escritório silencioso, organizado. Gabriel concentrado.",
    npcInicial: "Bom dia. Pode falar… prefiro ser objetivo.",
    escolhas: [
      {
        letra: "A",
        texto: "Perfeito. Vou ser direto: você consegue conferir cada venda com o valor líquido que entra, ou olha mais o total consolidado?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Direto e técnico. Introduz dois conceitos importantes: visão consolidada (total do período) versus visão por transação (cada venda individual).",
      },
      {
        letra: "B",
        texto: "Bom dia. Queria entender como você acompanha os recebimentos do escritório no dia a dia.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas amplo. Não direciona para conciliação, que é o cruzamento entre venda e recebimento.",
      },
      {
        letra: "C",
        texto: "Bom dia, vim te mostrar algumas soluções de pagamento que podem melhorar sua operação.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Abordagem genérica. Não entra no ponto crítico do cliente, que é controle e validação dos dados.",
      },
    ],
    npcResposta:
      "Eu olho bastante o total… mas nem sempre entro no detalhe de cada venda.",
  },
  {
    titulo: "CENA 2 - IDENTIFICAÇÃO DO GAP REAL",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Então pode estar tudo certo no total, mas ainda assim ter diferença em algumas transações específicas.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Introduz um conceito-chave: divergências podem ficar escondidas no total consolidado, mesmo que o valor final pareça correto.",
      },
      {
        letra: "B",
        texto: "Entendi, então você já tem um controle, mas talvez não tão detalhado em todas as vendas.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas não explica o risco. Sem análise por transação, você pode não identificar erros individuais.",
      },
      {
        letra: "C",
        texto: "Se o total bate no final, normalmente não tem problema relevante nisso.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Incorreto. O total pode “bater” e ainda assim existir diferenças por venda, causadas por taxa incorreta, antecipação ou erro operacional.",
      },
    ],
    npcResposta: "Que tipo de diferença você está falando?",
  },
  {
    titulo: "CENA 3 - EXEMPLO PRÁTICO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Por exemplo, você vende R$ 1.000, mas recebe R$ 970. Sem cruzar a venda, você não sabe se foi taxa, antecipação ou erro.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Traz três conceitos técnicos: taxa (MDR), antecipação e erro. Mostra a necessidade de validação.",
      },
      {
        letra: "B",
        texto: "Podem existir diferenças entre o valor vendido e o recebido, dependendo das condições da operação.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas genérico. Não explica quais condições geram essas diferenças.",
      },
      {
        letra: "C",
        texto: "Essas diferenças costumam ser só de taxas, então não precisa entrar tanto nesse nível de detalhe.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Incorreto. Nem toda diferença é taxa. Pode envolver antecipação (custo por receber antes) ou até erro no processamento.",
      },
    ],
    npcResposta: "E como eu teria certeza do que está acontecendo em cada caso?",
  },
  {
    titulo: "CENA 4 - MÉTODO DE VALIDAÇÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Você precisa ver cada venda com três pontos: valor bruto, taxa aplicada e valor líquido recebido, tudo vinculado.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Define o processo de conciliação: valor bruto, taxa e valor líquido. A vinculação entre esses três garante validação correta.",
      },
      {
        letra: "B",
        texto: "O ideal é acompanhar os valores com mais detalhe e tentar entender como eles são calculados.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas sem método. Não explica como validar.",
      },
      {
        letra: "C",
        texto: "Você pode olhar o extrato e tentar entender pelos valores, normalmente dá pra ter uma ideia geral.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Frágil. O extrato mostra o que entrou, mas não mostra claramente a origem de cada valor nem o cálculo por venda.",
      },
    ],
    npcResposta: "Mas fazer isso manualmente em cada venda fica inviável.",
  },
  {
    titulo: "CENA 5 - OBJEÇÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Exato. Por isso o ideal é ter isso estruturado, onde cada venda já aparece conciliada com o recebimento automaticamente.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Introduz automação da conciliação. Elimina esforço manual e aumenta precisão.",
      },
      {
        letra: "B",
        texto: "Dá trabalho mesmo, mas com organização você consegue fazer esse controle com mais consistência.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Verdade, mas ineficiente. Controle manual aumenta risco de erro e perda de tempo.",
      },
      {
        letra: "C",
        texto: "Você pode ir conferindo aos poucos quando tiver tempo, não precisa ser algo tão estruturado assim.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Incorreto. Sem estrutura, a conciliação perde confiabilidade e pode gerar erro acumulado.",
      },
    ],
    npcResposta:
      "Se eu conseguisse ver isso dessa forma, eu teria muito mais confiança no controle.",
  },
  {
    titulo: "CENA 6 - PRÓXIMO PASSO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Se fizer sentido, te mostro como visualizar cada venda já conciliada com o valor líquido, assim você valida tudo com precisão.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Conecta diretamente com a necessidade do cliente: segurança, validação e previsibilidade.",
      },
      {
        letra: "B",
        texto: "Posso te explicar melhor isso em outro momento, mostrando algumas formas de acompanhar esses dados.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Abre espaço, mas não deixa claro o ganho prático.",
      },
      {
        letra: "C",
        texto: "A gente pode configurar isso agora e você vai aprendendo a usar conforme for aparecendo no sistema.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Falta estrutura e previsibilidade. Vai contra o perfil do cliente.",
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
      "Você é Gabriel, um cliente de escritório organizado, analítico e objetivo. " +
      "Valoriza clareza, validação, precisão e previsibilidade.";
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
      "Gabriel  -  Escritório",
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

    this.textoCarregando = this.add.text(CX, CONT_Y, "Gabriel está pensando...", {
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
        icone: "🎯",
        texto: "Você vai conduzir uma conversa técnica com o Gabriel, gerando confiança por clareza, método e validação.",
      },
      {
        icone: "💬",
        texto: "A cada cena, escolha entre três opções de resposta a que mais fizer sentido para avançar a conversa.",
      },
      {
        icone: "🪙",
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
    els.push(this.add.text(CX, btnY, "Começar  ->", {
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
    this.textoNpc.setText("O que você diz?");
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
      .setText(escolha.feedbackTexto || "Você fez uma escolha.")
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
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Próxima cena  ->");
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
      avaliacao = "Excelente! Argumentação impecável.";
      cor = "#44ff88";
    } else {
      avaliacao = "Precisa melhorar. Tente novamente.";
      cor = "#ff6644";
    }

    const statusMeta = atingiu
      ? "Meta atingida!"
      : `Meta não atingida (precisava de ${meta} coins)`;

    this.textoNpc
      .setText(
        `Conversa encerrada!\n\n` +
        `Coins desta fase: ${this.pontuacaoFase} / ${maxPts}  (${pct}%)\n` +
        `Total da sessão: ${getScore(this.registry)}\n\n` +
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
        "O vendedor fez uma abordagem excelente. Responda de forma receptiva, avançando a conversa.",
      neutra:
        "O vendedor foi aceitável, porém genérico. Responda de forma neutra, sem entusiasmo mas sem fechar portas.",
      errada:
        "O vendedor errou a abordagem. Responda de forma mais fria ou cética, mas sem encerrar a conversa.",
    };

    const system =
      `${this.promptLLM}\n` +
      "Responda de forma natural e breve (1-2 frases) em português do Brasil.\n" +
      `Contexto desta cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de referência (adapte para soar natural): "${cena.npcResposta}"\n` +
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
