import SceneDialogoBase from "./SceneDialogoBase.js";
import { initScoring, handleAnswer, checkGoal, getScore, goalEscalado } from "../scoring.js";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GROQ_API_KEY = "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";
const GROQ_MODEL   = "llama-3.1-8b-instant";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

const ROTEIRO = [
  {
    titulo: "CENA 1 - OBSERVACAO / CHEGADA",
    narracao: "Posto movimentado. Fluxo constante de carros. Funcionarios ocupados.\nEntenda o ritmo antes de abordar.",
    npcInicial: "Bom dia. O que deseja?",
    escolhas: [
      { letra: "A", texto: "Bom dia! Movimento intenso aqui hoje, ne?", tipo: "correta" },
      { letra: "B", texto: "Bom dia! Vim falar sobre pagamentos.", tipo: "neutra" },
      { letra: "C", texto: "Bom dia! Tenho uma proposta imperdivel para o seu negocio.", tipo: "errada" },
    ],
    npcResposta: "Sim, e sempre assim. Pode falar rapido.",
  },
  {
    titulo: "CENA 2 - ABORDAGEM",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Sou parceiro da Cielo. Vi que voce tem alto volume de transacoes e quero entender se esta satisfeito com a solucao atual.", tipo: "correta" },
      { letra: "B", texto: "Sou da Cielo e vim apresentar nossas maquininhas.", tipo: "neutra" },
      { letra: "C", texto: "A Cielo tem as melhores taxas do mercado para postos.", tipo: "errada" },
    ],
    npcResposta: "Tenho maquininha, mas pode falar.",
  },
  {
    titulo: "CENA 3 - DIAGNOSTICO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Com esse volume de carros, uma queda no sistema pode travar o caixa e perder venda. Isso ja aconteceu aqui?", tipo: "correta" },
      { letra: "B", texto: "Quantas transacoes voce processa por dia em media?", tipo: "neutra" },
      { letra: "C", texto: "Voce ja considerou trocar de operadora para pagar menos taxa?", tipo: "errada" },
    ],
    npcResposta: "Ja aconteceu sim. Uma vez fiquei uma hora sem maquininha. Foi prejuizo.",
  },
  {
    titulo: "CENA 4 - APRESENTACAO DE VALOR",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "A Cielo tem uptime de 99,9% e suporte 24h especializado para postos de gasolina. Uma hora parada aqui pode custar muito.", tipo: "correta" },
      { letra: "B", texto: "A Cielo e estavel e tem bom suporte tecnico.", tipo: "neutra" },
      { letra: "C", texto: "Com a Cielo voce nao vai mais ter esses problemas.", tipo: "errada" },
    ],
    npcResposta: "Estabilidade e o principal para mim. Nao posso parar o caixa.",
  },
  {
    titulo: "CENA 5 - OBJECAO DE TAXA",
    narracao: null,
    npcInicial: "Mas minha taxa atual e de 1,5%. A Cielo cobra mais?",
    escolhas: [
      { letra: "A", texto: "Depende do volume. Para o seu porte, posso verificar uma taxa competitiva. Mas o custo de uma hora parada supera muito qualquer diferenca de taxa.", tipo: "correta" },
      { letra: "B", texto: "As taxas da Cielo sao competitivas e variam por volume.", tipo: "neutra" },
      { letra: "C", texto: "Nao se preocupe com taxa, o importante e a qualidade.", tipo: "errada" },
    ],
    npcResposta: "Faz sentido. O prejuizo de parar o caixa e muito maior.",
  },
  {
    titulo: "CENA 6 - CREDIBILIDADE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "A Cielo opera com suporte dos maiores bancos do Brasil e atende postos de grande porte em todo o pais. Esse segmento e prioridade para nos.", tipo: "correta" },
      { letra: "B", texto: "A Cielo e lider de mercado e muito confiavel.", tipo: "neutra" },
      { letra: "C", texto: "Todo mundo usa a Cielo. E a mais conhecida.", tipo: "errada" },
    ],
    npcResposta: "Se tem respaldo de banco grande, da mais confianca sim.",
  },
  {
    titulo: "CENA 7 - OBJECAO SOBRE TROCA",
    narracao: null,
    npcInicial: "Trocar de sistema da trabalho. Preciso retreinar minha equipe.",
    escolhas: [
      { letra: "A", texto: "Entendo. A implantacao e rapida e ofereço treinamento gratuito para sua equipe no proprio local.", tipo: "correta" },
      { letra: "B", texto: "A transicao costuma ser tranquila e nao demora muito.", tipo: "neutra" },
      { letra: "C", texto: "Sua equipe vai aprender rapido, e intuitivo.", tipo: "errada" },
    ],
    npcResposta: "Se tiver treinamento aqui mesmo, ja muda o panorama.",
  },
  {
    titulo: "CENA 8 - PROPOSTA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Posso formatar uma proposta personalizada com base no seu volume e trazer ate amanha para voce avaliar sem compromisso.", tipo: "correta" },
      { letra: "B", texto: "Posso te enviar uma proposta por email.", tipo: "neutra" },
      { letra: "C", texto: "Vou fechar a proposta agora mesmo para voce.", tipo: "errada" },
    ],
    npcResposta: "Sem compromisso e melhor. Pode trazer amanha.",
  },
  {
    titulo: "CENA 9 - OBJECAO FINAL",
    narracao: null,
    npcInicial: "Mas e se der problema depois que eu trocar?",
    escolhas: [
      { letra: "A", texto: "Nosso suporte e 24h, inclusive noturno. Se der qualquer problema, um tecnico e acionado em minutos.", tipo: "correta" },
      { letra: "B", texto: "A Cielo tem um bom suporte pos-venda.", tipo: "neutra" },
      { letra: "C", texto: "Nao vai dar problema, pode confiar.", tipo: "errada" },
    ],
    npcResposta: "Suporte noturno e importante para mim. Trabalhamos 24h aqui.",
  },
  {
    titulo: "CENA 10 - FECHAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Entao fica combinado: trago a proposta amanha as 9h. Se fizer sentido para voce, avancamos. Voce decide.", tipo: "correta" },
      { letra: "B", texto: "Vou preparar a proposta e te mando quando estiver pronto.", tipo: "neutra" },
      { letra: "C", texto: "Vamos fechar agora e resolver tudo de uma vez.", tipo: "errada" },
    ],
    npcResposta: "Amanha as 9h ta bom. Ate la.",
  },
];

