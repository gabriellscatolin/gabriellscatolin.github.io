export default class ScenePadaria extends Phaser.Scene {
  constructor() {
    super({ key: "ScenePadaria" });
  }

  // Recebe os dados do personagem vindos da cena anterior
  init(dados) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
  }

  // Carrega mapa, tilesets e sprites do personagem
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    // Loga erros de carregamento para facilitar debug
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[ScenePadaria] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Carrega o tilemap, tilesets e áudios do ambiente

    this.load.audio(
      "trilhaScenePadaria", 'src/assets/audios/trilhaScenePadaria.mp3'
    );

    this.load.tilemapTiledJSON(
      "padaria",
      "src/assets/imagens/mapsjson/tileMaps/padaria.tmj",
    );

    this.load.image(
      "super_interiors",
      "src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png",
    );
    this.load.image(
      "super_roombuilder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "super_exteriors",
      "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Complete_Tileset.png",
    );
    this.load.image(
      "npc_padaria",
      "src/assets/imagens/imagensPersonagens/NPC/npcPadaria.png",
    );

    // Sprites do personagem (4 direções × 4 frames)
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `esp_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `esp_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `esp_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `esp_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  // Monta mapa, personagem, colisões, câmera e saída
  create() {
    const mapa = this.make.tilemap({ key: "padaria" });
    this.mapa = mapa;

  // Adiciona áudios a cena
    this.musica = this.sound.add('trilhaScenePadaria', { loop: true, volume: 0.5});
    this.musica.play();

    // Otimiza tilesets para melhorar performance
    this._otimizarTilesetsPorUso(mapa);

    const tsInteriors = mapa.addTilesetImage(
      "Interiors_16x16",
      this._keyTileset("Interiors_16x16", "super_interiors"),
    );
    const tsRoomBuilder = mapa.addTilesetImage(
      "Room_Builder_16x16",
      this._keyTileset("Room_Builder_16x16", "super_roombuilder"),
    );
    const tsExteriors = mapa.addTilesetImage(
      "Modern_Exteriors_Complete_Tileset",
      this._keyTileset("Modern_Exteriors_Complete_Tileset", "super_exteriors"),
    );

    const tilesets = [tsInteriors, tsRoomBuilder, tsExteriors].filter(Boolean);

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

    // Camadas visuais (sem colisão)
    this._criarCamada(mapa, "Chão", tilesets);
    this._criarCamada(mapa, "ParedeSemColisão1", tilesets);
    this._criarCamada(mapa, "ParedeSemColisão2", tilesets);
    this._criarCamada(mapa, "ObjSemColisao1", tilesets);
    this._criarCamada(mapa, "ObjSemColisao2", tilesets);
    this._criarCamada(mapa, "Itens", tilesets);
    this._criarCamada(mapa, "Itens2", tilesets);
    this._criarCamada(mapa, "Vidro", tilesets);

    // Camadas sólidas (com colisão)
    const paredeC = this._criarCamada(mapa, "ParedeComColisão", tilesets);
    const objC = this._criarCamada(mapa, "ObjComColisao", tilesets);
    const bordaC = this._criarCamada(mapa, "Bordas", tilesets);

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
    const spawnX = 83;
    const spawnY = 215;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);

    // Colisões extras com zonas invisíveis (objetos específicos)
    const pontosColisao = [
      { x: 100, y: 56, w: 16, h: 16 },
      { x: 91, y: 59, w: 16, h: 16 },
      { x: 65, y: 84, w: 16, h: 16 },
      { x: 45, y: 84, w: 16, h: 16 },
      { x: 25, y: 84, w: 16, h: 16 },
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
    const escala = Math.min(
      (tamTile * 0.6) / this.personagem.width,
      (tamTile * 0.6) / this.personagem.height,
    );
    this.personagem.setScale(Math.max(escala, 0.03));

    this.personagem.body.setSize(
      this.personagem.width * 0.45,
      this.personagem.height * 0.35,
    );
    this.personagem.body.setOffset(
      this.personagem.width * 0.275,
      this.personagem.height * 0.65,
    );

    // Colisão com camadas do mapa
    [paredeC, objC, bordaC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));

    // NPC da padaria
    this.npcPadaria = this.physics.add.staticImage(125, 168, "npc_padaria");
    this.npcPadaria.setScale(0.07);
    this.npcPadaria.refreshBody();
    this.npcPadaria.setDepth(5);
    this.physics.add.collider(this.personagem, this.npcPadaria);

    this.labelNpc = this.add
      .text(this.npcPadaria.x, this.npcPadaria.y, "[E] Falar", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.exclamacaoNpc = this.add
      .text(
        this.npcPadaria.x,
        this.npcPadaria.y - this.npcPadaria.displayHeight * 0.5,
        "!",
        {
          fontSize: "24px",
          color: "#ffeb3b",
          stroke: "#000000",
          strokeThickness: 2,
          resolution: 4,
        },
      )
      .setDepth(21)
      .setOrigin(0.5, 1);

    this.tweenExclamacaoNpc = this.tweens.add({
      targets: this.exclamacaoNpc,
      alpha: { from: 1, to: 0.25 },
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

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
    this.cameras.main.setZoom(6);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Zonas de saída (detectadas no mapa ou fallback)
    this.zonasSaida = this._criarZonasSaida(spawnX, spawnY);

    this.labelSair = this.add
      .text(0, 0, "[E] Sair", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.transicionando = false;
    this.dentroZonaSaida = false;
    this.podeSairPadaria = false;
    this.perto_npc = false;
    this.falouComNpc = false;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    this.direcaoAtual = "frente";

    // Debug de posição
    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "4px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);

    // Pausa a trilha sonora ao iniciar nova cena
     this.events.on("shutdown", () => {
     this.musica.stop();
      });
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

  // Retorna a chave otimizada do tileset ou a original
  _keyTileset(tmjName, fallbackKey) {
    return (this._tilesetKeys && this._tilesetKeys[tmjName]) || fallbackKey;
  }

  // Coleta GIDs realmente usados no mapa
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

  // Recorta tilesets para usar apenas área necessária
  _otimizarTilesetsPorUso(mapa) {
    const defs = [
      { tmjName: "Interiors_16x16", baseKey: "super_interiors" },
      { tmjName: "Room_Builder_16x16", baseKey: "super_roombuilder" },
      {
        tmjName: "Modern_Exteriors_Complete_Tileset",
        baseKey: "super_exteriors",
      },
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

      if (cropW <= 0 || cropH <= 0) return;
      if (cropW >= source.width && cropH >= source.height) return;

      const cutKey = `${def.baseKey}_cut`;
      if (this.textures.exists(cutKey)) this.textures.remove(cutKey);

      const canvasTex = this.textures.createCanvas(cutKey, cropW, cropH);
      if (!canvasTex) return;
      const ctx = canvasTex.getContext();
      ctx.clearRect(0, 0, cropW, cropH);
      ctx.drawImage(source, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
      canvasTex.refresh();

      this._tilesetKeys[def.tmjName] = cutKey;
    });
  }

  // Define zona de saída mais restrita e um pouco abaixo do spawn
  _criarZonasSaida(spawnX, spawnY) {
    return [new Phaser.Geom.Rectangle(spawnX - 7, spawnY + 8, 14, 14)];
  }

  // Atualiza movimento e saída da cena
  update() {
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    if (Phaser.Input.Keyboard.JustDown(this.teclaF)) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }

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

    // Interação com NPC por proximidade (ponto solicitado)
    const distNpc = Phaser.Math.Distance.Between(
      personagem.x,
      personagem.y,
      101,
      165,
    );
    const pertoNpc = distNpc < 30;

    if (pertoNpc !== this.perto_npc) {
      this.perto_npc = pertoNpc;
      this.labelNpc.setVisible(pertoNpc && !this.dentroZonaSaida);
    }

    if (pertoNpc) {
      this.labelNpc.setPosition(this.npcPadaria.x, this.npcPadaria.y + 2);
    }

    if (pertoNpc && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.falouComNpc = true;
      this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
      console.log("[ScenePadaria] Interagiu com o NPC da padaria");
    }

    if (!this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setPosition(
        this.npcPadaria.x,
        this.npcPadaria.y - this.npcPadaria.displayHeight * 0.5,
      );
    }

    // Verifica se o personagem entrou na zona de saída
    const dentroSaida = (this.zonasSaida || []).some((z) =>
      Phaser.Geom.Rectangle.Contains(z, personagem.x, personagem.y),
    );

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    if (dentroSaida) {
      this.labelSair.setPosition(personagem.x, personagem.y - 10);
    }

    // Evita saída imediata ao entrar na cena: precisa sair da zona uma vez
    if (!this.podeSairPadaria && !dentroSaida) {
      this.podeSairPadaria = true;
    }

    // Transição automática para a cidade ao entrar na zona de saída
    if (!this.transicionando && this.podeSairPadaria && dentroSaida) {
      this.transicionando = true;
      this.labelSair.setVisible(false);

      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 1470,
          spawnY: 890,
        });
      });
    }

    // Debug de coordenadas
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
