export default class SceneLojaDeRoupas extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneLojaDeRoupas' });
  }

  init(dados) {
    // Dados do personagem definidos na transicao da cidade
    this.nomePastaEscolhida = dados.nomePasta || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || "HB";
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneLojaDeRoupas] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    // Mapa e tilesets do salao
    this.load.tilemapTiledJSON('salaoDeBeleza', 'src/assets/imagens/mapsjson/tileMaps/salaoDeBeleza.tmj');
    this.load.image('cab_roombuilder', 'src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png');
    this.load.image('cab_interiors',   'src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png');

    // Carrega os 16 frames de animacao do personagem escolhido
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`cab_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`cab_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`cab_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`cab_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  create() {
    // Criacao do mapa e camadas principais
    const mapa = this.make.tilemap({ key: 'salaoDeBeleza' });
    this._otimizarTilesetsPorUso(mapa);

    const roomBuilder = mapa.addTilesetImage('Room_Builder_16x16', this._keyTileset('Room_Builder_16x16', 'cab_roombuilder'));
    const interiors   = mapa.addTilesetImage('Interiors_16x16',    this._keyTileset('Interiors_16x16',    'cab_interiors'));
    const tiles       = [roomBuilder, interiors].filter(Boolean);

    // Fundo solido para cobrir qualquer area vazia fora dos tiles
    this.add.rectangle(0, 0, mapa.widthInPixels + 200, mapa.heightInPixels + 200, 0x888888).setOrigin(0, 0);

    // Camadas sem colisao
    mapa.createLayer('N - Chão',               tiles, 0, 0);
    mapa.createLayer('N - ParedeSemColid',     tiles, 0, 0);
    mapa.createLayer('N - ObjetsoSemColid_0',  tiles, 0, 0);
    mapa.createLayer('PLAYER',                 tiles, 0, 0);
    mapa.createLayer('N - ObjetosSemColid',    tiles, 0, 0);
    mapa.createLayer('N - ObjetosSemColid_02', tiles, 0, 0);
    mapa.createLayer('N - ObjetosSemColid_3',  tiles, 0, 0);

    // Camadas com colisao
    const paredeEmbaixo = mapa.createLayer('C - ParedeComColid_embaixo', tiles, 0, 0);
    const parede        = mapa.createLayer('C - ParedeComColid',         tiles, 0, 0);
    const objetos       = mapa.createLayer('C - Objetos ComColid',       tiles, 0, 0);

    paredeEmbaixo.setCollisionByExclusion([-1]);
    parede.setCollisionByExclusion([-1]);
    objetos.setCollisionByExclusion([-1]);

    // --- ANIMAÇOES ---
    const direcoes = ['frente', 'tras', 'direita', 'esquerda'];
    direcoes.forEach(dir => {
      if (!this.anims.exists(`cab_andar_${dir}`)) {
        this.anims.create({
          key: `cab_andar_${dir}`,
          frames: [
            { key: `cab_${dir}_1` },
            { key: `cab_${dir}_2` },
            { key: `cab_${dir}_3` },
            { key: `cab_${dir}_4` }
          ],
          frameRate: 8,
          repeat: -1
        });
      }
    });

    // --- PERSONAGEM ---
    // Sem object layer de spawn no mapa, usa posicao fixa na entrada do salao
    const spawnX = 124;
    const spawnY = 183;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'cab_frente_1');
    this.personagem.setCollideWorldBounds(true);

    const tamTile       = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite  = this.personagem.height;
    const escala = Math.min((tamTile * 0.4) / larguraSprite, (tamTile * 0.4) / alturaSprite);
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    this.physics.add.collider(this.personagem, paredeEmbaixo);
    this.physics.add.collider(this.personagem, parede);
    this.physics.add.collider(this.personagem, objetos);

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
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = 'frente';

    // --- SAÍDA COM TECLA ---
    // Ao entrar no raio da porta, mostra o aviso e retorna para a cidade ao apertar E
    this.zonasSaida = [{ x: 74, y: 72, raio: 35 }];
    this.dentroZonaSaida = false;
    this.transicionando = false;

    this.labelSair = this.add.text(74, 72, '[E] Sair', {
      fontSize: '3px', color: '#ffffff',
      backgroundColor: '#000000cc', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(20).setOrigin(0.5, 0.5).setVisible(false);

    this.debugTxt = this.add.text(0, 0, '', {
      fontSize: '4px', color: '#ffff00',
      backgroundColor: '#000000', padding: { x: 1, y: 1 }, resolution: 4
    }).setDepth(999);
  }

  _keyTileset(nomeTileset, fallbackKey) {
    // Retorna a key da textura final que sera usada por esse tileset.
    return (this._tilesetKeys && this._tilesetKeys[nomeTileset]) || fallbackKey;
  }

  _coletarGidsUsados(mapa) {
    // Percorre todas as camadas do mapa e junta os GIDs realmente usados.
    const usados = new Set();

    (mapa.layers || []).forEach((layer) => {
      const data = layer.data || [];
      for (let y = 0; y < data.length; y++) {
        const row = data[y] || [];
        for (let x = 0; x < row.length; x++) {
          const cell = row[x];
          // A celula pode vir como numero simples ou como objeto Tile do Phaser.
          const gid = typeof cell === 'number' ? cell : cell?.index || 0;
          if (gid > 0) usados.add(gid);
        }
      }
    });

    return usados;
  }

  _otimizarTilesetsPorUso(mapa) {
    // Define os tilesets que podem ser recortados para usar so a area necessaria.
    const defs = [
      { tmjName: 'Room_Builder_16x16', baseKey: 'cab_roombuilder' },
      { tmjName: 'Interiors_16x16',    baseKey: 'cab_interiors' }
    ];

    this._tilesetKeys = {};
    const usados = this._coletarGidsUsados(mapa);

    // Ordena pelo firstgid para descobrir o intervalo de tiles de cada tileset.
    const tilesetsOrdenados = [...(mapa.tilesets || [])].sort((a, b) => (a.firstgid || 0) - (b.firstgid || 0));

    defs.forEach((def) => {
      // Comeca assumindo a textura original.
      this._tilesetKeys[def.tmjName] = def.baseKey;

      if (!this.textures.exists(def.baseKey)) return;

      const ts = tilesetsOrdenados.find((t) => t.name === def.tmjName);
      if (!ts) return;

      const source = this.textures.get(def.baseKey).getSourceImage();
      if (!source?.width || !source?.height) return;

      const idx = tilesetsOrdenados.findIndex((t) => t.name === def.tmjName);
      const startGid = ts.firstgid || 1;

      // O fim do intervalo desse tileset e o inicio do proximo menos 1.
      const endGid = idx < tilesetsOrdenados.length - 1 ? tilesetsOrdenados[idx + 1].firstgid - 1 : Number.MAX_SAFE_INTEGER;

      let maiorGidUsado = 0;
      usados.forEach((gid) => {
        // Descobre ate qual tile desse tileset o mapa realmente vai.
        if (gid >= startGid && gid <= endGid && gid > maiorGidUsado) {
          maiorGidUsado = gid;
        }
      });

      if (!maiorGidUsado) return;

      const tileW = ts.tilewidth || 16;
      const tileH = ts.tileheight || 16;
      const margin = ts.margin || 0;
      const spacing = ts.spacing || 0;

      // Calcula quantas colunas a imagem do tileset possui.
      const columns = ts.columns || Math.max(1, Math.floor((source.width - margin * 2 + spacing) / (tileW + spacing)));

      const tilesNecessarios = maiorGidUsado - startGid + 1;
      const linhasNecessarias = Math.max(1, Math.ceil(tilesNecessarios / columns));

      // Calcula o menor recorte que ainda cobre todos os tiles usados.
      const cropWCalc = margin + columns * (tileW + spacing) - spacing + margin;
      const cropHCalc = margin + linhasNecessarias * (tileH + spacing) - spacing + margin;
      const cropW = Math.min(source.width,  Math.max(tileW, cropWCalc));
      const cropH = Math.min(source.height, Math.max(tileH, cropHCalc));

      // Se o recorte for igual ao tamanho original, nao precisa criar nova textura.
      if (cropW >= source.width && cropH >= source.height) return;

      const cutKey = `${def.baseKey}_cut`;
      if (this.textures.exists(cutKey)) this.textures.remove(cutKey);

      // Cria uma textura menor em canvas contendo so a area util do tileset.
      const canvasTex = this.textures.createCanvas(cutKey, cropW, cropH);
      const ctx = canvasTex.getContext();
      ctx.clearRect(0, 0, cropW, cropH);
      ctx.drawImage(source, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
      canvasTex.refresh();

      // Guarda a key da textura recortada para uso no addTilesetImage.
      this._tilesetKeys[def.tmjName] = cutKey;
    });
  }

  update() {
    // Movimentacao base do personagem
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    // Zera a velocidade a cada frame antes de aplicar a nova direcao.
    personagem.setVelocity(0);

    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play('cab_andar_esquerda', true);
      this.direcaoAtual = 'esquerda';
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play('cab_andar_direita', true);
      this.direcaoAtual = 'direita';
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play('cab_andar_tras', true);
      this.direcaoAtual = 'tras';
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play('cab_andar_frente', true);
      this.direcaoAtual = 'frente';
      movendo = true;
    }

    if (!movendo) {
      // Se parar de andar, interrompe a animacao e mostra o frame parado da direcao atual.
      personagem.anims.stop();
      personagem.setTexture(`cab_${this.direcaoAtual}_1`);
    }

    // --- SAIDA COM TECLA ---
    // Verifica se o personagem entrou em alguma zona de saida.
    const dentroSaida = (this.zonasSaida || []).some((z) => {
      const d = Phaser.Math.Distance.Between(personagem.x, personagem.y, z.x, z.y);
      return d <= z.raio;
    });

    if (dentroSaida !== this.dentroZonaSaida) {
      // Atualiza o estado e mostra ou esconde o aviso "[E] Sair".
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    // Transicao para a cidade ao se aproximar da saida e apertar E
    if (!this.transicionando && dentroSaida && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('SceneCidade', {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2248,
          spawnY: 1568
        });
      });
    }

    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
