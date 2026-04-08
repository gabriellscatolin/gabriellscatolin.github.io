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

// Roteiro completo da conversa com narrativa, escolhas e resposta base do NPC
const ROTEIRO = [
  {
    titulo: "INTRODUÇÃO",
    narracao:
      "Olá, boa tarde, tudo bem? Sou gerente de negócios da Cielo. Deixa eu te perguntar: você é a pessoa responsável pelo negócio?",
    npcInicial: "Olá, tudo bem? Sim, sou eu mesmo, pode falar comigo.",
  },
  {
    titulo: "CENA 1 - RETOMADA DE RELAÇÃO",
    narracao:
      "Ambiente: Estabelecimento em horário de pico. Movimento intenso, equipe acelerada. Nicolas acompanha o caixa com atenção, claramente focado em não perder tempo. A representante se aproxima com objetividade, sem interromper bruscamente.",
    npcInicial:
      "Você voltou... espero que não seja pra repetir o que já falou. Aqui eu não tenho tempo pra conversa bonita.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. Nem vou repetir. Voltei com um cenário direto de quando a operação para... pra ver como você continuaria vendendo.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Retoma com valor novo, direto ao ponto e alinhado ao perfil do cliente.",
      },
      {
        letra: "B",
        texto:
          "Voltei pra gente retomar o que falamos e ver se aquilo fez sentido dentro da sua operação.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas fraco. Não traz novidade.",
      },
      {
        letra: "C",
        texto:
          "Voltei pra ver se você decidiu implementar aquilo que te mostrei da outra vez.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Pressiona sem gerar valor. Perde o cliente.",
      },
    ],
    npcResposta:
      "Então fala. Porque aqui quando para, para tudo. E eu não aceito isso.",
  },
  {
    titulo: "CENA 2 - PRESSÃO / TESTE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Hoje, se a maquininha cai, você para de vender. A ideia é ter um caminho paralelo pra continuar cobrando, sem depender dela.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Direto, claro e já introduz fallback como continuidade.",
      },
      {
        letra: "B",
        texto:
          "Quando dá problema, existem alternativas que ajudam a manter a operação funcionando.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas genérico.",
      },
      {
        letra: "C",
        texto:
          "Essas falhas são raras, talvez não seja algo que justifique mudar o que você já usa hoje.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Minimiza risco. Erro crítico para esse perfil.",
      },
    ],
    npcResposta:
      "Eu já ouvi isso. Na teoria tudo funciona, na prática é outra história.",
  },
  {
    titulo: "CENA 3 - OBJEÇÃO FORTE",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Concordo. Por isso não é trocar nada... é ter uma segunda opção quando a principal falhar.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Introduz redundância sem confronto. Ganha confiança.",
      },
      {
        letra: "B",
        texto:
          "Entendo, mas a ideia é melhorar o que você já tem e deixar a operação mais segura.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas genérico.",
      },
      {
        letra: "C",
        texto:
          "Mas essa solução funciona bem, a maioria dos clientes não tem problema com isso.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Argumento fraco. Não resolve a objeção.",
      },
    ],
    npcResposta:
      "Tudo bem, então me explica sem enrolar. Como eu continuo vendendo sem maquininha?",
  },
  {
    titulo: "CENA 4 - TÉCNICA (COM PROVA SIMPLES)",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Você gera um link no celular, mostra pro cliente e ele paga ali na hora. A venda continua, mesmo sem a maquininha.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Explicação direta, prática e visual.",
      },
      {
        letra: "B",
        texto:
          "Existe o link de pagamento, que permite cobrar de forma digital sem depender do equipamento físico.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas menos operacional.",
      },
      {
        letra: "C",
        texto:
          "Você pode anotar a venda e depois cobrar quando o sistema voltar.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Aumenta risco e quebra o fluxo.",
      },
    ],
    npcResposta: "Isso aí qualquer um fala que tem. O que muda de verdade?",
  },
  {
    titulo: "CENA 5 - ATAQUE AO DIFERENCIAL",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "O que muda é funcionar quando você precisa. Não adianta ter alternativa se ela falha junto com o resto... aqui é pra segurar a venda quando o problema acontece.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Posiciona confiabilidade como diferencial real.",
      },
      {
        letra: "B",
        texto:
          "O conceito existe no mercado, mas a forma como cada empresa entrega pode variar.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas sem posicionamento.",
      },
      {
        letra: "C",
        texto: "Na prática é tudo parecido, qualquer solução resolve isso.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Incorreto. Elimina diferencial.",
      },
    ],
    npcResposta:
      "Eu não vou mudar nada aqui baseado em promessa. Já perdi dinheiro com isso.",
  },
  {
    titulo: "CENA 6 - DECISÃO SOB PRESSÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito. Sugiro você testar como backup, sem mexer no que já funciona... Posso deixar isso configurado agora pra você ver na prática se segura quando cair.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Reduz risco, respeita histórico e propõe teste. Alto poder de conversão.",
      },
      {
        letra: "B",
        texto: "Se quiser, posso te mostrar isso com mais calma depois.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Abre espaço, mas não avança.",
      },
      {
        letra: "C",
        texto: "A gente já pode implementar agora e você ajusta depois.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto: "Pressiona e ignora histórico do cliente.",
      },
    ],
  },
];

