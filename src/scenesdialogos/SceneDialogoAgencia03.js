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
    titulo: "CENA 1 - CHEGADA / AMBIENTE",
    narracao: "Agencia tensa. Clima de cobranca intensa. Gerente apressado.\nAqui e o nivel mais exigente. Cada palavra conta.",
    npcInicial: "Bom dia. Pode falar, mas tenho pouco tempo.",
    escolhas: [
      { letra: "A", texto: "Entendo. Vou ser direto e objetivo.", tipo: "correta" },
      { letra: "B", texto: "Bom dia! Vim para fortalecer nossa parceria.", tipo: "neutra" },
      { letra: "C", texto: "Bom dia! Trouxe varias solucoes para apresentar.", tipo: "errada" },
    ],
    npcResposta: "Certo. Pode comecar.",
  },
  {
    titulo: "CENA 2 - POSICIONAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Analisei sua carteira e vi tres clientes com alto potencial de ativacao imediata.", tipo: "correta" },
      { letra: "B", texto: "Quero apresentar as novidades da Cielo para a agencia.", tipo: "neutra" },
      { letra: "C", texto: "Trouxe material sobre todos os produtos que temos disponíveis.", tipo: "errada" },
    ],
    npcResposta: "Quais sao esses clientes?",
  },
  {
    titulo: "CENA 3 - APRESENTACAO DE OPORTUNIDADES",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Um posto de gasolina com alto volume, uma loja de roupas em expansao e um supermercado sem solucao atual.", tipo: "correta" },
      { letra: "B", texto: "Clientes com perfil comercial que podem usar maquininha.", tipo: "neutra" },
      { letra: "C", texto: "Varios clientes que ainda nao tem a Cielo.", tipo: "errada" },
    ],
    npcResposta: "Interessante. Esses sao clientes relevantes.",
  },
  {
    titulo: "CENA 4 - OBJECAO SOBRE CONCORRENCIA",
    narracao: null,
    npcInicial: "Mas eles ja recebem proposta de outras operadoras toda semana.",
    escolhas: [
      { letra: "A", texto: "A diferenca esta no suporte 24h e na estabilidade da Cielo, que nao para o caixa do cliente.", tipo: "correta" },
      { letra: "B", texto: "A Cielo e mais conhecida e confiavel que a maioria.", tipo: "neutra" },
      { letra: "C", texto: "A Cielo tem melhores taxas do mercado.", tipo: "errada" },
    ],
    npcResposta: "Se voce tiver um argumento concreto, pode ajudar a convencer.",
  },
  {
    titulo: "CENA 5 - ESTRATEGIA DE ABORDAGEM",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Proponho visita conjunta com o gerente PJ. Sua presenca aumenta a credibilidade e facilita o fechamento.", tipo: "correta" },
      { letra: "B", texto: "Posso visitar esses clientes e trazer retorno depois.", tipo: "neutra" },
      { letra: "C", texto: "Vou ligar para eles hoje e ja apresentar a proposta.", tipo: "errada" },
    ],
    npcResposta: "Visita conjunta faz sentido. Qual seria o melhor momento?",
  },
  {
    titulo: "CENA 6 - GESTAO DO TEMPO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Sugiro esta semana, dois por dia, comecando pelos de maior volume para garantir resultado rapido.", tipo: "correta" },
      { letra: "B", texto: "Podemos combinar conforme sua agenda.", tipo: "neutra" },
      { letra: "C", texto: "Quando voce tiver disponivel, eu me adapto.", tipo: "errada" },
    ],
    npcResposta: "Estruturado assim fica mais facil de acompanhar.",
  },
  {
    titulo: "CENA 7 - OBJECAO DE META",
    narracao: null,
    npcInicial: "Nossa meta esta atrasada. Preciso de resultado essa semana, nao no mes que vem.",
    escolhas: [
      { letra: "A", texto: "Exatamente por isso foquei em clientes prontos para fechar. O posto ja pediu proposta.", tipo: "correta" },
      { letra: "B", texto: "Entendo a urgencia. Vou me esforcar para agilizar.", tipo: "neutra" },
      { letra: "C", texto: "Vou ver o que consigo fazer dentro do prazo.", tipo: "errada" },
    ],
    npcResposta: "Se o posto ja pediu proposta, isso muda o quadro. Vamos priorizar.",
  },
  {
    titulo: "CENA 8 - RETENCAO DE CARTEIRA",
    narracao: null,
    npcInicial: "Tenho um cliente antigo reclamando de taxa. Risco de cancelamento.",
    escolhas: [
      { letra: "A", texto: "Posso visitá-lo hoje e entender o caso. Muitas vezes renegociar a taxa mantem o cliente e aumenta o volume.", tipo: "correta" },
      { letra: "B", texto: "Posso entrar em contato com ele para tentar resolver.", tipo: "neutra" },
      { letra: "C", texto: "A gente pode oferecer um desconto para ele ficar.", tipo: "errada" },
    ],
    npcResposta: "Se voce resolver esse caso, libero minha agenda para as visitas conjuntas.",
  },
  {
    titulo: "CENA 9 - FOLLOW-UP E DISCIPLINA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Envio um resumo hoje com os tres clientes, o status do antigo e as datas das visitas.", tipo: "correta" },
      { letra: "B", texto: "Mando mensagem quando tiver novidade.", tipo: "neutra" },
      { letra: "C", texto: "Te aviso se fechar alguma coisa.", tipo: "errada" },
    ],
    npcResposta: "Perfeito. Essa organizacao e o que diferencia um bom parceiro.",
  },
  {
    titulo: "CENA 10 - ENCERRAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      { letra: "A", texto: "Agradeco o alinhamento. Vou executar o plano e trazer resultado concreto essa semana.", tipo: "correta" },
      { letra: "B", texto: "Obrigado pelo tempo. Ate mais.", tipo: "neutra" },
      { letra: "C", texto: "Entao ta, vou ver o que consigo.", tipo: "errada" },
    ],
    npcResposta: "Bom trabalho. Espero o retorno.",
  },
];

