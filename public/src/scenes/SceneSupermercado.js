export default class SceneSupermercado extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneSupermercado' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneSupermercado] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON('supermercado', 'src/assets/imagens/mapsjson/tileMaps/supermercado.tmj');

    // Tilesets — nomes exatos conforme o .tmj
    this.load.image('super_interiors',   'src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png');
    this.load.image('super_roombuilder', 'src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png');
    this.load.image('super_exteriors',   'src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Complete_Tileset.png');
    this.load.image('super_char06',      'src/assets/imagens/mapsjson/tileSets/Premade_Character_06.png');
    this.load.image('super_char05',      'src/assets/imagens/mapsjson/tileSets/Premade_Character_05.png');
    this.load.image('super_char04',      'src/assets/imagens/mapsjson/tileSets/Premade_Character_04.png');
    this.load.image('super_char03',      'src/assets/imagens/mapsjson/tileSets/Premade_Character_03.png');
    this.load.image('super_char02',      'src/assets/imagens/mapsjson/tileSets/Premade_Character_02.png');
    this.load.image('super_char01',      'src/assets/imagens/mapsjson/tileSets/Premade_Character_01.png');

    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`esp_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`esp_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`esp_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`esp_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  create() {
    const mapa = this.make.tilemap({ key: 'supermercado' });

    // Nomes do primeiro argumento batem EXATAMENTE com "name" dentro do .tmj
    const tsInteriors   = mapa.addTilesetImage('Interiors_16x16',                   'super_interiors');
    const tsRoomBuilder = mapa.addTilesetImage('Room_Builder_16x16',                'super_roombuilder');
    const tsExteriors   = mapa.addTilesetImage('Modern_Exteriors_Complete_Tileset', 'super_exteriors');
    const tsChar06      = mapa.addTilesetImage('Premade_Character_06',              'super_char06');
    const tsChar05      = mapa.addTilesetImage('Premade_Character_05',              'super_char05');
    const tsChar04      = mapa.addTilesetImage('Premade_Character_04',              'super_char04');
    const tsChar03      = mapa.addTilesetImage('Premade_Character_03',              'super_char03');
    const tsChar02      = mapa.addTilesetImage('Premade_Character_02',              'super_char02');
    const tsChar01      = mapa.addTilesetImage('Premade_Character_01',              'super_char01');
    const tilesets = [tsInteriors, tsRoomBuilder, tsExteriors, tsChar06, tsChar05, tsChar04, tsChar03, tsChar02, tsChar01].filter(Boolean);

    // Fundo sólido
    this.add.rectangle(0, 0, mapa.widthInPixels + 200, mapa.heightInPixels + 200, 0x888888).setOrigin(0, 0);

    // Camadas sem colisão — nomes exatos do .tmj (com acento via unicode)
    this._criarCamada(mapa, 'Chão',             tilesets);
    this._criarCamada(mapa, 'ParedeSemColisão', tilesets);
    this._criarCamada(mapa, 'ObjSemColisão',    tilesets);
    this._criarCamada(mapa, 'ObjSemColisão2',   tilesets);
    this._criarCamada(mapa, 'CoisasNaParede',   tilesets);
    this._criarCamada(mapa, 'Vidro',            tilesets);
    this._criarCamada(mapa, 'Player',           tilesets);

    // Camadas com colisão
    const paredeC = this._criarCamada(mapa, 'ParedeComColisão', tilesets);
    const objC    = this._criarCamada(mapa, 'ObjComColisão',    tilesets);
    const objC2   = this._criarCamada(mapa, 'ObjComColisão2',   tilesets);
    const bordaC  = this._criarCamada(mapa, 'Bordas',           tilesets);

    [paredeC, objC, objC2, bordaC]
      .filter(Boolean)
      .forEach(c => c.setCollisionByExclusion([-1]));

    // Animações
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

    // Personagem — spawn próximo à entrada (bottom-center)
    const spawnX = mapa.widthInPixels  / 2;
    const spawnY = mapa.heightInPixels - 24;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'esp_frente_1');
    this.personagem.setCollideWorldBounds(true);

    const tamTile       = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite  = this.personagem.height;
    const escala = Math.min((tamTile * 0.8) / larguraSprite, (tamTile * 0.8) / alturaSprite);
    this.personagem.setScale(Math.max(escala, 0.05));
    this.personagem.body.setSize(larguraSprite * 0.5, alturaSprite * 0.5);

    [paredeC, objC, objC2, bordaC]
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
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Zona de saída — ajuste x,y com o debugTxt na porta de saída
    this.zonaSaida = new Phaser.Geom.Rectangle(
      mapa.widthInPixels / 2 - 30, mapa.heightInPixels - 32, 60, 32
    );
    this.labelSair = this.add.text(
      mapa.widthInPixels / 2, mapa.heightInPixels - 32, '[E] Sair', {
        fontSize: '3px', color: '#ffffff',
        backgroundColor: '#000000cc', padding: { x: 1, y: 1 }, resolution: 4
      }
    ).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.transicionando  = false;
    this.dentroZonaSaida = false;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.direcaoAtual = 'frente';

    this.debugTxt = this.add.text(0, 0, '', {
      fontSize: '4px', color: '#ffff00',
      backgroundColor: '#000000', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(999);
  }

  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) console.warn('[SceneSupermercado] Camada não encontrada:', nome);
      return camada;
    } catch (erro) {
      console.error('[SceneSupermercado] Erro ao criar camada', nome, ':', erro.message);
      return null;
    }
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
          spawnX:    2926,
          spawnY:    349
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}