import SceneDialogoBase from "./SceneDialogoBase.js";
import {
  initScoring,
  handleAnswer,
  checkGoal,
  getScore,
  goalEscalado,
} from "../scoring.js";

// Embaralha as alternativas para evitar memorização pela posição
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

// Configuração da LLM usada para gerar respostas dinâmicas do NPC
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Roteiro completo da conversa com narrativa, escolhas e resposta base da NPC
const ROTEIRO = [
  {
    titulo: "INTRODUÇÃO",
    narracao:
      "Ol?, boa tarde, tudo bem? Sou gerente de neg?cios da Cielo. Deixa eu te perguntar: voc? ? a pessoa respons?vel pelo neg�cio?",
    npcInicial: "Ol?, tudo bem? Sim, sou eu mesma, pode falar comigo.",
  },
  {
    titulo: "CENA 1 - ABORDAGEM",
    narracao:
      "Ambiente: Supermercado grande, vários caixas operando, fluxo intenso. Sons de bip constantes, clientes passando, equipe em ritmo acelerado. A representante observa por alguns segundos a operação antes de se aproximar. A representante se aproxima com cuidado, aguardando um breve intervalo entre atendimentos. Alícia percebe a presença, mas continua acompanhando o movimento dos caixas.",
    npcInicial: "Já aviso, aqui o problema nunca é simples.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Imagino... com esse volume todo de caixas rodando, d� pra ter uma vis?o clara do que est? entrando, inclusive j? na conta com a Cielo junto com o banco?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Mantém escala + integração + parceria, com ritmo natural.",
      },
      {
        letra: "B",
        texto:
          "Deve ser bem complexo controlar tudo isso com tantos caixas funcionando ao mesmo tempo e depois acompanhar no banco.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Empático, mas não entra no problema estrutural.",
      },
      {
        letra: "C",
        texto:
          "Mas no fim do dia o sistema j? mostra o total, ent?o depois o banco organiza isso e fica mais f?cil de controlar, n?o?",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. O banco não resolve falta de estrutura.",
      },
    ],
    npcResposta:
      "Eu até vejo o total... mas o problema é quando algo não bate depois.",
  },
  {
    titulo: "CENA 2 - IDENTIFICAÇÃO DO PROBLEMA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Voc� quer dizer, quando aparece uma diferen?a dias depois... e voc? n?o consegue identificar nem o caixa, nem em que momento isso virou na conta do banco?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Nomeia a dor real e conecta operação com financeiro.",
      },
      {
        letra: "B",
        texto:
          "Imagino que com volume alto possam surgir diferenças ao longo do tempo e isso acabe aparecendo depois no banco.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas genérico.",
      },
      {
        letra: "C",
        texto:
          "Isso acontece mesmo, mas em operação grande é normal ter alguma diferença até o valor chegar no banco.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Normalizar perda é erro grave.",
      },
    ],
    npcResposta:
      "Exato... às vezes aparece uma diferença e eu nem sei de onde veio.",
  },
  {
    titulo: "CENA 3 - EXPLORAÇÃO DA COMPLEXIDADE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Porque cada caixa funciona separado... e quando isso chega na conta, vira tudo um número só. Aí você perde de onde cada venda veio.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Explica o problema completo com clareza.",
      },
      {
        letra: "B",
        texto:
          "Quando tem muitos caixas, o volume de transações aumenta e fica mais difícil acompanhar tudo até o momento que entra no banco.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas não explica a causa.",
      },
      {
        letra: "C",
        texto:
          "Isso acontece mais por falha da equipe do que pela forma como a operação está organizada ou como chega no banco.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. O modelo influencia diretamente.",
      },
    ],
    npcResposta: "E como daria pra organizar isso melhor?",
  },
  {
    titulo: "CENA 4 - ORGANIZAÇÃO NA PRÁTICA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "O ideal é que cada venda já saia identificada, ligada ao caixa e ao pagamento, e com a Cielo junto com o banco isso já chega organizado na conta.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Introduz rastreabilidade + parceria de forma natural.",
      },
      {
        letra: "B",
        texto:
          "Dá pra melhorar organizando melhor as informações e acompanhando os dados até o momento em que entram na conta.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas vago.",
      },
      {
        letra: "C",
        texto:
          "Você pode pedir pra equipe ter mais atenção e conferir melhor os valores antes de fechar e depois validar no banco.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Não resolve a estrutura.",
      },
    ],
    npcResposta: "Mas com esse volume, isso n?o fica complicado?",
  },
  {
    titulo: "CENA 5 - INTRODUÇÃO DO CONCEITO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Fica se for manual. Por isso a Cielo junto com o banco já organiza isso: você vê tudo na conta, mas cada operação separada por origem.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "centralização na conta, divisão por origem, reforça parceria Cielo + banco",
      },
      {
        letra: "B",
        texto:
          "Existe um modelo de split de pagamento, que separa e organiza os valores por origem dentro da operação e depois no banco.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas menos didático.",
      },
      {
        letra: "C",
        texto:
          "Com volume alto, o melhor é olhar só o total no banco e evitar entrar em muitos detalhes da operação.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Em escala, detalhe é essencial.",
      },
    ],
    npcResposta:
      "Se eu conseguisse enxergar de onde vem cada valor, já evitaria muita dor.",
  },
  {
    titulo: "CENA 6 - IMPACTO + CONTROLE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Exatamente. Você vê o total na conta com a Cielo junto com o banco, mas também cada parte, sabendo qual caixa gerou o quê. Posso te mostrar isso rápido.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Fecha com força: visão + rastreabilidade + parceria.",
      },
      {
        letra: "B",
        texto:
          "Isso ajuda porque organiza melhor os dados e facilita a análise da operação tanto no sistema quanto no banco.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas genérico.",
      },
      {
        letra: "C",
        texto:
          "Dá pra melhorar isso ajustando o fechamento diário e pedindo mais conferência antes de bater o valor no banco.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Não resolve a causa.",
      },
    ],
  },
];

