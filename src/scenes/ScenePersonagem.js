export default class ScenePersonagem extends Phaser.Scene {
    constructor() {
        super("ScenePersonagem" );

        this.CONFIG = {
            BOTOES: [
                { key: "Lucas", x: 300, y: 700, scale: 0.6, action: "selecionarLucas" },
                { key: "Maya", x: 730, y: 700, scale: 0.6, action: "selecionarMaya" },
                { key: "Joao", x: 1170, y: 700, scale: 0.6, action: "selecionarJoao" },
                { key: "Dandara", x: 1600, y: 700, scale: 0.6, action: "selecionarDandara" }
            ]
        };
    }

    preload() {
        this.load.image('fundoPersonagem', 'src/assets/imagens/imagensMapa/fundoSelecaoPersonagem.png');
        this.load.setPath('src/assets/imagens/imagensPersonagens/selecaoPersonagens/');
        
        // Loop para carregar todas as imagens do array CONFIG
        this.CONFIG.BOTOES.forEach(botao => {
            this.load.image(botao.key, `${botao.key}.png`);
        });
    }

    create() {
        // Configura o fundo
        this.fundo = this.add.image(0, 0, "fundoPersonagem").setOrigin(0, 0);
        this.fundo.displayWidth = this.scale.width;
        this.fundo.displayHeight = this.scale.height;

        // Chama a função que cria os botões e o efeito de zoom
        this.adicionarBotoes();
    }

    adicionarBotoes() {
        this.CONFIG.BOTOES.forEach(botao => {
            let x = botao.x === "center" ? this.scale.width / 2 : botao.x;
            let y = botao.y;

            // Cria o botão
            const btn = this.add.image(x, y, botao.key)
                .setScale(botao.scale)
                .setInteractive({ useHandCursor: true });

            // Ação de clique
            btn.on("pointerdown", () => {
                this.selecionarPersonagem(botao.key);
            });

            // Efeito de ZOOM 
            btn.on("pointerover", () => {
                btn.setScale(botao.scale * 1.1); // Aumenta 10%
                btn.setDepth(1); // Traz para a frente para não ser cortado pelos vizinhos
            });

            btn.on("pointerout", () => {
                btn.setScale(botao.scale); // Volta ao normal
                btn.setDepth(0);
            });
        });
    }

    selecionarPersonagem(nome) {
        console.log("Selecionado:", nome);
        localStorage.setItem('personagemSelecionado', nome);
        this.scene.start('SceneJogo');
    }
}