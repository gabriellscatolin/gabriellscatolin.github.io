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

// Configuração da LLM usada para respostas dinâmicas quando o modo estrito for desligado
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Roteiro oficial da conversa com o Gerente Geral na agÃªncia
const ROTEIRO_GG = [
  {
    titulo: "ETAPA 1 - ABORDAGEM INICIAL",
    narracao:
      "Ambiente: Agência organizada, clima leve e receptivo. Equipe colaborativa, clientes sendo atendidos com tranquilidade. O GG demonstra abertura, atenção e disposição.",
    npcInicial: "Oi! Tudo bem? Pode falar, seja bem-vindo!",
    escolhas: [
      {
        letra: "A",
        texto:
          "Bom dia! Agência está bem dinâmica hoje... bastante movimento por aqui.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Objetivo, respeitoso e já conecta com apoio a operação.",
      },
      {
        letra: "B",
        texto: "Obrigado! Sou da Cielo. Estou passando hoje na agência pra me apresentar e conhecer melhor como vocês trabalham.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correta, mas genérica. Não diferencia o atendimento.",
      },
      {
        letra: "C",
        texto: "Obrigado! Sou da Cielo. Estou passando hoje pra falar com os clientes PJ e ver oportunidades por aqui.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Entra vendendo sem contexto. Quebra a conexão inicial.",
      },
    ],
    npcResposta:
      "Bom dia! Hoje está puxado, agência cheia. Como posso te ajudar?",
  },
  {
    titulo: "ETAPA 2 - POSICIONAMENTO E INTENÇÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Sou o parceiro da Cielo aqui da agência. Vim me alinhar com você e apoiar o PJ nas oportunidades.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Reforça parceria e traz impacto prático para a agência.",
      },
      {
        letra: "B",
        texto: "A ideia é entender melhor os clientes da carteira PJ e ver onde posso apoiar conforme as necessidades que vocês enxergam.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto:
          "Correto, mas ainda reativo e pouco direcionado.",
      },
      {
        letra: "C",
        texto: "A ideia é identificar clientes que possam melhorar as condições atuais e avaliar possíveis trocas nas soluções que utilizam hoje.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Foco transacional. Reduz credibilidade.",
      },
    ],
    npcResposta: "Perfeito, bom saber. Pode seguir.",
  },
  {
    titulo: "CENA 3 - ALINHAMENTO DE ATUAÇÃO",
    narracao: null,
    npcInicial: "E qual é a sua ideia de atuação aqui hoje?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Quero atuar junto com o PJ, olhando clientes com potencial e fortalecendo a carteira da agência.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Alinhamento com o interesse da agência. Visão de longo prazo.",
      },
      {
        letra: "B",
        texto: "Vou ver com o PJ como posso ajudar nos clientes.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Direção correta, mas pouco estratégica.",
      },
      {
        letra: "C",
        texto: "Vou dar uma rodada nos clientes e ver o que aparece.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Falta de planejamento. Passa insegurança.",
      },
    ],
    npcResposta: "Isso faz sentido. Está alinhado com o que buscamos.",
  },
  {
    titulo: "ETAPA 3 - TRANSIÇÃO PARA AÇÃO (LIBERAÇÃO)",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "A ideia é gerar resultado para a agência e também entregar valor real para o cliente PJ.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Propõe ação com alinhamento e mantém o GG no processo.",
      },
      {
        letra: "B",
        texto: "Perfeito. Posso começar falando com alguns clientes hoje e depois te atualizo sobre o que eu for identificando.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Verdadeiro, mas fraco. Não conecta com resultado.",
      },
      {
        letra: "C",
        texto: "Perfeito. Vou começar falando com alguns clientes hoje e depois sigo com as oportunidades que aparecerem por aqui.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Foco errado. Reduz a relação a incentivo financeiro.",
      },
    ],
    npcResposta: "Se gerar valor para os dois lados, faz sentido mesmo.",
  },
  {
    titulo: "CENA 5 - TRATAMENTO DE OBJEÇÃO",
    narracao: null,
    npcInicial: "Já tivemos problema com parceiros que não deram retorno...",
    escolhas: [
      {
        letra: "A",
        texto:
          "Entendo totalmente. Por isso quero combinar um acompanhamento claro, com retorno frequente e resultado visível.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Reconhece a dor + traz solução concreta. Gera confiança.",
      },
      {
        letra: "B",
        texto: "Imagino... mas dessa vez vai ser diferente.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Genérico. Não resolve a objeção.",
      },
      {
        letra: "C",
        texto: "Com a Cielo isso não acontece. Pode confiar.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Promessa vazia. Baixa credibilidade.",
      },
    ],
    npcResposta: "Se tiver esse acompanhamento, já muda bastante.",
  },
  {
    titulo: "CENA 6 - PRÓXIMOS PASSOS E RELACIONAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Posso começar com dois clientes prioritários essa semana e te mandar um resumo do andamento?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Proposta concreta + organização + previsibilidade.",
      },
      {
        letra: "B",
        texto: "Vou falando com você conforme tiver novidade.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Intenção ok, mas pouco estruturada.",
      },
      {
        letra: "C",
        texto: "Depois te aviso se fechar alguma coisa.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Reativo e fraco. Não constrói parceria.",
      },
    ],
    npcResposta: "Perfeito. Assim consigo acompanhar e te apoiar melhor.",
  },
];