const CAPITULO = "chapter3";
const FASE     = "agency3";
const N_CENAS  = ROTEIRO.length;

const COR_NEUTRO  = 0x1d2b4a;
const COR_HOVER   = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA  = 0x1a3a5c;
const COR_ERRADA  = 0x6a1a1a;

export default class SceneDialogoAgencia03 extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoAgencia03" });
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
    if (!this.textures.exists("falaAgencia03")) {
      this.load.image("falaAgencia03", "src/assets/imagens/imagensFalas/Agência 03 - GG - F.png");
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

    // Fundo
    this.add.rectangle(CX, H / 2, W, H, 0x0a0f1e).setDepth(0);

    // Imagem NPC
    this.imgNpc = this.add.image(CX, IMG_CY, "falaAgencia03")
      .setDepth(1)
      .setDisplaySize(W, IMG_H);

    // Painel de diálogo
    const panelBg = this.add.rectangle(PANEL_CX, PANEL_CY, W - 40, PANEL_H - 10, 0x111827, 0.95)
      .setStrokeStyle(2, 0x3b82f6).setDepth(2);

    const NOME_NPC = "Gerente da Agência";
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

    // HUD de moedas
    this.textoCieloCoin = this.add.text(W - 20, 20,
      `Cielo Coins: ${getScore(this.registry)}  (+0 aqui)`, {
      fontSize: "18px", color: "#fbbf24", fontStyle: "bold", resolution: 4,
    }).setDepth(10).setOrigin(1, 0);

    // Botões de escolha
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

    // Botão continuar
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
      "Bem-vindo à Agência!\n\n" +
      "Você está interagindo com o Gerente Geral da agência mais exigente.\n\n" +
      "• Aqui é o Capítulo 3 — respostas erradas subtraem Cielo Coins!\n" +
      "• Corretas: +300  |  Neutras: +150  |  Erradas: -50\n" +
      "• Leia o contexto com atenção antes de responder.\n\n" +
      "Pressione [E] ou clique em Continuar para começar."
    );
    this.textoCena.setText("Tutorial");
    this._mostrarContinuar("Começar  →");
  }

  _aoContinuar() {
    if (this.estado === "tutorial") {
      this.estado = "intro";
      this._mostrarCena(0);
      return;
    }
    if (this.estado === "intro") {
      this._mostrarEscolhas();
      return;
    }
    if (this.estado === "resposta") {
      const ultimo = this.cenaIdx >= ROTEIRO.length - 1;
      if (ultimo) {
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

    this.textoNarracao.setText(cena.narracao || "");
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
    this.pontuacaoFase           += ganhos;
    this.cieloCoinsGanhasDialogo += ganhos;
    this.textoCieloCoin.setText(
      `Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
    );

    const coresTipo = { correta: COR_CORRETA, neutra: COR_NEUTRA, errada: COR_ERRADA };
    this.botoesEscolha[indice].bg.setFillStyle(coresTipo[escolha.tipo]);
    this._esconderBotoes(indice);

    this.aguardandoLLM = true;
    this.textoCarregando.setVisible(true);
    this.textoNpc.setText("");

    const respostaLLM = await this._chamarLLM(escolha, cena);

    this.aguardandoLLM = false;
    this.textoCarregando.setVisible(false);
    this.textoNome.setVisible(true);
    this.textoNpc.setText(`"${respostaLLM}"`);
    this.estado = "resposta";
    this._mostrarContinuar("Próxima  →");
  }

  _mostrarResultadoFinal() {
    this.estado = "fim";
    this._esconderBotoes();
    this._ocultarContinuar();

    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");

    const meta    = goalEscalado(FASE);
    const maxPts  = N_CENAS * 300; // chapter3: 300 por correta
    const atingiu = checkGoal(FASE, this.pontuacaoFase);
    const pct     = Math.round((this.pontuacaoFase / maxPts) * 100);

    let avaliacao, cor;
    if      (pct >= 90) { avaliacao = "Parceiro exemplar! Agencia conquistada."; cor = "#44ff88"; }
    else if (pct >= 70) { avaliacao = "Bom desempenho. Quase perfeito.";          cor = "#88ccff"; }
    else if (pct >= 50) { avaliacao = "Razoavel. Cuidado com as erradas.";        cor = "#ffcc44"; }
    else                { avaliacao = "Precisa melhorar muito. Tente de novo.";   cor = "#ff6644"; }

    const statusMeta = atingiu ? "✓ Meta atingida!" : `Meta: ${meta} moedas`;

    this.textoNpc.setText(
      `Conversa encerrada!\n\n` +
      `Coins nesta conversa: +${this.cieloCoinsGanhasDialogo}\n` +
      `${statusMeta}\n\n` +
      avaliacao
    ).setStyle({ color: cor });

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
    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") return cena.npcResposta;

    const guias = {
      correta: "O vendedor foi estratégico e demonstrou preparo. Responda de forma objetiva e positiva.",
      neutra:  "O vendedor foi aceitável mas sem impacto. Responda de forma neutra.",
      errada:  "O vendedor foi superficial. Responda com ceticismo, sem encerrar.",
    };

    const system =
      "Você é o Gerente Geral de uma agência bancária experiente e exigente. " +
      "Responda em português do Brasil com 1-2 frases curtas.\n" +
      `Contexto: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de referência: "${cena.npcResposta}"\n` +
      guias[escolha.tipo];

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
          max_tokens: 120,
          temperature: 0.7,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || cena.npcResposta;
    } catch {
      return cena.npcResposta;
    }
  }
}
