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

// Roteiro da conversa com o gerente geral, focado em objetividade e leitura de contexto
const ROTEIRO_GG = [
  {
    titulo: "ETAPA 1 - ABORDAGEM INICIAL",
    narracao:
      "Ambiente: Agência elegante, com mármore, iluminação fria e acabamento impecável. Espaço silencioso, clientes bem vestidos, atendimento eficiente e sem excesso de proximidade. A equipe é profissional, mas distante. O GG mantém postura objetiva, cordial, porém sem abertura.",
    npcInicial: "Oi… tudo bem. Pode falar, estou com um pouco de pressa.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito, vou ser direto. Sou da Cielo e estou passando pra entender a operação e ver como posso apoiar vocês com os clientes PJ.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Leitura correta do contexto. Objetivo e respeitoso com o tempo do GG.",
      },
      {
        letra: "B",
        texto:
          "Oi, tudo bem. Sou da Cielo e estou passando hoje na agência pra me apresentar e conhecer melhor a operação de vocês.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Educado, mas não se adapta à pressa. Pode perder atenção.",
      },
      {
        letra: "C",
        texto:
          "Oi, tudo bem. Sou da Cielo e queria te explicar melhor tudo que a gente pode oferecer para os clientes da agência.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Ignora o contexto e tenta alongar a conversa. Baixa aderência.",
      },
    ],
    npcResposta: "Certo, siga em frente. O que você precisa alinhar aqui hoje?",
  },
  {
    titulo: "ETAPA 2 - POSICIONAMENTO E INTENÇÃO",
    narracao: null,
    npcInicial: "Certo… mas hoje está bem corrido. Como você pretende ajudar aqui?",
    escolhas: [
      {
        letra: "A",
        texto:
          "A ideia é atuar junto com vocês na carteira PJ, apoiando nas oportunidades e ajudando a resolver pontos do dia a dia que impactam o atendimento.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Responde com valor prático e foco na dor real da agência.",
      },
      {
        letra: "B",
        texto:
          "A ideia é entender melhor os clientes da carteira PJ e ver onde posso apoiar conforme as oportunidades que forem surgindo.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas ainda genérico e pouco conectado ao momento.",
      },
      {
        letra: "C",
        texto:
          "A ideia é identificar clientes que possam trocar as soluções atuais e avaliar onde conseguimos melhorar as condições para eles.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Foco em venda e troca. Não responde à pressão do GG.",
      },
    ],
    npcResposta: "Entendi. Se for objetivo, faz sentido. O que você sugere agora?",
  },
  {
    titulo: "ETAPA 3 - TRANSIÇÃO PARA AÇÃO (LIBERAÇÃO)",
    narracao: null,
    npcInicial: "Tudo bem… mas tenta ser rápido. O que você sugere fazer agora?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. Posso falar com alguns clientes agora de forma objetiva e depois te trago um resumo do que identifiquei para alinharmos juntos.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Respeita o tempo, propõe ação e mantém alinhamento com o GG.",
      },
      {
        letra: "B",
        texto:
          "Perfeito. Posso falar com alguns clientes agora e depois te atualizo sobre o que eu encontrar por aqui.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Vai para ação, mas não reforça o alinhamento conjunto.",
      },
      {
        letra: "C",
        texto:
          "Perfeito. Vou falar com alguns clientes agora e já sigo com as oportunidades que aparecerem ao longo do dia.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Assume autonomia total e ignora o contexto de pressa e controle.",
      },
    ],
    npcResposta: "Combinado. Me traga esse resumo depois para fecharmos os próximos passos.",
  },
];

