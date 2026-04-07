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
    titulo: "INTRODUÇÃO",
    narracao:
      "Ambiente: Farmácia movimentada, Rachel no caixa, atendendo rápido e visivelmente cansada. Há uma pequena fila. A representante se aproxima e aguarda uma brecha entre um atendimento e outro.",
  },
  {
    titulo: "CENA 1 - ABORDAGEM",
    narracao:
      "Ol?, boa tarde, tudo bem? Sou gerente de neg?cios da Cielo. Deixa eu te perguntar: voc? ? a pessoa respons?vel pelo neg�cio?",
    npcInicial: "Ol?, tudo bem? Sim, sou eu mesma, pode falar comigo.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Prometo ser r?pido. Vi que est? corrido... no fim do m?s, esse movimento todo vira resultado pra voc??",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Respeita o tempo, lê o ambiente e entra direto na dor.",
      },
      {
        letra: "B",
        texto:
          "Sei que está corrido. Queria entender melhor como funciona o movimento da farmácia no dia a dia.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Educado, mas genérico. Não direciona.",
      },
      {
        letra: "C",
        texto:
          "Certo, trabalho com soluções de pagamento e tenho algumas opções que podem ajudar a sua operação aqui.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Fala de produto cedo demais e ignora o contexto.",
      },
    ],
    npcResposta:
      "Olha, aqui vende bem... mas no fim do mês parece que eu estou sempre correndo atrás do dinheiro.",
  },
  {
    titulo: "CENA 2 - IDENTIFICAÇÃO DA DOR",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Isso acontece bastante... voc? vende bem, mas n?o tem muita clareza de quando o dinheiro entra na conta do banco, n??",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Conecta com a dor e traz o banco de forma natural.",
      },
      {
        letra: "B",
        texto:
          "Imagino... com esse movimento todo deve ser difícil acompanhar tudo que entra no caixa no dia a dia.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Empático, mas não aprofunda.",
      },
      {
        letra: "C",
        texto:
          "Mas isso n?o ? s? quest?o de organizar melhor o caixa e acompanhar os valores com mais frequ?ncia?",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Simplifica demais o problema.",
      },
    ],
    npcResposta:
      "Então... Eu vendo, mas não sei quando esse dinheiro vai cair, especialemente no crédito.",
  },
  {
    titulo: "CENA 3 - EXPLORAÇÃO COM EXEMPLO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Normal... você vende hoje, uma parte entra antes, o restante vai caindo aos poucos na conta ao longo dos dias.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Explica de forma simples e próxima da realidade.",
      },
      {
        letra: "B",
        texto:
          "No crédito o dinheiro não entra todo de uma vez, então isso acaba confundindo um pouco no acompanhamento.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas menos prático.",
      },
      {
        letra: "C",
        texto:
          "Isso é comum... depois com mais calma você consegue organizar isso melhor e entender esses valores. Nem tudo que você vende, você ganha.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Minimiza a dor e não resolve.",
      },
    ],
    npcResposta:
      "Ent?o o problema � que eu posso vender bem e mesmo assim ficar sem dinheiro dispon?vel?",
  },
  {
    titulo: "CENA 4 - CLAREZA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Pode sim. Você vende hoje, mas o dinheiro entra em dias diferentes... e sem organizar isso com o banco, parece que falta.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Traduz o problema com clareza e lógica.",
      },
      {
        letra: "B",
        texto:
          "Sim, porque o dinheiro entra em momentos diferentes ao longo dos dias e isso pode confundir no controle.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas pouco direto.",
      },
      {
        letra: "C",
        texto:
          "Se você vender mais, no final entra mais dinheiro e isso acaba se equilibrando naturalmente ao longo do tempo.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Conceito errado. Ignora fluxo de caixa.",
      },
    ],
    npcResposta:
      "Mas eu não tenho tempo pra ficar olhando isso... já estou no limite aqui.",
  },
  {
    titulo: "CENA 5 - OBJEÇÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "E nem precisa. Com o Cielo Conciliador integrado ao banco, já fica tudo organizado pra você ver o que entrou e o que falta.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Resolve com clareza, simplicidade e integração.",
      },
      {
        letra: "B",
        texto:
          "Dá pra organizar isso melhor com algumas ferramentas e acompanhando com mais frequência o que entra no dia a dia.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Ajuda, mas não resolve totalmente.",
      },
      {
        letra: "C",
        texto:
          "Você vai precisar separar um tempo pra acompanhar isso melhor e conferir os valores com mais atenção todos os dias.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Aumenta a barreira e desmotiva.",
      },
    ],
    npcResposta:
      "Se eu conseguisse enxergar isso melhor... já me ajudava muito no dia a dia.",
  },
  {
    titulo: "CENA 6 - PRÓXIMO PASSO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Se fizer sentido, passo mais tarde e te mostro o Cielo Conciliador junto com o banco, já organizado por dia pra você acompanhar.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Conecta solução com clareza e ação prática.",
      },
      {
        letra: "B",
        texto:
          "Posso te explicar isso com mais calma outro dia e te mostrar como funciona essa organização no sistema.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Abre espaço, mas sem urgência.",
      },
      {
        letra: "C",
        texto:
          "A gente pode configurar isso agora e você começa a usar hoje mesmo, depois você vai entendendo melhor como funciona.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Apressado e desalinhado.",
      },
    ],
  },
];

