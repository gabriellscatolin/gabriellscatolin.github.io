export default class ScenePostoDeGasolina extends Phaser.Scene {
  constructor() {
    super({ key: 'ScenePostoDeGasolina' });
  }

  init(dados) {
    this.nomePastaEscolhida = dados.nomePasta || this.registry.get('nomePasta') || "Pedro";
    this.prefixoEscolhido   = dados.prefixo   || this.registry.get('prefixo')   || "HB";
  }

  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo   = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    this.load.on("loaderror", (arquivo) => {
      console.error("[ScenePostoDeGasolina] Erro ao carregar:", arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON("posto", "src/assets/imagens/mapsjson/tileMaps/postoGasolina.tmj");

    this.load.image("super_interiors",   "src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png");
    this.load.image("super_roombuilder", "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png");
    this.load.image("super_exteriors",   "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Complete_Tileset.png");

    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`esp_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`esp_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`esp_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`esp_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  create() {
    const mapa = this.make.tilemap({ key: "posto" });
    this.mapa  = mapa;

    const tileW = mapa.tileWidth  || 16;
    const tileH = mapa.tileHeight || 16;

    // ---------------------------------------------------------------
    // DIAGNÓSTICO: loga nomes reais dos tilesets e camadas do TMJ
    // ---------------------------------------------------------------
    console.log("=== [ScenePostoDeGasolina] DIAGNÓSTICO ===");
    console.log("tileW:", tileW, "| tileH:", tileH);
    console.log("Largura (tiles):", mapa.width, "| Altura (tiles):", mapa.height);
    console.log(
      "TILESETS no TMJ:",
      (mapa.tilesets || []).map((t) => `"${t.name}" (firstgid:${t.firstgid})`)
    );
    console.log(
      "CAMADAS no TMJ:",
      (mapa.layers || []).map((l) => `"${l.name}"`)
    );
    console.log("==========================================");

    // ---------------------------------------------------------------
    // OFFSET: lido diretamente dos dados crus do TMJ para ser preciso.
    // Em mapas infinite o Tiled salva startx/starty negativos nos chunks.
    // O layer[0].x/y em Phaser já converte: se startx=-16, layer.x = -256.
    // Precisamos do valor absoluto para compensar o deslocamento negativo.
    // ---------------------------------------------------------------
    let offsetX = 0;
    let offsetY = 0;

    if (mapa.layers.length > 0) {
      // mapa.layers[0].x é o x em pixels da primeira camada
      const layerX = mapa.layers[0].x || 0;
      const layerY = mapa.layers[0].y || 0;

      // Se negativo, usamos o abs para "puxar" o mapa de volta à origem
      offsetX = layerX < 0 ? Math.abs(layerX) : 0;
      offsetY = layerY < 0 ? Math.abs(layerY) : 0;
    }

    // Fallback: se não achou nos layers, tenta ler do dado cru do cache
    if (offsetX === 0 && offsetY === 0) {
      try {
        const dadosCru = this.cache.tilemap.get("posto")?.data;
        if (dadosCru) {
          // Infinite maps: pega startx/starty do primeiro chunk da primeira layer com chunks
          const primeiraLayerComChunk = (dadosCru.layers || []).find(
            (l) => Array.isArray(l.chunks) && l.chunks.length > 0
          );
          if (primeiraLayerComChunk) {
            const startx = primeiraLayerComChunk.startx || 0;
            const starty = primeiraLayerComChunk.starty || 0;
            offsetX = startx < 0 ? Math.abs(startx) * tileW : 0;
            offsetY = starty < 0 ? Math.abs(starty) * tileH : 0;
            console.log(
              "[ScenePostoDeGasolina] Offset lido dos chunks crus — startx:",
              startx, "starty:", starty
            );
          }
        }
      } catch (e) {
        console.warn("[ScenePostoDeGasolina] Não foi possível ler dado cru do cache:", e.message);
      }
    }

    console.log("[ScenePostoDeGasolina] offsetX:", offsetX, "| offsetY:", offsetY);

    // ---------------------------------------------------------------
    // TILESETS: _otimizarTilesetsPorUso descobre os nomes reais e,
    // se possível, cria texturas cortadas para economizar memória.
    // ---------------------------------------------------------------
    this._otimizarTilesetsPorUso(mapa);

    // Nomes que DEVEM bater com o campo "name" dentro do TMJ/TSX.
    // Se o diagnóstico acima mostrar nomes diferentes, ajuste aqui.
    const NOME_INTERIORS   = "Interiors_16x16";
    const NOME_ROOMBUILDER = "Room_Builder_16x16";
    const NOME_EXTERIORS   = "Modern_Exteriors_Complete_Tileset";

    // Verifica se os nomes existem de fato no TMJ e avisa se não
    [NOME_INTERIORS, NOME_ROOMBUILDER, NOME_EXTERIORS].forEach((nome) => {
      const existe = (mapa.tilesets || []).some((t) => t.name === nome);
      if (!existe) {
        console.warn(
          `[ScenePostoDeGasolina] TILESET NÃO ENCONTRADO no TMJ: "${nome}".`,
          `Nomes disponíveis:`, (mapa.tilesets || []).map((t) => t.name)
        );
      }
    });

    const tsInteriors = mapa.addTilesetImage(
      NOME_INTERIORS,
      this._keyTileset(NOME_INTERIORS, "super_interiors")
    );
    const tsRoomBuilder = mapa.addTilesetImage(
      NOME_ROOMBUILDER,
      this._keyTileset(NOME_ROOMBUILDER, "super_roombuilder")
    );
    const tsExteriors = mapa.addTilesetImage(
      NOME_EXTERIORS,
      this._keyTileset(NOME_EXTERIORS, "super_exteriors")
    );

    const tilesets = [tsInteriors, tsRoomBuilder, tsExteriors].filter(Boolean);

    console.log(
      "[ScenePostoDeGasolina] Tilesets criados:",
      tilesets.length,
      "| interiors:", !!tsInteriors,
      "| roombuilder:", !!tsRoomBuilder,
      "| exteriors:", !!tsExteriors
    );

    if (tilesets.length === 0) {
      console.error(
        "[ScenePostoDeGasolina] NENHUM tileset carregado! " +
        "Verifique os nomes acima e corrija as constantes NOME_* no código."
      );
    }

    // Fundo escuro (evita buracos pretos entre tiles)
    this.add.rectangle(0, 0, 8000, 8000, 0x222222).setOrigin(0, 0).setPosition(-1000, -1000);

    // ---------------------------------------------------------------
    // CAMADAS: nomes lidos do TMJ (veja o diagnóstico no console).
    // Se o TMJ usar nomes diferentes dos abaixo, edite as constantes.
    // ---------------------------------------------------------------
    const CAMADAS = {
      chao:              "N- Ch\u00e3o",               // "N- Chão"
      paredeSemColid:    "N - ParedeSemColid",
      objetosBaixo:      "N - ObjetosSemColid_embaixo",
      paredeComColid:    "C- ParedeComColid",
      objetosComColid:   "C - Objetos com Colid",
      objetosCima:       "N - ObjetosSemColid_emcima",
      produtos:          "N - ProdutosSemColid",
    };

    // Sem colisão — abaixo do player
    this._criarCamada(mapa, CAMADAS.chao,           tilesets, offsetX, offsetY);
    this._criarCamada(mapa, CAMADAS.paredeSemColid, tilesets, offsetX, offsetY);
    this._criarCamada(mapa, CAMADAS.objetosBaixo,   tilesets, offsetX, offsetY);

    // Com colisão
    const paredeC = this._criarCamada(mapa, CAMADAS.paredeComColid,  tilesets, offsetX, offsetY);
    const objC    = this._criarCamada(mapa, CAMADAS.objetosComColid, tilesets, offsetX, offsetY);

    [paredeC, objC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));

    // Sem colisão — acima do player (depth 10)
    const emCima   = this._criarCamada(mapa, CAMADAS.objetosCima, tilesets, offsetX, offsetY);
    const produtos = this._criarCamada(mapa, CAMADAS.produtos,    tilesets, offsetX, offsetY);
    if (emCima)   emCima.setDepth(10);
    if (produtos) produtos.setDepth(10);

    // --- Animações ---
    ["frente", "tras", "direita", "esquerda"].forEach((dir) => {
      if (!this.anims.exists(`esp_andar_${dir}`)) {
        this.anims.create({
          key: `esp_andar_${dir}`,
          frames: [1, 2, 3, 4].map((i) => ({ key: `esp_${dir}_${i}` })),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // --- Personagem ---
    // Spawn no centro da área de conteúdo do mapa
    const spawnX = offsetX + Math.floor(mapa.width  / 2) * tileW;
    const spawnY = offsetY + Math.floor(mapa.height / 2) * tileH;

    console.log("[ScenePostoDeGasolina] Spawn:", spawnX, spawnY);

    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);
    this.personagem.setDepth(5);
    this.personagem.setDisplaySize(tileW, tileH * 2);

    // Hitbox nos pés
    const sx  = this.personagem.scaleX;
    const sy  = this.personagem.scaleY;
    const hbW = 10 / sx;
    const hbH =  8 / sy;
    this.personagem.body.setSize(hbW, hbH);
    this.personagem.body.setOffset(
      (this.personagem.width  - hbW) / 2,
       this.personagem.height - hbH,
    );

    [paredeC, objC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));

    // --- Controles ---
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd   = this.input.keyboard.addKeys({
      cima:     Phaser.Input.Keyboard.KeyCodes.W,
      baixo:    Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita:  Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // --- Câmera ---
    const totalW = offsetX + mapa.width  * tileW + offsetX;
    const totalH = offsetY + mapa.height * tileH + offsetY;

    console.log("[ScenePostoDeGasolina] Bounds mundo:", totalW, "x", totalH);

    const cam = this.cameras.main;
    cam.setZoom(4);
    cam.setBounds(0, 0, totalW, totalH);
    this.physics.world.setBounds(0, 0, totalW, totalH);
    cam.startFollow(this.personagem, true, 0.1, 0.1);
    cam.fadeIn(600, 0, 0, 0);

    // --- Zona de saída ---
    this.zonasSaida = this._criarZonasSaida(offsetX, offsetY, tileW, tileH);

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

    this.transicionando  = false;
    this.dentroZonaSaida = false;
    this.direcaoAtual    = "frente";

    // Debug: mostra posição do personagem + tile atual
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

  // ---------------------------------------------------------------
  // Cria uma camada com verificação robusta de nome.
  // Faz trim e comparação case-insensitive como fallback.
  // ---------------------------------------------------------------
  _criarCamada(mapa, nome, tilesets, offsetX = 0, offsetY = 0) {
    try {
      // Busca exata primeiro
      let nomeReal = nome;
      let existe = mapa.layers.some((l) => l.name === nome);

      // Fallback: trim + case-insensitive
      if (!existe) {
        const encontrado = mapa.layers.find(
          (l) => l.name.trim().toLowerCase() === nome.trim().toLowerCase()
        );
        if (encontrado) {
          console.warn(
            `[ScenePostoDeGasolina] Camada "${nome}" encontrada com nome diferente: "${encontrado.name}". ` +
            `Usando o nome real do TMJ.`
          );
          nomeReal = encontrado.name;
          existe   = true;
        }
      }

      if (!existe) {
        console.warn(
          `[ScenePostoDeGasolina] CAMADA AUSENTE no TMJ: "${nome}". ` +
          `Disponíveis: ${mapa.layers.map((l) => `"${l.name}"`).join(", ")}`
        );
        return null;
      }

      const camada = mapa.createLayer(nomeReal, tilesets, offsetX, offsetY);
      if (!camada) {
        console.error(`[ScenePostoDeGasolina] FALHA ao criar camada: "${nomeReal}"`);
        return null;
      }

      console.log(`[ScenePostoDeGasolina] Camada OK: "${nomeReal}"`);
      return camada;
    } catch (erro) {
      console.error(`[ScenePostoDeGasolina] ERRO na camada "${nome}":`, erro.message);
      return null;
    }
  }

  _criarZonasSaida(offsetX, offsetY, tileW, tileH) {
    // Ajuste portaTileX e portaTileY conforme o debugTxt.
    // Dica: ande até a porta, anote x/y do debugTxt e calcule:
    //   portaTileX = (x - offsetX) / tileW
    //   portaTileY = (y - offsetY) / tileH
    const portaTileX = 4;
    const portaTileY = 11;

    const zona = new Phaser.Geom.Rectangle(
      offsetX + portaTileX * tileW,
      offsetY + portaTileY * tileH,
      tileW * 2,
      tileH,
    );
    console.log("[ScenePostoDeGasolina] Zona de saída:", zona);
    return [zona];
  }

  _keyTileset(tmjName, fallbackKey) {
    return (this._tilesetKeys && this._tilesetKeys[tmjName]) || fallbackKey;
  }

  _coletarGidsUsados(mapa) {
    const usados = new Set();
    (mapa.layers || []).forEach((layer) => {
      const data = layer.data || [];
      for (let y = 0; y < data.length; y++) {
        const row = data[y] || [];
        for (let x = 0; x < row.length; x++) {
          const cell = row[x];
          const gid  = typeof cell === "number" ? cell : (cell?.index || 0);
          if (gid > 0) usados.add(gid);
        }
      }
    });
    return usados;
  }

  _otimizarTilesetsPorUso(mapa) {
    const defs = [
      { tmjName: "Interiors_16x16",                   baseKey: "super_interiors"   },
      { tmjName: "Room_Builder_16x16",                baseKey: "super_roombuilder" },
      { tmjName: "Modern_Exteriors_Complete_Tileset", baseKey: "super_exteriors"   },
    ];

    this._tilesetKeys = {};
    const usados            = this._coletarGidsUsados(mapa);
    const tilesetsOrdenados = [...(mapa.tilesets || [])].sort(
      (a, b) => (a.firstgid || 0) - (b.firstgid || 0),
    );

    // Atualiza defs com o nome real encontrado no TMJ (case-insensitive)
    defs.forEach((def) => {
      const encontrado = tilesetsOrdenados.find(
        (t) => t.name.trim().toLowerCase() === def.tmjName.trim().toLowerCase()
      );
      if (encontrado && encontrado.name !== def.tmjName) {
        console.warn(
          `[ScenePostoDeGasolina] Tileset "${def.tmjName}" encontrado como "${encontrado.name}" no TMJ.`
        );
        def.tmjNameReal = encontrado.name;
      } else {
        def.tmjNameReal = def.tmjName;
      }
    });

    defs.forEach((def) => {
      this._tilesetKeys[def.tmjName]     = def.baseKey;
      this._tilesetKeys[def.tmjNameReal] = def.baseKey; // garante o nome real também

      if (!this.textures.exists(def.baseKey)) return;
      const ts = tilesetsOrdenados.find((t) => t.name === def.tmjNameReal);
      if (!ts) return;

      const source = this.textures.get(def.baseKey).getSourceImage();
      if (!source?.width || !source?.height) return;

      const idx      = tilesetsOrdenados.findIndex((t) => t.name === def.tmjNameReal);
      const startGid = ts.firstgid || 1;
      const endGid   =
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

      const tsW     = ts.tilewidth  || 16;
      const tsH     = ts.tileheight || 16;
      const margin  = ts.margin     || 0;
      const spacing = ts.spacing    || 0;

      const columns =
        ts.columns ||
        Math.max(1, Math.floor((source.width - margin * 2 + spacing) / (tsW + spacing)));

      const tilesNecessarios  = maiorGidUsado - startGid + 1;
      const linhasNecessarias = Math.max(1, Math.ceil(tilesNecessarios / columns));

      const cropWCalc = margin + columns           * (tsW + spacing) - spacing + margin;
      const cropHCalc = margin + linhasNecessarias * (tsH + spacing) - spacing + margin;

      const cropW = Math.min(source.width,  Math.max(tsW, cropWCalc));
      const cropH = Math.min(source.height, Math.max(tsH, cropHCalc));

      if (cropW >= source.width && cropH >= source.height) return;

      const cutKey = `${def.baseKey}_cut`;
      if (this.textures.exists(cutKey)) this.textures.remove(cutKey);

      const canvasTex = this.textures.createCanvas(cutKey, cropW, cropH);
      const ctx       = canvasTex.getContext();
      ctx.clearRect(0, 0, cropW, cropH);
      ctx.drawImage(source, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
      canvasTex.refresh();

      this._tilesetKeys[def.tmjName]     = cutKey;
      this._tilesetKeys[def.tmjNameReal] = cutKey;
    });
  }

  update() {
    const velocidade = 80;
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

    if (!this.transicionando && dentroSaida && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo:   this.prefixoEscolhido,
          spawnX:    2931,
          spawnY:    350,
        });
      });
    }

    // Debug: posição em pixels e em tiles (útil para calibrar a zona de saída)
    const tileW = this.mapa?.tileWidth  || 16;
    const tileH = this.mapa?.tileHeight || 16;
    const tileX = Math.floor(personagem.x / tileW);
    const tileY = Math.floor(personagem.y / tileH);
    this.debugTxt.setText(
      `px(${Math.round(personagem.x)}, ${Math.round(personagem.y)})  tile(${tileX}, ${tileY})`
    );
    this.debugTxt.setPosition(personagem.x - 20, personagem.y - 16);
  }
}