// Roteiro alternativo para quando a conversa ocorre com o gerente PJ
const ROTEIRO_PJ = [
  {
    titulo: "ETAPA 1 - ABORDAGEM INICIAL",
    narracao:
      "Ambiente: Agência organizada, clima leve e colaborativo. O PJ está acessível, receptivo e aberto a construir junto. Existe confiança e espaço para troca.",
    npcInicial: "Bom dia! Tudo bem? Pode falar, em que posso te ajudar?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Bom dia. Dei uma olhada na carteira e vi alguns clientes com volume bom que podem estar perdendo margem no cartão.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Claro, direto e já conecta com a carteira do PJ.",
      },
      {
        letra: "B",
        texto: "Bom dia! Sou da Cielo e estou passando hoje na agência pra me apresentar e entender melhor a operação de vocês.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Direção ok, mas superficial. Não diferencia.",
      },
      {
        letra: "C",
        texto: "Bom dia! Sou da Cielo e estou passando hoje pra falar com alguns clientes e ver oportunidades por aqui.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Parece válido, mas ignora o alinhamento com o PJ.",
      },
    ],
    npcResposta: "Legal! O que você trouxe de oportunidades?",
  },
  {
    titulo: "ETAPA 2 - GERAÇÃO DE INTERESSE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Uma padaria e uma farmácia com bom giro no crédito. Provavelmente antecipam e pagam mais taxa do que percebem.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Específico + técnico + conectado à dor financeira.",
      },
      {
        letra: "B",
        texto: "Separei alguns clientes da carteira e estou avaliando onde pode existir alguma oportunidade usando as soluções da Cielo.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Ajuda, mas ainda genérico.",
      },
      {
        letra: "C",
        texto: "Separei alguns clientes que podem trocar a solução atual por algo melhor e aproveitar condições mais competitivas.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Sem critério. Mostra falta de estratégia.",
      },
    ],
    npcResposta: "Faz sentido… esses normalmente giram bastante mesmo.",
  },
  {
    titulo: "CENA 3 - CONSTRUÇÃO DE VALOR",
    narracao: null,
    npcInicial: "Mas o que você enxerga de ganho nesses clientes?",
    escolhas: [
      {
        letra: "A",
        texto:
          "Muitos vendem bem, mas perdem margem na taxa e na antecipação. Se ajustar isso, o resultado melhora sem precisar vender mais.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Insight forte. Mostra entendimento de negócio, não só de produto.",
      },
      {
        letra: "B",
        texto: "Dá pra melhorar a operação deles com a Cielo.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas vago.",
      },
      {
        letra: "C",
        texto: "A gente consegue colocar a maquininha neles.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Volta para produto. Não gera valor.",
      },
    ],
    npcResposta: "Isso pega mesmo… cliente reclama disso direto.",
  },
  {
    titulo: "ETAPA 3 - CONSTRUÇÃO CONJUNTA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Se você puder ir junto comigo, aumenta a confiança do cliente e a gente consegue avançar mais rápido.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Estratégia comercial madura. Usa a força da agência.",
      },
      {
        letra: "B",
        texto: "Separei alguns clientes com perfis diferentes e acredito que podemos avaliar juntos quais fazem mais sentido abordar agora.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Ok, mas sem força.",
      },
      {
        letra: "C",
        texto: "Separei alguns clientes variados e posso ir abordando aos poucos para ver onde aparecem melhores oportunidades.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Perde alavancagem da parceria.",
      },
    ],
    npcResposta: "Ir junto ajuda bastante mesmo.",
  },
  {
    titulo: "CENA 5 - OBJEÇÃO DO PJ",
    narracao: null,
    npcInicial: "Mas esses clientes já têm maquininha de outras.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito, e normalmente é aí que está a oportunidade. Dá pra mostrar ganho em taxa, estabilidade e principalmente no custo da antecipação.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Não evita a objeção, usa ela como porta de entrada. Excelente.",
      },
      {
        letra: "B",
        texto: "A Cielo pode complementar o que eles já usam.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Válido, mas pouco forte.",
      },
      {
        letra: "C",
        texto: "Então já são clientes Cielo também.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Resposta sem lógica. Perde credibilidade.",
      },
    ],
    npcResposta: "Se tiver argumento concreto, dá pra abrir conversa.",
  },
  {
    titulo: "ETAPA 4 - TRANSIÇÃO PARA AÇÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Fechado então. Já falo com esses dois hoje, vejo melhor horário e te mando para alinharmos a visita juntos.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Próximo passo claro, rápido e organizado.",
      },
      {
        letra: "B",
        texto: "Posso começar falando com esses clientes e depois te atualizo sobre o que eu for encontrando ao longo do dia.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Intenção boa, mas sem compromisso claro.",
      },
      {
        letra: "C",
        texto: "Posso ir falando com esses clientes e seguir com as oportunidades conforme elas forem surgindo por aqui.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Fraco e sem urgência.",
      },
    ],
    npcResposta: null,
  },
];

