import SceneDialogoBase from "./SceneDialogoBase.js";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
import { initScoring, handleAnswer, checkGoal, getScore, goalEscalado } from "../scoring.js";

const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const IA_MODO_ESTRITO_ROTEIRO = true;

const ROTEIRO = [
  {
    titulo: "CENA 0 - AMBIENTE",
    narracao:
      "Agencia tensa. Conversas sobre meta. Clima de cobranca.\nO ambiente mudou. Aqui voce precisa de seguranca e firmeza.",
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Bom dia. Movimento intenso hoje.", tipo: "neutra" },
      { letra: "B", texto: "Bom dia. Imagino que as metas estejam pressionando.", tipo: "correta" },
      { letra: "C", texto: "Bom dia. Vim falar das solucoes da Cielo.", tipo: "errada" },
    ],
    npcResposta: "Bom dia. Hoje o dia esta complicado.",
  },
  {
    titulo: "CENA 1 - ABORDAGEM SOB PRESSAO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Entao volto outro dia.", tipo: "errada" },
      { letra: "B", texto: "Vou ser rapido, prometo.", tipo: "neutra" },
      { letra: "C", texto: "Imagino. Vou ser direto e focar em oportunidades da sua carteira.", tipo: "correta" },
    ],
    npcResposta: "Pode falar, mas bem direto.",
  },
  {
    titulo: "CENA 2 - INICIO COM RESISTENCIA",
    narracao: null,
    npcInicial: "Pra ser sincero, cliente anda reclamando da Cielo.",
    escolhas: [
      { letra: "A", texto: "Nao, acho que nao e bem assim.", tipo: "errada" },
      { letra: "B", texto: "Pode acontecer as vezes.", tipo: "neutra" },
      { letra: "C", texto: "Entendo. O que mais eles tem comentado?", tipo: "correta" },
    ],
    npcResposta: "Falam de taxa e algumas instabilidades.",
  },
  {
    titulo: "CENA 3 - DEFESA DE MARCA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "A concorrencia tambem tem problema.", tipo: "errada" },
      { letra: "B", texto: "A Cielo tem melhorado isso.", tipo: "neutra" },
      {
        letra: "C",
        texto:
          "Faz sentido. Hoje a Cielo tem estrutura forte e estabilidade, principalmente pelo suporte dos grandes bancos.",
        tipo: "correta",
      },
    ],
    npcResposta: "Mesmo assim, tem concorrente ganhando espaco.",
  },
  {
    titulo: "CENA 4 - COMPARACAO COM CONCORRENCIA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "A concorrencia nao e melhor.", tipo: "errada" },
      { letra: "B", texto: "Depende muito do cliente.", tipo: "neutra" },
      {
        letra: "C",
        texto:
          "Em alguns casos entram por preco, mas na recorrencia o cliente valoriza estabilidade e suporte.",
        tipo: "correta",
      },
    ],
    npcResposta: "Pode ser... mas cliente olha muito taxa.",
  },
  {
    titulo: "CENA 5 - OBJECAO DE TAXA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "A gente cobre qualquer taxa.", tipo: "errada" },
      { letra: "B", texto: "A gente pode tentar melhorar taxa.", tipo: "neutra" },
      {
        letra: "C",
        texto: "Taxa pesa, mas quando impacta operacao e vendas, o custo fica maior que a diferenca.",
        tipo: "correta",
      },
    ],
    npcResposta: "Entendi, mas precisa fazer sentido pra ele.",
  },
  {
    titulo: "CENA 6 - RETOMADA DE CONTROLE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Entao fica dificil.", tipo: "errada" },
      { letra: "B", texto: "A gente tenta ver algum cliente.", tipo: "neutra" },
      {
        letra: "C",
        texto: "Vamos focar em clientes com volume, onde essa diferenca aparece mais no resultado.",
        tipo: "correta",
      },
    ],
    npcResposta: "Tem alguns clientes assim...",
  },
  {
    titulo: "CENA 7 - GERACAO DE OPORTUNIDADE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Qualquer um serve.", tipo: "errada" },
      { letra: "B", texto: "Pode me indicar alguns depois.", tipo: "neutra" },
      { letra: "C", texto: "Algum cliente com volume alto ou crescimento recente?", tipo: "correta" },
    ],
    npcResposta: "Tem loja de roupa, supermercado e um restaurante na regiao.",
  },
  {
    titulo: "CENA 8 - POSICIONAMENTO FINAL",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Vou la ver entao.", tipo: "errada" },
      { letra: "B", texto: "Depois te conto como foi.", tipo: "neutra" },
      { letra: "C", texto: "Vou priorizar esses e te trago retorno com oportunidades reais.", tipo: "correta" },
    ],
    npcResposta: "Perfeito.",
  },
  {
    titulo: "CENA 9 - CHECK-IN / DISCIPLINA",
    narracao: "Mesmo sob pressao, o processo continua.",
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Depois vejo isso.", tipo: "errada" },
      { letra: "B", texto: "Anoto e registro depois.", tipo: "neutra" },
      { letra: "C", texto: "Ja registro no sistema para manter controle das oportunidades.", tipo: "correta" },
    ],
    npcResposta: "Boa, isso ajuda.",
  },
];

