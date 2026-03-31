// Cena de dialogo da padaria com escolhas baseadas no roteiro
import SceneDialogoBase from "./SceneDialogoBase.js";

// Embaralha a ordem das escolhas da cena
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
import { initScoring, handleAnswer, checkGoal, getScore, goalEscalado } from "../scoring.js";

// Configuracoes da API para respostas dinamicas
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Roteiro principal da fase da padaria
// Cada item descreve uma etapa da conversa com titulo, contexto, alternativas e resposta esperada
const ROTEIRO = [
  {
    titulo: "CENA 1 - ABERTURA",
    narracao:
      'Ambiente: Padaria cheia. Sofia no caixa, visivelmente cansada.\n"Aborde a cliente da melhor forma possível"',
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Bom dia... tá naquele ritmo puxado de sempre ou hoje apertou mais?",
        tipo: "correta",
      },
      {
        letra: "B",
        texto: "Bom dia! Trabalho com soluções para melhorar o seu financeiro aqui na padaria. Tá lotado aqui.",
        tipo: "errada",
      },
      {
        letra: "C",
        texto: "Bom dia! Esse horário costuma ser mais cheio aqui na padaria?",
        tipo: "neutra",
      },
    ],
    npcResposta:
      "Bom dia. Aqui na padaria de manhã é sempre cheio. E hoje ainda acordei mais cedo...",
  },
  {
    titulo: "CENA 2 - DIAGNÓSTICO",
    narracao: null,
    npcInicial: null, 
    escolhas: [
      {
        letra: "A",
        texto: "Todo mundo passar por isso. Com esse movimento, o faturamento deve ser alto, né? ",
        tipo: "errada",
      },
      {
        letra: "B",
        texto: "Que bom que é assim, você costuma ter bastante cliente recorrente aqui no dia a dia?", 
        tipo: "neutra",
      },
      {
        letra: "C",
        texto: "Te entendo, e no fim do mês, você sente que esse movimento todo vira resultado?",
        tipo: "correta",
      },
    ],
    npcResposta:
      "Então... assumi aqui depois que meu pai morreu, estou entendo tudo. O problema é que até entra dinheiro, mas parece que não sobra. Eu trabalho o mês inteiro e fico com essa sensação.",
  },
  {
    titulo: "CENA 3 - EXPLORAÇÃO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Isso pode ser custo de fornecedor ou desperdício no estoque. Tem que ver o quanto você confia nos seus funcionários.",
        tipo: "errada",
      },
      {
        letra: "B",
        texto: "Você já conseguiu ver direitinho quanto fica nas taxas e no dinheiro que antecipa?",
        tipo: "correta",
      },
      {
        letra: "C",
        texto: "É importante saber se você trabalha mais com cartão ou dinheiro aqui na padaria.",
        tipo: "neutra",
      },
    ],
    npcResposta:
      "Confesso que lidar com tanto não é fácil. Entendo pouco de taxa, os clientes pagam em dinheiro e cartão.",
  },
  {
    titulo: "CENA 4 - DIRECIONAMENTO",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Tem bastante detalhe nessas cobranças, mas dá para organizar melhor depois. Precisa analisar tudo com calma. ",
        tipo: "neutra",
      },
      {
        letra: "B",
        texto: "Ás vezes não é a venda, é o quanto vai ficando pelo caminho nas taxas e antecipações.",
        tipo: "correta",
      },
      {
        letra: "C",
        texto: "O problema deve ser a taxa da sua maquininha, que provavelmente é alta. Precisa ver isso...",
        tipo: "errada",
      },
    ],
    npcResposta:
      "Preciso analisar... porque eu vendo bem, mas quando olho no final... não bate com o esforço.",
  },
  {
    titulo: "CENA 5 - VALOR",
    narracao: null,
    npcInicial: null,
    escolhas: [
      {
        letra: "A",
        texto: "Se você trocar agora, já consegue reduzir bastante esses custos seus. Se a situação está tão ruim assim...",
        tipo: "errada",
      },
      {
        letra: "B",
        texto: "Se você visse claramente quando paga no total e onde dá para ajustar, ajudaria no seu mês?",
        tipo: "correta",
      },
      {
        letra: "C",
        texto: "Posso te mostrar várias opções, a Cielo resolve tudo que você precisar. Poderia interessar bastante. Pode ser?",
        tipo: "neutra",
      },
    ],
    npcResposta:
      "Ok!",
  },
];


