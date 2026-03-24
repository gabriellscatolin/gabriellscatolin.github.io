export default class SceneMetro extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneMetro' });
  }

  // Recebe os dados do personagem vindos da cena anterior
  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
  }

  // Carrega mapa, tilesets grandes e sprites do personagem
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    // Loga erros de carregamento
    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneMetro] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    // Tilemap da estação de metrô
    this.load.tilemapTiledJSON('metro', 'src/assets/imagens/mapsjson/tileMaps/metro.tmj?v=2');

    // Tilesets divididos (versões grandes quebradas em partes)
    this.load.image('metro_mod_s1', 'src/assets/imagens/mapsjson/tileSets/Modern_S1_4096.png');
    this.load.image('metro_mod_s2', 'src/assets/imagens/mapsjson/tileSets/Modern_S2_4096.png');
    this.load.image('metro_mod_s3', 'src/assets/imagens/mapsjson/tileSets/Modern_S3_32.png');

    this.load.image('metro_int_s1', 'src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png');
    this.load.image('metro_int_s2', 'src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png');
    this.load.image('metro_int_s3', 'src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png');
    this.load.image('metro_int_s4', 'src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png');
    this.load.image('metro_int_s5', 'src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png');

    // Sprites do personagem (4 direções × 4 frames)
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`farm_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`farm_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`farm_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`farm_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  // Ajusta dinamicamente os tilesets muito grandes, dividindo em partes menores
  prepararTilesetsMetro() {
    const cacheMapa = this.cache.tilemap.get('metro');
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    // Evita recriar os tilesets caso já estejam processados
    if (dadosMapa.tilesets.some((ts) => ts.name === 'ME_Complete_S1')) return;

    const novosTilesets = [];

    dadosMapa.tilesets.forEach((ts) => {
      // Divide tileset externo grande em 3 partes
      if (ts.name === 'ME_Complete') {
        const base = ts.firstgid;
        const comuns = { tilewidth: 16, tileheight: 16, spacing: 0, margin: 0, columns: 176 };

        novosTilesets.push({ ...comuns, firstgid: base, name: 'ME_Complete_S1', tilecount: 45056, image: '../tileSets/Modern_S1_4096.png', imagewidth: 2816, imageheight: 4096 });
        novosTilesets.push({ ...comuns, firstgid: base + 45056, name: 'ME_Complete_S2', tilecount: 45056, image: '../tileSets/Modern_S2_4096.png', imagewidth: 2816, imageheight: 4096 });
        novosTilesets.push({ ...comuns, firstgid: base + 90112, name: 'ME_Complete_S3', tilecount: 352, image: '../tileSets/Modern_S3_32.png', imagewidth: 2816, imageheight: 32 });
        return;
      }

      // Divide tileset interno em várias partes menores
      if (ts.name === 'Interior_P1') {
        const base = ts.firstgid;
        const comuns = { tilewidth: 16, tileheight: 16, spacing: 0, margin: 0, columns: 16 };

        novosTilesets.push({ ...comuns, firstgid: base, name: 'Interior_P1_S1', tilecount: 4096, image: '../tileSets/Interiors_S1_4096.png', imagewidth: 256, imageheight: 4096 });
        novosTilesets.push({ ...comuns, firstgid: base + 4096, name: 'Interior_P1_S2', tilecount: 4096, image: '../tileSets/Interiors_S2_4096.png', imagewidth: 256, imageheight: 4096 });
        novosTilesets.push({ ...comuns, firstgid: base + 8192, name: 'Interior_P1_S3', tilecount: 4096, image: '../tileSets/Interiors_S3_4096.png', imagewidth: 256, imageheight: 4096 });
        novosTilesets.push({ ...comuns, firstgid: base + 12288, name: 'Interior_P1_S4', tilecount: 4096, image: '../tileSets/Interiors_S4_4096.png', imagewidth: 256, imageheight: 4096 });
        novosTilesets.push({ ...comuns, firstgid: base + 16384, name: 'Interior_P1_S5', tilecount: 640, image: '../tileSets/Interiors_S5_640.png', imagewidth: 256, imageheight: 640 });
        return;
      }

      novosTilesets.push(ts);
    });

    dadosMapa.tilesets = novosTilesets;
  }

  create() {
    // Prepara tilesets antes de criar o mapa
    this.prepararTilesetsMetro();

    const mapa = this.make.tilemap({ key: 'metro' });

    // Associa os tilesets já divididos
    const tiles = [
      mapa.addTilesetImage('ME_Complete_S1', 'metro_mod_s1'),
      mapa.addTilesetImage('ME_Complete_S2', 'metro_mod_s2'),
      mapa.addTilesetImage('ME_Complete_S3', 'metro_mod_s3'),
      mapa.addTilesetImage('Interior_P1_S1', 'metro_int_s1'),
      mapa.addTilesetImage('Interior_P1_S2', 'metro_int_s2'),
      mapa.addTilesetImage('Interior_P1_S3', 'metro_int_s3'),
      mapa.addTilesetImage('Interior_P1_S4', 'metro_int_s4'),
      mapa.addTilesetImage('Interior_P1_S5', 'metro_int_s5')
    ].filter(Boolean);

    // Cria camadas do mapa (visuais e de colisão)
    const chaoN = mapa.createLayer('N - chão', tiles, 0, 0);
    const paredeC = mapa.createLayer('C - Parede', tiles, 0, 0);
    const objC = mapa.createLayer('C - ObjetComColid', tiles, 0, 0);
    const vagaoC = mapa.createLayer('C - Vagão', tiles, 0, 0);

    // Ativa colisão nas camadas sólidas
    paredeC.setCollisionByExclusion([-1]);
    objC.setCollisionByExclusion([-1]);
    vagaoC.setCollisionByExclusion([-1]);

    // Calcula limites reais do mapa dinamicamente
    const bounds = chaoN.getBounds();

    // Fundo neutro
    this.add.rectangle(bounds.x - 200, bounds.y - 200, bounds.width + 400, bounds.height + 400, 0x555555)
      .setOrigin(0, 0)
      .setDepth(-10);

    // Animações do personagem
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

    // Personagem
    const spawnX = 273;
    const spawnY = 250;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'farm_frente_1');
    this.personagem.setCollideWorldBounds(true);

    this.personagem.setScale(0.028);
    this.personagem.body.setSize(this.personagem.width * 0.35, this.personagem.height * 0.35);

    this.physics.add.collider(this.personagem, paredeC);
    this.physics.add.collider(this.personagem, objC);
    this.physics.add.collider(this.personagem, vagaoC);

    // Controles
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Câmera segue o personagem
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = 'frente';

    // Zona de saída (entrada da estação)
    this.zonaSaida = new Phaser.Geom.Rectangle(spawnX - 30, spawnY - 18, 60, 36);
    this.labelSair = this.add.text(spawnX, spawnY - 2, '[E] Sair', {
      fontSize: '3px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 1, y: 1 },
      resolution: 4
    }).setDepth(20).setOrigin(0.5, 0.5).setVisible(false);

    this.transicionando = false;
    this.dentroZonaSaida = false;

    this.debugTxt = this.add.text(0, 0, '', {
      fontSize: '3px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 1, y: 1 },
      resolution: 4
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

    // Verifica entrada na zona de saída
    const dentroSaida = Phaser.Geom.Rectangle.Contains(this.zonaSaida, personagem.x, personagem.y);

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    // Transição para a cidade ao pressionar E
    if (dentroSaida && !this.transicionando && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.transicionando = true;
      this.labelSair.setVisible(false);

      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('SceneCidade', {
          nomePasta: this.nomePastaEscolhida,
          prefixo:   this.prefixoEscolhido,
          spawnX:    2632,
          spawnY:    471
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 8, personagem.y - 14);
  }
}