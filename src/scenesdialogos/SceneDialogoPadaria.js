import SceneDialogoBase from "./SceneDialogoBase.js";

const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const ROTEIRO = [
  {
    titulo: "CENA 1 - OBSERVACAO / MINI-INTERACAO",
    narracao:
      'Padaria cheia. Fila no caixa. Cliente atendendo rapido.\n"Antes de abordar, observe e entre no ambiente."',
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Bom dia! Bastante movimento agora, ne?", tipo: "correta" },
      { letra: "B", texto: "Bom dia! Esse horario e sempre cheio assim?", tipo: "neutra" },
      { letra: "C", texto: "Bom dia! Ja vou te explicar uma solucao rapida.", tipo: "errada" },
    ],
    npcResposta:
      "Bom dia. Esse horario e sempre corrido, entao tem que ser rapido aqui.",
  },
  {
    titulo: "CENA 2 - ABORDAGEM",
    narracao: null,
    npcInicial:
      "Bom dia. Vi que esta cheio. Posso te mostrar algo que agilize esse caixa?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Bom dia. Vi que esta cheio. Posso te mostrar algo que agilize esse caixa?",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Bom dia. Vim te apresentar a Cielo e nossas solucoes de pagamento.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Tenho uma solucao completa de pagamentos para o seu negocio.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Aqui e corrido, entao preciso de algo simples e que nao atrapalhe o atendimento.",
  },
  {
    titulo: "CENA 3 - CONTEXTO",
    narracao: "Ha fila no caixa.",
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Esse horario costuma ficar assim, com fila e mais pressao no caixa?",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Voce usa maquininha hoje ou trabalha mais com dinheiro e cartao?",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Vou te explicar como funciona a solucao da Cielo rapidamente.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Fica cheio sim. Quando demora no pagamento, acumula gente e complica o atendimento.",
  },
  {
    titulo: "CENA 4 - DIAGNOSTICO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "E quando o pagamento demora, voce sente que perde tempo ou deixa de atender alguem?",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Voce passa bastante cartao aqui ao longo do dia no seu movimento?",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto:
          "Se eu te mostrar uma opcao melhor, voce consideraria trocar sua maquininha?",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Sim, quando trava ou demora, a fila cresce e atrasa tudo. Isso acaba afetando o atendimento.",
  },
  {
    titulo: "CENA 5 - OBJECAO",
    narracao: null,
    npcInicial: "Mas eu ja tenho maquininha. Pra mim e tudo igual.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. Muitos clientes ja tem. A diferenca esta na velocidade e na estabilidade no dia a dia.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto:
          "Mas a Cielo e melhor e tem mais tecnologia que as outras opcoes.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Se e igual, entao voce pode estar deixando de ganhar com a atual.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Entendi, mas pra mim o que importa e funcionar bem e nao atrasar o atendimento.",
  },
  {
    titulo: "CENA 6 - VALOR",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Com pagamento por aproximacao e boa estabilidade, o cliente passa rapido e a fila anda melhor.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto:
          "A Cielo tem tecnologia moderna e solucoes completas para diferentes negocios.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "A maquininha tem varias funcoes que podem ajudar no seu negocio.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Se for mais rapido e nao travar, ja ajuda bastante no meu dia a dia.",
  },
  {
    titulo: "CENA 7 - CREDIBILIDADE (BB / BRADESCO)",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "A Cielo trabalha com bancos como Banco do Brasil e Bradesco, o que traz mais seguranca.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "A Cielo e uma empresa grande e conhecida no mercado.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Muitos estabelecimentos ja usam e continuam usando a Cielo.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Ter banco por tras ajuda. Da mais confianca do que algo desconhecido.",
  },
  {
    titulo: "CENA 8 - OBJECAO FINAL",
    narracao: null,
    npcInicial: "Mas trocar sempre da trabalho...",
    escolhas: [
      {
        letra: "A",
        texto:
          "Entendo. A ideia e simplificar seu dia a dia e nao criar mais dificuldade.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "A troca costuma ser tranquila e nao leva muito tempo.",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Mas voce precisa trocar para melhorar isso.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Se for simples mesmo e nao parar meu caixa, ja faz mais sentido avaliar.",
  },
  {
    titulo: "CENA 9 - FECHAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Posso te mostrar como isso funcionaria aqui. Se fizer sentido, voce decide.",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Quer que eu te apresente a solucao completa agora?",
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Vamos fechar isso agora e ja resolver esse problema.",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Pode mostrar sim, desde que seja rapido e direto ao ponto.",
  },
];

const PONTOS = { correta: 2, neutra: 1, errada: 0 };
const MAX_PTS = ROTEIRO.length * 2;

const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoPadaria extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoPadaria" });
    this.imagemKey = "falaPadaria";
    this.promptLLM =
      "Voce e a atendente de uma padaria muito movimentada. " +
      "Voce e agil, pratica e valoriza um atendimento rapido e sem atritos no caixa.";
  }

  init(dados) {
    super.init(dados);
    this.cenaIdx = 0;
    this.pontuacao = 0;
    this.estado = "tutorial";
    this.aguardandoLLM = false;
  }

  preload() {
    if (!this.textures.exists("falaPadaria")) {
      this.load.image(
        "falaPadaria",
        "src/assets/imagens/imagensFalas/FalaPadaria.png",
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

    const img = this.add.image(CX, IMG_CY, "falaPadaria")
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
      "Sofia  -  Atendente da Padaria",
      {
        fontSize: "20px",
        color: "#5a9fd4",
        fontStyle: "bold",
        resolution: 4,
      },
    ).setScrollFactor(0).setDepth(3).setVisible(false);

    this.textoNarracao = this.add.text(CX, NAR_Y + 30, "", {
      fontSize: "19px",
      color: "#99bbdd",
      fontStyle: "italic",
      wordWrap: { width: BTN_W },
      align: "center",
      resolution: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(3);

    this.textoNpc = this.add.text(CX, TEXTO_NPC_Y, "", {
      fontSize: "24px",
      color: "#e8f4ff",
      wordWrap: { width: BTN_W },
      align: "center",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3);

    this.botoesEscolha = BTN_Y.map((by, i) => {
      const letra = ["A", "B", "C"][i];

      const bg = this.add.rectangle(CX, by + BTN_H / 2, BTN_W, BTN_H, COR_NEUTRO)
        .setScrollFactor(0)
        .setDepth(3)
        .setStrokeStyle(1, 0x3a5ba0)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      const labelLetra = this.add.text(CX - BTN_W / 2 + 16, by + BTN_H / 2, `[${letra}]`, {
        fontSize: "21px",
        color: "#5a9fd4",
        fontStyle: "bold",
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(4).setVisible(false);

      const txtEscolha = this.add.text(CX - BTN_W / 2 + 70, by + BTN_H / 2, "", {
        fontSize: "21px",
        color: "#ffffff",
        wordWrap: { width: BTN_W - 80 },
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(4).setVisible(false);

      bg.on("pointerover", () => { if (!this.aguardandoLLM) bg.setFillStyle(COR_HOVER); });
      bg.on("pointerout", () => { if (!this.aguardandoLLM) bg.setFillStyle(COR_NEUTRO); });
      bg.on("pointerdown", () => { if (!this.aguardandoLLM) this._aoEscolher(i); });

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

    this.textoCarregando = this.add.text(CX, CONT_Y, "Sofia esta pensando...", {
      fontSize: "21px",
      color: "#99bbdd",
      fontStyle: "italic",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    this.textoCieloCoin = this.add.text(W - 20, 16, "Cielo Coins: 0 / 18", {
      fontSize: "22px",
      color: "#ffd700",
      backgroundColor: "#000000bb",
      padding: { x: 10, y: 5 },
      resolution: 4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);

    this.textoCena = this.add.text(20, 16, "", {
      fontSize: "22px",
      color: "#aaccee",
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
      fontSize: "32px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
    els.push(this.add.rectangle(CX, CY - 230, 1000, 2, 0x2a5ba0)
      .setScrollFactor(0).setDepth(D + 1));

    const linhas = [
      { icone: "🎯", texto: "Voce esta negociando com a atendente da padaria,\nem um horario de caixa cheio e atendimento acelerado." },
      { icone: "💬", texto: "A cada cena, escolha a melhor resposta para conduzir\na conversa sem atrapalhar o fluxo do atendimento." },
      { icone: "🪙", texto: "Cada escolha vale Cielo Coins:\nResposta correta = +2   Neutra = +1   Errada = +0" },
      { icone: "🤖", texto: "A resposta da cliente pode se adaptar ao que voce fala,\nseguindo o mesmo padrao das outras fases." },
      { icone: "🏆", texto: "Seu objetivo e mostrar valor sem pressionar,\nrespeitando o momento da operacao." },
    ];

    linhas.forEach(({ icone, texto }, i) => {
      const y = CY - 170 + i * 82;
      els.push(this.add.text(CX - 480, y, icone, { fontSize: "26px", resolution: 4 })
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1));
      els.push(this.add.text(CX - 430, y, texto, {
        fontSize: "20px",
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
    els.push(this.add.text(CX, btnY, "Comecar  ->", {
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

    cena.escolhas.forEach(({ texto }, i) => {
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
    const escolha = cena.escolhas[indice];

    this.pontuacao += PONTOS[escolha.tipo] ?? 0;
    this.textoCieloCoin.setText(`Cielo Coins: ${this.pontuacao} / ${MAX_PTS}`);

    const coresTipo = { correta: COR_CORRETA, neutra: COR_NEUTRA, errada: COR_ERRADA };
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

    const pct = Math.round((this.pontuacao / MAX_PTS) * 100);
    let avaliacao;
    let cor;
    if (pct >= 90) {
      avaliacao = "Vendedor nato! Negocio fechado!";
      cor = "#44ff88";
    } else if (pct >= 70) {
      avaliacao = "Bom trabalho! Quase perfeito.";
      cor = "#88ccff";
    } else if (pct >= 50) {
      avaliacao = "Razoavel. Pratique mais!";
      cor = "#ffcc44";
    } else {
      avaliacao = "Precisa melhorar. Tente de novo.";
      cor = "#ff6644";
    }

    this.textoNpc
      .setText(
        `Conversa encerrada!\n\nCielo Coins: ${this.pontuacao} / ${MAX_PTS}  (${pct}%)\n\n${avaliacao}`,
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
      correta: "O vendedor fez uma abordagem excelente. Responda de forma receptiva, avancando a conversa.",
      neutra: "O vendedor foi aceitavel porem generico. Responda de forma neutra, sem entusiasmo mas sem fechar portas.",
      errada: "O vendedor errou a abordagem. Responda de forma mais fria ou cetica, mas sem encerrar a conversa.",
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
      console.warn("[SceneDialogoPadaria] Falha na LLM, usando roteiro:", err.message);
      return cena.npcResposta;
    }
  }
}