const CAPITULO = "chapter1";
const FASE     = "padaria";
const N_CENAS  = ROTEIRO.length; // 5 perguntas

// Paleta visual usada para diferenciar estado padrao, hover e feedback das respostas
const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoPadaria extends SceneDialogoBase {
  constructor() {
    super({ key: "SceneDialogoPadaria" });

    // Configurações da personagem e do comportamento da conversa
    this.imagemKey = "falaPadaria";
    this.respostaRoteiroEstrita = true;
    this.promptLLM =
      "Voce e a atendente de uma padaria muito movimentada. " +
      "Voce e agil, pratica e valoriza um atendimento rapido e sem atritos no caixa.";
  }

  init(dados) {
    super.init(dados);

    // "estado" organiza o fluxo da interface entre tutorial, intro, escolha, resposta e fim

    // Estados iniciais da fase e da pontuação
    this.cenaIdx                 = 0;
    this.pontuacaoFase           = 0;
    this.cieloCoinsGanhasDialogo = 0;
    this.estado                  = "tutorial";
    this.aguardandoLLM           = false;
    initScoring(this.registry);
  }

  preload() {
    // Carrega a imagem da personagem se ainda não estiver disponivel
    if (!this.textures.exists("falaPadaria")) {
      this.load.image(
        "falaPadaria",
        "src/assets/imagens/imagensFalas/Padaria - F.png",
      );
    }
  }

  create() {
    // Define medidas base da interface
    // A composicao separa a arte na parte superior e a area interativa na parte inferior
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

    // Guarda a posicao do botao principal para reaproveitar no fluxo da cena
    this._CONT_Y = CONT_Y;

    // Fundo escurecido da cena de dialogo
    this.add.rectangle(CX, H / 2, W, H, 0x000000, 0.78)
      .setScrollFactor(0).setDepth(0).setInteractive();

    // Imagem principal da personagem
    const img = this.add.image(CX, IMG_CY, "falaPadaria")
      .setScrollFactor(0).setDepth(1).setOrigin(0.5);
    const escala = Math.min(W / img.width, IMG_H / img.height);
    img.setScale(escala);

    // Painel inferior com textos e escolhas
    // A linha horizontal cria a separacao visual entre ilustracao e interface de dialogo
    this.add.rectangle(CX, PANEL_CY, W, PANEL_H, 0x060d1a, 0.96)
      .setScrollFactor(0).setDepth(2);
    this.add.rectangle(CX, PANEL_TOP, W, 3, 0x2a5ba0)
      .setScrollFactor(0).setDepth(3);

    // Nome da personagem exibido nas falas
    this.textoNome = this.add.text(
      CX - BTN_W / 2,
      NOME_Y,
      "Sofia  -  Dona da Padaria",
      {
        fontSize: "20px",
        color: "#5a9fd4",
        fontStyle: "bold",
        resolution: 4,
      },
    ).setScrollFactor(0).setDepth(3).setVisible(false);

    // Texto de narração da cena
    this.textoNarracao = this.add.text(CX, NAR_Y + 30, "", {
      fontSize: "40px",
      color: "#e8f4ff",
      fontStyle: "italic",
      wordWrap: { width: BTN_W },
      align: "center",
      resolution: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(3);

    // Fala atual da NPC
    this.textoNpc = this.add.text(CX, TEXTO_NPC_Y, "", {
      fontSize: "40px",
      color: "#e8f4ff",
      wordWrap: { width: BTN_W },
      align: "center",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3);

    // Cria os botoes interativos das alternativas
    // Cada alternativa tem fundo, marcador de letra e texto separados para facilitar os estados visuais
    this.botoesEscolha = BTN_Y.map((by, i) => {
      const letra = ["A", "B", "C"][i];

      const bg = this.add.rectangle(CX, by + BTN_H / 2, BTN_W, BTN_H, COR_NEUTRO)
        .setScrollFactor(0)
        .setDepth(3)
        .setStrokeStyle(1, 0x3a5ba0)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      const labelLetra = this.add.text(CX - BTN_W / 2 + 16, by + BTN_H / 2, `[${letra}]`, {
        fontSize: "20px",
        color: "#776fe6",
        fontStyle: "bold",
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(4).setVisible(false);

      const txtEscolha = this.add.text(CX - BTN_W / 2 + 70, by + BTN_H / 2, "", {
        fontSize: "30px",
        color: "#ffffff",
        wordWrap: { width: BTN_W - 80 },
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(4).setVisible(false);

      // Enquanto a cena aguarda resposta, os eventos visuais e de clique ficam bloqueados
      bg.on("pointerover", () => { if (!this.aguardandoLLM) bg.setFillStyle(COR_HOVER); });
      bg.on("pointerout", () => { if (!this.aguardandoLLM) bg.setFillStyle(COR_NEUTRO); });
      bg.on("pointerdown", () => { if (!this.aguardandoLLM) this._aoEscolher(i); });

      return { bg, labelLetra, txtEscolha };
    });

    // Botao para avancar entre as etapas da conversa
    this.btnContinuar = this.add.rectangle(CX, CONT_Y, 340, 56, 0x1a5c1a)
      .setScrollFactor(0)
      .setDepth(3)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.txtContinuar = this.add.text(CX, CONT_Y, "", {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    // Efeitos visuais do botao continuar
    this.btnContinuar.on("pointerover", () => this.btnContinuar.setFillStyle(0x2a7c2a));
    this.btnContinuar.on("pointerout", () => this.btnContinuar.setFillStyle(0x1a5c1a));
    this.btnContinuar.on("pointerdown", () => this._aoContinuar());

    // Texto mostrado enquanto a resposta e processada
    this.textoCarregando = this.add.text(CX, CONT_Y, "Sofia esta pensando...", {
      fontSize: "21px",
      color: "#99bbdd",
      fontStyle: "italic",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(4).setVisible(false);

    // Exibe a pontuacao acumulada da sessao
    this.textoCieloCoin = this.add.text(W - 20, 16, "Cielo Coins: 0 / 500", {
      fontSize: "30px",
      color: "#ffd700",
      backgroundColor: "#000000bb",
      padding: { x: 10, y: 5 },
      resolution: 4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);

    // Mostra o titulo da cena atual
    this.textoCena = this.add.text(20, 16, "", {
      fontSize: "40px",
      color: "#ffffff",
      backgroundColor: "#000000bb",
      padding: { x: 10, y: 5 },
      resolution: 4,
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(10);

    // Atalho para fechar o resultado final
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Cria o tutorial inicial da fase
    this._criarTutorial(W, H, CX, H / 2);
  }

  update() {
    // Fecha a cena final ao apertar E
    if (this.estado === "fim" && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this._fechar();
    }
  }

  _criarTutorial(W, H, CX, CY) {
    // Monta o popup com instruções da fase
    // Os elementos ficam agrupados em array para serem destruidos juntos ao iniciar a conversa
    const els = [];
    const D = 5;

    els.push(this.add.rectangle(CX, CY, W, H, 0x000000, 0.88)
      .setScrollFactor(0).setDepth(D).setInteractive());
    els.push(this.add.rectangle(CX, CY, 1100, 640, 0x08101e)
      .setScrollFactor(0).setDepth(D + 0.1).setStrokeStyle(2, 0x2a5ba0));
    els.push(this.add.text(CX, CY - 270, "Como funciona esta conversa", {
      fontSize: "25px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
    els.push(this.add.rectangle(CX, CY - 230, 1000, 2, 0x2a5ba0)
      .setScrollFactor(0).setDepth(D + 1));

    // Regras resumidas da fase antes do primeiro contato com a cliente
    const linhas = [
      { icone: "🎯", texto: "Você vai entrar na sua primeira negociação! Seu objetivo é trazer a experiência Cielo\n para o cliente." },
      { icone: "💬", texto: "A cada cena, escolha entre três opções de resposta a que mais fizer sentido." },
      { icone: "🪙", texto: "Cada escolha vale Cielo Coins. Resposta correta = +100. Neutra = +50. Errada = +0" },
    ];

    linhas.forEach(({ icone, texto }, i) => {
      els.push(this.add.text(CX - 480, CY - 125 + i * 120, icone, { fontSize: "26px", resolution: 4 })
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1));
      els.push(this.add.text(CX - 430, CY - 110 + i * 120, texto, {
        fontSize: "30px",
        color: "#c8d8f0",
        wordWrap: { width: 900 },
        resolution: 4,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1));
    });

    const btnY = CY + 255;
    const btnBg = this.add.rectangle(CX, btnY, 300, 58, 0x1a5c1a)
      .setScrollFactor(0)
      .setDepth(D + 1)
      .setStrokeStyle(1, 0x2a9c2a)
      .setInteractive({ useHandCursor: true });
    els.push(btnBg);
    els.push(this.add.text(CX, btnY, "Comecar  ->", {
      fontSize: "24px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2));

    btnBg.on("pointerover", () => btnBg.setFillStyle(0x2a7c2a));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x1a5c1a));
    btnBg.on("pointerdown", () => {
      // Ao comecar, remove o overlay e libera a primeira cena do roteiro
      els.forEach((el) => el?.destroy?.());
      this._mostrarCena(0);
    });

    this._tutorialEls = els;
  }

  _mostrarCena(idx) {
    // Exibe a cena atual do roteiro
    // Sempre reseta os elementos visuais para evitar herdar estado da cena anterior
    const cena = ROTEIRO[idx];
    this.cenaIdx = idx;
    this.estado = "intro";
    this.aguardandoLLM = false;

    this.textoCena.setText(`${cena.titulo}  (${idx + 1} / ${ROTEIRO.length})`);
    this._esconderBotoes();
    this._ocultarContinuar();
    this.textoCarregando.setVisible(false);
    this.textoNome.setVisible(false);

    this.textoNarracao.setText(cena.narracao || "");
    this.textoNpc.setText(cena.npcInicial ? `"${cena.npcInicial}"` : "");

    // Cenas sem introducao pulam direto para o momento de escolha
    if (!cena.narracao && !cena.npcInicial) {
      this._mostrarEscolhas();
    } else {
      this.textoNome.setVisible(!!cena.npcInicial);
      this._mostrarContinuar("Responder  ->");
    }
  }

  _mostrarEscolhas() {
    // Mostra as alternativas embaralhadas para o jogador
    // A aleatorizacao reduz memorizacao da posicao e incentiva leitura das opcoes
    const cena = ROTEIRO[this.cenaIdx];
    this.estado = "escolha";

    this.textoNarracao.setText("");
    this.textoNpc.setText("O que voce diz?");
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
    // Processa a alternativa escolhida e atualiza a pontuação
    if (this.aguardandoLLM || this.estado !== "escolha") return;

    const cena = ROTEIRO[this.cenaIdx];
    const escolha = this.escolhasOrdenadas[indice];

    // Atualiza tanto a pontuação local da fase quanto o acumulado global salvo no registry
    const ganhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);
    this.pontuacaoFase           += ganhos;
    this.cieloCoinsGanhasDialogo += ganhos;
    this.textoCieloCoin.setText(
      `Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
    );

    // Destaca visualmente o botão escolhido com a cor do resultado obtido
    if (escolha.tipo === "correta") {
      this.botoesEscolha[indice].bg.setFillStyle(COR_CORRETA);
    } else if (escolha.tipo === "errada") {
      this.botoesEscolha[indice].bg.setFillStyle(COR_ERRADA);
    } else {
      this.botoesEscolha[indice].bg.setFillStyle(COR_NEUTRO);
    }

    this.aguardandoLLM = true;
    this._esconderBotoes(indice);
    this.textoCarregando.setVisible(true);

    // Mantem o feedback visual por um instante antes de avancar para a resposta
    await esperar(350);

    // A resposta pode vir do roteiro fixo ou de uma chamada externa, mas a interface trata igual
    const resposta = await this._chamarLLM(escolha, cena);

    this.aguardandoLLM = false;
    this.textoCarregando.setVisible(false);
    this._esconderBotoes();

    this.estado = "resposta";
    this.textoNarracao.setText("");
    this.textoNome.setVisible(true);
    this.textoNpc.setText(`"${resposta}"`);

    // Na ultima etapa, o botao deixa de avancar cena e passa a abrir o resumo final
    const ultimo = this.cenaIdx >= ROTEIRO.length - 1;
    this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Proxima cena  ->");
  }

  _aoContinuar() {
    // Controla o fluxo entre introducao, resposta e fim
    // O mesmo botao reutiliza comportamentos diferentes conforme o estado atual da conversa
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
    // Exibe o desempenho final da fase
    // O resumo combina progresso percentual, meta da fase e mensagem de avaliacao
    this.estado = "fim";
    this._esconderBotoes();
    this.textoNarracao.setText("");
    this.textoNome.setVisible(false);
    this.textoCena.setText("Resultado Final");

    const meta    = goalEscalado(FASE);
    const maxPts  = N_CENAS * 100;
    const atingiu = checkGoal(FASE, this.pontuacaoFase);
    const pct     = Math.round((this.pontuacaoFase / maxPts) * 100);

    let avaliacao, cor;
    if      (pct >= 40) { avaliacao = "Vendedor nato! Negócio fechado!";    cor = "#44ff88"; }
    else                { avaliacao = "Quase...";      cor = "#ff6644"; }

    // A meta indica se o jogador conseguiu o desempenho minimo esperado para a fase
    const statusMeta = atingiu
      ? "✅ Meta atingida! Parabéns, você conseguiu trazer a experiência Cielo para o cliente!"
      : `❌ Tente novamente... você precisava de ${meta} coins`;

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
    // Mostra o botão de continuar com o texto definido
    this.btnContinuar.setVisible(true);
    this.txtContinuar.setVisible(true).setText(label);
  }

  _ocultarContinuar() {
    // Esconde o botão de continuar
    this.btnContinuar.setVisible(false);
    this.txtContinuar.setVisible(false);
  }

  _esconderBotoes(manter = -1) {
    // Oculta os botões de escolha, mantendo um se preciso
    // Isso permite destacar temporariamente apenas a alternativa clicada antes da resposta aparecer
    this.botoesEscolha.forEach(({ bg, labelLetra, txtEscolha }, i) => {
      if (i !== manter) {
        bg.setVisible(false);
        labelLetra.setVisible(false);
        txtEscolha.setVisible(false);
      }
    });
  }

  async _chamarLLM(escolha, cena) {
    // Usa a resposta fixa do roteiro quando a fase está em modo estrito
    // Esse modo garante consistencia pedagogica nas respostas durante o treinamento
    if (this.respostaRoteiroEstrita) {
      return cena.npcResposta;
    }

    // Se não houver chave valida, usa a resposta padrão
    if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
      return cena.npcResposta;
    }

    // Ajusta o tom da resposta conforme o tipo da escolha
    const guias = {
      correta: "O vendedor fez uma abordagem excelente. Responda de forma receptiva, avancando a conversa.",
      neutra: "O vendedor foi aceitavel porém generico. Responda de forma neutra, sem entusiasmo mas sem fechar portas.",
      errada: "O vendedor errou a abordagem. Responda de forma mais fria ou cética, mas sem encerrar a conversa.",
    };

    // O prompt combina persona, contexto da cena, resposta-modelo e o tipo de abordagem escolhida
    const system =
      `${this.promptLLM}\n` +
      "Responda de forma natural e breve (1-2 frases) em portugues do Brasil.\n" +
      `Contexto desta cena: ${cena.titulo}. ${cena.narracao || ""}\n` +
      `Resposta de referencia (adapte para soar natural): "${cena.npcResposta}"\n` +
      `${guias[escolha.tipo]}`;

    try {
      // Solicita uma resposta dinâmica para a NPC
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
      // Se a API vier sem conteudo util, a cena faz fallback para a resposta do roteiro
      return data.choices?.[0]?.message?.content?.trim() || cena.npcResposta;
    } catch (err) {
      // Em caso de falha, retorna a resposta fixa do roteiro
      console.warn("[SceneDialogoPadaria] Falha na LLM, usando roteiro:", err.message);
      return cena.npcResposta;
    }
  }
}