const CAPITULO = "chapter3";
const FASE     = "posto";
const N_CENAS  = ROTEIRO.length;

const COR_NEUTRO  = 0x1d2b4a;
const COR_HOVER   = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA  = 0x1a3a5c;
const COR_ERRADA  = 0x6a1a1a;

export default class SceneDialogoPostoDeGasolina extends SceneDialogoBase {
    update() {
      if (this.estado === "fim" && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
        this._fechar();
      }
    }
  constructor() {
    super({ key: "SceneDialogoPostoDeGasolina" });
    this.imagemKey = "falaPosto";
  }

  init(dados) {
    super.init(dados);
    this.cenaIdx              = 0;
    this.pontuacaoFase        = 0;
    this.cieloCoinsGanhasDialogo = 0;
    this.estado               = "tutorial";
    this.aguardandoLLM        = false;
    this.escolhasOrdenadas    = [];
    initScoring(this.registry);
  }

  preload() {
    if (!this.textures.exists("falaPosto")) {
      this.load.image("falaPosto", "src/assets/imagens/imagensFalas/Posto - F.png");
    }
  }

  create() {
    const W  = this.scale.width;
    const H  = this.scale.height;
    const CX = W / 2;

    const IMG_H    = 660;
    const IMG_CY   = IMG_H / 2;
    const PANEL_TOP = IMG_H + 10;
    const PANEL_H   = H - PANEL_TOP - 10;
    const PANEL_CY  = PANEL_TOP + PANEL_H / 2;
    const PANEL_CX  = CX;

    this.add.rectangle(CX, H / 2, W, H, 0x0a0f1e).setDepth(0);

    this.imgNpc = this.add.image(CX, IMG_CY, "falaPosto")
      .setDepth(1).setDisplaySize(W, IMG_H);

    this.add.rectangle(PANEL_CX, PANEL_CY, W - 40, PANEL_H - 10, 0x111827, 0.95)
      .setStrokeStyle(2, 0x3b82f6).setDepth(2);

    const NOME_NPC = "Dono do Posto";
    this.textoNome = this.add.text(PANEL_CX - (W - 40) / 2 + 20, PANEL_TOP + 14, NOME_NPC, {
      fontSize: "18px", color: "#60a5fa", fontStyle: "bold", resolution: 4,
    }).setDepth(3).setVisible(false);

    this.textoCena = this.add.text(PANEL_CX, PANEL_TOP + 14, "", {
      fontSize: "14px", color: "#94a3b8", resolution: 4,
    }).setDepth(3).setOrigin(0.5, 0);

    this.textoNarracao = this.add.text(PANEL_CX, PANEL_TOP + 38, "", {
      fontSize: "16px", color: "#e2e8f0", wordWrap: { width: W - 100 },
      align: "center", resolution: 4,
    }).setDepth(3).setOrigin(0.5, 0);

    this.textoNpc = this.add.text(PANEL_CX, PANEL_TOP + 38, "", {
      fontSize: "16px", color: "#e2e8f0", wordWrap: { width: W - 100 },
      align: "center", resolution: 4,
    }).setDepth(3).setOrigin(0.5, 0);

    this.textoCarregando = this.add.text(PANEL_CX, PANEL_TOP + 38, "Aguardando resposta...", {
      fontSize: "16px", color: "#94a3b8", resolution: 4,
    }).setDepth(3).setOrigin(0.5, 0).setVisible(false);

    this.textoCieloCoin = this.add.text(W - 20, 20,
      `Cielo Coins: ${getScore(this.registry)}  (+0 aqui)`, {
      fontSize: "18px", color: "#fbbf24", fontStyle: "bold", resolution: 4,
    }).setDepth(10).setOrigin(1, 0);

    const BTN_W = W - 80;
    const BTN_H = 44;
    const BTN_X = CX;
    const LETRAS = ["A", "B", "C"];
    const btnBaseY = PANEL_TOP + PANEL_H * 0.38;

    this.botoesEscolha = LETRAS.map((letra, i) => {
      const by = btnBaseY + i * (BTN_H + 8);
      const bg = this.add.rectangle(BTN_X, by, BTN_W, BTN_H, COR_NEUTRO)
        .setStrokeStyle(1, 0x3b82f6).setDepth(3).setVisible(false).setInteractive();
      const labelLetra = this.add.text(BTN_X - BTN_W / 2 + 20, by, letra, {
        fontSize: "16px", color: "#60a5fa", fontStyle: "bold", resolution: 4,
      }).setDepth(4).setOrigin(0.5).setVisible(false);
      const txtEscolha = this.add.text(BTN_X - BTN_W / 2 + 44, by, "", {
        fontSize: "14px", color: "#e2e8f0", wordWrap: { width: BTN_W - 60 }, resolution: 4,
      }).setDepth(4).setOrigin(0, 0.5).setVisible(false);

      bg.on("pointerover",  () => { if (bg.visible) bg.setFillStyle(COR_HOVER); });
      bg.on("pointerout",   () => { if (bg.visible) bg.setFillStyle(COR_NEUTRO); });
      bg.on("pointerdown",  () => this._aoEscolher(i));
      return { bg, labelLetra, txtEscolha };
    });

    this.btnContinuar = this.add.rectangle(CX, PANEL_TOP + PANEL_H - 30, 220, 36, 0x1e40af)
      .setStrokeStyle(1, 0x3b82f6).setDepth(3).setVisible(false).setInteractive();
    this.txtContinuar = this.add.text(CX, PANEL_TOP + PANEL_H - 30, "Continuar  →", {
      fontSize: "15px", color: "#ffffff", resolution: 4,
    }).setDepth(4).setOrigin(0.5).setVisible(false);

    this.btnContinuar.on("pointerdown", () => this._aoContinuar());
    this.input.keyboard.on("keydown-E", () => this._aoContinuar());

    this._mostrarTutorial();
  }

