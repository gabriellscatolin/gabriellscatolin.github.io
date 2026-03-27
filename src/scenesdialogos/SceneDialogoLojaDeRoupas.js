import SceneDialogoBase from "./SceneDialogoBase.js";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
import {
  initScoring,
  handleAnswer,
  checkGoal,
  getScore,
  goalEscalado,
} from "../scoring.js";

const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const ROTEIRO = [
  {
    titulo: "CENA 0 - OBSERVACAO / MINI-INTERACAO",
    narracao:
      "Ambiente: loja moderna. Musica ambiente. Clientes circulando. Atendimento proximo e visual bem trabalhado.\n\"Observe o estilo do ambiente.\"",
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Bom dia. Loja bonita, bem pensada mesmo.",
        tipo: "neutra",
      },
      {
        letra: "B",
        texto: "Bom dia. Da pra ver que a experiencia aqui e prioridade.",
        tipo: "correta",
      },
      {
        letra: "C",
        texto: "Bom dia. Tenho uma solucao que pode melhorar seu negocio.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Bom dia. A gente tenta fazer tudo pensado na experiencia do cliente.",
  },
  {
    titulo: "CENA 1 - ABORDAGEM",
    narracao: null,
    npcInicial:
      "Pode falar. Mas aqui tudo precisa fazer sentido pra experiencia.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. Posso te mostrar algo que impacta direto na experiencia do cliente no pagamento?",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Vim te apresentar as solucoes da Cielo.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Tenho uma solucao que pode melhorar sua operacao.",
        tipo: "errada",
      },
    ],
    npcResposta: "Se impactar a experiencia, faz sentido conversar.",
  },
  {
    titulo: "CENA 2 - CONTEXTO",
    narracao: "Narrador:\n\"Cliente valoriza marca e experiencia.\"",
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "No momento do pagamento, voce sente que a experiencia se mantem ou quebra um pouco?",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Voce trabalha com pagamentos rapidos aqui no caixa?",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Vou te explicar como funciona a solucao da Cielo.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Depende. Quando flui bem, mantem. Quando demora, quebra o clima.",
  },
  {
    titulo: "CENA 3 - DIAGNOSTICO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "E quando quebra, voce sente impacto na percepcao do cliente?",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "O problema costuma ser mais tempo ou sistema?",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Se tiver algo melhor, voce consideraria trocar?",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Sim. Qualquer atrito no final muda a percepcao da compra.",
  },
  {
    titulo: "CENA 4 - OBJECAO",
    narracao: null,
    npcInicial: "Mas eu ja uso outra solucao e funciona bem.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. A ideia nao e mudar o que funciona, mas elevar a experiencia onde for possivel.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "A Cielo pode ser melhor do que a que voce usa hoje.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Mas sempre da pra melhorar o que voce ja tem.",
        tipo: "errada",
      },
    ],
    npcResposta: "Se for algo que realmente melhore, posso entender.",
  },
  {
    titulo: "CENA 5 - VALOR (EXPERIENCIA)",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Quando o pagamento e fluido e rapido, o cliente sai com uma percepcao melhor da marca.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "A solucao melhora o processo de pagamento.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "A tecnologia ajuda no atendimento.",
        tipo: "errada",
      },
    ],
    npcResposta: "Faz sentido. O final da compra impacta bastante.",
  },
  {
    titulo: "CENA 6 - VALOR (CONVERSAO)",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Menos atrito no pagamento ajuda a manter o ritmo da venda e evita perda no final.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Uma operacao melhor pode ajudar nas vendas.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Isso melhora o desempenho do negocio.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Se ajuda a nao perder venda no final, ja e relevante.",
  },
  {
    titulo: "CENA 7 - DIFERENCIACAO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Nao e so pagamento, e parte da experiencia que voce entrega para o cliente.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "A solucao da Cielo e moderna e completa.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "A Cielo e uma boa opcao no mercado.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Se fizer diferenca na experiencia, muda o jogo.",
  },
  {
    titulo: "CENA 8 - OBJECAO FINAL",
    narracao: null,
    npcInicial: "Mas trocar algo que ja funciona e arriscado.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Entendo. A ideia e evoluir a experiencia sem criar risco para sua operacao.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "A troca costuma ser tranquila.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Se nao mudar, pode estar perdendo oportunidades.",
        tipo: "errada",
      },
    ],
    npcResposta: "Se nao gerar risco, faz mais sentido avaliar.",
  },
  {
    titulo: "CENA 9 - FECHAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Posso te mostrar como isso melhora a experiencia na pratica. Se fizer sentido, seguimos.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Quer ver todos os detalhes da solucao agora?",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Vamos implementar isso e melhorar sua loja.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Pode mostrar. Quero entender como isso impacta a experiencia.",
  },
];

