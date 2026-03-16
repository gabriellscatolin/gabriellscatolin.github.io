export default class SceneSupermercado extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneSupermercado' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || "HB";
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneSupermercado] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON('supermercado', 'src/assets/imagens/mapsjson/tileMaps/supermercado.tmj');
    this.load.image('supermercado_tiles', 'src/assets/imagens/mapsjson/tileSets/supermercado.png');

    // Carrega os 16 frames de animação do personagem escolhido
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`esp_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`esp_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`esp_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`esp_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  create() {
    const mapa  = this.make.tilemap({ key: 'supermercado' });
    const tiles = mapa.addTilesetImage('supermercado', 'supermercado_tiles');

    // Fundo sólido para cobrir qualquer área vazia fora dos tiles
    this.add.rectangle(0, 0, mapa.widthInPixels + 200, mapa.heightInPixels + 200, 0x888888).setOrigin(0, 0);

    mapa.createLayer('chao',    tiles, 0, 0);
    mapa.createLayer('semcolis', tiles, 0, 0);

    const objcomcolis = mapa.createLayer('objcomcolis', tiles, 0, 0);
    const obcomcolis2 = mapa.createLayer('obcomcolis2', tiles, 0, 0);
    const borda       = mapa.createLayer('borda',       tiles, 0, 0);

    objcomcolis.setCollisionByExclusion([-1]);
    obcomcolis2.setCollisionByExclusion([-1]);
    borda.setCollisionByExclusion([-1]);

    // --- ANIMAÇÕES ---
    const direcoes = ['frente', 'tras', 'direita', 'esquerda'];
    direcoes.forEach(dir => {
      if (!this.anims.exists(`esp_andar_${dir}`)) {
        this.anims.create({
          key: `esp_andar_${dir}`,
          frames: [
            { key: `esp_${dir}_1` },
            { key: `esp_${dir}_2` },
            { key: `esp_${dir}_3` },
            { key: `esp_${dir}_4` }
          ],
          frameRate: 8,
          repeat: -1
        });
      }
    });

    // --- PERSONAGEM ---
    // Sem object layer de spawn no mapa — usa posição segura no hall de entrada
    const spawnX = 342;
    const spawnY = 308;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'esp_frente_1');
    this.personagem.setCollideWorldBounds(true);

    const tamTile      = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite  = this.personagem.height;
    const escala = Math.min((tamTile * 1.5) / larguraSprite, (tamTile * 1.5) / alturaSprite);
    this.personagem.setScale(Math.max(escala, 0.05));
    this.personagem.body.setSize(larguraSprite * 0.5, alturaSprite * 0.5);

    this.physics.add.collider(this.personagem, objcomcolis);
    this.physics.add.collider(this.personagem, obcomcolis2);
    this.physics.add.collider(this.personagem, borda);

    // --- CONTROLES ---
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima:     Phaser.Input.Keyboard.KeyCodes.W,
      baixo:    Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita:  Phaser.Input.Keyboard.KeyCodes.D
    });

    // --- CÂMERA ---
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = 'frente';

    this.debugTxt = this.add.text(0, 0, '', {
      fontSize: '4px', color: '#ffff00',
      backgroundColor: '#000000', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(999);
  }

  update() {
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);

    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play('esp_andar_esquerda', true);
      this.direcaoAtual = 'esquerda';
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play('esp_andar_direita', true);
      this.direcaoAtual = 'direita';
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play('esp_andar_tras', true);
      this.direcaoAtual = 'tras';
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play('esp_andar_frente', true);
      this.direcaoAtual = 'frente';
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`esp_${this.direcaoAtual}_1`);
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}