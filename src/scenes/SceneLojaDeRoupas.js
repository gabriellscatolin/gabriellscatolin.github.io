export default class SceneLojaDeRoupas extends Phaser.Scene {
  constructor() {
    super({ key: "SceneLojaDeRoupas" });
  }

  // Recebe os dados do personagem vindos da cena anterior
  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || "Pedro";
    this.prefixoEscolhido = dados.prefixo || "HB";
  }

  // Carrega mapa, tilesets e sprites do personagem
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    // Loga erros de carregamento para facilitar debug
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneLojaDeRoupas] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Tilemap e tilesets do ambiente
    this.load.tilemapTiledJSON(
      "salaoDeBeleza",
      "src/assets/imagens/mapsjson/tileMaps/salaoDeBeleza.tmj",
    );
    this.load.image(
      "cab_roombuilder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "cab_interiors",
      "src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png",
    );

    // Sprites do personagem (4 direções × 4 frames)
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `cab_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `cab_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `cab_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `cab_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  // Monta o mapa, personagem, colisões, câmera e saída
  create() {
    const mapa = this.make.tilemap({ key: "salaoDeBeleza" });

    // Otimiza os tilesets para reduzir uso de memória
    this._otimizarTilesetsPorUso(mapa);

    const roomBuilder = mapa.addTilesetImage(
      "Room_Builder_16x16",
      this._keyTileset("Room_Builder_16x16", "cab_roombuilder"),
    );
    const interiors = mapa.addTilesetImage(
      "Interiors_16x16",
      this._keyTileset("Interiors_16x16", "cab_interiors"),
    );
    const tiles = [roomBuilder, interiors].filter(Boolean);

    // Fundo neutro para evitar áreas vazias fora do mapa
    this.add
      .rectangle(
        0,
        0,
        mapa.widthInPixels + 200,
        mapa.heightInPixels + 200,
        0x888888,
      )
      .setOrigin(0, 0);

    // Camadas visuais sem colisão
    mapa.createLayer("N - Chão", tiles, 0, 0);
    mapa.createLayer("N - ParedeSemColid", tiles, 0, 0);
    mapa.createLayer("N - ObjetsoSemColid_0", tiles, 0, 0);
    mapa.createLayer("PLAYER", tiles, 0, 0);
    mapa.createLayer("N - ObjetosSemColid", tiles, 0, 0);
    mapa.createLayer("N - ObjetosSemColid_02", tiles, 0, 0);
    mapa.createLayer("N - ObjetosSemColid_3", tiles, 0, 0);

    // Camadas com colisão (bloqueiam o movimento)
    const paredeEmbaixo = mapa.createLayer(
      "C - ParedeComColid_embaixo",
      tiles,
      0,
      0,
    );
    const parede = mapa.createLayer("C - ParedeComColid", tiles, 0, 0);
    const objetos = mapa.createLayer("C - Objetos ComColid", tiles, 0, 0);

    paredeEmbaixo.setCollisionByExclusion([-1]);
    parede.setCollisionByExclusion([-1]);
    objetos.setCollisionByExclusion([-1]);

    // Cria animações de movimento do personagem
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`cab_andar_${dir}`)) {
        this.anims.create({
          key: `cab_andar_${dir}`,
          frames: [
            { key: `cab_${dir}_1` },
            { key: `cab_${dir}_2` },
            { key: `cab_${dir}_3` },
            { key: `cab_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Posição inicial do personagem dentro do ambiente
    const spawnX = 124;
    const spawnY = 183;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, "cab_frente_1");
    this.personagem.setCollideWorldBounds(true);

    // Ajusta escala e hitbox para encaixar no tilemap
    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite = this.personagem.height;
    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    // Colisões com o cenário
    this.physics.add.collider(this.personagem, paredeEmbaixo);
    this.physics.add.collider(this.personagem, parede);
    this.physics.add.collider(this.personagem, objetos);

    // Controles (setas + WASD)
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Câmera segue o personagem
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = "frente";

    // Zona de saída próxima à porta
    this.zonasSaida = [{ x: 74, y: 72, raio: 35 }];
    this.dentroZonaSaida = false;
    this.transicionando = false;

    this.labelSair = this.add
      .text(74, 72, "[E] Sair", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    // Texto de debug com coordenadas
    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "4px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);
  }

  // Retorna tileset otimizado ou fallback
  _keyTileset(nomeTileset, fallbackKey) {
    return (this._tilesetKeys && this._tilesetKeys[nomeTileset]) || fallbackKey;
  }

  // Coleta quais tiles são usados no mapa
  _coletarGidsUsados(mapa) {
    const usados = new Set();

    (mapa.layers || []).forEach((layer) => {
      const data = layer.data || [];
      for (let y = 0; y < data.length; y++) {
        const row = data[y] || [];
        for (let x = 0; x < row.length; x++) {
          const cell = row[x];
          const gid = typeof cell === "number" ? cell : cell?.index || 0;
          if (gid > 0) usados.add(gid);
        }
      }
    });

    return usados;
  }

  // Recorta tilesets para conter apenas os tiles realmente usados
  _otimizarTilesetsPorUso(mapa) {
    const defs = [
      { tmjName: "Room_Builder_16x16", baseKey: "cab_roombuilder" },
      { tmjName: "Interiors_16x16", baseKey: "cab_interiors" },
    ];

    this._tilesetKeys = {};
    const usados = this._coletarGidsUsados(mapa);
    const tilesetsOrdenados = [...(mapa.tilesets || [])].sort(
      (a, b) => (a.firstgid || 0) - (b.firstgid || 0),
    );

    defs.forEach((def) => {
      this._tilesetKeys[def.tmjName] = def.baseKey;

      if (!this.textures.exists(def.baseKey)) return;
      const ts = tilesetsOrdenados.find((t) => t.name === def.tmjName);
      if (!ts) return;

      const source = this.textures.get(def.baseKey).getSourceImage();
      if (!source?.width || !source?.height) return;

      const idx = tilesetsOrdenados.findIndex((t) => t.name === def.tmjName);
      const startGid = ts.firstgid || 1;
      const endGid =
        idx < tilesetsOrdenados.length - 1
          ? tilesetsOrdenados[idx + 1].firstgid - 1
          : Number.MAX_SAFE_INTEGER;

      let maiorGidUsado = 0;
      usados.forEach((gid) => {
        if (gid >= startGid && gid <= endGid && gid > maiorGidUsado) {
          maiorGidUsado = gid;
        }
      });

      if (!maiorGidUsado) return;

      const tileW = ts.tilewidth || 16;
      const tileH = ts.tileheight || 16;
      const margin = ts.margin || 0;
      const spacing = ts.spacing || 0;

      const columns =
        ts.columns ||
        Math.max(
          1,
          Math.floor((source.width - margin * 2 + spacing) / (tileW + spacing)),
        );

      const tilesNecessarios = maiorGidUsado - startGid + 1;
      const linhasNecessarias = Math.max(
        1,
        Math.ceil(tilesNecessarios / columns),
      );

      const cropWCalc = margin + columns * (tileW + spacing) - spacing + margin;
      const cropHCalc =
        margin + linhasNecessarias * (tileH + spacing) - spacing + margin;

      const cropW = Math.min(source.width, Math.max(tileW, cropWCalc));
      const cropH = Math.min(source.height, Math.max(tileH, cropHCalc));

      if (cropW >= source.width && cropH >= source.height) return;

      const cutKey = `${def.baseKey}_cut`;
      if (this.textures.exists(cutKey)) this.textures.remove(cutKey);

      const canvasTex = this.textures.createCanvas(cutKey, cropW, cropH);
      const ctx = canvasTex.getContext();
      ctx.clearRect(0, 0, cropW, cropH);
      ctx.drawImage(source, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
      canvasTex.refresh();

      this._tilesetKeys[def.tmjName] = cutKey;
    });
  }

  // Atualiza movimento e saída da cena
  update() {
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("cab_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("cab_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("cab_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play("cab_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`cab_${this.direcaoAtual}_1`);
    }

    // Verifica se o personagem entrou na zona de saída
    const dentroSaida = (this.zonasSaida || []).some((z) => {
      const d = Phaser.Math.Distance.Between(
        personagem.x,
        personagem.y,
        z.x,
        z.y,
      );
      return d <= z.raio;
    });

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    // Transição para a cidade ao pressionar E na saída
    if (
      !this.transicionando &&
      dentroSaida &&
      Phaser.Input.Keyboard.JustDown(this.teclaE)
    ) {
      this.transicionando = true;
      this.labelSair.setVisible(false);

      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2248,
          spawnY: 1568,
        });
      });
    }

    // Atualiza debug com coordenadas
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
