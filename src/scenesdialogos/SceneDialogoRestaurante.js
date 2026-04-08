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

// Roteiro principal da conversa com foco em integração, agilidade operacional e redução de erro
const ROTEIRO = [
  {
    titulo: "INTRODUÇÃO",
    narracao:
      "Ol?, boa tarde, tudo bem? Sou gerente de neg?cios da Cielo. Deixa eu te perguntar: voc? ? a pessoa respons?vel pelo neg�cio?",
    npcInicial: "Ol?, tudo bem? Sim, sou eu mesmo, pode falar comigo.",
  },
  {
    titulo: "CENA 1 - ABORDAGEM",
    narracao: "Ambiente: Restaurante cheio, equipe correndo, pedidos saindo.",
    npcInicial:
      "Fala... pode ser r?pido? Aqui qualquer minuto j? vira problema.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Claro. Hoje, quando fecha um pedido, o pagamento j? sai direto do sistema ou algu?m ainda digita na maquininha?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Começa natural, focado no fluxo da operação.",
      },
      {
        letra: "B",
        texto:
          "Hoje o pagamento ? integrado ao sistema ou voc? usa a maquininha separada na hora de cobrar?",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas mais técnico cedo demais.",
      },
      {
        letra: "C",
        texto:
          "Hoje voc? usa s� maquininha normal, que costuma ser mais simples e funciona melhor no dia a dia?",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Parece lógico, mas é incorreto.",
      },
    ],
    npcResposta:
      "Hoje o pagamento é separado... passa no sistema e depois na maquininha.",
  },
  {
    titulo: "CENA 2 - IDENTIFICAÇÃO DO PROBLEMA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Ent?o voc? fecha o pedido no sistema e depois algu?m precisa digitar o valor de novo pra cobrar, certo?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Valida o fluxo real antes de aprofundar.",
      },
      {
        letra: "B",
        texto:
          "Nesse modelo o sistema e o pagamento não estão integrados, então o valor precisa ser repetido manualmente.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas conceitual demais.",
      },
      {
        letra: "C",
        texto:
          "Esse modelo até ajuda, porque você confere o valor duas vezes antes de cobrar o cliente.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Repetição aumenta erro.",
      },
    ],
    npcResposta: "Sim, às vezes dá uns erros chatos.",
  },
  {
    titulo: "CENA 3 - EXPLORAÇÃO DO RISCO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Tipo digitar um valor errado, esquecer de registrar no sistema ou dar diferen?a no fechamento?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Nomeia erros reais de forma prática.",
      },
      {
        letra: "B",
        texto:
          "Quando o processo é separado, podem acontecer diferenças entre o que foi registrado e o que foi cobrado.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas genérico.",
      },
      {
        letra: "C",
        texto:
          "Esses erros são mais falta de atenção da equipe, não tem tanto a ver com o processo.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. O processo influencia diretamente.",
      },
    ],
    npcResposta: "E como isso ficaria mais seguro?",
  },
  {
    titulo: "CENA 4 - INTRODUÇÃO DA TÉCNICA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Quando o sistema está integrado ao pagamento, o valor já sai pronto, sem digitar, e já volta confirmado no sistema.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Clareza de fluxo, sem sobrecarregar.",
      },
      {
        letra: "B",
        texto:
          "Existe um modelo integrado onde o sistema envia automaticamente o valor para o pagamento.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas pouco conectado ao impacto.",
      },
      {
        letra: "C",
        texto:
          "Nesse modelo você não usa mais maquininha, tudo acontece direto dentro do sistema.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. O pagamento continua existindo.",
      },
    ],
    npcResposta:
      "Entendi... isso tem algum nome ou ? s? uma forma diferente de operar?",
  },
  {
    titulo: "CENA 5 - INTRODUÇÃO DAS SIGLAS (COM PARCERIA)",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Tem sim. Isso é integração com o sistema, às vezes via TEF, e com a parceria da Cielo com o banco isso já fica tudo conectado.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Introduz TEF e posiciona claramente a parceria Cielo + banco.",
      },
      {
        letra: "B",
        texto:
          "Isso é conhecido como TEF, quando o sistema se conecta com o pagamento e depois você acompanha os valores no banco.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas menos completo.",
      },
      {
        letra: "C",
        texto:
          "Isso é só um tipo de maquininha diferente, que depois já organiza automaticamente tudo no banco.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Confunde produto com integração.",
      },
    ],
    npcResposta: "Se isso evitar erro aqui, já resolve muita dor pra mim.",
  },
  {
    titulo: "CENA 6 - IMPACTO + PRÓXIMO PASSO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Resolve porque você tira a digitação, reduz erro e com a Cielo junto com o banco já deixa tudo registrado certo no sistema e na conta.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Conecta operação + parceria + impacto real.",
      },
      {
        letra: "B",
        texto:
          "Ajuda porque melhora o controle e deixa o processo mais organizado no dia a dia e depois no banco.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas genérico.",
      },
      {
        letra: "C",
        texto:
          "A gente pode manter como está e só ajustar o processo da equipe para depois conferir melhor no banco.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Problema estrutural.",
      },
    ],
  },
];