// Roteiro alternativo para a conversa com a gerente PJ da agência
const ROTEIRO_PJ = [
  {
    titulo: "ETAPA 1 - ABORDAGEM INICIAL",
    narracao:
      "Ambiente: Agência elegante, com mármore, iluminação fria e atendimento silencioso. Clientes exigentes, equipe eficiente e pouco expansiva. O PJ é profissional, direto e seletivo no uso do tempo.",
    npcInicial: "Bom dia. Pode falar, estou com a agenda um pouco apertada.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito, vou ser direto. Sou da Cielo e passei pra alinhar oportunidades da carteira PJ junto com a operação da agência.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Leitura correta do contexto e alinhamento com a agência.",
      },
      {
        letra: "B",
        texto:
          "Bom dia. Sou da Cielo e estou passando hoje na agência pra me apresentar e entender melhor a operação de vocês.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Educado, mas não se adapta ao nível de objetividade.",
      },
      {
        letra: "C",
        texto:
          "Bom dia. Sou da Cielo e queria te explicar melhor tudo que podemos oferecer para os clientes da agência.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Tenta alongar a conversa e perde aderência ao contexto.",
      },
    ],
    npcResposta: "Tudo bem. O que você identificou de relevante nessa carteira?",
  },
  {
    titulo: "ETAPA 2 - GERAÇÃO DE INTERESSE",
    narracao: null,
    npcInicial: "Certo. O que você identificou de relevante na carteira?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Analisei alguns clientes da sua carteira com bom potencial e que podem evoluir com a Cielo integrada ao banco, gerando mais resultado para a agência.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Reforça parceria estratégica e conecta com resultado.",
      },
      {
        letra: "B",
        texto:
          "Analisei alguns clientes da carteira e acredito que existem oportunidades onde as soluções da Cielo podem ser aplicadas.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas não explora a integração com o banco.",
      },
      {
        letra: "C",
        texto:
          "Analisei alguns clientes que podem trocar a solução atual e aproveitar melhores condições nas operações que realizam.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Foco em troca e preço, sem valor institucional.",
      },
    ],
    npcResposta: "Entendi. E quais clientes você está priorizando agora?",
  },
  {
    titulo: "ETAPA 3 - PRIORIZAÇÃO DA CARTEIRA",
    narracao: null,
    npcInicial: "Entendi. Quais clientes você está priorizando agora?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Separei três perfis com potencial: uma loja de roupas, um restaurante e um supermercado que podem evoluir com banco e Cielo atuando juntos.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Prioriza com clareza e reforça atuação conjunta.",
      },
      {
        letra: "B",
        texto:
          "Separei alguns clientes com perfis diferentes e acredito que podemos avaliar juntos quais fazem mais sentido abordar neste momento.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas menos direto na priorização.",
      },
      {
        letra: "C",
        texto:
          "Separei alguns clientes variados e posso começar abordando para entender onde surgem melhores oportunidades comerciais.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Falta critério claro e reduz eficiência.",
      },
    ],
    npcResposta: "Certo. E como você pretende conduzir isso daqui pra frente?",
  },
  {
    titulo: "ETAPA 4 - TRANSIÇÃO PARA AÇÃO",
    narracao: null,
    npcInicial: "Tudo bem. Como você pretende conduzir isso?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Posso começar por esses clientes de forma objetiva e depois te trago um retorno para alinharmos os próximos passos juntos.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Respeita o tempo, mantém controle compartilhado e estrutura o processo.",
      },
      {
        letra: "B",
        texto:
          "Posso falar com esses clientes e depois te atualizo sobre o que eu identificar ao longo das abordagens.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Vai para ação, mas reduz o alinhamento conjunto.",
      },
      {
        letra: "C",
        texto:
          "Posso falar com esses clientes e seguir com as oportunidades conforme elas forem surgindo durante o dia.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Assume autonomia total e reduz o controle do PJ.",
      },
    ],
    npcResposta: "Perfeito. Me traga esse retorno depois e alinhamos os próximos passos.",
  },
];

// Capítulo usado pelo sistema global de pontuação
const CAPITULO = "chapter2";

