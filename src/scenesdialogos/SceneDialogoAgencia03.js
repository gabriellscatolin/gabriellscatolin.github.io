import SceneDialogoBase from "./SceneDialogoBase.js";
import {
  initScoring,
  handleAnswer,
  checkGoal,
  getScore,
  goalEscalado,
} from "../scoring.js";

// Embaralha as alternativas para evitar padrão fixo nas respostas
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

// Configuração da LLM usada para respostas dinâmicas quando necessário
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Roteiro da conversa com o gerente geral, centrado em pressão operacional e controle
const ROTEIRO_GG = [
  {
    titulo: "ETAPA 1 - ABORDAGEM INICIAL",
    narracao:
      "Ambiente: Agência desgastada, filas longas, clima tenso. Atendimento pressionado, equipe visivelmente sobrecarregada. O GG fala sem tirar os olhos da operação.",
    npcInicial: "Fala rápido. Tá vendo como isso aqui tá hoje.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. Sou da Cielo e passei pra entender a operação e ver onde consigo apoiar com os clientes PJ.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Direto, respeita o momento e não entra em atrito.",
      },
      {
        letra: "B",
        texto:
          "Tudo bem. Sou da Cielo e estou passando hoje pra me apresentar e entender melhor como vocês trabalham aqui.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Educado, mas não se adapta ao nível de pressão.",
      },
      {
        letra: "C",
        texto:
          "Assim fica difícil explicar tudo que posso fazer pelos clientes e pela agência nesse tipo de situação.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Reage ao ambiente e cria tensão desnecessária.",
      },
    ],
    npcResposta: "Certo. Então me diz logo qual é a diferença do seu apoio aqui.",
  },
  {
    titulo: "ETAPA 2 - POSICIONAMENTO E INTENÇÃO",
    narracao: null,
    npcInicial: "Todo mundo fala isso. Qual a diferença na prática?",
    escolhas: [
      {
        letra: "A",
        texto:
          "A ideia é atuar com vocês na carteira PJ, ajudando a resolver pontos do dia a dia e trazendo oportunidades alinhadas.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Foco prático, sem confronto e sem promessa vazia.",
      },
      {
        letra: "B",
        texto:
          "A ideia é entender melhor os clientes da carteira PJ e ver onde posso apoiar conforme as oportunidades aparecerem.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Seguro, mas pouco convincente para esse contexto.",
      },
      {
        letra: "C",
        texto:
          "A diferença é que consigo melhorar condições e ajustar soluções direto com os clientes que vocês têm hoje.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Foco em troca e preço, ignora o papel do GG.",
      },
    ],
    npcResposta: "Aqui ninguém fala com cliente sem alinhamento. O que você vai fazer então?",
  },
  {
    titulo: "ETAPA 3 - TRANSIÇÃO PARA AÇÃO (BLOQUEIO)",
    narracao: null,
    npcInicial: "Aqui ninguém fala com cliente sem alinhamento. O que você vai fazer então?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. Podemos ver juntos quais clientes fazem sentido e eu abordo de forma objetiva, te retornando depois.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Respeita controle, reduz risco e mantém parceria.",
      },
      {
        letra: "B",
        texto:
          "Posso falar com alguns clientes de forma rápida e depois te atualizo sobre o que eu encontrar por aqui.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Vai para ação, mas não respeita totalmente o bloqueio.",
      },
      {
        letra: "C",
        texto:
          "Posso ir falando com alguns clientes e depois a gente vê o que faz sentido seguir com eles.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Ignora o limite imposto e força a situação.",
      },
    ],
    npcResposta: "Se for com alinhamento e retorno claro, aí eu consigo sustentar isso aqui dentro.",
  },
];