// Identificadores usados pela pontuação global e pela meta desta fase
const CAPITULO = "chapter3";
const FASE = "posto";
const N_CENAS = ROTEIRO.length;

// Paleta dos botões para estado neutro, hover e feedback da escolha
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoPostoDeGasolina extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoPostoDeGasolina" });
    // Define a arte e o perfil base usados nesta conversa
    this.imagemKey = "falaPosto";
    this.respostaRoteiroEstrita = true;
    this.promptLLM =
      "Você é Nicolas, responsável por uma operação de posto de gasolina. " +
      "Você é direto, cético e intolerante a risco operacional.";
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
    if (!this.textures.exists("falaPosto")) {
      this.load.image(
        "falaPosto",
        "src/assets/imagens/imagensFalas/Posto - F.png",
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
      .image(CX, IMG_CY, "falaPosto")
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

    // Nome do interlocutor exibido apenas quando há fala direta do NPC
    this.textoNome = this.add
      .text(CX - BTN_W / 2, NOME_Y, "Nicolas  -  Posto de Gasolina", {
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

    // Campo principal para a fala do NPC
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
      .text(CX, CONT_Y, "Nicolas está pensando...", {
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
      .text(W - 20, 16, "Cielo Coins: 0 / 1800", {
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
          "Você vai fazer um follow-up com o Nicolas, focando em continuidade da operação, backup e redução de risco.",
      },
      {
        icone: "💬",
        texto:
          "A cada cena, escolha entre três opções de resposta a que mais fizer sentido para avançar a conversa.",
      },
      {
        icone: "🪙",
        texto:
          "Cada escolha vale Cielo Coins. Resposta correta = +300. Neutra = +150. Errada = -50",
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
    // Mostra a avaliação da alternativa antes da fala seguinte do NPC
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
    // Exibe a resposta do NPC e prepara a transição para a próxima cena
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
    // Processa a alternativa escolhida, atualiza pontuação e prepara a reação da NPC
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

    // Busca a fala seguinte do NPC usando roteiro fixo ou geração dinâmica
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
      // Depois do feedback, o NPC reage à abordagem escolhida
      this._mostrarRespostaNpc(this.respostaAtualNpc);
    } else if (this.estado === "resposta") {
      // Após a resposta do NPC, segue para a próxima cena ou para o fim
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
    if (pct >= 83) {
      avaliacao = "Excelente condução! Risco e continuidade bem posicionados.";
      cor = "#44ff88";
    } else {
      avaliacao =
        "Precisa melhorar. Tente de novo com mais foco em backup e teste.";
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

    // Ajusta o tom da resposta do NPC conforme a qualidade da abordagem
    const guias = {
      correta:
        "O vendedor fez uma abordagem excelente. Responda de forma receptiva, avançando a conversa.",
      neutra:
        "O vendedor foi aceitável, porém genérico. Responda de forma neutra, sem entusiasmo mas sem fechar portas.",
      errada:
        "O vendedor errou a abordagem. Responda de forma mais fria ou cética, mas sem encerrar a conversa.",
    };

    // Monta o contexto enviado ao modelo para manter o personagem consistente
    const system =
      `${this.promptLLM}\n` +
      "Responda de forma natural e breve (1-2 frases) em portugu?s do Brasil.\n" +
      `Contexto desta cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de refer?ncia (adapte para soar natural): "${cena.npcResposta}"\n` +
      `${guias[escolha.tipo]}`;

    try {
      // Tenta gerar uma resposta contextual do NPC com base na escolha do jogador
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
        "[SceneDialogoPostoDeGasolina] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }

  _fechar() {
    // Ao fechar o diálogo do posto (fim de jogo), vai direto para a tela de vitória
    if (this.cenaOrigem) this.scene.stop(this.cenaOrigem);
    this.scene.start("SceneVitoria");
  }
}