// Capítulo usado pelo sistema global de pontuação
const CAPITULO = "chapter1";

// Cores usadas no estado padrão, hover e feedback das respostas
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoAgencia01 extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoAgencia01" });
    // Valor padrão antes da definição do tipo real de diálogo no init
    this.imagemKey = "falaAgencia01GG";
    this.respostaRoteiroEstrita = true;
    this.promptLLM = "";
  }

  init(dados) {
    super.init(dados);
    // Define se o diálogo atual será com o GG ou com o PJ da agência
    this.tipoDialogo = dados?.tipoDialogo || "GG";
    // Seleciona o roteiro, a arte e o comportamento da NPC conforme o perfil escolhido
    this.roteiro = this.tipoDialogo === "PJ" ? ROTEIRO_PJ : ROTEIRO_GG;
    this.maxPts = this.roteiro.length * 2;
    this.nomeNpcDialogo = this.tipoDialogo === "PJ" ? "Theo" : "Iza";
    this.promptLLM =
      this.tipoDialogo === "PJ"
        ? "Você é o PJ da Agência Cielo. Seja objetivo e comercial."
        : "Você é o Gerente Geral (GG) da Agência Cielo. Seja profissional e acolhedor.";
    this.imagemKey =
      this.tipoDialogo === "PJ" ? "falaAgencia01PJ" : "falaAgencia01GG";
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
    // Carrega as duas variações de arte para a mesma cena de diálogo
    if (!this.textures.exists("falaAgencia01GG")) {
      this.load.image(
        "falaAgencia01GG",
        "src/assets/imagens/imagensFalas/Agência01 - GG - F.png",
      );
    }
    if (!this.textures.exists("falaAgencia01PJ")) {
      this.load.image(
        "falaAgencia01PJ",
        "src/assets/imagens/imagensFalas/Agência01 - PJ - F.png",
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
        `${this.nomeNpcDialogo}  -  Agência Cielo`,
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
        texto: `Você vai conduzir a conversa na Agência.`,
      },
      {
        icone: "💬",
        texto:
          "A cada cena, escolha entre três opções de resposta a que mais fizer sentido.",
      },
      {
        icone: "🪙",
        texto:
          "Cada escolha vale Cielo Coins. Resposta correta = +100. Neutra = +50. Errada = +0",
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
      .setText(escolha.feedbackTexto || "feedback")
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
    this.textoNpc.setText(`"${resposta || ""}"`);

    const ultimo = this.cenaIdx >= this.roteiro.length - 1;
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Próxima cena  ->");
  }

  async _aoEscolher(indice) {
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
    // Tela final com percentual, meta e texto de avaliação da fase
    this.estado = "fim";
    this._esconderBotoes();
    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);
    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");

    const faseKey = this.tipoDialogo === "PJ" ? "agency1_pj" : "agency1_gg";
    const atingiu = checkGoal(faseKey, this.pontuacao);
    const meta = goalEscalado(faseKey);
    const pct = Math.round((this.pontuacao / this.maxPts) * 100);

    let avaliacao;
    let cor;
    if (pct >= 33) {
      avaliacao = "Excelente atendimento!";
      cor = "#44ff88";
    } else {
      avaliacao = "Tente novamente para melhorar a abordagem.";
      cor = "#ff6644";
    }

    const resumoFasePJ =
      "Você concluiu a fase de onboarding na agência.\n\n" +
      "Competências avaliadas:\n" +
      "- Postura profissional\n" +
      "- Posicionamento como parceiro\n" +
      "- Leitura de ambiente\n" +
      "- Organização e processo\n" +
      "- Uso de discurso de valor";

    const statusMeta = atingiu
      ? "Meta atingida!"
      : `Meta não atingida (precisava de ${meta} coins)`;

    const textoFinal =
      this.tipoDialogo === "PJ"
        ? `${resumoFasePJ}\n\nCoins da fase: ${this.pontuacao} / ${this.maxPts} (${pct}%)\nTotal da sessão: ${getScore(this.registry)}\n\n${statusMeta}\n\n${avaliacao}`
        : `Conversa encerrada!\n\nCoins da fase: ${this.pontuacao} / ${this.maxPts} (${pct}%)\nTotal da sessão: ${getScore(this.registry)}\n\n${statusMeta}\n\n${avaliacao}`;

    // Reposiciona o texto para o topo do painel para evitar sobreposição com o botão
    this.textoNpc
      .setText(textoFinal)
      .setStyle({
        color: cor,
        fontSize: "26px",
      })
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, 685);

    // Atualiza o progresso do jogo conforme o NPC concluído nesta agência
    if (this.tipoDialogo === "GG") {
      this.registry.set("ag01_dialogo_gg_concluido", true);
      this.registry.set(
        "missaoAgencia01Texto",
        "Missão: Suba e fale com o PJ Theo.",
      );
    }
    if (this.tipoDialogo === "PJ") {
      this.registry.set("ag01_dialogo_pj_concluido", true);
      this.registry.set("ag01_escolta_pj_agencia2", true);
      this.registry.set("ag01_pj_retorno", false);
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga o PJ ate a Padaria.",
      );
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
    // No modo estrito, a cena sempre usa a resposta fixa prevista no roteiro
    if (this.respostaRoteiroEstrita) {
      return cena.npcResposta;
    }

    // Sem chave válida, mantém o diálogo funcional usando o fallback do roteiro
    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
      return cena.npcResposta;
    }

    const guias = {
      correta:
        "O jogador fez uma abordagem excelente. Responda de forma receptiva.",
      neutra: "O jogador foi aceitável. Responda de forma neutra.",
      errada: "O jogador errou a abordagem. Responda de forma mais cética.",
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
        "[SceneDialogoAgencia01] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