// Roteiro alternativo para a conversa com o gerente PJ em um contexto de baixa confiança
const ROTEIRO_PJ = [
  {
    titulo: "ETAPA 1 - RETOMADA DE RELAÇÃO",
    narracao:
      "Ambiente: Agência degradada, atendimento pressionado e clima de baixa confiança. O PJ está mais duro no discurso e parte de um histórico ruim de execução.",
    npcInicial: "Você voltou… espero que não seja pra repetir o que já não funcionou aqui.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Justo. Não vim repetir, vim entender o que não funcionou e ver como ajustamos isso daqui pra frente.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Reconhece o histórico e reduz resistência sem confronto.",
      },
      {
        letra: "B",
        texto:
          "Entendo. Voltei pra retomar o contato e ver se conseguimos evoluir melhor nas oportunidades da carteira.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas não enfrenta o problema diretamente.",
      },
      {
        letra: "C",
        texto:
          "Voltei porque agora temos condições melhores e acredito que vale tentar de novo com esses clientes.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Ignora o histórico e força uma nova tentativa.",
      },
    ],
    npcResposta: "O problema aqui nunca foi oportunidade. Foi execução. E isso já deu problema com cliente.",
  },
  {
    titulo: "ETAPA 2 - RESGATE DE CREDIBILIDADE",
    narracao: null,
    npcInicial: "O problema aqui nunca foi oportunidade. Foi execução. E isso já deu problema com cliente.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito, então vamos focar na execução. Prefiro ajustar isso primeiro antes de abrir qualquer nova frente com cliente.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Alinha com a dor real e mostra maturidade.",
      },
      {
        letra: "B",
        texto:
          "Entendo. Podemos tentar conduzir melhor dessa vez e acompanhar mais de perto tudo que for feito com os clientes.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Intenção válida, mas ainda genérica.",
      },
      {
        letra: "C",
        texto:
          "Entendo, mas acredito que agora conseguimos performar melhor e trazer resultados mais rápidos pra esses clientes.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Promessa sem base, aumenta desconfiança.",
      },
    ],
    npcResposta: "Hoje eu não vou sair pra visita, nem agora nem depois. Se quiser ir no posto, você vai sozinho.",
  },
  {
    titulo: "ETAPA 3 - DIRECIONAMENTO SEM APOIO",
    narracao: null,
    npcInicial: "Hoje eu não vou sair pra visita, nem agora nem depois. Se quiser ir no posto, você vai sozinho.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. Posso ir no posto, conduzir de forma objetiva e depois te trago um retorno claro do que foi alinhado.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Assume responsabilidade sem romper alinhamento.",
      },
      {
        letra: "B",
        texto:
          "Tudo bem. Posso ir no posto sozinho e depois te atualizo sobre o que acontecer por lá com o cliente.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Vai para ação, mas sem reforçar controle.",
      },
      {
        letra: "C",
        texto:
          "Tudo bem. Vou no posto e já tento resolver tudo por lá pra ver se consigo fechar alguma coisa com o cliente.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Foco em fechar, ignora a questão de execução.",
      },
    ],
    npcResposta: "Só não quero retrabalho depois. Se der problema lá, sobra pra mim aqui dentro.",
  },
  {
    titulo: "ETAPA 4 - COMPROMISSO DE RELAÇÃO",
    narracao: null,
    npcInicial: "Só não quero retrabalho depois. Se der problema lá, sobra pra mim aqui dentro.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Combinado. Vou priorizar clareza no que for combinado e te alinhar antes de qualquer avanço com o cliente.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Reduz risco e reforça confiança.",
      },
      {
        letra: "B",
        texto:
          "Pode deixar. Vou conduzir com cuidado e depois te explico direitinho como foi a conversa com o cliente.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Intenção correta, mas pouco concreta.",
      },
      {
        letra: "C",
        texto:
          "Pode ficar tranquilo que dessa vez não deve dar problema com o cliente nem com o que for combinado lá.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Minimiza o risco e não gera confiança.",
      },
    ],
    npcResposta: "Se vier com clareza e sem improviso, aí sim faz sentido seguir.",
  },
];

// Capítulo usado pelo sistema global de pontuação
const CAPITULO = "chapter3";