  _mostrarTutorial() {
    this.textoNpc.setText(
      "Você entrou no Posto de Gasolina!\n\n" +
      "Este é um cliente de alto volume — erros custam caro!\n\n" +
      "• Capítulo 3: Corretas +300  |  Neutras +150  |  Erradas -50\n" +
      "• Foque nos problemas reais do cliente.\n\n" +
      "Pressione [E] ou clique em Continuar para começar."
    );
    this.textoCena.setText("Tutorial");
    this._mostrarContinuar("Começar  →");
  }

  _aoContinuar() {
    if (this.estado === "tutorial") { this.estado = "intro"; this._mostrarCena(0); return; }
    if (this.estado === "intro")    { this._mostrarEscolhas(); return; }
    if (this.estado === "resposta") {
      if (this.cenaIdx >= ROTEIRO.length - 1) { this._mostrarResultadoFinal(); }
      else { this._mostrarCena(this.cenaIdx + 1); }
      return;
    }
    if (this.estado === "fim") { this._fechar(); }
  }

  _mostrarCena(idx) {
    const cena = ROTEIRO[idx];
    this.cenaIdx = idx; this.estado = "intro"; this.aguardandoLLM = false;
    this.textoCena.setText(`${cena.titulo}  (${idx + 1} / ${ROTEIRO.length})`);
    this._esconderBotoes(); this._ocultarContinuar();
    this.textoCarregando.setVisible(false); this.textoNome.setVisible(false);
    this.textoNarracao.setText(cena.narracao || "");
    this.textoNpc.setText(cena.npcInicial ? `"${cena.npcInicial}"` : "");
    if (!cena.narracao && !cena.npcInicial) { this._mostrarEscolhas(); }
    else { this.textoNome.setVisible(!!cena.npcInicial); this._mostrarContinuar("Responder  →"); }
  }

