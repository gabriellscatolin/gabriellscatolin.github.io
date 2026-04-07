// Cena de diálogo da padaria com escolhas baseadas no roteiro
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

// Configuracoes da API para respostas dinamicas
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Roteiro principal da fase da padaria
const ROTEIRO = [
  {
    titulo: "INTRODUÇÃO",
    narracao:
      "Ambiente: Padaria cheia. Sofia no caixa, visivelmente cansada, atendendo rápido.\n Aborde a cliente da melhor forma possível.",
  },
  {
    titulo: "CENA 1 - ABERTURA",
    narracao:
      "Ol?, boa tarde, tudo bem? Sou gerente de neg?cios da Cielo. Deixa eu te perguntar: voc? ? a pessoa respons?vel pelo neg�cio?",
    npcInicial: "Ol?, tudo bem? Sim, sou eu mesma, pode falar comigo.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Movimento forte hoje, n?? T? sendo um daqueles dias puxados desde cedo?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Abordagem empática e contextual. Mostra percepção do ambiente e abre espaço para conversa.",
      },
      {
        letra: "B",
        texto: "Perfeito. Esse hor?rio costuma ser o mais cheio aqui?",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Pergunta válida, mas superficial. Não gera conexão emocional.",
      },
      {
        letra: "C",
        texto:
          "Ent?o, eu trabalho com solu??es financeiras pra padaria. Posso te explicar rapidinho. Como est?o seus hor�rios?",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Abordagem direta demais. Tenta vender antes de criar conexão.",
      },
    ],
    npcResposta:
      "Olha... aqui de manhã é sempre assim. Hoje ainda comecei mais cedo... tá puxado.",
  },
  {
    titulo: "CENA 2 - CONEXÃO E CONTEXTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Imagino o quanto cansa... e no fim do m?s, esse movimento todo acaba compensando?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Explora a dor real do cliente. Boa transição de empatia para diagnóstico.",
      },
      {
        letra: "B",
        texto: "Mas pelo menos ? bom que n?o falta cliente, n??",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Comentário positivo, mas não aprofunda o problema.",
      },
      {
        letra: "C",
        texto: "Com esse movimento todo, voc? deve estar faturando bem, n??",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Suposição equivocada. Pode gerar resistência e quebra de confiança.",
      },
    ],
    npcResposta:
      "Então... eu assumi aqui depois que meu pai faleceu. Ainda tô aprendendo tudo... entra dinheiro, mas parece que não sobra. Trabalho o mês inteiro e não vejo isso virar resultado.",
  },
  {
    titulo: "CENA 3 - EXPLORAÇÃO DO PROBLEMA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Hoje voc? consegue ter uma vis?o clara de quanto entra e quanto realmente vira resultado no fim do m?s?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Direciona para a dor real de forma simples e acessível.",
      },
      {
        letra: "B",
        texto: "Aqui o pessoal paga mais no cart?o ou no dinheiro?",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Ajuda no contexto, mas ainda não chega na dor principal.",
      },
      {
        letra: "C",
        texto:
          "Isso costuma ser problema de gest?o ou equipe... tem que olhar melhor isso a?. J� olhou isso?",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Julgamento precoce. Pode gerar defensividade e travar a conversa.",
      },
    ],
    npcResposta:
      "Para ser sincera, eu vejo entrando, tanto em dinheiro quanto em cartão, mas não tenho muita clareza no final.",
  },
  {
    titulo: "CENA 4 - CLAREZA DO PROBLEMA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Às vezes não é que vende pouco... é que no dia a dia fica difícil acompanhar tudo e entender pra onde o dinheiro está indo.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Gera clareza sem tecnicismo. Ajuda a cliente a reconhecer o problema.",
      },
      {
        letra: "B",
        texto:
          "Tem bastante detalhe nisso mesmo... depois com calma dá pra organizar melhor.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Não está errado, mas é genérico e pouco educativo.",
      },
      {
        letra: "C",
        texto:
          "Então você precisa rever isso urgente, porque está perdendo dinheiro.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Tom impositivo. Aponta problema sem construir entendimento.",
      },
    ],
    npcResposta:
      "Faz sentido... porque eu vendo bem, mas quando olho no final... não bate com o esforço.",
  },
  {
    titulo: "CENA 5 - GERAÇÃO DE VALOR",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Hoje muita padaria resolve isso quando consegue integrar a maquininha com a conta do banco, deixando os pagamentos e o financeiro organizados no mesmo lugar.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Introduz a união Cielo + banco como solução prática e aplicável.",
      },
      {
        letra: "B",
        texto:
          "A Cielo tem v?rias solu??es que podem ajudar nisso. Posso te mostrar depois?",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Introduz a solução, mas ainda sem gerar percepção forte de valor.",
      },
      {
        letra: "C",
        texto:
          "Então você precisa trocar sua maquininha urgente, porque isso está errado.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Venda direta e agressiva. Não respeita o tempo de decisão do cliente.",
      },
    ],
    npcResposta:
      "Isso ajudaria... porque hoje eu sinto que trabalho muito e não tenho clareza pra onde tá indo o dinheiro.",
  },
  {
    titulo: "CENA 6 - CONDUÇÃO PARA PRÓXIMO PASSO",
    narracao:
      "Contexto: Sofia já reconheceu o problema e demonstrou interesse.",
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Se fizer sentido pra você, posso olhar isso com você depois, sem compromisso. Eu trabalho com a Cielo junto com o banco parceiro aqui da região, então dá pra organizar tanto os pagamentos quanto a parte financeira no mesmo lugar.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Posiciona o DDN corretamente com proposta integrada Cielo + banco.",
      },
      {
        letra: "B",
        texto:
          "Se quiser, posso te explicar melhor como funciona a Cielo em outro momento.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Abre porta, mas é genérico e pouco conectado com a dor da cliente.",
      },
      {
        letra: "C",
        texto:
          "Então vamos fazer assim, já vou pedir pra trocar sua maquininha e você começa a usar a Cielo.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Avança rápido demais. Ignora o tempo da cliente e pode gerar rejeição.",
      },
    ],
  },
];

