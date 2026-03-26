import SceneDialogoBase from "./SceneDialogoBase.js";

// ─── Configuração da LLM ─────────────────────────────────────────────────────
// Chave gratuita em: https://console.groq.com
const GROQ_API_KEY = "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";
const GROQ_MODEL   = "llama-3.1-8b-instant";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

// ─── Roteiro Fase 3 – Farmácia ───────────────────────────────────────────────
const ROTEIRO = [
  {
    titulo: "CENA 1 – OBSERVAÇÃO",
    narracao: "Farmácia organizada. Vários caixas ativos. Fluxo alto e constante.\n\"Observe a operação antes de falar.\"",
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Bom dia. Movimento constante por aqui, né?",                       tipo: "neutra"  },
      { letra: "B", texto: "Bom dia. Mesmo cheio, parece bem organizado.",                     tipo: "correta" },
      { letra: "C", texto: "Bom dia. Tenho uma solução que pode ajudar seu atendimento.",      tipo: "errada"  },
    ],
    npcResposta: "Bom dia. Aqui é dinâmico, então precisa ser rápido.",
  },
  {
    titulo: "CENA 2 – ABORDAGEM",
    narracao: null,
    npcInicial: "Pode falar rápido. Estou acompanhando a operação.",
    escolhas: [
      { letra: "A", texto: "Claro. Posso te mostrar algo que ajude a ganhar tempo no caixa?", tipo: "correta" },
      { letra: "B", texto: "Vim te apresentar as soluções da Cielo para o seu negócio.",      tipo: "neutra"  },
      { letra: "C", texto: "Tenho uma solução que pode melhorar seu atendimento.",             tipo: "errada"  },
    ],
    npcResposta: "Se não atrapalhar o fluxo, pode falar.",
  },
  {
    titulo: "CENA 3 – CONTEXTO",
    narracao: "Fluxo alto, múltiplos atendentes.",
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Nos horários de pico, o caixa vira o ponto mais crítico?",        tipo: "correta" },
      { letra: "B", texto: "Vocês operam com vários caixas simultaneamente nesse fluxo?",     tipo: "neutra"  },
      { letra: "C", texto: "Vou te explicar como funciona a solução da Cielo.",               tipo: "errada"  },
    ],
    npcResposta: "Sim. Quando o pagamento demora, vira gargalo e trava tudo.",
  },
  {
    titulo: "CENA 4 – DIAGNÓSTICO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "E isso impacta mais a fila ou o tempo total de atendimento?",     tipo: "correta" },
      { letra: "B", texto: "O problema costuma ser mais sistema ou equipamento?",              tipo: "neutra"  },
      { letra: "C", texto: "Se eu te mostrar uma alternativa melhor, você avaliaria?",        tipo: "errada"  },
    ],
    npcResposta: "O maior problema é tempo. Qualquer atraso vira fila rápido.",
  },
  {
    titulo: "CENA 5 – OBJEÇÃO",
    narracao: null,
    npcInicial: "Mas não posso mexer nisso agora. Vai atrapalhar a operação.",
    escolhas: [
      { letra: "A", texto: "Claro. A ideia é melhorar o fluxo sem interferir no que já funciona.", tipo: "correta" },
      { letra: "B", texto: "A implementação costuma ser rápida e tranquila.",                       tipo: "neutra"  },
      { letra: "C", texto: "Se não mudar, o problema vai continuar.",                              tipo: "errada"  },
    ],
    npcResposta: "Se não parar o atendimento, posso entender melhor.",
  },
  {
    titulo: "CENA 6 – VALOR",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Com pagamento mais rápido e estável, o caixa gira melhor e reduz fila.", tipo: "correta" },
      { letra: "B", texto: "A Cielo tem tecnologia que melhora o atendimento.",                      tipo: "neutra"  },
      { letra: "C", texto: "A solução traz funcionalidades que ajudam no dia a dia.",               tipo: "errada"  },
    ],
    npcResposta: "Se ganhar tempo no caixa sem erro, já ajuda bastante.",
  },
  {
    titulo: "CENA 7 – EFICIÊNCIA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Com menos falhas, você evita retrabalho e mantém o ritmo do atendimento.", tipo: "correta" },
      { letra: "B", texto: "Com mais tecnologia, a operação fica mais moderna.",                        tipo: "neutra"  },
      { letra: "C", texto: "Isso ajuda no controle das vendas.",                                       tipo: "errada"  },
    ],
    npcResposta: "Evitar erro e retrabalho faz diferença no fluxo.",
  },
  {
    titulo: "CENA 8 – CREDIBILIDADE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "É uma solução usada no dia a dia, focada em estabilidade e rapidez no caixa.", tipo: "correta" },
      { letra: "B", texto: "A Cielo é uma empresa conhecida no mercado.",                                  tipo: "neutra"  },
      { letra: "C", texto: "Muitos estabelecimentos utilizam esse tipo de solução.",                      tipo: "errada"  },
    ],
    npcResposta: "Se for estável mesmo, já resolve grande parte do problema.",
  },
  {
    titulo: "CENA 9 – OBJEÇÃO FINAL",
    narracao: null,
    npcInicial: "Mas eu não tenho tempo pra ver isso agora.",
    escolhas: [
      { letra: "A", texto: "Perfeito. Te mostro rápido, sem atrapalhar o atendimento.", tipo: "correta" },
      { letra: "B", texto: "Leva pouco tempo e é simples.",                             tipo: "neutra"  },
      { letra: "C", texto: "Vale a pena separar um tempo.",                             tipo: "errada"  },
    ],
    npcResposta: "Se for direto, pode mostrar.",
  },
  {
    titulo: "CENA 10 – FECHAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Te mostro como isso funciona na prática aqui. Se fizer sentido, seguimos.", tipo: "correta" },
      { letra: "B", texto: "Quer ver a solução completa agora?",                                        tipo: "neutra"  },
      { letra: "C", texto: "Vamos implementar isso e melhorar sua operação.",                          tipo: "errada"  },
    ],
    npcResposta: "Pode mostrar, mas precisa ser direto.",
  },
];