// Cores usadas no estado padrão, hover e feedback das respostas
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoAgencia03 extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoAgencia03" });
    // Valor padrão antes da definição do tipo real de diálogo no init
    this.imagemKey = "falaAgencia03GG";
    this.respostaRoteiroEstrita = true;
    this.promptLLM = "";
  }

  init(dados) {
    super.init(dados);
    // Define se o diálogo atual será com o GG ou com o PJ da agência
    const tipoDialogo =
      dados?.tipoDialogo === "PJ" || dados?.npc === "PJ" ? "PJ" : "GG";

    // Seleciona roteiro, fase, arte e perfil da NPC conforme o tipo desta conversa
    this.tipoDialogo = tipoDialogo;
    this.fase = tipoDialogo === "PJ" ? "agency3_pj" : "agency3_gg";
    this.roteiro = tipoDialogo === "PJ" ? ROTEIRO_PJ : ROTEIRO_GG;
    this.maxPts = this.roteiro.length * 300;
    this.nomeNpcDialogo = tipoDialogo;
    this.promptLLM =
      tipoDialogo === "PJ"
        ? "Você é o gerente PJ da Agência 03. Seja seco, cauteloso e focado em execução."
        : "Você é o Gerente Geral da Agência 03. Seja seco, objetivo e pressionado pela operação.";
    this.imagemKey = tipoDialogo === "PJ" ? "falaAgencia03PJ" : "falaAgencia03GG";
    // Estado base usado pelo fluxo inteiro da conversa
    this.cenaIdx = 0;
    this.pontuacao = 0;
    this.cieloCoinsGanhasDialogo = 0;
    this.estado = "tutorial";
    this.aguardandoLLM = false;
    this.escolhaAtual = null;
    this.respostaAtualNpc = "";

    initScoring(this.registry);
  }

  preload() {
    // Carrega as duas variações de arte para GG e PJ desta agência
    if (!this.textures.exists("falaAgencia03GG")) {
      this.load.image(
        "falaAgencia03GG",
        "src/assets/imagens/imagensFalas/Agência 03 - GG - B.png",
      );
    }
    if (!this.textures.exists("falaAgencia03PJ")) {
      this.load.image(
        "falaAgencia03PJ",
        "src/assets/imagens/imagensFalas/Agência 03 - PJ - B.png",
      );
    }
  }

  create() {
    // Medidas-base para organizar imagem, painel de texto e botões
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

    // Guarda a posição do botão de continuar para reaproveitar em outros estados
    this._CONT_Y = CONT_Y;

    // Camada escura para destacar a interface do diálogo
    this.add
      .rectangle(CX, H / 2, W, H, 0x000000, 0.78)
      .setScrollFactor(0)
      .setDepth(0)
      .setInteractive();

    // Arte principal da cena, trocada conforme GG ou PJ
    const img = this.add
      .image(CX, IMG_CY, this.imagemKey)
      .setScrollFactor(0)
      .setDepth(1)
      .setOrigin(0.5);
    const escala = Math.min(W / img.width, IMG_H / img.height);
    img.setScale(escala);

    // Painel inferior onde ficam fala, narrativa e escolhas
    this.add
      .rectangle(CX, PANEL_CY, W, PANEL_H, 0x060d1a, 0.96)
      .setScrollFactor(0)
      .setDepth(2);
    this.add
      .rectangle(CX, PANEL_TOP, W, 3, 0x2a5ba0)
      .setScrollFactor(0)
      .setDepth(3);

    // Nome do interlocutor exibido apenas quando há fala direta da NPC
    this.textoNome = this.add
      .text(
        CX - BTN_W / 2,
        NOME_Y,
        `${this.nomeNpcDialogo}  -  Agência 03`,
        {
          fontSize: "20px",
          color: "#5a9fd4",
          fontStyle: "bold",
          resolution: 4,
        },
      )
      .setScrollFactor(0)
      .setDepth(3)
      .setVisible(false);

    // Texto de contextualização usado nas aberturas das cenas
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

    // Campo principal para a fala da NPC
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

    // Título do feedback após o jogador escolher uma alternativa
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

    // Mensagem explicando por que a escolha foi correta, neutra ou errada
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

    // Cria os três botões reutilizáveis das alternativas A, B e C
    this.botoesEscolha = BTN_Y.map((by, i) => {
      const letra = ["A", "B", "C"][i];

      // Fundo clicável da alternativa
      const bg = this.add
        .rectangle(CX, by + BTN_H / 2, BTN_W, BTN_H, COR_NEUTRO)
        .setScrollFactor(0)
        .setDepth(3)
        .setStrokeStyle(1, 0x3a5ba0)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      // Indicador visual da letra da alternativa
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

      // Texto principal da resposta escolhível
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

      // Estados visuais simples para deixar clara a interação disponível
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

    // Botão único usado para responder, continuar ou fechar o diálogo
    this.btnContinuar = this.add
      .rectangle(CX, CONT_Y, 340, 56, 0x1a5c1a)
      .setScrollFactor(0)
      .setDepth(3)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    // Texto interno do botão de continuar, alterado conforme o estado
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

    // Mensagem temporária exibida enquanto a próxima fala é preparada
    this.textoCarregando = this.add
      .text(CX, CONT_Y, `${this.nomeNpcDialogo} está pensando...`, {
        fontSize: "21px",
        color: "#99bbdd",
        fontStyle: "italic",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4)
      .setVisible(false);

    // HUD local para mostrar o total global e o ganho acumulado nesta conversa
    this.textoCieloCoin = this.add
      .text(W - 20, 16, "Cielo Coins: 0", {
        fontSize: "30px",
        color: "#ffd700",
        backgroundColor: "#000000bb",
        padding: { x: 10, y: 5 },
        resolution: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);
    this._atualizarHudMoedas();

    // Indicador do progresso dentro do roteiro atual
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

    // Atalho de fechamento usado no final do diálogo
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Antes de começar, exibe uma tela curta explicando a dinâmica da fase
    this._criarTutorial(W, H, CX, H / 2);
  }

  update() {
    // Permite encerrar a cena final também pelo teclado
    if (this.estado === "fim" && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this._fechar();
    }
  }

  _criarTutorial(W, H, CX, CY) {
    const els = [];
    const D = 5;

    // Overlay que bloqueia a interação com a conversa até o jogador iniciar
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
    // Título e divisor visual do tutorial
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
      // Resume o objetivo geral da conversa
      {
        icone: "•",
        texto: `Você vai conduzir a conversa na Agência 03.`,
      },
      {
        icone: "•",
        texto:
          "A cada etapa, escolha entre três opções de resposta a que mais fizer sentido para o contexto.",
      },
      {
        icone: "•",
        texto:
          "Cada escolha vale Cielo Coins. Resposta correta = +300. Neutra = +150. Errada = -50",
      },
    ];

    // Monta visualmente as regras em linhas com ícone e descrição
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
    // Botão que fecha o tutorial e libera o início do roteiro
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
    // Carrega a cena correspondente do roteiro e limpa resíduos da etapa anterior
    const cena = this.roteiro[idx];
    this.cenaIdx = idx;
    this.estado = "intro";
    this.aguardandoLLM = false;
    this.escolhaAtual = null;
    this.respostaAtualNpc = "";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);

    this.textoCena.setText(
      `${cena.titulo}  (${idx + 1} / ${this.roteiro.length})`,
    );
    this._esconderBotoes();
    this._ocultarContinuar();
    this.textoCarregando.setVisible(false);
    this.textoNome.setVisible(false);

    this.textoNarracao.setText(cena.narracao || "");
    this.textoNpc.setText(cena.npcInicial ? `"${cena.npcInicial}"` : "");

    // Se a cena já começa sem fala introdutória, pula direto para as escolhas
    if (!cena.narracao && !cena.npcInicial) {
      this._mostrarEscolhas();
    } else {
      this.textoNome.setVisible(!!cena.npcInicial);
      this._mostrarContinuar("Responder  ->");
    }
  }

  _mostrarEscolhas() {
    // Troca a interface para o modo de decisão do jogador
    const cena = this.roteiro[this.cenaIdx];
    this.estado = "escolha";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);

    this.textoNarracao.setText("");
    this.textoNpc.setText("O que você diz?");
    this.textoNome.setVisible(false);
    this._ocultarContinuar();

    // Embaralha e preenche os três botões com as respostas da cena atual
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
    // Exibe a leitura pedagógica da alternativa antes da reação da NPC
    this.estado = "feedback";

    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoNpc.setVisible(false);

    this.textoFeedbackTitulo
      .setText(escolha.feedbackTitulo || "Feedback")
      .setVisible(true);

    this.textoFeedback
      .setText(escolha.feedbackTexto || "Feedback da escolha.")
      .setVisible(true);

    this._mostrarContinuar("Continuar  ->");
  }

  _mostrarRespostaNpc(resposta) {
    // Mostra a fala da NPC depois do feedback da escolha
    this.estado = "resposta";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);

    this.textoNarracao.setText("");
    this.textoNome.setVisible(true);
    this.textoNpc.setVisible(true);
    this.textoNpc.setText(`"${resposta}"`);

    const ultimo = this.cenaIdx >= this.roteiro.length - 1;
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Próxima cena  ->");
  }

  async _aoEscolher(indice) {
    // Processa a alternativa escolhida, atualiza pontuação e prepara a reação da NPC
    if (this.aguardandoLLM || this.estado !== "escolha") return;

    // Recupera a alternativa clicada dentro da ordem embaralhada visível
    const cena = this.roteiro[this.cenaIdx];
    const escolha = this.escolhasOrdenadas[indice];
    const pontosGanhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);

    // Guarda a escolha e atualiza a pontuação local/global
    this.escolhaAtual = escolha;
    this.pontuacao += pontosGanhos;
    this.cieloCoinsGanhasDialogo += pontosGanhos;
    this._atualizarHudMoedas();

    if (escolha.tipo === "correta") {
      this.botoesEscolha[indice].bg.setFillStyle(COR_CORRETA);
    } else if (escolha.tipo === "errada") {
      this.botoesEscolha[indice].bg.setFillStyle(COR_ERRADA);
    } else {
      this.botoesEscolha[indice].bg.setFillStyle(COR_NEUTRA);
    }

    // Bloqueia novas interações até concluir a reação da NPC
    this.aguardandoLLM = true;
    this._esconderBotoes(indice);
    this.textoCarregando.setVisible(true);

    await esperar(350);

    // Busca a resposta da NPC e guarda para a próxima etapa do fluxo
    const resposta = await this._chamarLLM(escolha, cena);
    this.respostaAtualNpc = resposta;

    this.aguardandoLLM = false;
    this.textoCarregando.setVisible(false);
    this._esconderBotoes();

    this._mostrarFeedbackEscolha(escolha);
  }

  _aoContinuar() {
    // Centraliza as transições entre introdução, feedback, resposta e fim
    if (this.estado === "intro") {
      this._mostrarEscolhas();
    } else if (this.estado === "feedback") {
      this._mostrarRespostaNpc(this.respostaAtualNpc);
    } else if (this.estado === "resposta") {
      if (this.cenaIdx >= this.roteiro.length - 1) {
        this._mostrarResultadoFinal();
      } else {
        this._mostrarCena(this.cenaIdx + 1);
      }
    } else if (this.estado === "fim") {
      this._fechar();
    }
  }

  _mostrarResultadoFinal() {
    // Tela final com percentual, meta atingida e atualização do progresso
    this.estado = "fim";
    this._esconderBotoes();
    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);
    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");

    const atingiu = checkGoal(this.fase, this.pontuacao);
    const meta = goalEscalado(this.fase);
    const pct = Math.round((this.pontuacao / this.maxPts) * 100);

    let avaliacao;
    let cor;
    if (pct >= 55) {
      avaliacao = "Excelente condução!";
      cor = "#44ff88";
    } else {
      avaliacao = "Tente novamente para fortalecer a relação e a execução.";
      cor = "#ff6644";
    }

    const resumo =
      this.tipoDialogo === "GG"
        ? "Competências avaliadas:\n- Leitura de ambiente\n- Objetividade sob pressão\n- Respeito ao controle da agência"
        : "Competências avaliadas:\n- Resgate de credibilidade\n- Execução sem apoio\n- Compromisso de relação";

    const statusMeta = atingiu
      ? "Meta atingida!"
      : `Meta não atingida (precisava de ${meta} coins)`;

    // Reaproveita o campo principal de fala para mostrar o resumo final
    this.textoNpc
      .setText(
        `${resumo}\n\nCoins da fase: ${this.pontuacao} / ${this.maxPts} (${pct}%)\n` +
          `Total da sessão: ${getScore(this.registry)}\n\n` +
          `${statusMeta}\n${avaliacao}`,
      )
      .setStyle({
        color: cor,
        fontSize: "26px",
      })
      .setOrigin(0.5, 0)
      .setPosition(
        this.scale.width / 2,
        this.scale.height - (this.scale.height - 670) + 15,
      );

    // Atualiza o progresso do jogo conforme o NPC concluído nesta agência
    if (this.tipoDialogo === "GG") {
      this.registry.set("ag03_dialogo_gg_concluido", true);
    } else {
      this.registry.set("ag03_dialogo_pj_concluido", true);
    }

    this._mostrarContinuar("Fechar  [E]");
  }

  _mostrarContinuar(label) {
    // Mostra o botão principal com o texto adequado ao momento
    this.btnContinuar.setVisible(true);
    this.txtContinuar.setVisible(true).setText(label);
  }

  _ocultarContinuar() {
    // Esconde temporariamente o botão principal
    this.btnContinuar.setVisible(false);
    this.txtContinuar.setVisible(false);
  }

  _esconderBotoes(manter = -1) {
    // Oculta todas as alternativas, exceto a que deve permanecer destacada
    this.botoesEscolha.forEach(({ bg, labelLetra, txtEscolha }, i) => {
      if (i !== manter) {
        bg.setVisible(false);
        labelLetra.setVisible(false);
        txtEscolha.setVisible(false);
      }
    });
  }

  _atualizarHudMoedas() {
    // Atualiza o HUD com o total acumulado e o ganho desta conversa
    if (!this.textoCieloCoin) return;
    this.textoCieloCoin.setText(
      `Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
    );
  }

  async _chamarLLM(escolha, cena) {
    // Usa a resposta fixa do roteiro ou tenta gerar uma variante contextual
    if (this.respostaRoteiroEstrita) {
      return cena.npcResposta;
    }

    // Sem chave válida, mantém o diálogo funcional usando o fallback do roteiro
    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
      return cena.npcResposta;
    }

    const guias = {
      correta:
        "O jogador fez uma abordagem excelente. Responda de forma objetiva e profissional.",
      neutra: "O jogador foi aceitável. Responda de forma neutra e contida.",
      errada: "O jogador errou a abordagem. Responda de forma seca, sem encerrar a conversa.",
    };

    const system =
      `${this.promptLLM}\n` +
      "Responda em português do Brasil, em 1-2 frases.\n" +
      `Contexto: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de referência: "${cena.npcResposta}"\n` +
      `${guias[escolha.tipo]}`;

    try {
      // Gera uma resposta curta contextualizada pela cena e pela escolha do jogador
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
            { role: "user", content: `O jogador disse: "${escolha.texto}"` },
          ],
          max_tokens: 120,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || cena.npcResposta;
    } catch (err) {
      // Em falha de rede/API, volta para a resposta pré-definida do roteiro
      console.warn(
        "[SceneDialogoAgencia03] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
