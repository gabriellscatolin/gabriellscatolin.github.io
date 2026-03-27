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

// ─── Configuração da LLM ─────────────────────────────────────────────────────
// Chave gratuita em: https://console.groq.com
const GROQ_API_KEY = "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";
const GROQ_MODEL   = "llama-3.1-8b-instant";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

// ─── Roteiro Fase 3 – Farmácia ───────────────────────────────────────────────
const ROTEIRO = [
  {
    titulo: "CENA 1 – OBSERVAÇÃO",
    narracao: "Ambiente: farmácia organizada. Vários caixas ativos. Fluxo alto e constante.\n\"Agora é sua vez de abordar o cliente.\"",
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Bom dia. Tá bem corrido por aqui hoje, né?",                       tipo: "neutra"  },
      { letra: "B", texto: "Bom dia. Vi que mesmo com bastante gente vocês estão tocando tudo bem rápido.",                     tipo: "correta" },
      { letra: "C", texto: "Bom dia. Posso te mostrar uma solução que melhora o atendimento de vocês?.",      tipo: "errada"  },
    ],
    npcResposta: "Bom dia. Aqui é sempre assim, bem puxado... a gente precisa ser rápido para não formar fila.",
  },
  {
    titulo: "CENA 2 – ABORDAGEM",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Claro. Vou ser direto. Posso te fazer uma pergunta rápida?", tipo: "correta" },
      { letra: "B", texto: "Fica tranquila, não vou tomar muito do seu tempo agora.",      tipo: "neutra"  },
      { letra: "C", texto: "É coisa simples, rapidinho você já entende tudo.",             tipo: "errada"  },
    ],
    npcResposta: "Tá pode falar.",
  },
  {
    titulo: "CENA 3 – CONTEXTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Quando a farmácia começa a encher, o que é pior, demora ou erro no pagamento?",        tipo: "correta" },
      { letra: "B", texto: "Esse tipo de movimento acontece em horários específicos ou é o dia todo?",     tipo: "neutra"  },
      { letra: "C", texto: "Você sabia que a soluçao para isso é a maquininha da Cielo?",               tipo: "errada"  },
    ],
    npcResposta: "O problema é que quando o fluxo aumenta, a fila cresce rápido demais e o atendimento não é tão rápido para assim.",
  },
  {
    titulo: "CENA 4 – DIAGNÓSTICO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Mas isso acontece em todos os lugares, é normal.",     tipo: "errada" },
      { letra: "B", texto: "Você acha que o problema é equipamento ou o atendente?",              tipo: "neutra"  },
      { letra: "C", texto: "E isso já chegou a fazer o cliente desistir da compra?",        tipo: "correta"  },
    ],
    npcResposta: "Já aconteceu mais de uma vez, não sei em quem colocar a culpa.",
  },
  {
    titulo: "CENA 5 – OBJEÇÃO",
    narracao: null,
    npcInicial: "Mas não posso fazer grandes mudanças agora.",
    escolhas: [
      { letra: "A", texto: "Entendo, normalmente isso é algo rápido de ajustar no dia-a-dia..", tipo: "neutra" },
      { letra: "B", texto: "Perfeito, nem deve. A ideia é melhorar isso sem parar a operação.",                       tipo: "correta"  },
      { letra: "C", texto: "Mas isso é importante, precisa ser resolvido o quanto antes.",                              tipo: "errada"  },
    ],
    npcResposta: "Se não parar o caixa, já ajuda, e muito.",
  },
  {
    titulo: "CENA 6 – VALOR",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Se ajudar a organizar melhor o atendimento, já melhora um pouco.",                      tipo: "neutra"  },
      { letra: "B", texto: "Isso, você está perdendo venda, você precisa ser agressivo na sua estratégia.",               tipo: "errada"  },
      { letra: "C", texto: "Com pagamento mais rápido e estável, a fila anda e o cliente sai satisfeito.", tipo: "correta" },
    ],
    npcResposta: "O meu foco principal é fidelizar o cliente.",
  },
  {
    titulo: "CENA 7 – EFICIÊNCIA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "E evita aquele efeito de atraso em cadeia, que trava todo o resto.", tipo: "correta" },
      { letra: "B", texto: "É bom que você tem essa visão, a Cielo veio para te ajudar.",                        tipo: "neutra"  },
      { letra: "C", texto: "Isso todo estabelecimento quer.",                                       tipo: "errada"  },
    ],
    npcResposta: "Sim, é um problema atrás do outro.",
  },
  {
    titulo: "CENA 8 – CREDIBILIDADE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      
      { letra: "A", texto: "A Cielo tem a solução, e é uma empresa conhecida no mercado, desde 1995.",                                  tipo: "neutra"  },
      { letra: "B", texto: "Muitas empresas já usam esse tipo de tecnologia ultimamente.",                      tipo: "errada"  },
      { letra: "C", texto: "A Cielo tem uma solução usada no dia a dia por milhares de empreendedores, em 99% do território brasileiro.", tipo: "correta" },
    ],
    npcResposta: "Se aguentar esse movimento, já ajuda bastante.",
  },
  {
    titulo: "CENA 9 – OBJEÇÃO FINAL",
    narracao: null,
    npcInicial: "Agora preciso saber das vantages e taxas para eu considerar a troca.",
    escolhas: [
      { letra: "A", texto: "Você precisa analisar certinho, não sei quais são suas taxas atuais",                             tipo: "errada"  },
      { letra: "B", texto: "Fica tranquilo, vamos pensar juntos em constuir as melhores taxas.", tipo: "correta" },
      { letra: "C", texto: "Mas pensa a longo prazo, vai valer muito a pena. Não perca a oportunidade",                             tipo: "neutra"  },
      
    ],
    npcResposta: "Se for direto, pode mostrar.",
  },
  {
    titulo: "CENA 10 – FECHAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Se fizer sentido para você, a gente testa agora, personalizado para a rotina de vocês.", tipo: "correta" },
      { letra: "B", texto: "Prometo que vai ser bem rápido, é uma solução muito boa mesmo.",                                        tipo: "neutra"  },
      { letra: "C", texto: "Depois você pode ver isso com mais calma.",                          tipo: "errada"  },
    ],
    npcResposta: "Pode ser então.",
  },
];