  _mostrarEscolhas() {
    const cena = ROTEIRO[this.cenaIdx];
    this.estado = "escolha";
    this.textoNarracao.setText(""); this.textoNpc.setText("O que você diz?");
    this.textoNome.setVisible(false); this._ocultarContinuar();
    this.escolhasOrdenadas = shuffleArray(cena.escolhas);
    this.escolhasOrdenadas.forEach(({ texto }, i) => {
      const { bg, labelLetra, txtEscolha } = this.botoesEscolha[i];
      txtEscolha.setText(texto);
      bg.setFillStyle(COR_NEUTRO).setVisible(true);
      labelLetra.setVisible(true); txtEscolha.setVisible(true);
    });
  }

  async _aoEscolher(indice) {
    if (this.aguardandoLLM || this.estado !== "escolha") return;
    const cena   = ROTEIRO[this.cenaIdx];
    const escolha = this.escolhasOrdenadas[indice];
    const ganhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);
    this.pontuacaoFase           += ganhos;
    this.cieloCoinsGanhasDialogo += ganhos;
    this.textoCieloCoin.setText(`Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`);
    const coresTipo = { correta: COR_CORRETA, neutra: COR_NEUTRA, errada: COR_ERRADA };
    this.botoesEscolha[indice].bg.setFillStyle(coresTipo[escolha.tipo]);
    this._esconderBotoes(indice);
    this.aguardandoLLM = true; this.textoCarregando.setVisible(true); this.textoNpc.setText("");
    const respostaLLM = await this._chamarLLM(escolha, cena);
    this.aguardandoLLM = false; this.textoCarregando.setVisible(false);
    this.textoNome.setVisible(true); this.textoNpc.setText(`"${respostaLLM}"`);
    this.estado = "resposta"; this._mostrarContinuar("Próxima  →");
  }

  _mostrarResultadoFinal() {
    this.estado = "fim"; this._esconderBotoes(); this._ocultarContinuar();
    this.textoNarracao.setText(""); this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");
    const meta    = goalEscalado(FASE);
    const maxPts  = N_CENAS * 300;
    const atingiu = checkGoal(FASE, this.pontuacaoFase);
    const pct     = Math.round((this.pontuacaoFase / maxPts) * 100);
    let avaliacao, cor;
    if      (pct >= 90) { avaliacao = "Vendedor experiente! Negocio fechado."; cor = "#44ff88"; }
    else if (pct >= 70) { avaliacao = "Bom trabalho. Cliente convencido.";     cor = "#88ccff"; }
    else if (pct >= 50) { avaliacao = "Razoavel. Cuidado com as erradas.";     cor = "#ffcc44"; }
    else                { avaliacao = "Precisa melhorar. Tente de novo.";      cor = "#ff6644"; }
    const statusMeta = atingiu ? "✓ Meta atingida!" : `Meta: ${meta} moedas`;
    this.textoNpc.setText(
      `Conversa encerrada!\n\n` +
      `Coins nesta conversa: +${this.cieloCoinsGanhasDialogo}\n` +
      `${statusMeta}\n\n` + avaliacao
    ).setStyle({ color: cor });
    this._mostrarContinuar("Fechar  [E]");
  }

  _mostrarContinuar(label) { this.btnContinuar.setVisible(true); this.txtContinuar.setVisible(true).setText(label); }
  _ocultarContinuar()      { this.btnContinuar.setVisible(false); this.txtContinuar.setVisible(false); }

  _esconderBotoes(manter = -1) {
    this.botoesEscolha.forEach(({ bg, labelLetra, txtEscolha }, i) => {
      if (i !== manter) { bg.setVisible(false); labelLetra.setVisible(false); txtEscolha.setVisible(false); }
    });
  }

  async _chamarLLM(escolha, cena) {
    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") return cena.npcResposta;
    const guias = {
      correta: "O vendedor foi profissional. Responda de forma objetiva e positiva.",
      neutra:  "O vendedor foi aceitável. Responda de forma neutra.",
      errada:  "O vendedor foi superficial. Responda com ceticismo.",
    };
    const system =
      "Você é o dono de um posto de gasolina, objetivo e prático. " +
      "Responda em português do Brasil com 1-2 frases.\n" +
      `Contexto: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Referência: "${cena.npcResposta}"\n` + guias[escolha.tipo];
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user",   content: `O vendedor disse: "${escolha.texto}"` },
          ],
          max_tokens: 120, temperature: 0.7,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || cena.npcResposta;
    } catch { return cena.npcResposta; }
  }
}
