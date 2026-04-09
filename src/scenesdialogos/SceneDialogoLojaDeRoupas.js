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

// Roteiro principal da conversa com foco em experiência de marca, fluidez e conversão
const ROTEIRO = [
  {
    titulo: "INTRODUÇÃO",
    narracao:
      "Ambiente: Loja moderna, música ambiente. Um cliente finaliza a compra. Eduardo acompanha atento a experiência. A representante aguarda um momento e se aproxima após o atendimento.",
  },
  {
    titulo: "CENA 1 - ABORDAGEM",
    narracao:
      "Olá, boa tarde, tudo bem? Sou gerente de negócios da Cielo. Deixa eu te perguntar: você é a pessoa responsável pelo negócio?",
    npcInicial:
      "Olá, tudo bem? Sim, sou eu mesmo, pode falar comigo, mas rapidinho. Aqui eu cuido muito da experiência do cliente.",
    escolhas: [
      {
        letra: "A",
        texto:
          "Perfeito, e foi exatamente isso que me chamou atenção. Como está sendo a experiência do cliente na hora de pagar hoje?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Conecta direto com o valor central do cliente e entra no tema certo.",
      },
      {
        letra: "B",
        texto:
          "Espaço muito bom, dá pra ver que você pensou bastante na experiência aqui.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Parece alinhado, mas não gera avanço.",
      },
      {
        letra: "C",
        texto:
          "Fala, vim te mostrar umas soluções de pagamento que ajudam a aumentar conversão e melhorar a operação da loja.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Parece sofisticado, mas continua centrado em produto e não no cliente.",
      },
    ],
    npcResposta:
      "Bom, a dificuldade é que a experiência é boa... mas às vezes no pagamento quebra o clima.",
  },
  {
    titulo: "CENA 2 - IDENTIFICAÇÃO DA DOR",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Fila, demora... ou a maquininha travando bem na hora de fechar a compra?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Nomeia fricções reais e mostra domínio da operação.",
      },
      {
        letra: "B",
        texto:
          "Imagino... com volume alto, é normal ter algum ponto da jornada que perde fluidez.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Soa inteligente, mas não aprofunda.",
      },
      {
        letra: "C",
        texto:
          "Mas isso é mais operacional... não costuma impactar tanto assim a decisão de compra no final.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Erro conceitual relevante. Subestima o momento mais crítico da venda.",
      },
    ],
    npcResposta:
      "Trava... justo na hora de pagar. O cliente já está no clima e perde o ritmo ali.",
  },
  {
    titulo: "CENA 3 - EXPLORAÇÃO DA EXPERIÊNCIA",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "E aí você não perde só tempo... qualquer quebra nesse momento pode fazer o cliente repensar a compra.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Conecta fricção com perda real de conversão.",
      },
      {
        letra: "B",
        texto:
          "É... não é o ideal, mas faz parte da operação quando tem bastante movimento.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Normaliza algo que deveria ser resolvido.",
      },
      {
        letra: "C",
        texto:
          "Mas como o cliente já escolheu o produto, dificilmente ele desiste nessa etapa, então o impacto é pequeno.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Parece lógico, mas está errado. A decisão ainda não está totalmente consolidada.",
      },
    ],
    npcResposta: "E o que daria pra fazer pra deixar isso mais fluído?",
  },
  {
    titulo: "CENA 4 - TÉCNICA (BANCO + TC)",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Hoje muita loja resolve isso quando integra com o banco. Você vende e o valor já entra na conta na hora, sem depender de etapas depois, o que deixa o fluxo mais leve.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Introduz o “vendeu, tá na conta” como ganho de fluidez operacional.",
      },
      {
        letra: "B",
        texto:
          "Dá pra melhorar o pagamento deixando o processo mais rápido e reduzindo algumas etapas no caixa.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Parece correto, mas não mostra como resolver.",
      },
      {
        letra: "C",
        texto:
          "O ideal nesses casos é aumentar a quantidade de maquininhas e distribuir melhor os pontos de pagamento.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Parece solução prática, mas não resolve o problema estrutural de fluxo e integração.",
      },
    ],
    npcResposta: "Mas isso muda tanto assim na prática?",
  },
  {
    titulo: "CENA 5 - IMPACTO NA CONVERSÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Muda porque você não só acelera o pagamento. Quando está integrado com a Cielo e com o banco parceiro, você vende e o dinheiro já está na conta, sem travar tudo.",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto:
          "Conecta experiência, operação e fluxo de caixa em um único benefício.",
      },
      {
        letra: "B",
        texto:
          "Ajuda sim, porque deixa o pagamento mais rápido e melhora a percepção do cliente na hora de finalizar.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Correto, mas superficial.",
      },
      {
        letra: "C",
        texto:
          "Ajuda um pouco, mas no fim o cliente valoriza mais o produto do que essa parte do pagamento. É mais sobre ter algo de qualidade do que pagamento.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Meia-verdade perigosa. Ignora o impacto do momento final da compra.",
      },
    ],
    npcResposta:
      "Se isso deixar mais fluido, já melhora bastante a experiência aqui.",
  },
  {
    titulo: "CENA 6 - PRÓXIMO PASSO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto:
          "Faz sentido. Posso te mostrar isso funcionando em 5 minutos, já com essa integração com o banco aplicada no seu fluxo. Quer ver agora ou prefere depois?",
        tipo: "correta",
        feedbackTitulo: "Escolha correta",
        feedbackTexto: "Direto, prático e orientado à ação.",
      },
      {
        letra: "B",
        texto:
          "Se quiser, posso te explicar melhor isso em outro momento com mais detalhes.",
        tipo: "neutra",
        feedbackTitulo: "Escolha neutra",
        feedbackTexto: "Não gera urgência nem conexão com o que foi discutido.",
      },
      {
        letra: "C",
        texto:
          "A gente pode já ativar isso aqui e você vai ajustando depois conforme for usando no dia a dia.",
        tipo: "errada",
        feedbackTitulo: "Escolha inadequada",
        feedbackTexto:
          "Parece ágil, mas ignora o processo de decisão do cliente.",
      },
    ],
  },
];

