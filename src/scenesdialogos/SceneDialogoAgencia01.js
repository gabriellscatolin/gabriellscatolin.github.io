import SceneDialogoBase from "./SceneDialogoBase.js";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
import { initScoring, handleAnswer, checkGoal, getScore, goalEscalado } from "../scoring.js";

// Configuração da LLM
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Modo de treinamento: resposta sempre fiel ao roteiro, sem improviso.
const IA_MODO_ESTRITO_ROTEIRO = true;

// FASE 1 - AGENCIA 01 (GG)
const ROTEIRO_GG = [
	{
		titulo: "CENA 0 - CHEGADA / OBSERVACAO",
		narracao:
			"Ambiente: Agencia organizada. Ritmo acelerado. Equipe em atividade. Antes de abordar, entenda o ambiente e se posicione corretamente.",
		npcInicial: "Bom dia, posso te ajudar?",
		escolhas: [
			{
				letra: "A",
				texto: "Bom dia! Movimento intenso hoje.",
				tipo: "neutra",
			},
			{
				letra: "B",
				texto: "Bom dia! Agencia bem dinamica hoje.",
				tipo: "correta",
			},
			{
				letra: "C",
				texto: "Bom dia! Vim falar de solucoes da Cielo.",
				tipo: "errada",
			},
		],
		npcResposta: "Bom dia! O movimento esta intenso mesmo. Como posso te ajudar hoje?",
	},
	{
		titulo: "CENA 1 - ABORDAGEM (GERENTE GERAL)",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{
				letra: "A",
				texto: "Sou da Cielo, vim ver alguns clientes.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "Sou o parceiro da Cielo e vim me apresentar.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "Sou o parceiro da Cielo da agencia. Vim fortalecer a parceria e apoiar o PJ.",
				tipo: "correta",
			},
		],
		npcResposta: "Perfeito, seja bem-vindo.",
	},
	{
		titulo: "CENA 2 - ALINHAMENTO COM GERENTE GERAL",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{
				letra: "A",
				texto: "Vou falar com o pessoal ali.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "Vou ver com o PJ como posso ajudar.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "Vou atuar com o PJ, apoiando negocios e retencao da carteira.",
				tipo: "correta",
			},
		],
		npcResposta: "Otimo, pode seguir.",
	},
	{
		titulo: "CENA 3 - PRIORIDADES DA AGENCIA",
		narracao: null,
		npcInicial: "Qual e o seu foco aqui hoje?",
		escolhas: [
			{
				letra: "A",
				texto: "Vender o maximo de maquininhas possivel.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "Conhecer os clientes e ver o que precisam.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "Ativar clientes com potencial e fortalecer a carteira PJ da agencia.",
				tipo: "correta",
			},
		],
		npcResposta: "Isso esta alinhado com as nossas metas tambem.",
	},
	{
		titulo: "CENA 4 - BENEFICIOS DA PARCERIA",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{
				letra: "A",
				texto: "A Cielo paga comissao para os gerentes indicarem clientes.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "A parceria com a Cielo e reconhecida no mercado.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "A parceria gera receita para a agencia e valor real para o cliente PJ.",
				tipo: "correta",
			},
		],
		npcResposta: "Faz sentido. Vamos aproveitar essa oportunidade.",
	},
	{
		titulo: "CENA 5 - OBJECAO DO GG",
		narracao: null,
		npcInicial: "Tivemos problemas com parceiros anteriores que nao cumpriram o combinado.",
		escolhas: [
			{
				letra: "A",
				texto: "Com a Cielo e diferente, pode confiar.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "Entendo, mas dessa vez sera diferente.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "Entendo a preocupacao. Por isso quero estabelecer um ritmo claro de retorno e resultados.",
				tipo: "correta",
			},
		],
		npcResposta: "Se tiver acompanhamento constante, da mais seguranca para a gente.",
	},
	{
		titulo: "CENA 6 - METAS DE ATIVACAO",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{
				letra: "A",
				texto: "Minha meta e de 10 maquininhas por mes.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "Tenho algumas metas a cumprir esse mes.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "Vou focar nos clientes com maior volume para garantir ativacoes de qualidade.",
				tipo: "correta",
			},
		],
		npcResposta: "Qualidade e melhor que quantidade. Prefiro clientes que ficam.",
	},
	{
		titulo: "CENA 7 - PLANEJAMENTO DE VISITAS CONJUNTAS",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{
				letra: "A",
				texto: "Posso ir sozinho nos clientes.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "Podemos combinar de ir juntos quando der.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "Proponho duas visitas conjuntas essa semana nos clientes priorizados.",
				tipo: "correta",
			},
		],
		npcResposta: "Visita conjunta passa mais credibilidade. Vamos agendar.",
	},
	{
		titulo: "CENA 8 - COMUNICACAO E RETORNO",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{
				letra: "A",
				texto: "Te aviso se fechar alguma coisa.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "Mando mensagem quando tiver novidade.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "Envio um resumo semanal com status das oportunidades para voce acompanhar.",
				tipo: "correta",
			},
		],
		npcResposta: "Perfeito. Transparencia e o que preciso para apoiar voce aqui dentro.",
	},
	{
		titulo: "CENA 9 - ENCERRAMENTO COM GG",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{
				letra: "A",
				texto: "Entao ta, ate mais.",
				tipo: "errada",
			},
			{
				letra: "B",
				texto: "Obrigado pela atencao, ate logo.",
				tipo: "neutra",
			},
			{
				letra: "C",
				texto: "Agradeco o alinhamento. Fico a disposicao e ja sigo para o PJ.",
				tipo: "correta",
			},
		],
		npcResposta: "Pode ir. Boa sorte com os clientes hoje.",
	},
];