// Cores usadas no estado padrão, hover e feedback das respostas
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoAgencia02 extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoAgencia02" });
    // Valor padrão antes da definição do NPC real no init
    this.imagemKey = "falaAgencia02GG";
    this.respostaRoteiroEstrita = true;
    this.promptLLM = "";
  }

  init(dados) {
    super.init(dados);
    // Define qual NPC será usado e reinicia o estado do diálogo
    const npcAlvo = dados?.npc === "Camila" ? "Camila" : "Enzo";
    const ehGG = npcAlvo === "Enzo";

    // Seleciona roteiro, fase, arte e perfil da NPC conforme o alvo desta conversa
    this.npcAlvo = npcAlvo;
    this.tipoDialogo = ehGG ? "GG" : "PJ";
    this.fase = ehGG ? "agency2_gg" : "agency2_pj";
    this.roteiro = ehGG ? ROTEIRO_GG : ROTEIRO_PJ;
    this.maxPts = this.roteiro.length * 200;
    this.nomeNpcDialogo = npcAlvo;
    this.promptLLM = ehGG
      ? "Você é o Gerente Geral (GG) da Agência 02. Seja objetivo, cordial e profissional."
      : "Você é o Gerente PJ da Agência 02. Seja objetivo, profissional e seletivo no uso do tempo.";
    this.imagemKey = ehGG ? "falaAgencia02GG" : "falaAgencia02PJ";
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
    // Carrega as duas artes possíveis para reaproveitar a mesma cena
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
        `${this.nomeNpcDialogo}  -  Agência 02`,
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
      .text(W - 20, 16, "Cielo Coins: 0 / 600", {
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
        icone: "🎯",
        texto: `Você vai conduzir a conversa com ${this.nomeNpcDialogo} na Agência 02.`,
      },
      {
        icone: "💬",
        texto:
          "A cada etapa, escolha entre três opções de resposta a que mais fizer sentido para o contexto.",
      },
      {
        icone: "🪙",
        texto:
          "Cada escolha vale Cielo Coins. Resposta correta = +200. Neutra = +100. Errada = +0",
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
    if (pct >= 60) {
      avaliacao = "Excelente condução!";
      cor = "#44ff88";
    } else {
      avaliacao = "Tente novamente para fortalecer a abordagem.";
      cor = "#ff6644";
    }

    const resumo =
      this.tipoDialogo === "GG"
        ? "Competências avaliadas:\n- Leitura de contexto\n- Objetividade\n- Respeito ao tempo do gestor\n- Alinhamento com a agência"
        : "Competências avaliadas:\n- Geração de interesse\n- Priorização de carteira\n- Atuação conjunta\n- Estruturação do próximo passo";

    const statusMeta = atingiu
      ? "Meta atingida!"
      : `Meta não atingida (precisava de ${meta} coins)`;

    // Reaproveita o campo principal de fala para mostrar o resumo final
    this.textoNpc.setText(
      `${resumo}\n\nCoins da fase: ${this.pontuacao} / ${this.maxPts} (${pct}%)\n` +
        `Total da sessão: ${getScore(this.registry)}\n\n` +
        `${statusMeta}\n\n${avaliacao}`,
    ).setStyle({
      color: cor,
      fontSize: "32px",
    });

    // Atualiza o progresso do jogo conforme o NPC concluído nesta agência
    if (this.npcAlvo === "Camila") {
      this.registry.set("ag02_dialogo_camila_concluido", true);
      this.registry.set("missaoAgencia02Texto", "Missão: Suba e fale com a PJ Camila.");
    } else {
      this.registry.set("ag02_dialogo_enzo_concluido", true);
      this.registry.set("missaoAgencia02Texto", "Missão: Suba e fale com a PJ Camila.");
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
        "O jogador fez uma abordagem excelente. Responda de forma receptiva e objetiva.",
      neutra: "O jogador foi aceitável. Responda de forma neutra.",
      errada: "O jogador errou a abordagem. Responda de forma mais fria, porém profissional.",
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
        "[SceneDialogoAgencia02] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