const CAPITULO = "chapter2";
const FASE = "agency2";
const N_CENAS = ROTEIRO.length;

const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoAgencia02 extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoAgencia02" });
    this.imagemKey = "falaAgencia02PJ";
    this.nomeNpcDialogo = "PJ";
    this.promptLLM =
      "Voce e o PJ da Agencia 02 e conversa sob pressao de metas. " +
      "Seja objetivo, firme e profissional.";
  }

  init(dados) {
    super.init(dados);
    const npcAlvo = dados?.npc === "Camila" ? "Camila" : "Enzo";
    this.npcAlvo = npcAlvo;
    // Invertido: Enzo = GG, Camila = PJ
    const ehGG = npcAlvo === "Enzo";

    this.imagemKey = ehGG ? "falaAgencia02GG" : "falaAgencia02PJ";
    this.nomeNpcDialogo = ehGG ? "GG" : "PJ";
    this.promptLLM = ehGG
      ? "Voce e o GG da Agencia 02 e conversa sob pressao de metas. Seja objetivo, firme e profissional."
      : "Voce e o PJ da Agencia 02 e conversa sob pressao de metas. Seja objetivo, firme e profissional.";

    this.cenaIdx = 0;
    this.pontuacaoFase = 0;
    this.cieloCoinsGanhasDialogo = 0;
    this.estado = "tutorial";
    this.aguardandoLLM = false;
    initScoring(this.registry);
  }

  preload() {
    if (!this.textures.exists("falaAgencia02PJ")) {
      this.load.image(
        "falaAgencia02PJ",
        "src/assets/imagens/imagensFalas/Agência02 - PJ - F.png",
      );
    }
    if (!this.textures.exists("falaAgencia02GG")) {
      this.load.image(
        "falaAgencia02GG",
        "src/assets/imagens/imagensFalas/Agência02 - GG - F.png",
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

    this.add.rectangle(CX, H / 2, W, H, 0x000000, 0.78).setScrollFactor(0).setDepth(0).setInteractive();

    const img = this.add.image(CX, IMG_CY, this.imagemKey).setScrollFactor(0).setDepth(1).setOrigin(0.5);
    const escala = Math.min(W / img.width, IMG_H / img.height);
    img.setScale(escala);

    this.add.rectangle(CX, PANEL_CY, W, PANEL_H, 0x060d1a, 0.96).setScrollFactor(0).setDepth(2);
    this.add.rectangle(CX, PANEL_TOP, W, 3, 0x2a5ba0).setScrollFactor(0).setDepth(3);

    this.textoNome = this.add
      .text(CX - BTN_W / 2, NOME_Y, `${this.nomeNpcDialogo}  -  Agencia 02`, {
        fontSize: "24px",
        color: "#5a9fd4",
        fontStyle: "bold",
        resolution: 4,
      })
      .setScrollFactor(0)
      .setDepth(3)
      .setVisible(false);

    this.textoNarracao = this.add
      .text(CX, NAR_Y + 30, "", {
        fontSize: "22px",
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
        fontSize: "30px",
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
          fontSize: "25px",
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
          fontSize: "25px",
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
        fontSize: "26px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4)
      .setVisible(false);

    this.btnContinuar.on("pointerover", () => this.btnContinuar.setFillStyle(0x2a7c2a));
    this.btnContinuar.on("pointerout", () => this.btnContinuar.setFillStyle(0x1a5c1a));
    this.btnContinuar.on("pointerdown", () => this._aoContinuar());

    this.textoCarregando = this.add
      .text(CX, CONT_Y, `${this.nomeNpcDialogo} esta pensando...`, {
        fontSize: "24px",
        color: "#99bbdd",
        fontStyle: "italic",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4)
      .setVisible(false);

    this.textoCieloCoin = this.add
      .text(W - 20, 16, "", {
        fontSize: "24px",
        color: "#ffd700",
        backgroundColor: "#000000bb",
        padding: { x: 10, y: 5 },
        resolution: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);
    this._atualizarHudMoedas();

    this.textoCena = this.add
      .text(20, 16, "", {
        fontSize: "24px",
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

    els.push(this.add.rectangle(CX, CY, W, H, 0x000000, 0.88).setScrollFactor(0).setDepth(D).setInteractive());
    els.push(this.add.rectangle(CX, CY, 1100, 640, 0x08101e).setScrollFactor(0).setDepth(D + 0.1).setStrokeStyle(2, 0x2a5ba0));

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

    els.push(this.add.rectangle(CX, CY - 230, 1000, 2, 0x2a5ba0).setScrollFactor(0).setDepth(D + 1));

    const linhas = [
      {
        icone: "🎯",
        texto:
          "Nessa fase voce e avaliado por seguranca no discurso, defesa de marca e controle emocional.",
      },
      {
        icone: "💬",
        texto:
          "A cada cena, escolha a resposta mais estrategica para sustentar a conversa sob pressao.",
      },
      {
        icone: "🪙",
        texto:
          "Cielo Coins:\n✅ correta = +2   ⚪ neutra = +1   ❌ errada = +0",
      },
      {
        icone: "🤖",
        texto:
          "As respostas seguem o roteiro oficial da fase para manter o treino consistente.",
      },
      {
        icone: "🏆",
        texto:
          "Nessa fase, nao bastava vender: era preciso sustentar com argumentacao sob pressao.",
      },
    ];

    linhas.forEach(({ icone, texto }, i) => {
      const y = CY - 170 + i * 82;
      els.push(this.add.text(CX - 480, y, icone, { fontSize: "26px", resolution: 4 }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1));
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

    this.aguardandoLLM = true;

    const coresTipo = { correta: COR_CORRETA, neutra: COR_NEUTRA, errada: COR_ERRADA };
    this.botoesEscolha[indice].bg.setFillStyle(coresTipo[escolha.tipo]);

    const antes = getScore(this.registry);
    handleAnswer(this.registry, CAPITULO, FASE, escolha.tipo);
    const depois = getScore(this.registry);

    const ganho = Math.max(0, depois - antes);
    this.pontuacaoFase += ganho;
    this.cieloCoinsGanhasDialogo += ganho;
    this._atualizarHudMoedas();

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
      return;
    }

    if (this.estado === "resposta") {
      if (this.cenaIdx >= ROTEIRO.length - 1) {
        this._mostrarResultadoFinal();
      } else {
        this._mostrarCena(this.cenaIdx + 1);
      }
      return;
    }

    if (this.estado === "fim") {
      this._fechar();
    }
  }

  _mostrarResultadoFinal() {
    this.estado = "fim";
    if (this.npcAlvo === "Camila") {
      this.registry.set("ag02_dialogo_camila_concluido", true);
      this.registry.set("missaoAgencia02Texto", "Missão: Suba e fale com a PJ Camila.");
    } else {
      this.registry.set("ag02_dialogo_enzo_concluido", true);
      this.registry.set("missaoAgencia02Texto", "Missão: Fale com o PJ Camila.");
    }

    this._esconderBotoes();
    this.textoNarracao.setText(
      "Nessa fase, nao bastava vender. Era preciso sustentar.\n\n" +
        "Competencias avaliadas:\n" +
        "- Seguranca no discurso\n" +
        "- Defesa de marca\n" +
        "- Controle emocional\n" +
        "- Argumentacao sob pressao\n" +
        "- Direcionamento estrategico",
    );
    this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");

    const meta = goalEscalado(FASE);
    const atingiuMeta = checkGoal(this.registry, CAPITULO, FASE, N_CENAS);

    const cor = atingiuMeta ? "#44ff88" : "#ffcc44";
    const status = atingiuMeta ? "Meta atingida" : `Meta: ${meta} moedas`;

    this.textoNpc
      .setText(
        `Conversa encerrada!\n\n` +
          `Cielo Coins nesta conversa: +${this.cieloCoinsGanhasDialogo}\n` +
          `${status}`,
      )
      .setStyle({ color: cor });

    this._atualizarHudMoedas();
    this._mostrarContinuar("Fechar  [E]");
  }

  _atualizarHudMoedas() {
    if (!this.textoCieloCoin) return;
    const total = getScore(this.registry);
    const meta = goalEscalado(FASE);
    this.textoCieloCoin.setText(
      `Cielo Coins: ${total} / ${meta}  (+${this.cieloCoinsGanhasDialogo} nesta conversa)`,
    );
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
    if (IA_MODO_ESTRITO_ROTEIRO) {
      return cena.npcResposta;
    }

    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
      return cena.npcResposta;
    }

    const guias = {
      correta:
        "O vendedor conduziu bem sob pressao. Responda de forma objetiva e colaborativa.",
      neutra:
        "O vendedor foi aceitavel, mas sem muita firmeza. Responda de forma neutra.",
      errada:
        "O vendedor falhou na condução. Responda com mais resistencia, sem encerrar a conversa.",
    };

    const system =
      `${this.promptLLM}\n` +
      "Responda em portugues do Brasil com 1-2 frases.\n" +
      `Contexto da cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de referencia (adapte): \"${cena.npcResposta}\"\n` +
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
            { role: "user", content: `O vendedor disse: \"${escolha.texto}\"` },
          ],
          max_tokens: 120,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || cena.npcResposta;
    } catch (err) {
      console.warn("[SceneDialogoAgencia02] Falha na LLM, usando roteiro:", err.message);
      return cena.npcResposta;
    }
  }
}