const CAPITULO  = "chapter1";
const FASE      = "farmacia";
const N_CENAS   = ROTEIRO.length; // 10 perguntas

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
    this.cenaIdx                = 0;
    this.pontuacaoFase          = 0;   // coins acumuladas só nesta fase
    this.cieloCoinsGanhasDialogo = 0;  // exibido no HUD como "+X nesta conversa"
    this.estado                 = "tutorial";
    this.aguardandoLLM          = false;
    initScoring(this.registry);
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

    const cena   = ROTEIRO[this.cenaIdx];
    const escolha = this.escolhasOrdenadas[indice];

    const ganhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);
    this.pontuacaoFase          += ganhos;
    this.cieloCoinsGanhasDialogo += ganhos;
    this.textoCieloCoin.setText(
      `Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
    );

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

    const meta      = goalEscalado(FASE);
    const maxPts    = N_CENAS * 100; // chapter1: 100 por correta
    const atingiu   = checkGoal(FASE, this.pontuacaoFase);
    const pct       = Math.round((this.pontuacaoFase / maxPts) * 100);

    let avaliacao, cor;
    if      (pct >= 90) { avaliacao = "Vendedor nato! Negócio fechado!";    cor = "#44ff88"; }
    else if (pct >= 70) { avaliacao = "Bom trabalho! Quase perfeito.";      cor = "#88ccff"; }
    else if (pct >= 50) { avaliacao = "Razoável. Pratique mais!";           cor = "#ffcc44"; }
    else                { avaliacao = "Precisa melhorar. Tente de novo.";   cor = "#ff6644"; }

    const statusMeta = atingiu
      ? "✅ Meta atingida!"
      : `❌ Meta não atingida (precisava de ${meta} coins)`;

    this.textoNpc
      .setText(
        `Conversa encerrada!\n\n` +
        `Coins desta fase: ${this.pontuacaoFase} / ${maxPts}  (${pct}%)\n` +
        `Total da sessão: ${getScore(this.registry)}\n\n` +
        `${statusMeta}\n\n${avaliacao}`,
      )
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