// Capítulo usado pelo sistema global de pontuação
const CAPITULO = "chapter2";
const FASE = "restaurante";
const N_CENAS = ROTEIRO.length;

// Cores usadas no estado padrão, hover e feedback das respostas
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoRestaurante extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoRestaurante" });
    // Define a arte e o perfil base usados nesta conversa
    this.imagemKey = "falaRestaurante";
    this.respostaRoteiroEstrita = true;
    this.promptLLM =
      "Você é Lucas, responsável por um restaurante movimentado. " +
      "Você é ágil, objetivo e muito atento à eficiência da operação e ao fluxo de pagamentos.";
  }

  init(dados) {
    super.init(dados);
    // Estado inicial da conversa e da pontuação da fase
    this.cenaIdx = 0;
    this.pontuacaoFase = 0;
    this.cieloCoinsGanhasDialogo = 0;
    this.estado = "tutorial";
    this.aguardandoLLM = false;
    this.escolhaAtual = null;
    this.respostaAtualNpc = "";
    initScoring(this.registry);
  }

  preload() {
    // Carrega a arte principal desta cena de diálogo
    if (!this.textures.exists("falaRestaurante")) {
      this.load.image(
        "falaRestaurante",
        "src/assets/imagens/imagensFalas/Restaurante - F.png",
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
      .image(CX, IMG_CY, "falaRestaurante")
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

    // Nome do cliente exibido apenas quando há fala direta da NPC
    this.textoNome = this.add
      .text(CX - BTN_W / 2, NOME_Y, "Lucas  -  Restaurante", {
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
      .text(CX, CONT_Y, "Lucas está pensando...", {
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
        texto: "Você vai conduzir a conversa com ${this.nomeNpcDialogo} no restaurante.",
      },
      {
        icone: "💬",
        texto: "A cada cena, escolha entre três opções de resposta a que mais fizer sentido.",
      },
      {
        icone: "🪙",
        texto: "Cada escolha vale Cielo Coins. Resposta correta = +200. Neutra = +100. Errada = +0",

      
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
    const cena = ROTEIRO[idx];
    this.cenaIdx = idx;
    this.estado = "intro";
    this.aguardandoLLM = false;
    this.escolhaAtual = null;
    this.respostaAtualNpc = "";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);

    this.textoCena.setText(`${cena.titulo}  (${idx + 1} / ${ROTEIRO.length})`);
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
    const cena = ROTEIRO[this.cenaIdx];
    this.estado = "escolha";

    this.textoFeedbackTitulo.setVisible(false);
    this.textoFeedback.setVisible(false);
    this.textoNpc.setVisible(true);

    this.textoNarracao.setText("");
    this.textoNpc.setText("O que voc? diz?");
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
      .setText(escolha.feedbackTexto || "Você fez uma escolha.")
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

    const ultimo = this.cenaIdx >= ROTEIRO.length - 1;
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Pr?xima cena  ->");
  }

  async _aoEscolher(indice) {
    // Processa a alternativa escolhida, atualiza pontuação e prepara a reação da NPC
    if (this.aguardandoLLM || this.estado !== "escolha") return;

    // Recupera a alternativa clicada dentro da ordem embaralhada visível
    const cena = ROTEIRO[this.cenaIdx];
    const escolha = this.escolhasOrdenadas[indice];

    // Guarda a escolha e soma os coins ganhos nesta fase
    this.escolhaAtual = escolha;

    const ganhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);
    this.pontuacaoFase += ganhos;
    this.cieloCoinsGanhasDialogo += ganhos;
    this.textoCieloCoin.setText(
      `Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
    );

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
      const cena = ROTEIRO[this.cenaIdx];
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
      this._mostrarRespostaNpc(this.respostaAtualNpc);
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
    // Tela final com percentual, meta atingida e mensagem de desempenho
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
    if (pct >= 66) {
      avaliacao = "Excelente condução! Operação e clareza bem conectadas.";
      cor = "#44ff88";
    } else {
      avaliacao = "Precisa melhorar. Tente de novo com mais foco no fluxo.";
      cor = "#ff6644";
    }

    const statusMeta = atingiu
      ? "Meta atingida!"
      : `Meta não atingida (precisava de ${meta} coins)`;

    // Reaproveita o campo principal de fala para mostrar o resumo final
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
        "O vendedor fez uma abordagem excelente. Responda de forma receptiva, avançando a conversa.",
      neutra:
        "O vendedor foi aceitável porém genérico. Responda de forma neutra, sem entusiasmo mas sem fechar portas.",
      errada:
        "O vendedor errou a abordagem. Responda de forma mais fria ou cética, mas sem encerrar a conversa.",
    };

    const system =
      `${this.promptLLM}\n` +
      "Responda de forma natural e breve (1-2 frases) em portugu?s do Brasil.\n" +
      `Contexto desta cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de refer?ncia (adapte para soar natural): "${cena.npcResposta}"\n` +
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
      // Em falha de rede/API, volta para a resposta pré-definida do roteiro
      console.warn(
        "[SceneDialogoRestaurante] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