// Capítulo usado pelo sistema global de pontuação
const CAPITULO = "chapter2";
const FASE = "loja_de_roupas";
const N_CENAS = ROTEIRO.length;

// Cores usadas no estado padrão, hover e feedback das respostas
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoLojaDeRoupas extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoLojaDeRoupas" });
    // Define a arte e o perfil base usados nesta conversa
    this.imagemKey = "falaLoja";
    this.respostaRoteiroEstrita = true;
    this.promptLLM =
      "Você é Eduardo, responsável por uma loja de roupas moderna. " +
      "Você valoriza experiência, fluidez, conversão e coe rência com a marca.";
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
    if (!this.textures.exists("falaLoja")) {
      this.load.image(
        "falaLoja",
        "src/assets/imagens/imagensFalas/Loja - F.png",
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
      .image(CX, IMG_CY, "falaLoja")
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
      .text(CX - BTN_W / 2, NOME_Y, "Eduardo  -  Loja de Roupas", {
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
      .text(CX, CONT_Y, "Eduardo está pensando...", {
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
        texto:
          "Você vai conversar com o Eduardo, conectando pagamento, fluidez e experiência de marca.",
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
    const maxPts = N_CENAS * 200;
    const atingiu = checkGoal(FASE, this.pontuacaoFase);
    const pct = Math.round((this.pontuacaoFase / maxPts) * 100);

    let avaliacao;
    let cor;
    if (pct >= 58) {
      avaliacao = "Excelente condução! Valor conectado à experiência.";
      cor = "#44ff88";
    } else {
      avaliacao =
        "Precisa melhorar. Tente novamente com mais foco na experiÃªncia.";
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
        "O vendedor conduziu muito bem a conversa. Responda de forma receptiva, estratégica e aberta ao próximo passo.",
      neutra:
        "O vendedor foi aceitável, mas ainda genérico. Responda de forma neutra, com interesse moderado.",
      errada:
        "O vendedor conduziu mal a abordagem. Responda de forma mais fria ou cautelosa, sem encerrar a conversa.",
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
        "[SceneDialogoLojaDeRoupas] Falha na LLM, usando roteiro:",
        err.message,
      );
      return cena.npcResposta;
    }
  }
}