// FASE 1 - AGENCIA 01 (PJ)
const ROTEIRO_PJ = [
	{
		titulo: "CENA 3 - ABORDAGEM (GERENTE PJ)",
		narracao: "Ambiente: Gerente PJ no atendimento. Agenda cheia.",
		npcInicial: "Bom dia. O que voce trouxe hoje?",
		escolhas: [
			{ letra: "A", texto: "Trouxe maquininhas para oferecer.", tipo: "errada" },
			{ letra: "B", texto: "Separei clientes que podem usar maquininha.", tipo: "neutra" },
			{ letra: "C", texto: "Analisei a carteira e vi clientes com potencial de aumentar faturamento.", tipo: "correta" },
		],
		npcResposta: "Quais clientes?",
	},
	{
		titulo: "CENA 4 - APRESENTACAO DE OPORTUNIDADES",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{ letra: "A", texto: "Qualquer cliente que quiser maquininha.", tipo: "errada" },
			{ letra: "B", texto: "Clientes proximos da agencia.", tipo: "neutra" },
			{ letra: "C", texto: "Separei farmacia e padaria com bom volume e potencial rapido.", tipo: "correta" },
		],
		npcResposta: "Podemos visitar?",
	},
	{
		titulo: "CENA 5 - DIRECIONAMENTO DE VISITA",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{ letra: "A", texto: "Pode ser.", tipo: "errada" },
			{ letra: "B", texto: "Se voce puder ir.", tipo: "neutra" },
			{ letra: "C", texto: "Ir juntos aumenta confianca e facilita o fechamento.", tipo: "correta" },
		],
		npcResposta: "Certo, podemos alinhar isso.",
	},
	{
		titulo: "CENA 6 - CHECK-IN / PROCESSO",
		narracao: "Organizacao e processo fazem parte da rotina.",
		npcInicial: null,
		escolhas: [
			{ letra: "A", texto: "Depois eu registro isso.", tipo: "errada" },
			{ letra: "B", texto: "Vou anotar para registrar depois.", tipo: "neutra" },
			{ letra: "C", texto: "Ja vou registrar no sistema para organizar as visitas.", tipo: "correta" },
		],
		npcResposta: "Perfeito, isso ajuda no controle.",
	},
	{
		titulo: "CENA 7 - ENCERRAMENTO NA AGENCIA",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{ letra: "A", texto: "Entao e isso.", tipo: "errada" },
			{ letra: "B", texto: "Depois te atualizo.", tipo: "neutra" },
			{ letra: "C", texto: "Alinho as visitas e te trago retorno das oportunidades.", tipo: "correta" },
		],
		npcResposta: "Combinado.",
	},
	{
		titulo: "CENA 8 - OBJECAO DO PJ",
		narracao: null,
		npcInicial: "Mas esses clientes ja tem maquininha de outras bandeiras.",
		escolhas: [
			{ letra: "A", texto: "Entao ja sao clientes Cielo tambem.", tipo: "errada" },
			{ letra: "B", texto: "A Cielo pode complementar o que ja tem.", tipo: "neutra" },
			{ letra: "C", texto: "Posso mostrar onde a Cielo entrega mais valor: taxas, suporte e velocidade.", tipo: "correta" },
		],
		npcResposta: "Se tiver argumento concreto de diferencial, pode valer a conversa.",
	},
	{
		titulo: "CENA 9 - PRODUTO ESPECIFICO",
		narracao: null,
		npcInicial: "O que voce indicaria para um comercio com alto volume de vendas?",
		escolhas: [
			{ letra: "A", texto: "Qualquer maquininha da Cielo atende.", tipo: "errada" },
			{ letra: "B", texto: "Uma opcao de maquininha mais robusta.", tipo: "neutra" },
			{ letra: "C", texto: "Um terminal com integracao de sistema e suporte prioritario, ideal para alto volume.", tipo: "correta" },
		],
		npcResposta: "Faz sentido. Esse tipo de cliente precisa de estabilidade acima de tudo.",
	},
	{
		titulo: "CENA 10 - PROXIMOS PASSOS",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{ letra: "A", texto: "Vou tentar falar com eles essa semana.", tipo: "errada" },
			{ letra: "B", texto: "Entro em contato com os clientes em breve.", tipo: "neutra" },
			{ letra: "C", texto: "Agendo as visitas ainda hoje e te mando a confirmacao por mensagem.", tipo: "correta" },
		],
		npcResposta: "Quanto mais rapido, melhor. Aproveita o momento.",
	},
	{
		titulo: "CENA 11 - ENCERRAMENTO COM PJ",
		narracao: null,
		npcInicial: null,
		escolhas: [
			{ letra: "A", texto: "Valeu, qualquer coisa te falo.", tipo: "errada" },
			{ letra: "B", texto: "Obrigado, ate mais.", tipo: "neutra" },
			{ letra: "C", texto: "Agradeco o tempo. Faco as visitas e te trago o retorno com resultado.", tipo: "correta" },
		],
		npcResposta: "Certo. Espero o retorno. Boa sorte.",
	},
];

