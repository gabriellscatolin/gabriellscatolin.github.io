// Classe que representa a cena de seleção de personagens
export default class ScenePersonagem extends Phaser.Scene {
    constructor() {
        super({ key: "ScenePersonagem" }); // Identificador da cena
    }
        
    // Carrega as imagens usadas na cena
    preload() {
        this.load.image('fundoPersonagem', 'src/assets/imagens/imagensMapa/fundoSelecaoPersonagem.png'); // Fundo da tela
        
        this.load.setPath('src/assets/imagens/imagensPersonagens/selecaoPersonagens/');
        this.load.image('Lucas', 'Lucas.png'); 
        this.load.image('Maya', 'Maya.png'); 
        this.load.image('Joao', 'Joao.png'); 
        this.load.image('Dandara', 'Dandara.png');
    }

    // Cria os elementos visuais da cena
    create() {
        // Adiciona o fundo e ajusta ao tamanho da tela
        this.fundo = this.add.image(0, 0, "fundoPersonagem").setOrigin(0, 0);
        this.fundo.displayWidth = this.scale.width;
        this.fundo.displayHeight = this.scale.height;

        // Adiciona os personagens na tela, com posição e interação ativada
        const Personagem1 = this.add.image(313, 700, 'Lucas').setScale(0.6).setInteractive();
        const Maya = this.add.image(730, 700, 'Maya').setScale(0.6).setInteractive();
        const personagem3 = this.add.image(1170, 700, 'Joao').setScale(0.6).setInteractive();
        const personagem4 = this.add.image(1600, 700, 'Dandara').setScale(0.6).setInteractive();
    }

    // Define os comportamentos de hover e clique para cada personagem
    configurarInteracao(personagem, fichaTecnica, callbackSelecao) {

        // Quando o personagem for clicado
        personagem.on('pointerdown', callbackSelecao);
    }

     // Salva a escolha do personagem e vai para a próxima cena
    selecionarPersonagem(personagem) {
        localStorage.setItem('personagemSelecionado', personagem); // Salva no navegador
        this.scene.start('Tutorial'); // Avança para o tutorial
    }
}