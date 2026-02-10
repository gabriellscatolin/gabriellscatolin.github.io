// Classe que representa a cena de seleção de personagens
export default class Personagem extends Phaser.Scene {
    constructor() {
        super({ key: "Personagem" }); // Identificador da cena

        // Variáveis da cena
        this.personagemSelecionado = null; // Vai guardar o nome do personagem escolhido
       

    // Carrega as imagens usadas na cena
    preload() {
        this.load.image('fundo', './assets/telas/personagem/fundo.png'); // Fundo da tela
        this.load.image('personagem1', './assets/mauro/mauro1.png');     // Imagem do personagem 1
        this.load.image('personagem2', './assets/chris/chris1.png');     // Imagem do personagem 2
        this.load.image('personagem3', './assets/tiago/tiago1.png');     // Imagem do personagem 3
    }

    // Cria os elementos visuais da cena
    create() {
        // Adiciona o fundo e ajusta ao tamanho da tela
        const fundo = this.add.image(0, 0, 'fundo').setOrigin(0, 0);
        fundo.displayWidth = this.cameras.main.width;
        fundo.displayHeight = this.cameras.main.height;

        // Adiciona os personagens na tela, com posição e interação ativada
        const personagem1 = this.add.image(313, 424, 'personagem1').setScale(1.0).setInteractive();
        const personagem2 = this.add.image(730, 421, 'personagem2').setScale(1).setInteractive();
        const personagem3 = this.add.image(1145, 430, 'personagem3').setScale(1.0).setInteractive();

        // Define o que acontece quando o jogador interage com cada personagem
        this.configurarInteracao(personagem1, 'ficha01', () => this.selecionarPersonagem('personagem1'));
        this.configurarInteracao(personagem2, 'ficha02', () => this.selecionarPersonagem('personagem2'));
        this.configurarInteracao(personagem3, 'ficha03', () => this.selecionarPersonagem('personagem3'));
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