const CAPITULO = "chapter1";
const FASE = "farmacia";
const N_CENAS = ROTEIRO.length;

const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoFarmacia extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoFarmacia" });
    this.imagemKey = "falaFarmacia";
    this.respostaRoteiroEstrita = true;
    this.promptLLM =
      "Você é Rachel, gerente de uma farmácia movimentada. " +
      "Você é direta, ocupada e profissional.";
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
    if (!this.textures.exists("falaFarmacia")) {
      this.load.image(
        "falaFarmacia",
        "src/assets/imagens/imagensFalas/Farmacia - F.png",
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

    this.add
      .rectangle(CX, H / 2, W, H, 0x000000, 0.78)
      .setScrollFactor(0)
      .setDepth(0)
      .setInteractive();

    const img = this.add
      .image(CX, IMG_CY, "falaFarmacia")
      .setScrollFactor(0)
      .setDepth(1)
      .setOrigin(0.5);
    const escala = Math.min(W / img.width, IMG_H / img.height);
    img.setScale(escala);

    this.add
      .rectangle(CX, PANEL_CY, W, PANEL_H, 0x060d1a, 0.96)
      .setScrollFactor(0)
      .setDepth(2);
    this.add
      .rectangle(CX, PANEL_TOP, W, 3, 0x2a5ba0)
      .setScrollFactor(0)
      .setDepth(3);

    this.textoNome = this.add
      .text(CX - BTN_W / 2, NOME_Y, "Rachel  -  Gerente da Farmácia", {
        fontSize: "20px",
        color: "#5a9fd4",
        fontStyle: "bold",
        resolution: 4,
      })
      .setScrollFactor(0)
      .setDepth(3)
      .setVisible(false);

    this.textoNarracao = this.add
      .text(CX, NAR_Y + 30, "", {
        fontSize: "40px",
        color: "#e8f4ff",
        fontStyle: "italic",
        wordWrap: { width: BTN_W },
        align: "center",
        resolution: 4,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(3);

    this.textoNpc = this.add
      .text(CX, TEXTO_NPC_Y, "", {
        fontSize: "40px",
        color: "#e8f4ff",
        wordWrap: { width: BTN_W },
        align: "center",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3);

    this.textoFeedbackTitulo = this.add
      .text(CX, PANEL_TOP + 60, "", {
        fontSize: "38px",
        color: "#ffd166",
        fontStyle: "bold",
        align: "center",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4)
      .setVisible(false);

    this.textoFeedback = this.add
      .text(CX, TEXTO_NPC_Y, "", {
        fontSize: "32px",
        color: "#e8f4ff",
        wordWrap: { width: BTN_W },
        align: "center",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4)
      .setVisible(false);

    this.botoesEscolha = BTN_Y.map((by, i) => {
      const letra = ["A", "B", "C"][i];

      const bg = this.add
        .rectangle(CX, by + BTN_H / 2, BTN_W, BTN_H, COR_NEUTRO)
        .setScrollFactor(0)
        .setDepth(3)
        .setStrokeStyle(1, 0x3a5ba0)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      const labelLetra = this.add
        .text(CX - BTN_W / 2 + 16, by + BTN_H / 2, `[${letra}]`, {
          fontSize: "20px",
          color: "#776fe6",
          fontStyle: "bold",
          resolution: 4,
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(4)
        .setVisible(false);

      const txtEscolha = this.add
        .text(CX - BTN_W / 2 + 70, by + BTN_H / 2, "", {
          fontSize: "30px",
          color: "#ffffff",
          wordWrap: { width: BTN_W - 80 },
          resolution: 4,
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(4)
        .setVisible(false);

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

    this.btnContinuar = this.add
      .rectangle(CX, CONT_Y, 340, 56, 0x1a5c1a)
      .setScrollFactor(0)
      .setDepth(3)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.txtContinuar = this.add
      .text(CX, CONT_Y, "", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4)
      .setVisible(false);

    this.btnContinuar.on("pointerover", () =>
      this.btnContinuar.setFillStyle(0x2a7c2a),
    );
    this.btnContinuar.on("pointerout", () =>
      this.btnContinuar.setFillStyle(0x1a5c1a),
    );
    this.btnContinuar.on("pointerdown", () => this._aoContinuar());

    this.textoCarregando = this.add
      .text(CX, CONT_Y, "Rachel está pensando...", {
        fontSize: "21px",
        color: "#99bbdd",
        fontStyle: "italic",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4)
      .setVisible(false);

    this.textoCieloCoin = this.add
      .text(W - 20, 16, "Cielo Coins: 0 / 500", {
        fontSize: "30px",
        color: "#ffd700",
        backgroundColor: "#000000bb",
        padding: { x: 10, y: 5 },
        resolution: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);

    this.textoCena = this.add
      .text(20, 16, "", {
        fontSize: "40px",
        color: "#ffffff",
        backgroundColor: "#000000bb",
        padding: { x: 10, y: 5 },
        resolution: 4,
      })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(10);

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

    els.push(
      this.add
        .rectangle(CX, CY, W, H, 0x000000, 0.88)
        .setScrollFactor(0)
        .setDepth(D)
        .setInteractive(),
    );
    els.push(
      this.add
        .rectangle(CX, CY, 1100, 640, 0x08101e)
        .setScrollFactor(0)
        .setDepth(D + 0.1)
        .setStrokeStyle(2, 0x2a5ba0),
    );
    els.push(
      this.add
        .text(CX, CY - 270, "Como funciona esta conversa", {
          fontSize: "25px",
          color: "#ffffff",
          fontStyle: "bold",
          resolution: 4,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(D + 1),
    );
    els.push(
      this.add
        .rectangle(CX, CY - 230, 1000, 2, 0x2a5ba0)
        .setScrollFactor(0)
        .setDepth(D + 1),
    );

    const linhas = [
      {
        icone: "🎯",
        texto:
          "Você vai conduzir uma conversa consultiva com Rachel, entendendo a dor antes de avançar para a solução.",
      },
      {
        icone: "💬",
        texto:
          "A cada cena, escolha entre três opções de resposta a que mais fizer sentido para a conversa.",
      },
      {
        icone: "🪙",
        texto:
          "Cada escolha vale Cielo Coins. Resposta correta = +100. Neutra = +50. Errada = +0",
      },
    ];

    linhas.forEach(({ icone, texto }, i) => {
      els.push(
        this.add
          .text(CX - 480, CY - 125 + i * 120, icone, {
            fontSize: "26px",
            resolution: 4,
          })
          .setOrigin(0, 0.5)
          .setScrollFactor(0)
          .setDepth(D + 1),
      );
      els.push(
        this.add
          .text(CX - 430, CY - 110 + i * 120, texto, {
            fontSize: "30px",
            color: "#c8d8f0",
            wordWrap: { width: 900 },
            resolution: 4,
          })
          .setOrigin(0, 0.5)
          .setScrollFactor(0)
          .setDepth(D + 1),
      );
    });

    const btnY = CY + 255;
    const btnBg = this.add
      .rectangle(CX, btnY, 300, 58, 0x1a5c1a)
      .setScrollFactor(0)
      .setDepth(D + 1)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true });
    els.push(btnBg);
    els.push(
      this.add
        .text(CX, btnY, "Começar  ->", {
          fontSize: "24px",
          color: "#ffffff",
          fontStyle: "bold",
          resolution: 4,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(D + 2),
    );

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
    this.textoNpc.setText("O que voc? diz?");
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
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Pr?xima cena  ->");
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
      const cena = ROTEIRO[this.cenaIdx];
      if (!cena.escolhas?.length) {
        if (this.cenaIdx >= ROTEIRO.length - 1) {
          this._mostrarResultadoFinal();
        } else {
          this._mostrarCena(this.cenaIdx + 1);
        }
      } else {
        this._mostrarEscolhas();
      }
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
    if (pct >= 90) {
      avaliacao = "Vendedor nato! Negócio fechado!";
      cor = "#44ff88";
    } else if (pct >= 70) {
      avaliacao = "Bom trabalho! Quase perfeito.";
      cor = "#88ccff";
    } else if (pct >= 50) {
      avaliacao = "Razoável. Pratique mais!";
      cor = "#ffcc44";
    } else {
      avaliacao = "Precisa melhorar. Tente de novo.";
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
      "Responda de forma natural e breve (1-2 frases) em portugu?s do Brasil.\n" +
      `Contexto desta cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de refer?ncia (adapte para soar natural): "${cena.npcResposta}"\n` +
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
      console.warn(
        "[SceneDialogoFarmacia] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
