export default class SceneSupermercado extends Phaser.Scene {
  constructor() {
    super({ key: "SceneSupermercado" });
  }

  // Registra os dados do spritePersonagem para uso na cena
  init(dados = {}) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
  }

  // Carrega os recursos necessários para a cena
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    // Carrega áudios da cena
    this.load.audio(
      "trilhaSceneMercado",
      "src/assets/audios/trilhaSceneMercado.mp3",
    );

    // Loga erros de carregamento para facilitar debug
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneSupermercado] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });
    //____________________________________________________________________________________________

    //_________________________________Carrega os recursos do mapa_________________________________
    this.load.tilemapTiledJSON(
      "supermercado",
      "src/assets/imagens/mapsjson/tileMaps/Supermercado.tmj",
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
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_06.png",
    );
    this.load.image(
      "super_char05",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_05.png",
    );
    this.load.image(
      "super_char04",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_04.png",
    );
    this.load.image(
      "super_char03",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_03.png",
    );
    this.load.image(
      "super_char02",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_02.png",
    );
    this.load.image(
      "super_char01",
      "src/assets/imagens/mapsjson/tileSets/Premade_Character_01.png",
    );

    // Sprite do NPC do supermercado
    this.load.image(
      "npc_supermercado",
      "src/assets/imagens/imagensPersonagens/NPC/npcLoja_Roupas.png",
    );

    // Imagem de fala do supermercado
    this.load.image(
      "falaSupermercado",
      "src/assets/imagens/imagensFalas/Mercado.png",
    );
    //___________________________________________________________________________________________________

    //_________________________________Carrega os recursos do personagem_________________________________
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
  //___________________________________________________________________________________________________

  //__________________________Cria a cena, o mapa, o áudio e o spritePersonagem e as interações________________________

  create() {
    const mapa = this.make.tilemap({ key: "supermercado" });
    this.mapa = mapa;

    // Adiciona áudios a cena
    this.musica = this.sound.add("trilhaSceneMercado", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    // Otimiza os tilesets antes de montar o cenário
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
    //____________________________________________________________________________________________

    //_________________________________Cria as camadas do mapa_________________________________

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

    this.add // Fundo cinza para evitar bordas pretas fora do mapa
      .rectangle(
        0,
        0,
        mapa.widthInPixels + 200,
        mapa.heightInPixels + 200,
        0x888888,
      )
      .setOrigin(0, 0);

    // Camadas visuais sem colisão
    this._criarCamada(mapa, "Chão", tilesets);
    this._criarCamada(mapa, "ParedeSemColisão", tilesets);
    this._criarCamada(mapa, "ObjSemColisão", tilesets);
    this._criarCamada(mapa, "ObjSemColisão2", tilesets);
    this._criarCamada(mapa, "CoisasNaParede", tilesets);
    this._criarCamada(mapa, "Vidro", tilesets);
    this._criarCamada(mapa, "Player", tilesets);

    // Camadas sólidas que bloqueiam o spritePersonagem
    const paredeC = this._criarCamada(mapa, "ParedeComColisão", tilesets);
    const objC = this._criarCamada(mapa, "ObjComColisão", tilesets);
    const objC2 = this._criarCamada(mapa, "ObjComColisão2", tilesets);
    const bordaC = this._criarCamada(mapa, "Bordas", tilesets);

    [paredeC, objC, objC2, bordaC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));
    //____________________________________________________________________________________________

    //_________________________________Cria as animações do personagem_________________________________
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

    // Posição inicial do spritePersonagem na cena
    const spawnX = 124;
    const spawnY = 183;
    //________________________________________________________________________________________________

    //_________________________________Cria o spritePersonagem e as colisões_________________________________
    this.spritePersonagem = this.physics.add.sprite(
      spawnX,
      spawnY,
      "esp_frente_1",
    );
    this.spritePersonagem.setCollideWorldBounds(true);

    // Colisões extras para corrigir limitações do Tiled em alguns pontos do mapa
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
      this.physics.add.collider(this.spritePersonagem, zona);
      this.colisoesExtras.push(zona);
    });

    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.spritePersonagem.width;
    const alturaSprite = this.spritePersonagem.height;

    // Ajusta escala e hitbox do spritePersonagem para melhor encaixe no mapa
    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.spritePersonagem.setScale(Math.max(escala, 0.04));
    this.spritePersonagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    // Colisões com as camadas sólidas do mapa
    [paredeC, objC, objC2, bordaC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.spritePersonagem, c));

    // NPC do supermercado
    this.npcSupermercado = this.physics.add
      .staticImage(53, 157, "npc_supermercado")
      .setDepth(5);
    // Deixa o tamanho do NPC igual ao do spritePersonagem
    const alturaAlvoNpc = this.spritePersonagem.displayHeight;
    this.npcSupermercado.setDisplaySize(
      (this.npcSupermercado.width / this.npcSupermercado.height) *
        alturaAlvoNpc,
      alturaAlvoNpc,
    );
    this.npcSupermercado.refreshBody();
    this.physics.add.collider(this.spritePersonagem, this.npcSupermercado);

    // Botão [E] igual às outras cenas
    this.labelNpc = this.add
      .text(this.npcSupermercado.x, this.npcSupermercado.y, "[E] Falar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.exclamacaoNpc = this.add
      .text(
        this.npcSupermercado.x,
        this.npcSupermercado.y - this.npcSupermercado.displayHeight * 0.5,
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

    // Controles de movimento (setas)
    this.teclas = this.input.keyboard.createCursorKeys();
    //____________________________________________________________________________________________________________

    //_________________________________Configura a câmera para seguir o personagem_________________________________
    this.cameras.main.startFollow(this.spritePersonagem);
    this.cameras.main.setZoom(5);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.centerOn(mapa.widthInPixels / 2, mapa.heightInPixels / 2);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Define a zona de saída da cena
    this.zonasSaida = this._criarZonasSaida();

    // Botão [E] padronizado para saída
    this.labelSair = this.add
      .text(129, 200, "[E] Sair", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.transicionando = false;
    this.dentroZonaSaida = false;
    this.perto_npc = false;
    this.falouComNpc = false;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    this.direcaoAtual = "frente"; // Guarda a direção inicial do spritePersonagem

    // Pausa a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
    });
  }
  //____________________________________________________________________________________________________________

  //__________________________Funções auxiliares para otimização e criação de camadas e zonas__________________________
  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) {
        console.warn("[SceneSupermercado] Camada não encontrada:", nome);
      }
      return camada;
    } catch (erro) {
      console.error(
        "[SceneSupermercado] Erro ao criar camada",
        nome,
        ":",
        erro.message,
      );
      return null;
    }
  }

  // Retorna a chave otimizada do tileset ou a chave original se não houver recorte
  _keyTileset(tmjName, fallbackKey) {
    return (this._tilesetKeys && this._tilesetKeys[tmjName]) || fallbackKey;
  }

  // Coleta os GIDs realmente usados no mapa
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

  // Recorta os tilesets para manter apenas as partes realmente usadas
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

    // Cria um mapa de chaves apontando inicialmente para as texturas originais
    this._tilesetKeys = {};
    const usados = this._coletarGidsUsados(mapa);
    const tilesetsOrdenados = [...(mapa.tilesets || [])].sort(
      (a, b) => (a.firstgid || 0) - (b.firstgid || 0),
    );

    // Cria versões menores dos tilesets com base no último tile usado
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

  // Define as zonas de saída do mapa
  _criarZonasSaida() {
    // Única saída permitida: porta em x=129, y=200
    return [{ x: 129, y: 200, raio: 14 }];
  }

  //____________________________________________________________________________________________________________

  //__________________________Lógica de movimentação do personagem______________________________________________
  update() {
    const velocidade = 150;
    const { teclas, spritePersonagem } = this;

    if (Phaser.Input.Keyboard.JustDown(this.teclaF)) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }

    spritePersonagem.setVelocity(0);
    let movendo = false;

    // Movimento horizontal
    if (teclas.left.isDown) {
      spritePersonagem.setVelocityX(-velocidade);
      spritePersonagem.anims.play("esp_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown) {
      spritePersonagem.setVelocityX(velocidade);
      spritePersonagem.anims.play("esp_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    // Movimento vertical
    if (teclas.up.isDown) {
      spritePersonagem.setVelocityY(-velocidade);
      if (!movendo) spritePersonagem.anims.play("esp_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown) {
      spritePersonagem.setVelocityY(velocidade);
      if (!movendo) spritePersonagem.anims.play("esp_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    // Mantém o sprite parado na última direção usada
    if (!movendo) {
      spritePersonagem.anims.stop();
      spritePersonagem.setTexture(`esp_${this.direcaoAtual}_1`);
    }

    // Botão [E] igual às outras cenas: aparece ao se aproximar do NPC
    const distNpc = Phaser.Math.Distance.Between(
      spritePersonagem.x,
      spritePersonagem.y,
      this.npcSupermercado.x,
      this.npcSupermercado.y,
    );
    const mostrarBotaoE = distNpc < 60; // raio maior para mostrar
    const pertoNpc = distNpc < 30; // raio menor para interação

    if (mostrarBotaoE !== this.perto_npc) {
      this.perto_npc = mostrarBotaoE;
      this.labelNpc.setVisible(mostrarBotaoE && !this.dentroZonaSaida);
    }
    if (mostrarBotaoE) {
      this.labelNpc.setPosition(
        this.npcSupermercado.x,
        this.npcSupermercado.y + 2,
      );
    }

    if (pertoNpc && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.falouComNpc = true;
      this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
      console.log("[SceneSupermercado] Interagiu com o NPC do supermercado");
      // Pausa a cena atual e lança o diálogo
      this.scene.pause();
      this.scene.launch("SceneDialogoSupermercado", {
        cenaOrigem: "SceneSupermercado",
      });
    }

    if (!this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setPosition(
        this.npcSupermercado.x,
        this.npcSupermercado.y - this.npcSupermercado.displayHeight * 0.5,
      );
    }

    // Detecção por aproximação da porta
    const dentroSaida = (this.zonasSaida || []).some((z) => {
      const d = Phaser.Math.Distance.Between(
        spritePersonagem.x,
        spritePersonagem.y,
        z.x,
        z.y,
      );
      return d <= z.raio;
    });

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida && this.falouComNpc);
    }
    // Sempre posiciona o botão na porta, mesmo se já visível
    this.labelSair.setPosition(129, 200 - 10);

    // Sai automaticamente ao se aproximar da porta
    if (!this.transicionando && this.falouComNpc && dentroSaida) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        const missaoPosSupermercado =
          "Missão: Ache a Agência 03. Use o mapa interativo da maquininha à esquerda. Boa sorte!";
        this.registry.set("missaoCidadeTexto", missaoPosSupermercado);

        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2926,
          spawnY: 349,
          missaoCidadeTexto: missaoPosSupermercado,
          destacarMissaoCidade: true,
        });
      });
    }

    //_______________________________________________________________________________________________
  }
}
