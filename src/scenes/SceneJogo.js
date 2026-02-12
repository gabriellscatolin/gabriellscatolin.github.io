// Cena do jogo - Mapa da ponte com personagem controlável
export default class SceneJogo extends Phaser.Scene { 
  constructor() {
    super("SceneJogo");
  }
//Carrega os assets necessários para a cena
  preload() {
    this.load.image("mapaPonte", "src/assets/imagens/imagensMapa/mapaPonte.png"); //Carrega mapa da ponte
    this.load.image("wasd", "src/assets/imagens/imagensBotoes/wasd.png"); //Carrega cena do tutorial

    const caminho = "src/assets/imagens/imagensPersonagens/homem_banco_VF"; //Guarda os caminhos das imagens dos personagens
    for (let i = 1; i <= 4; i++) { //Cria loop para ser possível carregar todos os sprites
      this.load.image(`hb_frente_${i}`, `${caminho}/HB_frente_${i}.png`);
      this.load.image(`hb_tras_${i}`, `${caminho}/HB_tras_${i}.png`);//{i} são templates string para carregar as imagens de forma dinâmica
      this.load.image(`hb_direita_${i}`, `${caminho}/HB_direita_${i}.png`);
      this.load.image(`hb_esquerda_${i}`, `${caminho}/HB_esquerda_${i}.png`);
    }
  }

  create() {
    this.fundo = this.add.image(0, 0, "mapaPonte").setOrigin(0, 0);//Esse set origin é para alinhar a imagem ao canto superior esquerdo da tela, garantindo que ela preencha toda a área de jogo
    this.fundo.displayWidth = this.scale.width; //Ajusta a largura do fundo para preencher toda a largura da tela, garantindo que o mapa se encaixe perfeitamente
    this.fundo.displayHeight = this.scale.height;// Ajusta a altura do fundo para preencher toda a altura da tela, garantindo que o mapa se encaixe perfeitamente

    this.criarAnimacoes();

    this.personagem = this.add.sprite(//Cria o sprite do personagem, posicionando-o no centro da tela e um pouco para baixo (684) para que ele fique na posição correta em relação ao mapa
      this.scale.width / 2,
      684,
      "hb_frente_1"
    ).setScale(0.15);
    this.physics.add.existing(this.personagem);
//Adiciona física ao personagem para permitir movimento e colisões
    this.teclas = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.velocidade = 300;

    this.input.keyboard.on("keydown-F", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    this.add.image(90, 80, "wasd").setScale(0.12).setScrollFactor(0).setDepth(10);

// A transição de entrada é aplicada após a criação dos elementos da cena para garantir que o efeito seja visível desde o início do jogo
    this.transicaoEntradaPixel();
  }

  transicaoEntradaPixel() {
    const cam = this.cameras.main;
    const pixelated = cam.postFX.addPixelate(60);

    this.add.tween({
      targets: pixelated,
      amount: 1,
      duration: 1000,
      onComplete: () => {
        cam.postFX.remove(pixelated);
      }
    });
  }
// O método criarAnimacoes é responsável por definir as animações de movimento do personagem, associando cada direção a um conjunto de frames específicos para criar uma animação fluida
  criarAnimacoes() {
    this.anims.create({
      key: "andar_frente",
      frames: [
        { key: "hb_frente_1" },
        { key: "hb_frente_2" },
        { key: "hb_frente_3" },
        { key: "hb_frente_4" }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "andar_tras",
      frames: [
        { key: "hb_tras_1" },
        { key: "hb_tras_2" },
        { key: "hb_tras_3" },
        { key: "hb_tras_4" }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "andar_direita",
      frames: [
        { key: "hb_direita_1" },
        { key: "hb_direita_2" },
        { key: "hb_direita_3" },
        { key: "hb_direita_4" }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "andar_esquerda",
      frames: [
        { key: "hb_esquerda_1" },
        { key: "hb_esquerda_2" },
        { key: "hb_esquerda_3" },
        { key: "hb_esquerda_4" }
      ],
      frameRate: 8,
      repeat: -1
    });
  }
// O método update é chamado a cada frame do jogo
  update() {
  const body = this.personagem.body;
  body.setVelocity(0);

  let andando = false;

  if (this.teclas.a.isDown) {
    body.setVelocityX(-this.velocidade);
    if (this.personagem.anims.currentAnim?.key !== "andar_esquerda") {
      this.personagem.anims.play("andar_esquerda");
    }
    andando = true;
  } 
  else if (this.teclas.d.isDown) {  //Verifica se a tecla D está pressionada para mover o personagem para a direita
    body.setVelocityX(this.velocidade);
    if (this.personagem.anims.currentAnim?.key !== "andar_direita") {
      this.personagem.anims.play("andar_direita");
    }
    andando = true;
  }

  if (this.teclas.w.isDown) {
    body.setVelocityY(-this.velocidade);
    if (!andando && this.personagem.anims.currentAnim?.key !== "andar_tras") {
      this.personagem.anims.play("andar_tras");
    }
    andando = true;
  } 
  else if (this.teclas.s.isDown) {
    body.setVelocityY(this.velocidade);
    if (!andando && this.personagem.anims.currentAnim?.key !== "andar_frente") {
      this.personagem.anims.play("andar_frente");
    }
    andando = true;
  }

// Se nenhuma tecla de movimento estiver pressionada, pausa a animação do personagem para que ele fique em uma pose de descanso
  if (!andando) {
    this.personagem.anims.pause(); // antes era stop()
  } else {
    this.personagem.anims.resume();
  }// O método Phaser.Math.Clamp é usado para limitar a posição do personagem dentro dos limites do mapa, evitando que ele saia da área de jogo

  this.personagem.y = Phaser.Math.Clamp(this.personagem.y, 578, 690);
  this.personagem.x = Phaser.Math.Clamp(this.personagem.x, 0, 1920);
}

}
