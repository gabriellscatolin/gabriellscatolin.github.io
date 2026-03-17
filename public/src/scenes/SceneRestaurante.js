export default class SceneRestaurante extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneRestaurante' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
    this.spawnXCustom = dados.spawnX || null;
    this.spawnYCustom = dados.spawnY || null;
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneRestaurante] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON('restaurante', 'src/assets/imagens/mapsjson/tileMaps/restauranteJapones.tmj?v=1');
    this.load.image('rest_room_builder', 'src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png');
    this.load.image('rest_int_p1',       'src/assets/imagens/mapsjson/tileSets/Interiors_Part1.png');
    this.load.image('rest_int_p2',       'src/assets/imagens/mapsjson/tileSets/Interiors_Part2.png');
    this.load.image('rest_int_p3',       'src/assets/imagens/mapsjson/tileSets/Interiors_Part3.png');
    this.load.image('rest_mod_top',      'src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Top.png');
    this.load.image('rest_mod_bottom',   'src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Bottom.png');

    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`rest_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`rest_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`rest_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`rest_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  prepararTilesetsRestaurante() {
    const cacheMapa = this.cache.tilemap.get('restaurante');
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    // Evita aplicar o split mais de uma vez.
    if (dadosMapa.tilesets.some(ts => ts.name === 'Interiors_16x16_P1')) return;

    const novosTilesets = [];

    dadosMapa.tilesets.forEach(ts => {
      if (ts.name === 'Interiors_16x16') {
        const base = ts.firstgid;
        const comuns = {
          tilewidth: 16,
          tileheight: 16,
          spacing: 0,
          margin: 0,
          columns: 16
        };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: 'Interiors_16x16_P1',
          tilecount: 8192,
          image: '../tileSets/Interiors_Part1.png',
          imagewidth: 256,
          imageheight: 8192
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 8192,
          name: 'Interiors_16x16_P2',
          tilecount: 8192,
          image: '../tileSets/Interiors_Part2.png',
          imagewidth: 256,
          imageheight: 8192
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 16384,
          name: 'Interiors_16x16_P3',
          tilecount: 640,
          image: '../tileSets/Interiors_Part3.png',
          imagewidth: 256,
          imageheight: 640
        });
        return;
      }

      if (ts.name === 'Modern_Exteriors_Complete_Tileset') {
        const base = ts.firstgid;
        const comuns = {
          tilewidth: 16,
          tileheight: 16,
          spacing: 0,
          margin: 0,
          columns: 176
        };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: 'Modern_Exteriors_Top',
          tilecount: 45232,
          image: '../tileSets/Modern_Exteriors_Top.png',
          imagewidth: 2816,
          imageheight: 4112
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 45232,
          name: 'Modern_Exteriors_Bottom',
          tilecount: 45232,
          image: '../tileSets/Modern_Exteriors_Bottom.png',
          imagewidth: 2816,
          imageheight: 4112
        });
        return;
      }

      novosTilesets.push(ts);
    });

    dadosMapa.tilesets = novosTilesets;
  }

  create() {
    this.prepararTilesetsRestaurante();

    const mapa   = this.make.tilemap({ key: 'restaurante' });
    const tsRoom = mapa.addTilesetImage('Room_Builder_16x16', 'rest_room_builder', 16, 16, 0, 0);
    const tsInt1 = mapa.addTilesetImage('Interiors_16x16_P1', 'rest_int_p1', 16, 16, 0, 0);
    const tsInt2 = mapa.addTilesetImage('Interiors_16x16_P2', 'rest_int_p2', 16, 16, 0, 0);
    const tsInt3 = mapa.addTilesetImage('Interiors_16x16_P3', 'rest_int_p3', 16, 16, 0, 0);
    const tsModT = mapa.addTilesetImage('Modern_Exteriors_Top', 'rest_mod_top', 16, 16, 0, 0);
    const tsModB = mapa.addTilesetImage('Modern_Exteriors_Bottom', 'rest_mod_bottom', 16, 16, 0, 0);
    const tilesets = [tsRoom, tsInt1, tsInt2, tsInt3, tsModT, tsModB].filter(Boolean);

    // Camadas sem colisao
    const chaoN         = mapa.createLayer('N- Chão',             tilesets, 0, 0);
    const paredeSemC    = mapa.createLayer('N - ParedesSemColid', tilesets, 0, 0);
    const plantasN      = mapa.createLayer('N -Plantas',          tilesets, 0, 0);
    const linhasParedeN = mapa.createLayer('N - LinhasParede',    tilesets, 0, 0);
    const cozinhaN      = mapa.createLayer('N - OjetosCosinha',   tilesets, 0, 0);
    const playerN       = mapa.createLayer('PLAYER',              tilesets, 0, 0);

    // Camadas com colisao
    const paredeC        = mapa.createLayer('C - ParedesComColid',   tilesets, 0, 0);
    const objC           = mapa.createLayer('C- ObjetsColid',        tilesets, 0, 0);
    const rodape0C       = mapa.createLayer('C - Rodapeda parede_0', tilesets, 0, 0);
    const rodapeC        = mapa.createLayer('C - Rodapeda parede',   tilesets, 0, 0);

    const camadasMapa = [chaoN, paredeSemC, plantasN, linhasParedeN, cozinhaN, playerN, paredeC, objC, rodape0C, rodapeC]
      .filter(Boolean);

    // Ajusta camera/mundo para o bounds real das layers (mapa infinito com chunks negativos).
    const boundsIniciais = { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity };
    const boundsMapa = camadasMapa.reduce((acc, camada) => {
      const b = camada.getBounds();
      acc.x = Math.min(acc.x, b.x);
      acc.y = Math.min(acc.y, b.y);
      acc.right = Math.max(acc.right, b.right);
      acc.bottom = Math.max(acc.bottom, b.bottom);
      return acc;
    }, boundsIniciais);
    const larguraMapa = boundsMapa.right - boundsMapa.x;
    const alturaMapa = boundsMapa.bottom - boundsMapa.y;

    // Fundo para cobrir qualquer area vazia
    this.add.rectangle(boundsMapa.x - 200, boundsMapa.y - 200, larguraMapa + 400, alturaMapa + 400, 0x555555)
      .setOrigin(0, 0)
      .setDepth(-10);

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

    // Personagem - spawn de entrada no restaurante
    const spawnX = this.spawnXCustom || 377;
    const spawnY = this.spawnYCustom || 425;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'rest_frente_1');
    this.personagem.setCollideWorldBounds(true);

    // Sprites sao 1024x1024px. Com zoom=7, escala 0.028
    this.personagem.setScale(0.028);
    this.personagem.body.setSize(this.personagem.width * 0.35, this.personagem.height * 0.35);

    [paredeC, objC, rodape0C, rodapeC]
      .filter(Boolean)
      .forEach(c => this.physics.add.collider(this.personagem, c));

    // Barreira horizontal para limitar acesso na secao Y=452
    this.barreiraY = this.add.rectangle(boundsMapa.x + (larguraMapa / 2), 452, larguraMapa, 2, 0xff0000, 0);
    this.physics.add.existing(this.barreiraY, true);
    this.physics.add.collider(this.personagem, this.barreiraY);

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
    this.cameras.main.setZoom(6);
    this.cameras.main.setBounds(boundsMapa.x, boundsMapa.y, larguraMapa, alturaMapa);
    this.physics.world.setBounds(boundsMapa.x, boundsMapa.y, larguraMapa, alturaMapa);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Zona de saida compativel com o ponto de entrada/spawn
    this.zonaSaida = new Phaser.Geom.Rectangle(spawnX - 30, spawnY - 18, 60, 36);
    this.labelSair = this.add.text(spawnX, spawnY - 2, '[E] Sair', {
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
          spawnX:    2660,
          spawnY:    310
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 8, personagem.y - 14);
  }
}
