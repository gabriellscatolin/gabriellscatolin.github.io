export default class ScenePadaria extends Phaser.Scene {
  constructor() {
    super({ key: 'ScenePadaria' });
  }

  // Recebe os dados do personagem vindos da cena anterior
  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
  }

  // Carrega mapa, tilesets e sprites do personagem
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    // Loga erros de carregamento para facilitar debug
    this.load.on("loaderror", (arquivo) => {
      console.error("[ScenePadaria] Erro ao carregar:", arquivo.key, arquivo.src);
    });

    // Tilemap e tilesets do ambiente
    this.load.tilemapTiledJSON("padaria", "src/assets/imagens/mapsjson/tileMaps/padaria.tmj");

    this.load.image("super_interiors",   "src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png");
    this.load.image("super_roombuilder", "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png");
    this.load.image("super_exteriors",   "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Complete_Tileset.png");

    // Sprites do personagem (4 direções × 4 frames)
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`esp_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`esp_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`esp_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`esp_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  // Monta mapa, personagem, colisões, câmera e saída
  create() {
    const mapa = this.make.tilemap({ key: "padaria" });
    this.mapa = mapa;

    // Otimiza tilesets para melhorar performance
    this._otimizarTilesetsPorUso(mapa);

    const tsInteriors = mapa.addTilesetImage("Interiors_16x16", this._keyTileset("Interiors_16x16", "super_interiors"));
    const tsRoomBuilder = mapa.addTilesetImage("Room_Builder_16x16", this._keyTileset("Room_Builder_16x16", "super_roombuilder"));
    const tsExteriors = mapa.addTilesetImage("Modern_Exteriors_Complete_Tileset", this._keyTileset("Modern_Exteriors_Complete_Tileset", "super_exteriors"));

    const tilesets = [tsInteriors, tsRoomBuilder, tsExteriors].filter(Boolean);

    // Fundo neutro para evitar áreas vazias fora do mapa
    this.add
      .rectangle(0, 0, mapa.widthInPixels + 200, mapa.heightInPixels + 200, 0x888888)
      .setOrigin(0, 0);

    // Camadas visuais (sem colisão)
    this._criarCamada(mapa, "Chão",              tilesets);
    this._criarCamada(mapa, "ParedeSemColisão1", tilesets);
    this._criarCamada(mapa, "ParedeSemColisão2", tilesets);
    this._criarCamada(mapa, "ObjSemColisao1",    tilesets);
    this._criarCamada(mapa, "ObjSemColisao2",    tilesets);
    this._criarCamada(mapa, "Itens",             tilesets);
    this._criarCamada(mapa, "Itens2",            tilesets);
    this._criarCamada(mapa, "Vidro",             tilesets);

    // Camadas sólidas (com colisão)
    const paredeC = this._criarCamada(mapa, "ParedeComColisão", tilesets);
    const objC    = this._criarCamada(mapa, "ObjComColisao",    tilesets);
    const bordaC  = this._criarCamada(mapa, "Bordas",           tilesets);

    [paredeC, objC, bordaC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));

    // Cria animações de movimento
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`esp_andar_${dir}`)) {
        this.anims.create({
          key: `esp_andar_${dir}`,
          frames: [
            { key: `esp_${dir}_1` },
            { key: `esp_${dir}_2` },
            { key: `esp_${dir}_3` },
            { key: `esp_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Posição inicial dentro da padaria
    const spawnX = 124;
    const spawnY = 183;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);

    // Colisões extras com zonas invisíveis (objetos específicos)
    const pontosColisao = [
      { x: 100, y: 56, w: 16, h: 16 },
      { x: 91,  y: 59, w: 16, h: 16 },
      { x: 65,  y: 84, w: 16, h: 16 },
      { x: 45,  y: 84, w: 16, h: 16 },
      { x: 25,  y: 84, w: 16, h: 16 },
    ];

    this.colisoesExtras = [];
    pontosColisao.forEach(({ x, y, w, h }) => {
      const zona = this.add.zone(x, y, w, h).setOrigin(0, 0);
      this.physics.add.existing(zona, true);
      this.physics.add.collider(this.personagem, zona);
      this.colisoesExtras.push(zona);
    });

    // Ajusta escala e hitbox (colisão mais precisa nos pés)
    const tamTile = mapa.tileHeight || 16;
    const escalaX = tamTile / this.personagem.width;
    const escalaY = (tamTile * 2) / this.personagem.height;
    this.personagem.setScale(escalaX, escalaY);

    this.personagem.body.setSize(12 / escalaX, 10 / escalaY);
    this.personagem.body.setOffset(
      (this.personagem.width - 12 / escalaX) / 2,
      this.personagem.height - 10 / escalaY
    );

    // Colisão com camadas do mapa
    [paredeC, objC, bordaC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));

    // Controles
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Câmera segue o personagem
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Zonas de saída (detectadas no mapa ou fallback)
    this.zonasSaida = this._criarZonasSaida(mapa);

    this.labelSair = this.add.text(0, 0, "[E] Sair", {
      fontSize: "3px",
      color: "#ffffff",
      backgroundColor: "#000000cc",
      padding: { x: 1, y: 1 },
      resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.transicionando  = false;
    this.dentroZonaSaida = false;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.direcaoAtual = "frente";

    // Debug de posição
    this.debugTxt = this.add.text(0, 0, "", {
      fontSize: "4px",
      color: "#ffff00",
      backgroundColor: "#000000",
      padding: { x: 1, y: 1 },
      resolution: 4,
    }).setDepth(999);
  }

  // Cria camada com verificação de existência no mapa
  _criarCamada(mapa, nome, tilesets) {
    try {
      const existe = mapa.layers.some((l) => l.name === nome);
      if (!existe) return null;
      return mapa.createLayer(nome, tilesets, 0, 0);
    } catch {
      return null;
    }
  }

  // Atualiza movimento e saída da cena
  update() {
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("esp_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("esp_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("esp_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play("esp_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`esp_${this.direcaoAtual}_1`);
    }

    // Verifica se o personagem entrou na zona de saída
    const dentroSaida = (this.zonasSaida || []).some((z) =>
      Phaser.Geom.Rectangle.Contains(z, personagem.x, personagem.y)
    );

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    if (dentroSaida) {
      this.labelSair.setPosition(personagem.x, personagem.y - 10);
    }

    // Transição para a cidade ao pressionar E
    if (!this.transicionando && dentroSaida && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.transicionando = true;
      this.labelSair.setVisible(false);

      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo:   this.prefixoEscolhido,
          spawnX:    76,
          spawnY:    232,
        });
      });
    }

    // Debug de coordenadas
    this.debugTxt.setText(`x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`);
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}