const CAPITULO = "chapter1";
const FASE = "padaria";
const N_CENAS = ROTEIRO.length;

// Paleta visual usada para diferenciar estado padrao, hover e feedback das respostas
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoPadaria extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoPadaria" });

    this.imagemKey = "falaPadaria";
    this.respostaRoteiroEstrita = true;
    this.promptLLM =
      "Você é a atendente de uma padaria muito movimentada. " +
      "Você é ágil, prática e valoriza um atendimento rápido e sem atritos no caixa.";
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
    if (!this.textures.exists("falaPadaria")) {
      this.load.image(
        "falaPadaria",
        "src/assets/imagens/imagensFalas/Padaria - F.png",
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
      .image(CX, IMG_CY, "falaPadaria")
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
      .text(CX - BTN_W / 2, NOME_Y, "Sofia  -  Dona da Padaria", {
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
      .text(CX, CONT_Y, "Sofia está pensando...", {
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
          "Você vai entrar em uma negociação consultiva. Seu objetivo é entender a dor da cliente e gerar valor antes de oferecer a solução.",
      },
      {
        icone: "💬",
        texto:
          "A cada cena, escolha entre três opções de resposta a que mais fizer sentido para avançar a conversa.",
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
    if (pct >= 40) {
      avaliacao = "Vendedor nato! Negócio fechado!";
      cor = "#44ff88";
    } else {
      avaliacao = "Quase...";
      cor = "#ff6644";
    }

    const statusMeta = atingiu
      ? "Meta atingida! Parab?ns, voc? conseguiu trazer a experi?ncia Cielo para o cliente!"
      : `Tente novamente... você precisava de ${meta} coins`;

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

    this.registry.set("padaria_dialogo_concluido", true);

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
        "[SceneDialogoPadaria] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
