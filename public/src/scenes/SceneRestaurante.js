export default class SceneRestaurante extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneRestaurante' });
  }

  init(dados) {
    // Dados do personagem definidos na transicao da cidade
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
    this.spawnXCustom       = dados.spawnX ?? null;
    this.spawnYCustom       = dados.spawnY ?? null;
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneRestaurante] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    // Mapa e tilesets do restaurante
    this.load.tilemapTiledJSON('restaurante', 'src/assets/imagens/mapsjson/tileMaps/restauranteJapones.tmj?v=1');
    this.load.image('rest_room_builder', 'src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png');
    this.load.image('rest_int_s1', 'src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png');
    this.load.image('rest_int_s2', 'src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png');
    this.load.image('rest_int_s3', 'src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png');
    this.load.image('rest_int_s4', 'src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png');
    this.load.image('rest_int_s5', 'src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png');
    this.load.image('rest_mod_s1', 'src/assets/imagens/mapsjson/tileSets/Modern_S1_4096.png');
    this.load.image('rest_mod_s2', 'src/assets/imagens/mapsjson/tileSets/Modern_S2_4096.png');
    this.load.image('rest_mod_s3', 'src/assets/imagens/mapsjson/tileSets/Modern_S3_32.png');

    // Carrega os 16 frames de animacao do personagem escolhido
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`rest_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`rest_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`rest_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`rest_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  prepararTilesetsRestaurante() {
    // Divide os tilesets muito grandes em partes menores para o mapa conseguir usar tudo.
    const cacheMapa = this.cache.tilemap.get('restaurante');
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    // Evita aplicar a separacao mais de uma vez.
    if (dadosMapa.tilesets.some((ts) => ts.name === 'Interiors_16x16_S1')) return;

    const novosTilesets = [];

    dadosMapa.tilesets.forEach((ts) => {
      if (ts.name === 'Interiors_16x16') {
        const base = ts.firstgid;
        const comuns = { tilewidth: 16, tileheight: 16, spacing: 0, margin: 0, columns: 16 };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: 'Interiors_16x16_S1',
          tilecount: 4096,
          image: '../tileSets/Interiors_S1_4096.png',
          imagewidth: 256,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 4096,
          name: 'Interiors_16x16_S2',
          tilecount: 4096,
          image: '../tileSets/Interiors_S2_4096.png',
          imagewidth: 256,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 8192,
          name: 'Interiors_16x16_S3',
          tilecount: 4096,
          image: '../tileSets/Interiors_S3_4096.png',
          imagewidth: 256,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 12288,
          name: 'Interiors_16x16_S4',
          tilecount: 4096,
          image: '../tileSets/Interiors_S4_4096.png',
          imagewidth: 256,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 16384,
          name: 'Interiors_16x16_S5',
          tilecount: 640,
          image: '../tileSets/Interiors_S5_640.png',
          imagewidth: 256,
          imageheight: 640
        });
        return;
      }

      if (ts.name === 'Modern_Exteriors_Complete_Tileset') {
        const base = ts.firstgid;
        const comuns = { tilewidth: 16, tileheight: 16, spacing: 0, margin: 0, columns: 176 };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: 'Modern_Exteriors_S1',
          tilecount: 45056,
          image: '../tileSets/Modern_S1_4096.png',
          imagewidth: 2816,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 45056,
          name: 'Modern_Exteriors_S2',
          tilecount: 45056,
          image: '../tileSets/Modern_S2_4096.png',
          imagewidth: 2816,
          imageheight: 4096
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 90112,
          name: 'Modern_Exteriors_S3',
          tilecount: 352,
          image: '../tileSets/Modern_S3_32.png',
          imagewidth: 2816,
          imageheight: 32
        });
        return;
      }

      novosTilesets.push(ts);
    });

    dadosMapa.tilesets = novosTilesets;
  }

  descerTilesForaDoLimite(camada, deslocamentoTiles = 4) {
    // Move alguns tiles que ficaram acima do limite visual para alinhar com o cenario.
    if (!camada) return;

    const mover = [];
    camada.forEachTile((tile) => {
      if (!tile || tile.index < 0) return;
      if (tile.y < 0) {
        mover.push({ x: tile.x, y: tile.y, index: tile.index });
      }
    });

    mover.forEach((t) => {
      const destinoY = t.y + deslocamentoTiles;
      camada.removeTileAt(t.x, t.y);
      camada.putTileAt(t.index, t.x, destinoY, true);
    });
  }

  create() {
    // Criacao do mapa e camadas principais
    this.prepararTilesetsRestaurante();

    const mapa   = this.make.tilemap({ key: 'restaurante' });
    const tsRoom = mapa.addTilesetImage('Room_Builder_16x16',               'rest_room_builder', 16, 16, 0, 0);
    const tsInt1 = mapa.addTilesetImage('Interiors_16x16_S1',               'rest_int_s1',       16, 16, 0, 0);
    const tsInt2 = mapa.addTilesetImage('Interiors_16x16_S2',               'rest_int_s2',       16, 16, 0, 0);
    const tsInt3 = mapa.addTilesetImage('Interiors_16x16_S3',               'rest_int_s3',       16, 16, 0, 0);
    const tsInt4 = mapa.addTilesetImage('Interiors_16x16_S4',               'rest_int_s4',       16, 16, 0, 0);
    const tsInt5 = mapa.addTilesetImage('Interiors_16x16_S5',               'rest_int_s5',       16, 16, 0, 0);
    const tsMod1 = mapa.addTilesetImage('Modern_Exteriors_S1',              'rest_mod_s1',       16, 16, 0, 0);
    const tsMod2 = mapa.addTilesetImage('Modern_Exteriors_S2',              'rest_mod_s2',       16, 16, 0, 0);
    const tsMod3 = mapa.addTilesetImage('Modern_Exteriors_S3',              'rest_mod_s3',       16, 16, 0, 0);
    const tiles  = [tsRoom, tsInt1, tsInt2, tsInt3, tsInt4, tsInt5, tsMod1, tsMod2, tsMod3].filter(Boolean);

    // Camadas sem colisão
    const chaoN        = mapa.createLayer('N- Chão',                 tiles, 0, 0);
    const paredeSemC   = mapa.createLayer('N - ParedesSemColid',     tiles, 0, 0);
    const plantasN     = mapa.createLayer('N -Plantas',              tiles, 0, 0);
    const linhasParede = mapa.createLayer('N - LinhasParede',        tiles, 0, 0);
    const cozinhaN     = mapa.createLayer('N - OjetosCosinha',       tiles, 0, 0);
    const playerN      = mapa.createLayer('PLAYER',                  tiles, 0, 0);

    // Camadas com colisão
    const paredeC  = mapa.createLayer('C - ParedesComColid',     tiles, 0, 0);
    const objC     = mapa.createLayer('C- ObjetsColid',          tiles, 0, 0);
    const rodape0C = mapa.createLayer('C - Rodapeda parede_0',   tiles, 0, 0);
    const rodapeC  = mapa.createLayer('C - Rodapeda parede',     tiles, 0, 0);

    // Ajuste fino para detalhes visuais que sobem acima do limite do estabelecimento.
    this.descerTilesForaDoLimite(plantasN, 4);
    this.descerTilesForaDoLimite(cozinhaN, 4);

    const camadasMapa = [
      chaoN, paredeSemC, plantasN, linhasParede, cozinhaN, playerN,
      paredeC, objC, rodape0C, rodapeC
    ].filter(Boolean);

    // Calcula o limite geral do mapa usando as bounds das layers.
    const boundsIniciais = { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity };
    const boundsMapa = camadasMapa.reduce((acc, camada) => {
      const b = camada.getBounds();
      acc.x = Math.min(acc.x, b.x);
      acc.y = Math.min(acc.y, b.y);
      acc.right = Math.max(acc.right, b.right);
      acc.bottom = Math.max(acc.bottom, b.bottom);
      return acc;
    }, boundsIniciais);

    // Usa a layer de chao para descobrir o limite real do estabelecimento.
    const conteudoInicial = { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity };
    const boundsConteudo = [chaoN].filter(Boolean).reduce((acc, camada) => {
      camada.forEachTile((tile) => {
        if (!tile || tile.index < 0) return;
        const left = camada.x + tile.pixelX;
        const top = camada.y + tile.pixelY;
        acc.x = Math.min(acc.x, left);
        acc.y = Math.min(acc.y, top);
        acc.right = Math.max(acc.right, left + tile.width);
        acc.bottom = Math.max(acc.bottom, top + tile.height);
      });
      return acc;
    }, conteudoInicial);

    const encontrouConteudo = Number.isFinite(boundsConteudo.x) && Number.isFinite(boundsConteudo.y);
    const limiteX = encontrouConteudo ? boundsConteudo.x : boundsMapa.x;
    const limiteY = encontrouConteudo ? boundsConteudo.y : boundsMapa.y;
    const limiteRight = encontrouConteudo ? boundsConteudo.right : boundsMapa.right;
    const limiteBottom = encontrouConteudo ? boundsConteudo.bottom : boundsMapa.bottom;

    const boundsEstabelecimento = new Phaser.Geom.Rectangle(
      limiteX,
      limiteY,
      limiteRight - limiteX,
      limiteBottom - limiteY
    );

    // Mascara visual para esconder tiles que ficam fora da area util do restaurante.
    const mascaraGrafica = this.make.graphics({ x: 0, y: 0, add: false });
    mascaraGrafica.fillStyle(0xffffff, 1);
    mascaraGrafica.fillRect(
      boundsEstabelecimento.x,
      boundsEstabelecimento.y,
      boundsEstabelecimento.width,
      boundsEstabelecimento.height
    );
    const mascaraEstabelecimento = mascaraGrafica.createGeometryMask();
    camadasMapa.forEach((camada) => camada.setMask(mascaraEstabelecimento));

    // Fundo sólido para cobrir qualquer area vazia fora dos tiles
    this.add.rectangle(
      boundsEstabelecimento.x - 200,
      boundsEstabelecimento.y - 200,
      boundsEstabelecimento.width + 400,
      boundsEstabelecimento.height + 400,
      0x555555
    ).setOrigin(0, 0).setDepth(-10);

    paredeC.setCollisionByExclusion([-1]);
    objC.setCollisionByExclusion([-1]);
    rodape0C.setCollisionByExclusion([-1]);
    rodapeC.setCollisionByExclusion([-1]);

    // --- ANIMAÇÕES ---
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

    // --- PERSONAGEM ---
    // Usa spawn fixo na entrada, com possibilidade de override vindo da cena anterior.
    const spawnX = this.spawnXCustom ?? 377;
    const spawnY = this.spawnYCustom ?? 425;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'rest_frente_1');
    this.personagem.setCollideWorldBounds(true);

    this.personagem.setScale(0.028);
    this.personagem.body.setSize(this.personagem.width * 0.35, this.personagem.height * 0.35);

    this.physics.add.collider(this.personagem, paredeC);
    this.physics.add.collider(this.personagem, objC);
    this.physics.add.collider(this.personagem, rodape0C);
    this.physics.add.collider(this.personagem, rodapeC);

    // Barreira horizontal para limitar o acesso a parte superior do restaurante.
    this.barreiraY = this.add.rectangle(
      boundsEstabelecimento.x + boundsEstabelecimento.width / 2,
      452,
      boundsEstabelecimento.width,
      2,
      0xff0000,
      0
    );
    this.physics.add.existing(this.barreiraY, true);
    this.physics.add.collider(this.personagem, this.barreiraY);

    // --- CONTROLES ---
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima:     Phaser.Input.Keyboard.KeyCodes.W,
      baixo:    Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita:  Phaser.Input.Keyboard.KeyCodes.D
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // --- CÂMERA ---
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(6);
    this.cameras.main.setBounds(
      boundsEstabelecimento.x,
      boundsEstabelecimento.y,
      boundsEstabelecimento.width,
      boundsEstabelecimento.height
    );
    this.physics.world.setBounds(
      boundsEstabelecimento.x,
      boundsEstabelecimento.y,
      boundsEstabelecimento.width,
      boundsEstabelecimento.height
    );
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = 'frente';

    // --- SAIDA COM TECLA ---
    // Ao entrar na area da porta, mostra o aviso e retorna para a cidade ao apertar E
    this.zonaSaida = new Phaser.Geom.Rectangle(spawnX - 30, spawnY - 18, 60, 36);
    this.labelSair = this.add.text(spawnX, spawnY - 2, '[E] Sair', {
      fontSize: '3px', color: '#ffffff',
      backgroundColor: '#000000cc', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.transicionando = false;
    this.dentroZonaSaida = false;

    this.debugTxt = this.add.text(0, 0, '', {
      fontSize: '3px', color: '#ffff00',
      backgroundColor: '#000000', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(999);
  }

  update() {
    // Movimentacao base do personagem
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
      personagem.setTexture(`rest_${this.direcaoAtual}_1`);
    }

    // --- SAÍDA COM TECLA ---
    const dentroSaida = Phaser.Geom.Rectangle.Contains(this.zonaSaida, personagem.x, personagem.y);

    if (dentroSaida !== this.dentroZonaSaida) {
      // Atualiza o estado e mostra ou esconde o aviso "[E] Sair".
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    // Transicao para a cidade ao se aproximar da saida e apertar E
    if (dentroSaida && !this.transicionando && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('SceneCidade', {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2660,
          spawnY: 310
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 8, personagem.y - 14);
  }
}