const PONTOS  = { correta: 2, neutra: 1, errada: 0 };
const MAX_PTS = ROTEIRO.length * 2;

// ─── Cores dos botões de escolha ─────────────────────────────────────────────
const COR_NEUTRO   = 0x1d2b4a;
const COR_HOVER    = 0x2a3f6a;
const COR_CORRETA  = 0x1a5c1a;
const COR_NEUTRA   = 0x1a3a5c;
const COR_ERRADA   = 0x6a1a1a;

export default class SceneDialogoFarmacia extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoFarmacia" });
    this.imagemKey = "falaFarmacia";
    this.promptLLM =
      "Você é Rachel, gerente de uma farmácia movimentada. É direta, ocupada e profissional. " +
      "Está conversando com um vendedor da Cielo sobre soluções de pagamento para sua farmácia.";
  }

  init(dados) {
    super.init(dados);
    this.cenaIdx       = 0;
    this.pontuacao     = 0;
    this.estado        = "tutorial";
    this.aguardandoLLM = false;
  }

  preload() {
    if (!this.textures.exists("falaFarmacia")) {
      this.load.image("falaFarmacia", "src/assets/imagens/imagensFalas/FalaFarmacia.png");
    }
  }

  create() {
    const W  = this.scale.width;
    const H  = this.scale.height;
    const CX = W / 2;

    // ── Layout ──────────────────────────────────────────────────────────────
    // Imagem do NPC ocupa a parte de cima; painel de diálogo fica embaixo.
    const IMG_H        = 660;   // altura máxima reservada para a imagem
    const IMG_CY       = IMG_H / 2;  // centro vertical da imagem
    const PANEL_TOP    = IMG_H + 10; // y onde começa o painel de diálogo
    const PANEL_H      = H - PANEL_TOP - 10;
    const PANEL_CY     = PANEL_TOP + PANEL_H / 2;

    // Posições internas do painel
    const NOME_Y       = PANEL_TOP + 22;
    const TEXTO_NPC_Y  = PANEL_TOP + PANEL_H / 2 - 10;
    const NAR_Y        = PANEL_TOP + 26;
    const BTN_Y        = [PANEL_TOP + 28, PANEL_TOP + 118, PANEL_TOP + 208];
    const BTN_W        = W - 120;
    const BTN_H        = 82;
    const CONT_Y       = PANEL_TOP + PANEL_H - 38;

    this._CONT_Y       = CONT_Y; // usado em _mostrarResultadoFinal

    // ── Fundo escuro (bloqueia cliques na cena abaixo) ──────────────────────
    this.add.rectangle(CX, H / 2, W, H, 0x000000, 0.78)
      .setScrollFactor(0).setDepth(0).setInteractive();

    // ── Imagem da farmacêutica (topo, sem cobertura) ────────────────────────
    const img = this.add.image(CX, IMG_CY, "falaFarmacia")
      .setScrollFactor(0).setDepth(1).setOrigin(0.5);
    const escala = Math.min(W / img.width, IMG_H / img.height);
    img.setScale(escala);

    // ── Painel de diálogo (fundo do painel) ─────────────────────────────────
    this.add.rectangle(CX, PANEL_CY, W, PANEL_H, 0x060d1a, 0.96)
      .setScrollFactor(0).setDepth(2);
    // Linha separadora no topo do painel
    this.add.rectangle(CX, PANEL_TOP, W, 3, 0x2a5ba0)
      .setScrollFactor(0).setDepth(3);

    // ── Nome do NPC ──────────────────────────────────────────────────────────
    this.textoNome = this.add.text(CX - (BTN_W / 2), NOME_Y, "Rachel  —  Gerente da Farmácia", {
      fontSize: "20px", color: "#5a9fd4", fontStyle: "bold", resolution: 4,
    }).setScrollFactor(0).setDepth(3).setVisible(false);

    // ── Texto de narração / fala do NPC ─────────────────────────────────────
    this.textoNarracao = this.add.text(CX, NAR_Y + 30, "", {
      fontSize: "19px", color: "#99bbdd", fontStyle: "italic",
      wordWrap: { width: BTN_W }, align: "center", resolution: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(3);

    this.textoNpc = this.add.text(CX, TEXTO_NPC_Y, "", {
      fontSize: "24px", color: "#e8f4ff",
      wordWrap: { width: BTN_W }, align: "center", resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3);

    // ── Botões de escolha ────────────────────────────────────────────────────
    this.botoesEscolha = BTN_Y.map((by, i) => {
      const letra = ["A", "B", "C"][i];

      const bg = this.add.rectangle(CX, by + BTN_H / 2, BTN_W, BTN_H, COR_NEUTRO)
        .setScrollFactor(0).setDepth(3)
        .setStrokeStyle(1, 0x3a5ba0)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      const labelLetra = this.add.text(CX - BTN_W / 2 + 16, by + BTN_H / 2, `[${letra}]`, {
        fontSize: "21px", color: "#5a9fd4", fontStyle: "bold", resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(4).setVisible(false);

      const txtEscolha = this.add.text(CX - BTN_W / 2 + 70, by + BTN_H / 2, "", {
        fontSize: "21px", color: "#ffffff", wordWrap: { width: BTN_W - 80 }, resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(4).setVisible(false);

      bg.on("pointerover", () => { if (!this.aguardandoLLM) bg.setFillStyle(COR_HOVER); });
      bg.on("pointerout",  () => { if (!this.aguardandoLLM) bg.setFillStyle(COR_NEUTRO); });
      bg.on("pointerdown", () => { if (!this.aguardandoLLM) this._aoEscolher(i); });

      return { bg, labelLetra, txtEscolha };
    });

    // ── Botão Continuar ──────────────────────────────────────────────────────
    this.btnContinuar = this.add.rectangle(CX, CONT_Y, 340, 56, 0x1a5c1a)
      .setScrollFactor(0).setDepth(3)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.txtContinuar = this.add.text(CX, CONT_Y, "", {
      fontSize: "22px", color: "#ffffff", fontStyle: "bold", resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    this.btnContinuar.on("pointerover", () => this.btnContinuar.setFillStyle(0x2a7c2a));
    this.btnContinuar.on("pointerout",  () => this.btnContinuar.setFillStyle(0x1a5c1a));
    this.btnContinuar.on("pointerdown", () => this._aoContinuar());

    // ── Loading ──────────────────────────────────────────────────────────────
    this.textoCarregando = this.add.text(CX, CONT_Y, "Rachel está pensando...", {
      fontSize: "21px", color: "#99bbdd", fontStyle: "italic", resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    // ── HUD ──────────────────────────────────────────────────────────────────
    this.textoCieloCoin = this.add.text(W - 20, 16, "Cielo Coins: 0 / 20", {
      fontSize: "22px", color: "#ffd700",
      backgroundColor: "#000000bb", padding: { x: 10, y: 5 }, resolution: 4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);

    this.textoCena = this.add.text(20, 16, "", {
      fontSize: "22px", color: "#aaccee",
      backgroundColor: "#000000bb", padding: { x: 10, y: 5 }, resolution: 4,
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(10);

    // ── Tecla E (só fecha no estado "fim") ───────────────────────────────────
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // ── Tutorial ─────────────────────────────────────────────────────────────
    this._criarTutorial(W, H, CX, H / 2);
  }

  update() {
    if (this.estado === "fim" && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this._fechar();
    }
  }

  // ─── Tutorial ────────────────────────────────────────────────────────────

  _criarTutorial(W, H, CX, CY) {
    const els = [];
    const D = 5;

    // Fundo
    els.push(this.add.rectangle(CX, CY, W, H, 0x000000, 0.88)
      .setScrollFactor(0).setDepth(D).setInteractive());

    // Painel central
    els.push(this.add.rectangle(CX, CY, 1100, 640, 0x08101e)
      .setScrollFactor(0).setDepth(D + 0.1).setStrokeStyle(2, 0x2a5ba0));

    // Título
    els.push(this.add.text(CX, CY - 270, "Como funciona esta conversa", {
      fontSize: "32px", color: "#ffffff", fontStyle: "bold", resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));

    // Linha
    els.push(this.add.rectangle(CX, CY - 230, 1000, 2, 0x2a5ba0)
      .setScrollFactor(0).setDepth(D + 1));

    const linhas = [
      { icone: "🎯", texto: "Você é um vendedor da Cielo tentando fechar negócio com Rachel,\ngerente de uma farmácia movimentada." },
      { icone: "💬", texto: "A cada cena, Rachel fala algo. Escolha a melhor resposta\npara avançar a conversa de forma estratégica." },
      { icone: "🪙", texto: "Cada escolha vale Cielo Coins:\n✅ Resposta correta = +2   ⚪ Neutra = +1   ❌ Errada = +0" },
      { icone: "🤖", texto: "Rachel responde com inteligência artificial,\nadaptando a fala com base na sua escolha." },
      { icone: "🏆", texto: "Acumule o máximo de Cielo Coins possível\ne conquiste a venda!" },
    ];

    linhas.forEach(({ icone, texto }, i) => {
      const y = CY - 170 + i * 82;
      els.push(this.add.text(CX - 480, y, icone, { fontSize: "26px", resolution: 4 })
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1));
      els.push(this.add.text(CX - 430, y, texto, {
        fontSize: "20px", color: "#c8d8f0", wordWrap: { width: 900 }, resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1));
    });

    // Botão Começar
    const btnY = CY + 255;
    const btnBg = this.add.rectangle(CX, btnY, 300, 58, 0x1a5c1a)
      .setScrollFactor(0).setDepth(D + 1)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true });
    els.push(btnBg);
    els.push(this.add.text(CX, btnY, "Começar  →", {
      fontSize: "24px", color: "#ffffff", fontStyle: "bold", resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2));

    btnBg.on("pointerover", () => btnBg.setFillStyle(0x2a7c2a));
    btnBg.on("pointerout",  () => btnBg.setFillStyle(0x1a5c1a));
    btnBg.on("pointerdown", () => {
      els.forEach(el => el?.destroy?.());
      this._mostrarCena(0);
    });

    this._tutorialEls = els;
  }

  // ─── Roteiro ─────────────────────────────────────────────────────────────

  _mostrarCena(idx) {
    const cena = ROTEIRO[idx];
    this.cenaIdx       = idx;
    this.estado        = "intro";
    this.aguardandoLLM = false;

    this.textoCena.setText(`${cena.titulo}  (${idx + 1} / ${ROTEIRO.length})`);
    this._esconderBotoes();
    this._ocultarContinuar();
    this.textoCarregando.setVisible(false);
    this.textoNome.setVisible(false);

    this.textoNarracao.setText(cena.narracao  || "");
    this.textoNpc.setText(cena.npcInicial ? `"${cena.npcInicial}"` : "");

    if (!cena.narracao && !cena.npcInicial) {
      this._mostrarEscolhas();
    } else {
      this.textoNome.setVisible(!!cena.npcInicial);
      this._mostrarContinuar("Responder  →");
    }
  }

  _mostrarEscolhas() {
    const cena = ROTEIRO[this.cenaIdx];
    this.estado = "escolha";

    this.textoNarracao.setText("");
    this.textoNpc.setText("O que você diz?");
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

    const cena   = ROTEIRO[this.cenaIdx];
    const escolha = cena.escolhas[indice];

    this.pontuacao += PONTOS[escolha.tipo] ?? 0;
    this.textoCieloCoin.setText(`Cielo Coins: ${this.pontuacao} / ${MAX_PTS}`);

    // Feedback de cor na escolha feita
    const coresTipo = { correta: COR_CORRETA, neutra: COR_NEUTRA, errada: COR_ERRADA };
    this.botoesEscolha[indice].bg.setFillStyle(coresTipo[escolha.tipo]);

    this.aguardandoLLM = true;
    this._esconderBotoes(indice);
    this.textoCarregando.setVisible(true);

    const resposta = await this._chamarLLM(escolha, cena);

    this.aguardandoLLM = false;
    this.textoCarregando.setVisible(false);
    this._esconderBotoes();

    // Exibe resposta da Rachel
    this.estado = "resposta";
    this.textoNarracao.setText("");
    this.textoNome.setVisible(true);
    this.textoNpc.setText(`"${resposta}"`);

    const ultimo = this.cenaIdx >= ROTEIRO.length - 1;
    this._mostrarContinuar(ultimo ? "Ver resultado  →" : "Próxima cena  →");
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
    let avaliacao, cor;
    if      (pct >= 90) { avaliacao = "Vendedor nato! Negócio fechado!";    cor = "#44ff88"; }
    else if (pct >= 70) { avaliacao = "Bom trabalho! Quase perfeito.";      cor = "#88ccff"; }
    else if (pct >= 50) { avaliacao = "Razoável. Pratique mais!";           cor = "#ffcc44"; }
    else                { avaliacao = "Precisa melhorar. Tente de novo.";   cor = "#ff6644"; }

    this.textoNpc
      .setText(`Conversa encerrada!\n\nCielo Coins: ${this.pontuacao} / ${MAX_PTS}  (${pct}%)\n\n${avaliacao}`)
      .setStyle({ color: cor });

    this._mostrarContinuar("Fechar  [E]");
  }

  // ─── Helpers de UI ────────────────────────────────────────────────────────

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

  // ─── LLM (Groq) ──────────────────────────────────────────────────────────

  async _chamarLLM(escolha, cena) {
    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
      return cena.npcResposta;
    }

    const guias = {
      correta: "O vendedor fez uma abordagem excelente. Responda de forma receptiva, avançando a conversa.",
      neutra:  "O vendedor foi aceitável porém genérico. Responda de forma neutra, sem entusiasmo mas sem fechar portas.",
      errada:  "O vendedor errou a abordagem. Responda de forma mais fria ou cética, mas sem encerrar a conversa.",
    };

    const system =
      `${this.promptLLM}\n` +
      `Responda de forma natural e breve (1-2 frases) em português do Brasil.\n` +
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
            { role: "user",   content: `O vendedor disse: "${escolha.texto}"` },
          ],
          max_tokens: 120,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || cena.npcResposta;
    } catch (err) {
      console.warn("[SceneDialogoFarmacia] Falha na LLM, usando roteiro:", err.message);
      return cena.npcResposta;
    }
  }
}