const CAPITULO = "chapter1";

const COR_NEUTRO = 0x1d2b4a;
const COR_HOVER = 0x2a3f6a;
const COR_CORRETA = 0x1a5c1a;
const COR_NEUTRA = 0x1a3a5c;
const COR_ERRADA = 0x6a1a1a;

export default class SceneDialogoAgencia01 extends SceneDialogoBase {
	constructor() {
		super({ key: "SceneDialogoAgencia01" });
		this.imagemKey = "falaAgencia01GG";
		this.promptLLM = "";
	}

	init(dados) {
		super.init(dados);
		this.tipoDialogo = dados?.tipoDialogo || "GG";
		this.roteiro = this.tipoDialogo === "PJ" ? ROTEIRO_PJ : ROTEIRO_GG;
		this.maxPts = this.roteiro.length * 2;
		this.nomeNpcDialogo = this.tipoDialogo === "PJ" ? "PJ" : "GG";
		this.promptLLM =
			this.tipoDialogo === "PJ"
				? "Voce e o PJ da Agencia Cielo. Seja objetivo e comercial."
				: "Voce e o Gerente Geral (GG) da Agencia Cielo. Seja profissional e acolhedor.";
		this.imagemKey = this.tipoDialogo === "PJ" ? "falaAgencia01PJ" : "falaAgencia01GG";
		this.cenaIdx = 0;
		this.pontuacao = 0;
		this.cieloCoinsGanhasDialogo = 0;
		this.estado = "tutorial";
		this.aguardandoLLM = false;

		initScoring(this.registry);
	}