const CAPITULO = "chapter2";
const FASE = "cabeleleiro";
const N_CENAS = ROTEIRO.length;

const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoLojaDeRoupas extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoLojaDeRoupas" });
    this.imagemKey = "falaLoja";
    this.promptLLM =
      "Voce e Vanessa, gerente de uma loja de roupas moderna. " +
      "Voce valoriza experiencia, marca, atendimento e uma jornada de compra bem resolvida. " +
      "Esta conversando com um vendedor da Cielo sobre solucoes de pagamento para a loja.";
  }

  init(dados) {
    super.init(dados);
    this.cenaIdx = 0;
    this.pontuacaoFase = 0;
    this.cieloCoinsGanhasDialogo = 0;
    this.estado = "tutorial";
    this.aguardandoLLM = false;
    initScoring(this.registry);
  }

  preload() {
    if (!this.textures.exists("falaLoja")) {
      this.load.image("falaLoja", "src/assets/imagens/imagensFalas/Loja - F.png");
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
      .image(CX, IMG_CY, "falaLoja")
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
      .text(CX - BTN_W / 2, NOME_Y, "Vanessa  -  Gerente da Loja", {
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
        fontSize: "19px",
        color: "#99bbdd",
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
        fontSize: "24px",
        color: "#e8f4ff",
        wordWrap: { width: BTN_W },
        align: "center",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3);

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
          fontSize: "21px",
          color: "#5a9fd4",
          fontStyle: "bold",
          resolution: 4,
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(4)
        .setVisible(false);

      const txtEscolha = this.add
        .text(CX - BTN_W / 2 + 70, by + BTN_H / 2, "", {
          fontSize: "21px",
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
      .text(CX, CONT_Y, "Vanessa esta pensando...", {
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
      .text(W - 20, 16, "Cielo Coins: 0 / 20", {
        fontSize: "22px",
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
        fontSize: "22px",
        color: "#aaccee",
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
          fontSize: "32px",
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
        icone: "1.",
        texto:
          "Voce esta falando com Vanessa, gerente de uma loja que valoriza experiencia, marca e atendimento.",
      },
      {
        icone: "2.",
        texto:
          "Em cada cena, escolha a resposta que melhor conecta pagamento com experiencia do cliente.",
      },
      {
        icone: "3.",
        texto:
          "Cada resposta rende Cielo Coins:\ncorreta = +2   neutra = +1   errada = +0",
      },
      {
        icone: "4.",
        texto:
          "Vanessa responde com IA, adaptando a conversa ao jeito como voce conduz a venda.",
      },
      {
        icone: "5.",
        texto:
          "Quanto melhor voce posicionar valor e reduzir risco, maior a chance de avancar a conversa.",
      },
    ];

    linhas.forEach(({ icone, texto }, i) => {
      const y = CY - 170 + i * 82;
      els.push(
        this.add
          .text(CX - 480, y, icone, {
            fontSize: "26px",
            color: "#5a9fd4",
            fontStyle: "bold",
            resolution: 4,
          })
          .setOrigin(0, 0.5)
          .setScrollFactor(0)
          .setDepth(D + 1),
      );
      els.push(
        this.add
          .text(CX - 430, y, texto, {
            fontSize: "20px",
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
        .text(CX, btnY, "Comecar  ->", {
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

    this.textoNarracao.setText("");
    this.textoNpc.setText("O que voce diz?");
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

  async _aoEscolher(indice) {
    if (this.aguardandoLLM || this.estado !== "escolha") return;

    const cena = ROTEIRO[this.cenaIdx];
    const escolha = this.escolhasOrdenadas[indice];

    const ganhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);
    this.pontuacaoFase += ganhos;
    this.cieloCoinsGanhasDialogo += ganhos;
    this.textoCieloCoin.setText(
      `Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
    );

    const coresTipo = {
      correta: COR_CORRETA,
      neutra: COR_NEUTRA,
      errada: COR_ERRADA,
    };
    this.botoesEscolha[indice].bg.setFillStyle(coresTipo[escolha.tipo]);

    this.aguardandoLLM = true;
    this._esconderBotoes(indice);
    this.textoCarregando.setVisible(true);

    const resposta = await this._chamarLLM(escolha, cena);

    this.aguardandoLLM = false;
    this.textoCarregando.setVisible(false);
    this._esconderBotoes();

    this.estado = "resposta";
    this.textoNarracao.setText("");
    this.textoNome.setVisible(true);
    this.textoNpc.setText(`"${resposta}"`);

    const ultimo = this.cenaIdx >= ROTEIRO.length - 1;
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Proxima cena  ->");
  }

  _aoContinuar() {
    if (this.estado === "intro") {
      this._mostrarEscolhas();
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
    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");

    const meta = goalEscalado(FASE);
    const maxPts = N_CENAS * 200;
    const atingiu = checkGoal(FASE, this.pontuacaoFase);
    const pct = Math.round((this.pontuacaoFase / maxPts) * 100);

    let avaliacao;
    let cor;
    if (pct >= 90) {
      avaliacao = "Excelente condução! Voce vendeu valor com foco em experiencia.";
      cor = "#44ff88";
    } else if (pct >= 70) {
      avaliacao = "Boa conversa! Faltou pouco para ficar ainda mais forte.";
      cor = "#88ccff";
    } else if (pct >= 50) {
      avaliacao = "Resultado razoavel. Vale refinar mais o posicionamento.";
      cor = "#ffcc44";
    } else {
      avaliacao = "Precisa melhorar. Tente novamente com mais foco na experiencia.";
      cor = "#ff6644";
    }

    const statusMeta = atingiu
      ? "Meta atingida!"
      : `Meta nao atingida (precisava de ${meta} coins)`;

    this.textoNpc
      .setText(
        `Conversa encerrada!\n\n` +
          `Coins desta fase: ${this.pontuacaoFase} / ${maxPts}  (${pct}%)\n` +
          `Total da sessao: ${getScore(this.registry)}\n\n` +
          `${statusMeta}\n\n${avaliacao}`,
      )
      .setStyle({ color: cor });

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
    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
      return cena.npcResposta;
    }

    const guias = {
      correta:
        "O vendedor conduziu muito bem a conversa. Responda de forma receptiva, estrategica e aberta ao proximo passo.",
      neutra:
        "O vendedor foi aceitavel, mas ainda generico. Responda de forma neutra, com interesse moderado.",
      errada:
        "O vendedor conduziu mal a abordagem. Responda de forma mais fria ou cautelosa, sem encerrar a conversa.",
    };

    const system =
      `${this.promptLLM}\n` +
      "Responda de forma natural e breve (1-2 frases) em portugues do Brasil.\n" +
      `Contexto desta cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de referencia (adapte para soar natural): "${cena.npcResposta}"\n` +
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
        "[SceneDialogoLojaDeRoupas] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
