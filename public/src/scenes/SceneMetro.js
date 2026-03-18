export default class SceneMetro extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneMetro' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
    this.spawnXCustom = dados.spawnX ?? null;
    this.spawnYCustom = dados.spawnY ?? null;
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneMetro] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON('metro', 'src/assets/imagens/mapsjson/tileMaps/metro.tmj?v=2');
    this.load.image('metro_mod_s1', 'src/assets/imagens/mapsjson/tileSets/Modern_S1_4096.png');
    this.load.image('metro_mod_s2', 'src/assets/imagens/mapsjson/tileSets/Modern_S2_4096.png');
    this.load.image('metro_mod_s3', 'src/assets/imagens/mapsjson/tileSets/Modern_S3_32.png');
    this.load.image('metro_int_s1', 'src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png');
    this.load.image('metro_int_s2', 'src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png');
    this.load.image('metro_int_s3', 'src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png');
    this.load.image('metro_int_s4', 'src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png');
    this.load.image('metro_int_s5', 'src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png');

    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`farm_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`farm_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`farm_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`farm_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  prepararTilesetsMetro() {
    const cacheMapa = this.cache.tilemap.get('metro');
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    // Evita aplicar o split mais de uma vez.
    if (dadosMapa.tilesets.some(ts => ts.name === 'ME_Complete_S1')) return;

    const novosTilesets = [];

    dadosMapa.tilesets.forEach(ts => {
      if (ts.name === 'ME_Complete') {
        const base = ts.firstgid;
        const comuns = { tilewidth: 16, tileheight: 16, spacing: 0, margin: 0, columns: 176 };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: 'ME_Complete_S1',
          tilecount: 45056,
          image: '../tileSets/Modern_S1_4096.png',
          imagewidth: 2816,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 45056,
          name: 'ME_Complete_S2',
          tilecount: 45056,
          image: '../tileSets/Modern_S2_4096.png',
          imagewidth: 2816,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 90112,
          name: 'ME_Complete_S3',
          tilecount: 352,
          image: '../tileSets/Modern_S3_32.png',
          imagewidth: 2816,
          imageheight: 32
        });
        return;
      }

      if (ts.name === 'Interior_P1') {
        const base = ts.firstgid;
        const comuns = { tilewidth: 16, tileheight: 16, spacing: 0, margin: 0, columns: 16 };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: 'Interior_P1_S1',
          tilecount: 4096,
          image: '../tileSets/Interiors_S1_4096.png',
          imagewidth: 256,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 4096,
          name: 'Interior_P1_S2',
          tilecount: 4096,
          image: '../tileSets/Interiors_S2_4096.png',
          imagewidth: 256,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 8192,
          name: 'Interior_P1_S3',
          tilecount: 4096,
          image: '../tileSets/Interiors_S3_4096.png',
          imagewidth: 256,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 12288,
          name: 'Interior_P1_S4',
          tilecount: 4096,
          image: '../tileSets/Interiors_S4_4096.png',
          imagewidth: 256,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 16384,
          name: 'Interior_P1_S5',
          tilecount: 640,
          image: '../tileSets/Interiors_S5_640.png',
          imagewidth: 256,
          imageheight: 640
        });
        return;
      }

      novosTilesets.push(ts);
    });

    dadosMapa.tilesets = novosTilesets;
  }

  obterSpawnMetroPadrao() {
    const spawnFallback = { x: 273, y: 250 };
    const cacheMapa = this.cache.tilemap.get('metro');
    const dadosMapa = cacheMapa && cacheMapa.data;

    if (!dadosMapa || !Array.isArray(dadosMapa.layers)) return spawnFallback;

    const layerPlayer = dadosMapa.layers.find(l => l.name === 'PLAYER');
    if (!layerPlayer || !Array.isArray(layerPlayer.chunks)) return spawnFallback;

    const tileW = dadosMapa.tilewidth || 16;
    const tileH = dadosMapa.tileheight || 16;

    for (const chunk of layerPlayer.chunks) {
      if (!Array.isArray(chunk.data)) continue;

      for (let i = 0; i < chunk.data.length; i++) {
        if ((chunk.data[i] | 0) <= 0) continue;

        const localX = i % chunk.width;
        const localY = Math.floor(i / chunk.width);
        const tileX = chunk.x + localX;
        const tileY = chunk.y + localY;

        return {
          x: tileX * tileW + tileW / 2,
          y: tileY * tileH + tileH / 2
        };
      }
    }

    return spawnFallback;
  }

  create() {
    this.prepararTilesetsMetro();

    const mapa = this.make.tilemap({ key: 'metro' });
    const tsExt1 = mapa.addTilesetImage('ME_Complete_S1', 'metro_mod_s1', 16, 16, 0, 0);
    const tsExt2 = mapa.addTilesetImage('ME_Complete_S2', 'metro_mod_s2', 16, 16, 0, 0);
    const tsExt3 = mapa.addTilesetImage('ME_Complete_S3', 'metro_mod_s3', 16, 16, 0, 0);
    const tsInt1 = mapa.addTilesetImage('Interior_P1_S1', 'metro_int_s1', 16, 16, 0, 0);
    const tsInt2 = mapa.addTilesetImage('Interior_P1_S2', 'metro_int_s2', 16, 16, 0, 0);
    const tsInt3 = mapa.addTilesetImage('Interior_P1_S3', 'metro_int_s3', 16, 16, 0, 0);
    const tsInt4 = mapa.addTilesetImage('Interior_P1_S4', 'metro_int_s4', 16, 16, 0, 0);
    const tsInt5 = mapa.addTilesetImage('Interior_P1_S5', 'metro_int_s5', 16, 16, 0, 0);
    const tilesets = [tsExt1, tsExt2, tsExt3, tsInt1, tsInt2, tsInt3, tsInt4, tsInt5].filter(Boolean);

    // Camadas sem colisão
    const chaoN      = mapa.createLayer('N - chão',                   tilesets, 0, 0);
    const trilhoN    = mapa.createLayer('N- Trilho',                  tilesets, 0, 0);
    const objBaixoN  = mapa.createLayer('N - ObjetSemColid_embaixo',  tilesets, 0, 0);
    const playerN    = mapa.createLayer('PLAYER',                     tilesets, 0, 0);
    const vagaoN     = mapa.createLayer('N - Vagão',                  tilesets, 0, 0);
    const paredeN    = mapa.createLayer('N - Parede sem Colid',       tilesets, 0, 0);
    const pisosN     = mapa.createLayer('N - Pixos',                  tilesets, 0, 0);
    const pisos2N    = mapa.createLayer('N- Pixos2',                  tilesets, 0, 0);
    const pisos3N    = mapa.createLayer('N - Pixos 3',                tilesets, 0, 0);
    const objCimaN   = mapa.createLayer('N - ObjetSemColid_cima',     tilesets, 0, 0);
    const objCima2N  = mapa.createLayer('N - ObjetSemColid_cima_2',   tilesets, 0, 0);
    const objCima3N  = mapa.createLayer('N- ObjetSemColid_cima_3',    tilesets, 0, 0);

    // Camadas com colisão
    const paredeC = mapa.createLayer('C - Parede',             tilesets, 0, 0);
    const arm3C   = mapa.createLayer('C - chão com colid',     tilesets, 0, 0);
    const arm2C   = mapa.createLayer('C - ObjetComColid',      tilesets, 0, 0);
    const armC    = mapa.createLayer('C - Vagão',              tilesets, 0, 0);

    const camadasMapa = [
      chaoN, trilhoN, objBaixoN, playerN, vagaoN, paredeN,
      pisosN, pisos2N, pisos3N, objCimaN, objCima2N, objCima3N,
      paredeC, arm3C, arm2C, armC
    ].filter(Boolean);

    const boundsIniciais = { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity };
    const boundsMapa = camadasMapa.reduce((acc, camada) => {
      const b = camada.getBounds();
      acc.x = Math.min(acc.x, b.x);
      acc.y = Math.min(acc.y, b.y);
      acc.right = Math.max(acc.right, b.right);
      acc.bottom = Math.max(acc.bottom, b.bottom);
      return acc;
    }, boundsIniciais);

    if (!Number.isFinite(boundsMapa.x) || !Number.isFinite(boundsMapa.y) ||
        !Number.isFinite(boundsMapa.right) || !Number.isFinite(boundsMapa.bottom)) {
      boundsMapa.x = 0;
      boundsMapa.y = 0;
      boundsMapa.right = mapa.widthInPixels;
      boundsMapa.bottom = mapa.heightInPixels;
    }

    const larguraMapa = boundsMapa.right - boundsMapa.x;
    const alturaMapa = boundsMapa.bottom - boundsMapa.y;

    // Fundo para cobrir qualquer área vazia
    this.add.rectangle(boundsMapa.x - 200, boundsMapa.y - 200, larguraMapa + 400, alturaMapa + 400, 0x555555)
      .setOrigin(0, 0)
      .setDepth(-10);

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

    // Personagem — usa spawn predefinido no mapa (camada PLAYER) com fallback da cena
    const spawnPadrao = this.obterSpawnMetroPadrao();
    const spawnX = this.spawnXCustom ?? spawnPadrao.x;
    const spawnY = this.spawnYCustom ?? spawnPadrao.y;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'farm_frente_1');
    this.personagem.setCollideWorldBounds(true);

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

    // Câmera (mesmo padrão da SceneFarmacia)
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(boundsMapa.x, boundsMapa.y, larguraMapa, alturaMapa);
    this.physics.world.setBounds(boundsMapa.x, boundsMapa.y, larguraMapa, alturaMapa);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Zona de saída (alinhada com o ponto de entrada na estação)
    this.zonaSaida = new Phaser.Geom.Rectangle(spawnX - 30, spawnY - 18, 60, 36);
    this.labelSair = this.add.text(spawnX, spawnY - 2, '[E] Sair', {
      fontSize: '3px', color: '#ffffff',
      backgroundColor: '#000000cc', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(20).setOrigin(0.5, 0.5).setVisible(false);

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
          spawnX:    3080,
          spawnY:    1168
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 8, personagem.y - 14);
  }
}