	preload() {
		if (!this.textures.exists("falaAgencia01GG")) {
			this.load.image(
				"falaAgencia01GG",
				"src/assets/imagens/imagensFalas/Agência01 - GG.png",
			);
		}
		if (!this.textures.exists("falaAgencia01PJ")) {
			this.load.image(
				"falaAgencia01PJ",
				"src/assets/imagens/imagensFalas/Agência01 - PJ.png",
			);
		}
	}

	create() {
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

		this._CONT_Y = CONT_Y;

		this.add
			.rectangle(CX, H / 2, W, H, 0x000000, 0.78)
			.setScrollFactor(0)
			.setDepth(0)
			.setInteractive();

		const img = this.add
			.image(CX, IMG_CY, this.imagemKey)
			.setScrollFactor(0)
			.setDepth(1)
			.setOrigin(0.5);
		const escala = Math.min(W / img.width, IMG_H / img.height);
		img.setScale(escala);

		this.add
			.rectangle(CX, PANEL_CY, W, PANEL_H, 0x060d1a, 0.96)
			.setScrollFactor(0)
			.setDepth(2);
		this.add
			.rectangle(CX, PANEL_TOP, W, 3, 0x2a5ba0)
			.setScrollFactor(0)
			.setDepth(3);

		this.textoNome = this.add
			.text(CX - BTN_W / 2, NOME_Y, `${this.nomeNpcDialogo}  —  Agencia Cielo`, {
				fontSize: "24px",
				color: "#5a9fd4",
				fontStyle: "bold",
				resolution: 4,
			})
			.setScrollFactor(0)
			.setDepth(3)
			.setVisible(false);

		this.textoNarracao = this.add
			.text(CX, NAR_Y + 30, "", {
				fontSize: "22px",
				color: "#99bbdd",
				fontStyle: "italic",
				wordWrap: { width: BTN_W },
				align: "center",
				resolution: 4,
			})
			.setOrigin(0.5, 0)
			.setScrollFactor(0)
			.setDepth(3);

		this.textoNpc = this.add
			.text(CX, TEXTO_NPC_Y, "", {
				fontSize: "30px",
				color: "#e8f4ff",
				wordWrap: { width: BTN_W },
				align: "center",
				resolution: 4,
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(3);

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
					fontSize: "25px",
					color: "#5a9fd4",
					fontStyle: "bold",
					resolution: 4,
				})
				.setOrigin(0, 0.5)
				.setScrollFactor(0)
				.setDepth(4)
				.setVisible(false);

			const txtEscolha = this.add
				.text(CX - BTN_W / 2 + 70, by + BTN_H / 2, "", {
					fontSize: "25px",
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

		this.btnContinuar = this.add
			.rectangle(CX, CONT_Y, 340, 56, 0x1a5c1a)
			.setScrollFactor(0)
			.setDepth(3)
			.setStrokeStyle(1, 0x2a9c2a)
			.setInteractive({ useHandCursor: true })
			.setVisible(false);
		this.txtContinuar = this.add
			.text(CX, CONT_Y, "", {
				fontSize: "26px",
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

		this.textoCarregando = this.add
			.text(CX, CONT_Y, "Theo está pensando...", {
				fontSize: "24px",
				color: "#99bbdd",
				fontStyle: "italic",
				resolution: 4,
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(4)
			.setVisible(false);

		this.textoCieloCoin = this.add
			.text(W - 20, 16, "", {
				fontSize: "24px",
				color: "#ffd700",
				backgroundColor: "#000000bb",
				padding: { x: 10, y: 5 },
				resolution: 4,
			})
			.setOrigin(1, 0)
			.setScrollFactor(0)
			.setDepth(10);
		this._atualizarHudMoedas();

		this.textoCena = this.add
			.text(20, 16, "", {
				fontSize: "24px",
				color: "#aaccee",
				backgroundColor: "#000000bb",
				padding: { x: 10, y: 5 },
				resolution: 4,
			})
			.setOrigin(0, 0)
			.setScrollFactor(0)
			.setDepth(10);

		this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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
					fontSize: "32px",
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
			{
				icone: "🎯",
				texto: `Voce vai conduzir a conversa com ${this.nomeNpcDialogo} na Agencia Cielo.`,
			},
			{
				icone: "💬",
				texto:
					"Em cada cena, escolha a melhor resposta para manter o diálogo estratégico.",
			},
			{
				icone: "🪙",
				texto:
					"Cielo Coins:\n✅ correta = +2   ⚪ neutra = +1   ❌ errada = +0",
			},
			{
				icone: "🤖",
				texto:
					"O NPC responde com IA com base na sua escolha, mantendo contexto comercial.",
			},
			{
				icone: "🏆",
				texto: "Busque a maior pontuação para fechar um atendimento de excelência.",
			},
		];

		linhas.forEach(({ icone, texto }, i) => {
			const y = CY - 170 + i * 82;
			els.push(
				this.add
					.text(CX - 480, y, icone, { fontSize: "26px", resolution: 4 })
					.setOrigin(0, 0.5)
					.setScrollFactor(0)
					.setDepth(D + 1),
			);
			els.push(
				this.add
					.text(CX - 430, y, texto, {
						fontSize: "20px",
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
		const cena = this.roteiro[idx];
		this.cenaIdx = idx;
		this.estado = "intro";
		this.aguardandoLLM = false;

		this.textoCena.setText(`${cena.titulo}  (${idx + 1} / ${this.roteiro.length})`);
		this._esconderBotoes();
		this._ocultarContinuar();
		this.textoCarregando.setVisible(false);
		this.textoNome.setVisible(false);

		// Nesta cena mostramos somente fala, sem bloco de narracao.
		this.textoNarracao.setText("");
		this.textoNpc.setText(cena.npcInicial ? `"${cena.npcInicial}"` : "");

		if (!cena.narracao && !cena.npcInicial) {
			this._mostrarEscolhas();
		} else {
			this.textoNome.setVisible(!!cena.npcInicial);
			this._mostrarContinuar("Responder  ->");
		}
	}

	_mostrarEscolhas() {
		const cena = this.roteiro[this.cenaIdx];
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
		if (this.aguardandoLLM || this.estado !== "escolha") return;

		const cena = this.roteiro[this.cenaIdx];
		const escolha = this.escolhasOrdenadas[indice];
		const pontosGanhos = handleAnswer(this.registry, CAPITULO, escolha.tipo);
		this.pontuacao               += pontosGanhos;
		this.cieloCoinsGanhasDialogo += pontosGanhos;
		this._atualizarHudMoedas();

		const coresTipo = {
			correta: COR_CORRETA,
			neutra: COR_NEUTRA,
			errada: COR_ERRADA,
		};
		this.botoesEscolha[indice].bg.setFillStyle(coresTipo[escolha.tipo]);

		this.aguardandoLLM = true;
		this._esconderBotoes(indice);
		this.textoCarregando.setVisible(true);

		const resposta = await this._chamarLLM(escolha, cena);

		this.aguardandoLLM = false;
		this.textoCarregando.setVisible(false);
		this._esconderBotoes();

		this.estado = "resposta";
		this.textoNarracao.setText("");
		this.textoNome.setVisible(true);
		this.textoNpc.setText(`"${resposta}"`);

		const ultimo = this.cenaIdx >= this.roteiro.length - 1;
		this._mostrarContinuar(ultimo ? "Ver resultado  ->" : "Proxima cena  ->");
	}

	_aoContinuar() {
		if (this.estado === "intro") {
			this._mostrarEscolhas();
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
		this.estado = "fim";
		this._esconderBotoes();
		this.textoNarracao.setText("");
		this.textoNome.setVisible(false);
		this.textoCena.setText("Resultado Final");

		const faseKey = this.tipoDialogo === "PJ" ? "agency1_pj" : "agency1_gg";
		const atingiu = checkGoal(faseKey, this.pontuacao);
		const meta    = goalEscalado(faseKey);
		const pct     = Math.round((this.pontuacao / this.maxPts) * 100);
		let avaliacao;
		let cor;
		if (pct >= 90) {
			avaliacao = "Excelente atendimento!";
			cor = "#44ff88";
		} else if (pct >= 70) {
			avaliacao = "Bom trabalho!";
			cor = "#88ccff";
		} else if (pct >= 50) {
			avaliacao = "Razoavel, da para evoluir.";
			cor = "#ffcc44";
		} else {
			avaliacao = "Tente novamente para melhorar a abordagem.";
			cor = "#ff6644";
		}

		const resumoFasePJ =
			"Voce concluiu a fase de onboarding na agencia.\n\n" +
			"Competencias avaliadas:\n" +
			"- Postura profissional\n" +
			"- Posicionamento como parceiro\n" +
			"- Leitura de ambiente\n" +
			"- Organizacao e processo\n" +
			"- Uso de discurso de valor";

		const statusMeta = atingiu
			? "✅ Meta atingida!"
			: `❌ Meta nao atingida (precisava de ${meta} coins)`;

		const textoFinal =
			this.tipoDialogo === "PJ"
				? `${resumoFasePJ}\n\nCoins da fase: ${this.pontuacao} / ${this.maxPts} (${pct}%)\nTotal da sessao: ${getScore(this.registry)}\n\n${statusMeta}\n\n${avaliacao}`
				: `Conversa encerrada!\n\nCoins da fase: ${this.pontuacao} / ${this.maxPts} (${pct}%)\nTotal da sessao: ${getScore(this.registry)}\n\n${statusMeta}\n\n${avaliacao}`;

		this.textoNpc.setText(textoFinal).setStyle({ color: cor, fontSize: "22px" });

		if (this.tipoDialogo === "GG") {
			this.registry.set("ag01_dialogo_gg_concluido", true);
		}
		if (this.tipoDialogo === "PJ") {
			this.registry.set("ag01_dialogo_pj_concluido", true);
			this.registry.set("ag01_escolta_pj_agencia2", true);
			this.registry.set("ag01_pj_retorno", false);
			this.registry.set("missaoCidadeTexto", "Missao: Siga o PJ ate a Padaria.");
		}

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

	_atualizarHudMoedas() {
		if (!this.textoCieloCoin) return;
		this.textoCieloCoin.setText(
			`Cielo Coins: ${getScore(this.registry)}  (+${this.cieloCoinsGanhasDialogo} aqui)`,
		);
	}

	async _chamarLLM(escolha, cena) {
		if (IA_MODO_ESTRITO_ROTEIRO) {
			return cena.npcResposta;
		}

		if (!GROQ_API_KEY || GROQ_API_KEY === "SUA_CHAVE_GROQ_AQUI") {
			return cena.npcResposta;
		}

		const guias = {
			correta:
				"O jogador fez uma abordagem excelente. Responda de forma receptiva.",
			neutra: "O jogador foi aceitavel. Responda de forma neutra.",
			errada: "O jogador errou a abordagem. Responda de forma mais cética.",
		};

		const system =
			`${this.promptLLM}\n` +
			`Responda em portugues do Brasil, em 1-2 frases.\n` +
			`Contexto: ${cena.titulo}. ${cena.narracao || ""}\n` +
			`Resposta de referencia: "${cena.npcResposta}"\n` +
			`${guias[escolha.tipo]}`;

		try {
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
			console.warn(
				"[SceneDialogoAgencia01] Falha na LLM, usando roteiro:",
				err.message,
			);
			return cena.npcResposta;
		}
	}
}
