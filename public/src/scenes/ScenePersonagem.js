//Cena de seleção dos personagens
export default class ScenePersonagem extends Phaser.Scene {
    constructor() {
        super("ScenePersonagem");

        // Centralização de dados para facilitar a adição de novos personagens
        this.PERSONAGENS = [
            { key: "Gabriel", x: 300, y: 700, scale: 0.42 },
            { key: "Maya", x: 730, y: 700, scale: 0.42 },
            { key: "Joao", x: 1170, y: 700, scale: 0.42 },
            { key: "Dandara", x: 1600, y: 700, scale: 0.42 }
        ];
    }

    preload() {
        this.load.image('fundoPersonagem', 'src/assets/imagens/imagensMapa/fundoSelecaoPersonagem.png'); //Carrega o fundo
        this.load.setPath('src/assets/imagens/imagensPersonagens/selecaoPersonagens/');                  //Define o destino para carregar as imagens dos personagens

        // Carregamento dinâmico: evita repetir load.image para cada personagem
        this.PERSONAGENS.forEach(p => this.load.image(p.key, `${p.key}.png`));
    }

    create() {
        // Inicializa os elementos visuais da interface
        this.add.image(0, 0, "fundoPersonagem").setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);

        this.criarMenuSelecao();
    }

    criarMenuSelecao() {
        // Constrói os botões e atribui seus comportamentos
        this.PERSONAGENS.forEach(dados => {
            const btn = this.add.image(dados.x, dados.y, dados.key)
                .setScale(dados.scale)
                .setInteractive({ useHandCursor: true });

            this.configurarEventos(btn, dados);
        });
    }

    configurarEventos(btn, dados) {
        // Inicia a cena principal passando o personagem escolhido como parâmetro
        btn.on("pointerdown", () => {
            this.scene.start('SceneJogo', { personagem: dados.key });
        });

        // Efeito de destaque (Zoom e Profundidade) no hover
        btn.on("pointerover", () => {
            btn.setScale(dados.scale * 1.1).setDepth(1);
        });

        btn.on("pointerout", () => {
            btn.setScale(dados.scale).setDepth(0);
        });
    }
}