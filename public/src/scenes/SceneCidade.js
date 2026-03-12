export default class SceneCidade extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneCidade' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || "HB";
  }

  preload() {
    const nomePasta = this.registry.get('nomePasta') || 'Pedro';
    const prefixo   = this.registry.get('prefixo')   || 'HB';

    this.load.on('loaderror', (arquivo) => {
      console.error('[SceneCidade] Erro ao carregar:', arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON('mapaGeral', 'src/assets/imagens/mapsjson/tileMaps/mapaMiniMundoVF.tmj?v=5');
    this.load.image('tilesMapaTopo', 'src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Top.png?v=1');
    this.load.image('tilesMapaBase', 'src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Bottom.png?v=1');

    // Carrega todos os frames de animação do personagem escolhido
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`sprite_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`sprite_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`sprite_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`sprite_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  create() {
    const MAPA_X       = 720;   // conteúdo visual começa aqui
    const MAPA_Y       = 100;   // conteúdo visual começa aqui
    const MAPA_LARGURA = 2432;  // 3152 - 720
    const MAPA_ALTURA  = 1760;  // 1860 - 100

    // --- TILEMAP ---
    const mapa = this.make.tilemap({ key: 'mapaGeral' });

    const tileset1 = mapa.addTilesetImage('ME_Top_1',    'tilesMapaTopo');
    const tileset2 = mapa.addTilesetImage('ME_Bottom_1', 'tilesMapaBase');
    const tileset3 = mapa.addTilesetImage('ME_Top_2',    'tilesMapaTopo');
    const tileset4 = mapa.addTilesetImage('ME_Bottom_2', 'tilesMapaBase');
    const tilesets = [tileset1, tileset2, tileset3, tileset4].filter(Boolean);

    let caminhoInferior, carrosVeiculos, objetosInferior2, estabelecimentos;

    if (tilesets.length > 0) {
      // Camadas sem colisão — abaixo do personagem
      this._criarCamada(mapa, 'objetosSemColid_em_cima_2',     tilesets);
      this._criarCamada(mapa, 'contorno_preto_do_mapa',        tilesets);
      this._criarCamada(mapa, 'chao_inferior_de_areia',        tilesets);
      this._criarCamada(mapa, 'chao',                          tilesets);
      this._criarCamada(mapa, 'n_conchinhas_toalhas_matinhos', tilesets);
      this._criarCamada(mapa, 'n_agua_do_mar',                 tilesets);
      this._criarCamada(mapa, 'n_sombras',                     tilesets);
      this._criarCamada(mapa, 'n_objetosSemColid_em_baixo',    tilesets);
      this._criarCamada(mapa, 'n_objetosSemColi_em_baixo_2',   tilesets);
      this._criarCamada(mapa, 'n_linhas da rua',               tilesets);

      // Camadas com colisão
      caminhoInferior  = this._criarCamada(mapa, 'c_objetosComColid_em_baixo',   tilesets);
      carrosVeiculos   = this._criarCamada(mapa, 'c_carros e Veículos',          tilesets);
      objetosInferior2 = this._criarCamada(mapa, 'c_objetosComColid_em_baixo_2', tilesets);
      estabelecimentos = this._criarCamada(mapa, 'c_estabelecimentos_Com_Colid', tilesets);

      if (caminhoInferior)  caminhoInferior.setCollisionByExclusion([-1]);
      if (carrosVeiculos)   carrosVeiculos.setCollisionByExclusion([-1]);
      if (objetosInferior2) objetosInferior2.setCollisionByExclusion([-1]);
      if (estabelecimentos) estabelecimentos.setCollisionByExclusion([-1]);
    }

    // --- ANIMAÇÕES ---
    const direcoes = ['frente', 'tras', 'direita', 'esquerda'];
    direcoes.forEach(dir => {
      // Evita recriar se já existir (ao voltar para a cena)
      if (!this.anims.exists(`andar_${dir}`)) {
        this.anims.create({
          key: `andar_${dir}`,
          frames: [
            { key: `sprite_${dir}_1` },
            { key: `sprite_${dir}_2` },
            { key: `sprite_${dir}_3` },
            { key: `sprite_${dir}_4` }
          ],
          frameRate: 8,
          repeat: -1
        });
      }
    });

    // --- PERSONAGEM ---
    // Spawn no caminho de terra à esquerda do mapa (conteúdo real começa em px 784)
    const spawnX = 840;
    const spawnY = 900;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, 'sprite_frente_1');
    this.personagem.setCollideWorldBounds(true);

    const tamTile      = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite  = this.personagem.height;
    const escala = Math.min((tamTile * 1.5) / larguraSprite, (tamTile * 1.5) / alturaSprite);
    this.personagem.setScale(Math.max(escala, 0.05));
    this.personagem.body.setSize(larguraSprite * 0.5, alturaSprite * 0.5);

    // Colisões do personagem com as camadas
    if (caminhoInferior)  this.physics.add.collider(this.personagem, caminhoInferior);
    if (carrosVeiculos)   this.physics.add.collider(this.personagem, carrosVeiculos);
    if (objetosInferior2) this.physics.add.collider(this.personagem, objetosInferior2);
    if (estabelecimentos) this.physics.add.collider(this.personagem, estabelecimentos);

    // Camadas sem colisão — acima do personagem
    if (tilesets.length > 0) {
      const decSup1 = this._criarCamada(mapa, 'n_estabelecimento_Sem_colid', tilesets);
      const decSup2 = this._criarCamada(mapa, 'n_objetosSemColid_em_cima',   tilesets);
      const decSup3 = this._criarCamada(mapa, 'n_objetosSemColid_em_cima_2', tilesets);
      if (decSup1) decSup1.setDepth(10);
      if (decSup2) decSup2.setDepth(11);
      if (decSup3) decSup3.setDepth(12);
    }

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
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(MAPA_X, MAPA_Y, MAPA_LARGURA, MAPA_ALTURA);
    this.physics.world.setBounds(MAPA_X, MAPA_Y, MAPA_LARGURA, MAPA_ALTURA);

    // Direção atual para saber qual frame idle mostrar ao parar
    this.direcaoAtual = 'frente';
  }

  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) console.warn('[SceneCidade] Camada não encontrada:', nome);
      return camada;
    } catch (erro) {
      console.error('[SceneCidade] Erro ao criar camada', nome, ':', erro.message);
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
      personagem.anims.play('andar_esquerda', true);
      this.direcaoAtual = 'esquerda';
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play('andar_direita', true);
      this.direcaoAtual = 'direita';
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play('andar_tras', true);
      this.direcaoAtual = 'tras';
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play('andar_frente', true);
      this.direcaoAtual = 'frente';
      movendo = true;
    }

    // Parado: mostra o frame 1 da direção atual (idle)
    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`sprite_${this.direcaoAtual}_1`);
    }
  }
}