// Identificadores usados pela pontuação global e pela meta desta fase
const CAPITULO = "chapter1";
const FASE = "supermercado";
const N_CENAS = ROTEIRO.length;

// Paleta dos botões para estado neutro, hover e feedback da escolha
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoSupermercado extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoSupermercado" });
    // Define a arte e o perfil base usados nesta conversa
    this.imagemKey = "falaSupermercado";
    this.respostaRoteiroEstrita = true;
    this.promptLLM =
      "Você é Alícia, responsável por um supermercado de grande porte. " +
      "Você valoriza escala, controle, rastreabilidade e visão clara da operação.";
  }

  init(dados) {
    super.init(dados);
    // Reinicia o progresso local sempre que esta conversa começa
    this.cenaIdx = 0;
    this.pontuacaoFase = 0;
    this.cieloCoinsGanhasDialogo = 0;
    // Controla a etapa atual do fluxo visual do diálogo
    this.estado = "tutorial";
    this.aguardandoLLM = false;
    this.escolhaAtual = null;
    this.respostaAtualNpc = "";
    // Garante que a pontuação compartilhada esteja pronta para uso
    initScoring(this.registry);
  }

  preload() {
    // Carrega a arte principal desta cena de diálogo
    if (!this.textures.exists("falaSupermercado")) {
      this.load.image(
        "falaSupermercado",
        "src/assets/imagens/imagensFalas/Mercado - F.png",
      );
    }
  }

  create() {
    // Medidas-base para montar a tela de diálogo e o painel inferior
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

    // Camada escura para destacar a interface da conversa
    this.add
      .rectangle(CX, H / 2, W, H, 0x000000, 0.78)
      .setScrollFactor(0)
      .setDepth(0)
      .setInteractive();

    // Imagem principal da personagem/cena
    const img = this.add
      .image(CX, IMG_CY, "falaSupermercado")
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
      .text(CX - BTN_W / 2, NOME_Y, "Al?cia  -  Supermercado", {
        fontSize: "20px",
        color: "#5a9fd4",
        fontStyle: "bold",
        resolution: 4,
      })
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

    // Botões das três alternativas de resposta
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
          fontSize: "20px",
          color: "#776fe6",
          fontStyle: "bold",
          resolution: 4,
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(4)
        .setVisible(false);

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

    // Botão usado para avançar entre introdução, feedback, resposta e fim
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

    // Mensagem temporária exibida enquanto a próxima fala é preparada
    this.textoCarregando = this.add
      .text(CX, CONT_Y, "Alícia está pensando...", {
        fontSize: "21px",
        color: "#99bbdd",
        fontStyle: "italic",
        resolution: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4)
      .setVisible(false);

    // HUD com a soma da sessão e o ganho acumulado nesta conversa
    this.textoCieloCoin = this.add
      .text(W - 20, 16, "Cielo Coins: 0 / 1200", {
        fontSize: "30px",
        color: "#ffd700",
        backgroundColor: "#000000bb",
        padding: { x: 10, y: 5 },
        resolution: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);

    // Cabeçalho com o nome da cena atual dentro do roteiro
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

    // Atalho usado para fechar a tela quando o diálogo termina
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Abre a conversa exibindo antes um tutorial de contexto
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

    // Overlay inicial com instruções rápidas da dinâmica do diálogo
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

    // Resume objetivo, mecânica das escolhas e regra de pontuação
    const linhas = [
      {
        icone: "🎯",
        texto:
          "Você vai conduzir uma conversa com Alícia, focando em escala, rastreabilidade e controle da operação.",
      },
      {
        icone: "💬",
        texto:
          "A cada cena, escolha entre três opções de resposta a que mais fizer sentido para avançar a conversa.",
      },
      {
        icone: "🪙",
        texto:
          "Cada escolha vale Cielo Coins. Resposta correta = +200. Neutra = +100. Errada = +0",
      },
    ];

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

    // Botão que encerra o tutorial e libera a primeira cena
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

    // Feedback visual simples para destacar a ação principal
    btnBg.on("pointerover", () => btnBg.setFillStyle(0x2a7c2a));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x1a5c1a));
    btnBg.on("pointerdown", () => {
      // Remove os elementos do tutorial antes de entrar no roteiro
      els.forEach((el) => el?.destroy?.());
      this._mostrarCena(0);
    });

    this._tutorialEls = els;
  }

  _mostrarCena(idx) {
    // Restaura o estado visual para apresentar a próxima etapa do roteiro
    const cena = ROTEIRO[idx];
    this.cenaIdx = idx;
    this.estado = "intro";
    this.aguardandoLLM = false;
    this.escolhaAtual = null;
    this.respostaAtualNpc = "";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);

    // Atualiza o cabeçalho com o nome da etapa e o progresso no roteiro
    this.textoCena.setText(`${cena.titulo}  (${idx + 1} / ${ROTEIRO.length})`);
    this._esconderBotoes();
    this._ocultarContinuar();
    this.textoCarregando.setVisible(false);
    this.textoNome.setVisible(false);

    this.textoNarracao.setText(cena.narracao || "");
    this.textoNpc.setText(cena.npcInicial ? `"${cena.npcInicial}"` : "");

    // Quando não há introdução, a cena já começa nas alternativas
    if (!cena.narracao && !cena.npcInicial) {
      this._mostrarEscolhas();
    } else {
      // Se existe contexto ou fala inicial, o avanço passa pelo botão
      this.textoNome.setVisible(!!cena.npcInicial);
      this._mostrarContinuar("Responder  ->");
    }
  }

  _mostrarEscolhas() {
    // Exibe as respostas possíveis já embaralhadas
    const cena = ROTEIRO[this.cenaIdx];
    this.estado = "escolha";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);

    this.textoNarracao.setText("");
    this.textoNpc.setText("O que voc? diz?");
    this.textoNome.setVisible(false);
    this._ocultarContinuar();

    // Embaralha as opções para evitar memorização por posição fixa
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
    // Mostra a avaliação da alternativa antes da fala seguinte da NPC
    this.estado = "feedback";

    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoNpc.setVisible(false);

    this.textoFeedbackTitulo
      .setText(escolha.feedbackTitulo || "Feedback")
      .setVisible(true);

    // Explica ao jogador o motivo do feedback daquela resposta
    this.textoFeedback
      .setText(escolha.feedbackTexto || "Você fez uma escolha.")
      .setVisible(true);

    this._mostrarContinuar("Continuar  ->");
  }

  _mostrarRespostaNpc(resposta) {
    // Exibe a resposta da NPC e prepara a transição para a próxima cena
    this.estado = "resposta";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);

    this.textoNarracao.setText("");
    this.textoNome.setVisible(true);
    this.textoNpc.setVisible(true);
    this.textoNpc.setText(`"${resposta}"`);

    // Ajusta o CTA conforme a resposta leve à próxima cena ou ao encerramento
    const ultimo = this.cenaIdx >= ROTEIRO.length - 1;
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Pr?xima cena  ->");
  }

  async _aoEscolher(indice) {
    // Evita cliques repetidos ou fora da etapa correta do fluxo
    if (this.aguardandoLLM || this.estado !== "escolha") return;

    const cena = ROTEIRO[this.cenaIdx];
    const escolha = this.escolhasOrdenadas[indice];

    this.escolhaAtual = escolha;

    // Soma a pontuação da escolha atual ao total da fase e da sessão
    const ganhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);
    this.pontuacaoFase += ganhos;
    this.cieloCoinsGanhasDialogo += ganhos;
    this.textoCieloCoin.setText(
      `Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
    );

    // Destaca visualmente o tipo de resposta selecionada
    if (escolha.tipo === "correta") {
      this.botoesEscolha[indice].bg.setFillStyle(COR_CORRETA);
    } else if (escolha.tipo === "errada") {
      this.botoesEscolha[indice].bg.setFillStyle(COR_ERRADA);
    } else {
      this.botoesEscolha[indice].bg.setFillStyle(COR_NEUTRA);
    }

    // Esconde as demais opções enquanto a próxima resposta é preparada
    this.aguardandoLLM = true;
    this._esconderBotoes(indice);
    this.textoCarregando.setVisible(true);

    await esperar(350);

    // Busca a fala seguinte da NPC usando roteiro fixo ou geração dinâmica
    const resposta = await this._chamarLLM(escolha, cena);
    this.respostaAtualNpc = resposta;

    this.aguardandoLLM = false;
    this.textoCarregando.setVisible(false);
    this._esconderBotoes();

    this._mostrarFeedbackEscolha(escolha);
  }

  _aoContinuar() {
    // Avança o fluxo conforme a etapa atual da conversa
    if (this.estado === "intro") {
      const cena = ROTEIRO[this.cenaIdx];
      // Cenas sem escolhas funcionam como passagem direta para o próximo bloco
      if (!cena.escolhas?.length) {
        if (this.cenaIdx >= ROTEIRO.length - 1) {
          this._mostrarResultadoFinal();
        } else {
          this._mostrarCena(this.cenaIdx + 1);
        }
      } else {
        this._mostrarEscolhas();
      }
    } else if (this.estado === "feedback") {
      // Depois do feedback, a NPC reage à abordagem escolhida
      this._mostrarRespostaNpc(this.respostaAtualNpc);
    } else if (this.estado === "resposta") {
      // Após a resposta da NPC, segue para a próxima cena ou para o fim
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
    // Resume o desempenho do jogador na fase e informa se a meta foi batida
    this.estado = "fim";
    this._esconderBotoes();
    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);
    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");

    const meta = goalEscalado(FASE);
    const maxPts = N_CENAS * 100;
    const atingiu = checkGoal(FASE, this.pontuacaoFase);
    const pct = Math.round((this.pontuacaoFase / maxPts) * 100);

    let avaliacao;
    let cor;
    if (pct >= 75) {
      avaliacao = "Excelente condução! Escala e controle bem posicionados.";
      cor = "#44ff88";
    } else {
      avaliacao = "Precisa melhorar. Tente de novo com mais foco no controle.";
      cor = "#ff6644";
    }

    // Mostra explicitamente se a meta mínima da fase foi alcançada
    const statusMeta = atingiu
      ? "Meta atingida!"
      : `Meta não atingida (precisava de ${meta} coins)`;

    this.textoNpc
      .setText(
        `Conversa encerrada!\n\n` +
          `Coins desta fase: ${this.pontuacaoFase} / ${maxPts}  (${pct}%)\n` +
          `Total da sessão: ${getScore(this.registry)}\n\n` +
          `${statusMeta}\n\n${avaliacao}`,
      )
      .setStyle({
        color: cor,
        fontSize: "32px",
      });

    this._mostrarContinuar("Fechar  [E]");
  }

  _mostrarContinuar(label) {
    // Reaproveita o mesmo CTA em todas as transições do diálogo
    this.btnContinuar.setVisible(true);
    this.txtContinuar.setVisible(true).setText(label);
  }

  _ocultarContinuar() {
    // Some com o CTA quando a ação esperada é escolher uma resposta
    this.btnContinuar.setVisible(false);
    this.txtContinuar.setVisible(false);
  }

  _esconderBotoes(manter = -1) {
    // Esconde todas as alternativas ou preserva apenas a selecionada
    this.botoesEscolha.forEach(({ bg, labelLetra, txtEscolha }, i) => {
      if (i !== manter) {
        bg.setVisible(false);
        labelLetra.setVisible(false);
        txtEscolha.setVisible(false);
      }
    });
  }

  async _chamarLLM(escolha, cena) {
    // Quando o modo estrito está ativo, usa apenas a resposta definida no roteiro
    if (this.respostaRoteiroEstrita) {
      return cena.npcResposta;
    }

    // Sem chave válida, o fluxo continua usando a resposta fixa do roteiro
    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
      return cena.npcResposta;
    }

    // Ajusta o tom da resposta da NPC conforme a qualidade da abordagem
    const guias = {
      correta:
        "O vendedor fez uma abordagem excelente. Responda de forma receptiva, avançando a conversa.",
      neutra:
        "O vendedor foi aceitável, porém genérico. Responda de forma neutra, sem entusiasmo mas sem fechar portas.",
      errada:
        "O vendedor errou a abordagem. Responda de forma mais fria ou cética, mas sem encerrar a conversa.",
    };

    // Monta o contexto enviado ao modelo para manter a personagem consistente
    const system =
      `${this.promptLLM}\n` +
      "Responda de forma natural e breve (1-2 frases) em portugu?s do Brasil.\n" +
      `Contexto desta cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de refer?ncia (adapte para soar natural): "${cena.npcResposta}"\n` +
      `${guias[escolha.tipo]}`;

    try {
      // Tenta gerar uma resposta contextual da NPC com base na escolha do jogador
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
      // Em caso de falha, mantém a progressão usando a resposta fixa do roteiro
      console.warn(
        "[SceneDialogoSupermercado] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
