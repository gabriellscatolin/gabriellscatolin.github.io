export default class SceneMetro extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneMetro' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneMetro] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON('metro', 'src/assets/imagens/mapsjson/tileMaps/metro.tmj');
    this.load.image('metro_tiles_exterior', 'src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Complete_Tileset.png');
    this.load.image('metro_tiles_interior', 'src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png');
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`farm_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`farm_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`farm_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`farm_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  create() {
    // FILTRO PARA FUNDO DO MAPA 
    const mapa  = this.make.tilemap({ key: 'metro' });
    const tsExterior = mapa.addTilesetImage('ME_Complete',  'metro_tiles_exterior');
    const tsInterior = mapa.addTilesetImage('Interior_P1',   'metro_tiles_interior');
   
    const tilesets = [tsExterior, tsInterior].filter(Boolean);

    // Fundo para cobrir qualquer área vazia
    this.add.rectangle(0, 0, mapa.widthInPixels + 200, mapa.heightInPixels + 200, 0x555555).setOrigin(0, 0);

    // Camadas sem colisão
    mapa.createLayer('N - ch\u00e3o',           tilesets, 0, 0);
    mapa.createLayer('N- Trilho',     tilesets, 0, 0);
    mapa.createLayer('N - ObjetSemColid_embaixo',  tilesets, 0, 0);
    mapa.createLayer('PLAYER',  tilesets, 0, 0);
    mapa.createLayer('N - Vag\u00e3o',     tilesets, 0, 0);
    mapa.createLayer('N - Parede sem Colid',    tilesets, 0, 0);
    mapa.createLayer('N - Pixos',   tilesets, 0, 0);
    mapa.createLayer('N- Pixos2',   tilesets, 0, 0);
    mapa.createLayer('N - Pixos 3',   tilesets, 0, 0);
    mapa.createLayer('N - ObjetSemColid_cima',   tilesets, 0, 0);
    mapa.createLayer('N - ObjetSemColid_cima_2',   tilesets, 0, 0);
    mapa.createLayer('N- ObjetSemColid_cima_3',   tilesets, 0, 0);

    // Camadas com colisão
    const paredeC   = mapa.createLayer('C - Parede',          tilesets, 0, 0);
    const arm3C     = mapa.createLayer('C - ch\u00e3o com colid',       tilesets, 0, 0);
    const arm2C     = mapa.createLayer('C - ObjetComColid',       tilesets, 0, 0);
    const armC      = mapa.createLayer('C - Vag\u00e3o',         tilesets, 0, 0);

    [paredeC, arm3C, arm2C, armC]
      .filter(Boolean)
      .forEach(c => c.setCollisionByExclusion([-1]));

    // Animações
    const direcoes = ['frente', 'tras', 'direita', 'esquerda'];
    direcoes.forEach(dir => {
      if (!this.anims.exists(`farm_andar_${dir}`)) {
        this.anims.create({
          key: `farm_andar_${dir}`,
          frames: [
            { key: `farm_${dir}_1` },
            { key: `farm_${dir}_2` },
            { key: `farm_${dir}_3` },
            { key: `farm_${dir}_4` }
          ],
          frameRate: 8,
          repeat: -1
        });
      }
    });

    // Personagem — spawn próximo à entrada (bottom-center do mapa)
    const spawnX = mapa.widthInPixels  / 2;
    const spawnY = mapa.heightInPixels - 24;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'farm_frente_1');
    this.personagem.setCollideWorldBounds(true);

    // Sprites são 1024×1024px. Com zoom=7, escala 0.019 → ~1.3 tiles de altura na tela
    this.personagem.setScale(0.028);
    this.personagem.body.setSize(this.personagem.width * 0.35, this.personagem.height * 0.35);

    [paredeC, arm3C, arm2C, armC]
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

    // Câmera
    // Para maps "infinite" o Phaser às vezes calcula width/height como 0,
    // então garantimos valores a partir das propriedades do mapa.
    const mapaWidth  = mapa.widthInPixels  || (mapa.width  * mapa.tileWidth);
    const mapaHeight = mapa.heightInPixels || (mapa.height * mapa.tileHeight);

    this.cameras.main.startFollow(this.personagem, true, 0.15, 0.15);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(0, 0, mapaWidth, mapaHeight);
    this.physics.world.setBounds(0, 0, mapaWidth, mapaHeight);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Zona de saída
    this.zonaSaida = new Phaser.Geom.Rectangle(118, 215, 60, 40);
    this.labelSair = this.add.text(148, 232, '[E] Sair', {
      fontSize: '3px', color: '#ffffff',
      backgroundColor: '#000000cc', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.transicionando    = false;
    this.dentroZonaSaida   = false;
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
      personagem.anims.play('farm_andar_esquerda', true);
      this.direcaoAtual = 'esquerda';
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play('farm_andar_direita', true);
      this.direcaoAtual = 'direita';
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play('farm_andar_tras', true);
      this.direcaoAtual = 'tras';
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play('farm_andar_frente', true);
      this.direcaoAtual = 'frente';
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`farm_${this.direcaoAtual}_1`);
    }

    // Zona de saída
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
          spawnX:    1121,
          spawnY:    1261
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 8, personagem.y - 14);
  }
}
