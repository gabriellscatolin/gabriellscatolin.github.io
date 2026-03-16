export default class SceneRestaurante extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneRestaurante' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneRestaurante] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON('restaurante', 'src/assets/imagens/mapsjson/tileMaps/restauranteJapones.tmj?v=1');
    this.load.image('rest_room_builder', 'src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png');
    this.load.image('rest_interiors',    'src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png');
    this.load.image('rest_modern',       'src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Complete_Tileset.png');

    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`rest_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`rest_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`rest_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`rest_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  create() {
    const mapa   = this.make.tilemap({ key: 'restaurante' });
    const tsRoom = mapa.addTilesetImage('Room_Builder_16x16', 'rest_room_builder');
    const tsInt  = mapa.addTilesetImage('Interiors_16x16', 'rest_interiors');
    const tsMod  = mapa.addTilesetImage('Modern_Exteriors_Complete_Tileset', 'rest_modern');
    const tilesets = [tsRoom, tsInt, tsMod].filter(Boolean);

    // Fundo para cobrir qualquer area vazia
    this.add.rectangle(0, 0, mapa.widthInPixels + 200, mapa.heightInPixels + 200, 0x555555).setOrigin(0, 0);

    // Camadas sem colisao
    mapa.createLayer('N- Chão',             tilesets, 0, 0);
    mapa.createLayer('N - ParedesSemColid', tilesets, 0, 0);
    mapa.createLayer('N -Plantas',          tilesets, 0, 0);
    mapa.createLayer('N - LinhasParede',    tilesets, 0, 0);
    mapa.createLayer('N - OjetosCosinha',   tilesets, 0, 0);
    mapa.createLayer('PLAYER',              tilesets, 0, 0);

    // Camadas com colisao
    const paredeC  = mapa.createLayer('C - ParedesComColid',   tilesets, 0, 0);
    const objC     = mapa.createLayer('C- ObjetsColid',        tilesets, 0, 0);
    const rodape0C = mapa.createLayer('C - Rodapeda parede_0', tilesets, 0, 0);
    const rodapeC  = mapa.createLayer('C - Rodapeda parede',   tilesets, 0, 0);

    [paredeC, objC, rodape0C, rodapeC]
      .filter(Boolean)
      .forEach(c => c.setCollisionByExclusion([-1]));

    // Animacoes
    const direcoes = ['frente', 'tras', 'direita', 'esquerda'];
    direcoes.forEach(dir => {
      if (!this.anims.exists(`rest_andar_${dir}`)) {
        this.anims.create({
          key: `rest_andar_${dir}`,
          frames: [
            { key: `rest_${dir}_1` },
            { key: `rest_${dir}_2` },
            { key: `rest_${dir}_3` },
            { key: `rest_${dir}_4` }
          ],
          frameRate: 8,
          repeat: -1
        });
      }
    });

    // Personagem - spawn proximo a entrada (bottom-center do mapa)
    const spawnX = mapa.widthInPixels  / 2;
    const spawnY = mapa.heightInPixels - 24;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'rest_frente_1');
    this.personagem.setCollideWorldBounds(true);

    // Sprites sao 1024x1024px. Com zoom=7, escala 0.028
    this.personagem.setScale(0.028);
    this.personagem.body.setSize(this.personagem.width * 0.35, this.personagem.height * 0.35);

    [paredeC, objC, rodape0C, rodapeC]
      .filter(Boolean)
      .forEach(c => this.physics.add.collider(this.personagem, c));

    // Controles
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima:     Phaser.Input.Keyboard.KeyCodes.W,
      baixo:    Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita:  Phaser.Input.Keyboard.KeyCodes.D
    });

    // Camera
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(7);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Zona de saida
    this.zonaSaida = new Phaser.Geom.Rectangle(210, 278, 60, 36);
    this.labelSair = this.add.text(240, 296, '[E] Sair', {
      fontSize: '3px', color: '#ffffff',
      backgroundColor: '#000000cc', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.transicionando  = false;
    this.dentroZonaSaida = false;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.direcaoAtual = 'frente';

    this.debugTxt = this.add.text(0, 0, '', {
      fontSize: '3px', color: '#ffff00',
      backgroundColor: '#000000', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(999);
  }

  update() {
    const velocidade = 100;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play('rest_andar_esquerda', true);
      this.direcaoAtual = 'esquerda';
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play('rest_andar_direita', true);
      this.direcaoAtual = 'direita';
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play('rest_andar_tras', true);
      this.direcaoAtual = 'tras';
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play('rest_andar_frente', true);
      this.direcaoAtual = 'frente';
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`rest_${this.direcaoAtual}_1`);
    }

    // Zona de saida
    const dentroSaida = Phaser.Geom.Rectangle.Contains(this.zonaSaida, personagem.x, personagem.y);
    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    if (dentroSaida && !this.transicionando && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('SceneCidade', {
          nomePasta: this.nomePastaEscolhida,
          prefixo:   this.prefixoEscolhido,
          spawnX:    850,
          spawnY:    930
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 8, personagem.y - 14);
  }
}
