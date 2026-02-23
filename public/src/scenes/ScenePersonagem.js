export default class ScenePersonagem extends Phaser.Scene {
    constructor() {
        super("ScenePersonagem");

        // Centralização de dados com a inclusão do PREFIXO de cada arquivo
        this.PERSONAGENS = [
            { key: "Gabriel", x: 300,  y: 700, scale: 0.42, prefixo: "HB" },
            { key: "Maya",    x: 730,  y: 700, scale: 0.42, prefixo: "ML" },
            { key: "Joao",    x: 1170, y: 700, scale: 0.42, prefixo: "HM" },
            { key: "Dandara", x: 1600, y: 700, scale: 0.42, prefixo: "MM" }
        ];
    }

    preload() {
        this.load.image('fundoPersonagem', 'src/assets/imagens/imagensMapa/fundoSelecaoPersonagem.png');
        this.load.setPath('src/assets/imagens/imagensPersonagens/selecaoPersonagens/');

        // Carrega as fotos de exibição do menu
        this.PERSONAGENS.forEach(p => this.load.image(p.key, `${p.key}.png`));
    }

    create() {
        this.add.image(0, 0, "fundoPersonagem").setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);

        this.criarMenuSelecao();
    }

    criarMenuSelecao() {
        this.PERSONAGENS.forEach(dados => {
            const btn = this.add.image(dados.x, dados.y, dados.key)
                .setScale(dados.scale)
                .setInteractive({ useHandCursor: true });

            this.configurarEventos(btn, dados);
        });
    }

    configurarEventos(btn, dados) {
        btn.on("pointerdown", () => {
            // Passamos o NOME (para a pasta) e o PREFIXO (para o arquivo)
            this.scene.start('SceneJogo', { 
                personagem: dados.key, 
                prefixo: dados.prefixo 
            });
        });

        btn.on("pointerover", () => {
            btn.setScale(dados.scale * 1.1).setDepth(1);
        });

        btn.on("pointerout", () => {
            btn.setScale(dados.scale).setDepth(0);
        });
    }
}