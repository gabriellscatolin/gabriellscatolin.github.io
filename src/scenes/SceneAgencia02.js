export default class SceneAgencia02 extends Phaser.Scene {
  constructor() {
    super({ key: "SceneAgencia02" });
  }

  // Recupera os dados do personagem escolhidos anteriormente
  init(dados = {}) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
    this.spawnXCustom = dados.spawnX ?? null;
    this.spawnYCustom = dados.spawnY ?? null;
  }

  // Carrega os assets do mapa e do personagem
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    // Loga erros de carregamento para facilitar depuração
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneAgencia02] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Carrega o mapa e os tilesets usados na agência
    this.load.tilemapTiledJSON(
      "agencia02",
      "src/assets/imagens/mapsjson/tileMaps/agencia02.tmj",
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
      "super_char06",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_06 - Copia.png",
    );
    this.load.image(
      "super_char05",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_05 - Copia.png",
    );
    this.load.image(
      "super_char04",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_04 - Copia.png",
    );
    this.load.image(
      "super_char03",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_03 - Copia.png",
    );
    this.load.image(
      "super_char02",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_02 - Copia.png",
    );
    this.load.image(
      "super_char01",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_01 - Copia.png",
    );

    // Carrega os sprites do personagem em todas as direções
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

  // Monta a cena, cria o mapa, o personagem e as interações principais
  create() {
    const mapa = this.make.tilemap({ key: "agencia02" });
    this.mapa = mapa;
    const mapaBruto = this.cache.tilemap.get("agencia02")?.data;
    const limitesMapa = this._calcularLimitesMapa(mapaBruto || mapa);
    const limitesCena = {
      x: limitesMapa.x + 77,
      y: limitesMapa.y,
      width: limitesMapa.width,
      height: Math.max(limitesMapa.height, mapa.heightInPixels) + 70,
    };

    // Otimiza os tilesets antes de montar as camadas
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
    const tsChar06 = mapa.addTilesetImage(
      "Premade_Character_06",
      this._keyTileset("Premade_Character_06", "super_char06"),
    );
    const tsChar05 = mapa.addTilesetImage(
      "Premade_Character_05",
      this._keyTileset("Premade_Character_05", "super_char05"),
    );
    const tsChar04 = mapa.addTilesetImage(
      "Premade_Character_04",
      this._keyTileset("Premade_Character_04", "super_char04"),
    );
    const tsChar03 = mapa.addTilesetImage(
      "Premade_Character_03",
      this._keyTileset("Premade_Character_03", "super_char03"),
    );
    const tsChar02 = mapa.addTilesetImage(
      "Premade_Character_02",
      this._keyTileset("Premade_Character_02", "super_char02"),
    );
    const tsChar01 = mapa.addTilesetImage(
      "Premade_Character_01",
      this._keyTileset("Premade_Character_01", "super_char01"),
    );

    // Agrupa apenas os tilesets que foram carregados corretamente
    const tilesets = [
      tsInteriors,
      tsRoomBuilder,
      tsExteriors,
      tsChar06,
      tsChar05,
      tsChar04,
      tsChar03,
      tsChar02,
      tsChar01,
    ].filter(Boolean);

    // Adiciona um fundo neutro para evitar bordas pretas fora do mapa
    this.add
      .rectangle(
        limitesCena.x - 100,
        limitesCena.y - 100,
        limitesCena.width + 200,
        limitesCena.height + 200,
        0x888888,
      )
      .setOrigin(0, 0);

    // Cria as camadas visuais e de colisão do mapa
    this._criarCamada(mapa, "N - Chao", tilesets);
    this._criarCamada(mapa, "N - Tapetes", tilesets);
    this._criarCamada(mapa, "N- ObjetSemColid_baixo", tilesets);
    this._criarCamada(mapa, "N - Cabine", tilesets);
    this._criarCamada(mapa, "N - ParedeSemColid", tilesets);
    this._criarCamada(mapa, "N - ObjetSemColid_cima", tilesets);
    this._criarCamada(mapa, "PLAYER", tilesets);

    const objCbaixo = this._criarCamada(mapa, "C - ObjetComColid_baixo", tilesets);
    const parC = this._criarCamada(mapa, "C - ParedeComColid", tilesets);
    const estante = this._criarCamada(mapa, "C - Estante", tilesets);
    const linhasparede = this._criarCamada(mapa, "C - LinhasDeParede", tilesets);
    const mesinha = this._criarCamada(mapa, "C- Mesinha", tilesets);
    const objC = this._criarCamada(mapa, "C - ObjetComColid", tilesets);
    const cabine = this._criarCamada(mapa, "C- Cabine", tilesets);

    // Ativa colisão em todas as camadas sólidas
    [objCbaixo, parC, estante, linhasparede, mesinha, objC, cabine]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));

    // Cria as animações de movimento do personagem, uma para cada direção
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

    // Define o ponto inicial do personagem na cena
    const spawnX = this.spawnXCustom ?? 500;
    const spawnY = this.spawnYCustom ?? 500;

    // Cria o personagem com física e limita seu movimento ao mapa
    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);

    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite = this.personagem.height;

    // Ajusta escala e hitbox para encaixar melhor no cenário
    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    // Cria colisões entre o personagem e os elementos sólidos do mapa
    [objCbaixo, parC, estante, linhasparede, mesinha, objC, cabine]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));

    // Habilita movimentação pelas setas e também por WASD
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Configura a câmera para acompanhar o personagem
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(
      limitesCena.x,
      limitesCena.y,
      limitesCena.width,
      limitesCena.height,
    );
    this.physics.world.setBounds(
      limitesCena.x,
      limitesCena.y,
      limitesCena.width,
      limitesCena.height,
    );
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Cria a zona de saída e o aviso visual exibido ao se aproximar dela
    this.zonasSaida = this._criarZonasSaida(spawnX, spawnY);

    this.labelSair = this.add
      .text(0, 0, "[Saída]", {
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

    // Guarda a última direção para manter o sprite parado corretamente
    this.direcaoAtual = "frente";

    // Texto de debug para mostrar coordenadas do personagem
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

  // Cria uma camada do tilemap com tratamento de erro
  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) {
        console.warn("[SceneAgencia02] Camada não encontrada:", nome);
      }
      return camada;
    } catch (erro) {
      console.error(
        "[SceneAgencia02] Erro ao criar camada",
        nome,
        ":",
        erro.message,
      );
      return null;
    }
  }

  // Retorna a key otimizada do tileset, se ela existir
  _keyTileset(tmjName, fallbackKey) {
    return (this._tilesetKeys && this._tilesetKeys[tmjName]) || fallbackKey;
  }

  // Percorre o mapa para descobrir quais tiles realmente são usados
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

  // Calcula os limites reais do mapa infinito
  _calcularLimitesMapa(mapa) {
    const tileW = mapa.tileWidth || 16;
    const tileH = mapa.tileHeight || 16;
    let minX = 0;
    let minY = 0;
    let maxX = mapa.width || 0;
    let maxY = mapa.height || 0;
    let encontrouChunk = false;

    (mapa.layers || []).forEach((layer) => {
      if (
        typeof layer?.startx === "number" &&
        typeof layer?.starty === "number" &&
        typeof layer?.width === "number" &&
        typeof layer?.height === "number"
      ) {
        if (!encontrouChunk) {
          minX = layer.startx;
          minY = layer.starty;
          maxX = layer.startx + layer.width;
          maxY = layer.starty + layer.height;
          encontrouChunk = true;
        } else {
          minX = Math.min(minX, layer.startx);
          minY = Math.min(minY, layer.starty);
          maxX = Math.max(maxX, layer.startx + layer.width);
          maxY = Math.max(maxY, layer.starty + layer.height);
        }
      }

      const chunks = Array.isArray(layer?.chunks) ? layer.chunks : layer?.data || [];
      chunks.forEach((chunk) => {
        if (
          typeof chunk?.x !== "number" ||
          typeof chunk?.y !== "number" ||
          typeof chunk?.width !== "number" ||
          typeof chunk?.height !== "number"
        ) {
          return;
        }

        if (!encontrouChunk) {
          minX = chunk.x;
          minY = chunk.y;
          maxX = chunk.x + chunk.width;
          maxY = chunk.y + chunk.height;
          encontrouChunk = true;
          return;
        }

        minX = Math.min(minX, chunk.x);
        minY = Math.min(minY, chunk.y);
        maxX = Math.max(maxX, chunk.x + chunk.width);
        maxY = Math.max(maxY, chunk.y + chunk.height);
      });
    });

    return {
      x: minX * tileW,
      y: minY * tileH,
      width: (Math.max(maxX, mapa.width || 0) - minX) * tileW,
      height: (Math.max(maxY, mapa.height || 0) - minY) * tileH,
    };
  }

  // Cria versões menores dos tilesets usando apenas os tiles necessários
  _otimizarTilesetsPorUso(mapa) {
    const defs = [
      { tmjName: "Interiors_16x16", baseKey: "super_interiors" },
      { tmjName: "Room_Builder_16x16", baseKey: "super_roombuilder" },
      {
        tmjName: "Modern_Exteriors_Complete_Tileset",
        baseKey: "super_exteriors",
      },
      { tmjName: "Premade_Character_06", baseKey: "super_char06" },
      { tmjName: "Premade_Character_05", baseKey: "super_char05" },
      { tmjName: "Premade_Character_04", baseKey: "super_char04" },
      { tmjName: "Premade_Character_03", baseKey: "super_char03" },
      { tmjName: "Premade_Character_02", baseKey: "super_char02" },
      { tmjName: "Premade_Character_01", baseKey: "super_char01" },
    ];

    // Inicia o mapeamento dos tilesets com as texturas originais
    this._tilesetKeys = {};
    const usados = this._coletarGidsUsados(mapa);
    const tilesetsOrdenados = [...(mapa.tilesets || [])].sort(
      (a, b) => (a.firstgid || 0) - (b.firstgid || 0),
    );

    // Recorta cada tileset até o último tile realmente usado no mapa
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

      // Se o tileset inteiro já está sendo usado, não precisa recortar
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

  // Define a posição da única saída válida da cena
  _criarZonasSaida(spawnX, spawnY) {
    return [new Phaser.Geom.Rectangle(spawnX - 60, spawnY - 60, 120, 120)];
  }

  // Atualiza movimentação, animação, saída e debug a cada frame
  update() {
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    // Movimento horizontal
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

    // Movimento vertical
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

    // Se estiver parado, mantém o sprite na última direção usada
    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`esp_${this.direcaoAtual}_1`);
    }

    // Verifica se o personagem entrou na área de saída
    const dentroSaida = (this.zonasSaida || []).some((z) =>
      Phaser.Geom.Rectangle.Contains(z, personagem.x, personagem.y)
    );

    // Mostra ou esconde a label conforme a proximidade da saída
    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    if (dentroSaida) {
      this.labelSair.setPosition(personagem.x, personagem.y - 10);
    }

    // Ao entrar na zona, inicia automaticamente a transição para a cidade
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
          spawnX: 1200,
          spawnY: 1200,
        });
      });
    }

    // Exibe as coordenadas atuais do personagem para debug
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
