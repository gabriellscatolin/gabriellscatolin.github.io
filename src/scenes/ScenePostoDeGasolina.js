export default class ScenePostoDeGasolina extends Phaser.Scene {
  constructor() {
    super({ key: "ScenePostoDeGasolina" });
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

    // Loga erros de carregamento para facilitar debug
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[ScenePostoDeGasolina] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Carrega o mapa, tilesets e áudios do posto de gasolina
    this.load.tilemapTiledJSON(
      "posto",
      "src/assets/imagens/mapsjson/tileMaps/postoDeGasolina.tmj",
    );
    this.load.image(
      "posto_roombuilder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "posto_int_s1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png",
    );
    this.load.image(
      "posto_int_s2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png",
    );
    this.load.image(
      "posto_int_s3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png",
    );
    this.load.image(
      "posto_int_s4",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png",
    );
    this.load.image(
      "posto_int_s5",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png",
    );
    this.load.image(
      "posto_mod_s1",
      "src/assets/imagens/mapsjson/tileSets/Modern_S1_4096.png",
    );
    this.load.image(
      "posto_mod_s2",
      "src/assets/imagens/mapsjson/tileSets/Modern_S2_4096.png",
    );
    this.load.image(
      "posto_mod_s3",
      "src/assets/imagens/mapsjson/tileSets/Modern_S3_32.png",
    );

    this.load.audio(
      "trilhaPostoDeGasolina",
      "src/assets/audios/trilhaPostoDeGasolina.mp3",
    );

    if (!this.textures.exists("npc_posto")) {
      this.load.image(
        "npc_posto",
        "src/assets/imagens/imagensPersonagens/NPC/npcPosto.png",
      );
    }

    // Carrega os frames do personagem em todas as direções
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

  // Monta o mapa, o personagem, as colisões e a saída da cena
  create() {
    // Adiciona áudios a cena
    this.musica = this.sound.add("trilhaPostoDeGasolina", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    // Prepara os tilesets antes de criar o mapa
    this.prepararTilesetsPosto();

    const mapa = this.make.tilemap({ key: "posto" });
    this.mapa = mapa;

    const roomBuilder = mapa.addTilesetImage(
      "Room_Builder_16x16",
      "posto_roombuilder",
      16,
      16,
      0,
      0,
    );
    const intS1 = mapa.addTilesetImage(
      "Interiors_16x16_S1",
      "posto_int_s1",
      16,
      16,
      0,
      0,
    );
    const intS2 = mapa.addTilesetImage(
      "Interiors_16x16_S2",
      "posto_int_s2",
      16,
      16,
      0,
      0,
    );
    const intS3 = mapa.addTilesetImage(
      "Interiors_16x16_S3",
      "posto_int_s3",
      16,
      16,
      0,
      0,
    );
    const intS4 = mapa.addTilesetImage(
      "Interiors_16x16_S4",
      "posto_int_s4",
      16,
      16,
      0,
      0,
    );
    const intS5 = mapa.addTilesetImage(
      "Interiors_16x16_S5",
      "posto_int_s5",
      16,
      16,
      0,
      0,
    );
    const modS1 = mapa.addTilesetImage(
      "Modern_Exteriors_S1",
      "posto_mod_s1",
      16,
      16,
      0,
      0,
    );
    const modS2 = mapa.addTilesetImage(
      "Modern_Exteriors_S2",
      "posto_mod_s2",
      16,
      16,
      0,
      0,
    );
    const modS3 = mapa.addTilesetImage(
      "Modern_Exteriors_S3",
      "posto_mod_s3",
      16,
      16,
      0,
      0,
    );
    const tiles = [
      roomBuilder,
      intS1,
      intS2,
      intS3,
      intS4,
      intS5,
      modS1,
      modS2,
      modS3,
    ].filter(Boolean);

    // Calcula a área útil do mapa e do chão
    const areaMapa = this._calcularAreaCamada(mapa);
    const areaChao = this._calcularAreaCamada(mapa, "N- Ch\u00e3o");
    this.origemMapaX = areaMapa.x;
    this.origemMapaY = areaMapa.y;
    this.larguraMapa = areaMapa.largura;
    this.alturaMapa = areaMapa.altura;

    // Mantém a área do chão para referência de spawn e saída.
    this.origemChaoX = areaChao.x;
    this.origemChaoY = areaChao.y;
    this.larguraChao = areaChao.largura;
    this.alturaChao = areaChao.altura;

    // Fundo neutro para evitar áreas vazias fora do mapa
    this.add
      .rectangle(
        areaMapa.x - 100,
        areaMapa.y - 100,
        areaMapa.largura + 200,
        areaMapa.altura + 200,
        0x888888,
      )
      .setOrigin(0, 0);

    // Camadas visuais sem colisão
    this.criarCamada(mapa, "N- Ch\u00e3o", tiles);
    this.criarCamada(mapa, "N - ParedeSemColid", tiles);
    this.criarCamada(mapa, "N - ObjetosSemColid_embaixo", tiles);
    this.criarCamada(mapa, "PLAYER", tiles);

    // Camadas sólidas que bloqueiam o personagem
    const parede = this.criarCamada(mapa, "C- ParedeComColid", tiles);
    const objetos = this.criarCamada(mapa, "C - Objetos com Colid", tiles);

    if (parede) parede.setCollisionByExclusion([-1]);
    if (objetos) objetos.setCollisionByExclusion([-1]);

    // Camadas acima do personagem para dar profundidade visual
    const objetosCima = this.criarCamada(
      mapa,
      "N - ObjetosSemColid_emcima",
      tiles,
    );
    const produtos = this.criarCamada(mapa, "N - ProdutosSemColid", tiles);
    if (objetosCima) objetosCima.setDepth(10);
    if (produtos) produtos.setDepth(10);

    // Cria as animações de movimento do personagem
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

    // Spawn fixo solicitado
    const spawnX = 301;
    const spawnY = 396;

    this.spritePersonagem = this.physics.add.sprite(
      spawnX,
      spawnY,
      "esp_frente_1",
    );
    this.spritePersonagem.setCollideWorldBounds(true);

    // Ajusta escala e hitbox para encaixar melhor no cenário
    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.spritePersonagem.width;
    const alturaSprite = this.spritePersonagem.height;
    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.spritePersonagem.setScale(Math.max(escala, 0.04));
    this.spritePersonagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    if (parede) this.physics.add.collider(this.spritePersonagem, parede);
    if (objetos) this.physics.add.collider(this.spritePersonagem, objetos);

    // Controles de movimento e interação
    this.teclas = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Configura a câmera para seguir o personagem
    this.cameras.main.startFollow(this.spritePersonagem);
    this.cameras.main.setZoom(6.5);
    this.cameras.main.setBounds(
      this.origemMapaX,
      this.origemMapaY,
      this.larguraMapa,
      this.alturaMapa,
    );
    this.physics.world.setBounds(
      this.origemMapaX,
      this.origemMapaY,
      this.larguraMapa,
      this.alturaMapa,
    );
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = "frente";

    // Define zonas de saída: antiga + nova solicitada
    this.zonasSaida = [
      { x: this.origemChaoX + 48, y: this.origemChaoY + 160, raio: 24 },
      { x: 301, y: 422, raio: 24 },
    ];
    this.dentroZonaSaida = false;
    this.transicionando = false;

    this.podeSairPosto = false;

    this.labelSair = this.add
      .text(this.origemChaoX + 48, this.origemChaoY + 160, "[E] Sair", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    // NPC
    const npcX = this.origemChaoX + this.larguraChao * 0.55;
    const npcY = this.origemChaoY + this.alturaChao * 0.45;
    this.npcPosto = this.physics.add
      .staticImage(npcX, npcY, "npc_posto")
      .setDepth(5);
    this.npcPosto.setDisplaySize(
      (this.npcPosto.width / this.npcPosto.height) *
        (this.spritePersonagem.displayHeight * 1.1),
      this.spritePersonagem.displayHeight * 1.1,
    );
    this.npcPosto.refreshBody();
    this.physics.add.collider(this.spritePersonagem, this.npcPosto);

    this.labelNpcPosto = this.add
      .text(npcX, npcY, "[E] Falar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.exclamacaoPosto = this.add
      .text(npcX, npcY - this.npcPosto.displayHeight * 0.5, "!", {
        fontSize: "24px",
        color: "#ffeb3b",
        stroke: "#000000",
        strokeThickness: 2,
        resolution: 4,
      })
      .setDepth(21)
      .setOrigin(0.5, 1);

    this.tweens.add({
      targets: this.exclamacaoPosto,
      alpha: { from: 1, to: 0.25 },
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

    this.perto_npc = false;
    this.falouComNpc = this.registry.get("posto_dialogo_concluido") === true;

    if (this.falouComNpc && this.exclamacaoPosto) {
      this.exclamacaoPosto.setVisible(false);
    }

    // Pausa a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
    });
  }

  // Cria uma camada do tilemap com tratamento de erro
  criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) {
        console.warn("[ScenePostoDeGasolina] Camada nao encontrada:", nome);
      }
      return camada;
    } catch (erro) {
      console.error(
        "[ScenePostoDeGasolina] Erro ao criar camada:",
        nome,
        erro.message,
      );
      return null;
    }
  }

  // Calcula a área ocupada pelos tiles válidos de uma camada
  calcularAreaCamada(layer, tileW, tileH) {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    this.percorrerTilesDaCamada(layer, ({ gid, tileX, tileY }) => {
      if (gid <= 0) return;

      minX = Math.min(minX, tileX);
      minY = Math.min(minY, tileY);
      maxX = Math.max(maxX, tileX);
      maxY = Math.max(maxY, tileY);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;

    return {
      x: minX * tileW,
      y: minY * tileH,
      largura: (maxX - minX + 1) * tileW,
      altura: (maxY - minY + 1) * tileH,
    };
  }

  // Calcula a área total de uma camada específica ou do mapa inteiro
  _calcularAreaCamada(mapa, nomeCamada = null) {
    const tileW = mapa.tileWidth || 16;
    const tileH = mapa.tileHeight || 16;
    let areaEncontrada = null;

    (mapa.layers || []).forEach((layer) => {
      if (nomeCamada && layer.name !== nomeCamada) return;
      const areaLayer = this.calcularAreaCamada(layer, tileW, tileH);
      if (!areaLayer) return;

      if (!areaEncontrada) {
        areaEncontrada = { ...areaLayer };
        return;
      }

      const rightAtual = areaEncontrada.x + areaEncontrada.largura;
      const bottomAtual = areaEncontrada.y + areaEncontrada.altura;
      const rightNovo = areaLayer.x + areaLayer.largura;
      const bottomNovo = areaLayer.y + areaLayer.altura;

      areaEncontrada.x = Math.min(areaEncontrada.x, areaLayer.x);
      areaEncontrada.y = Math.min(areaEncontrada.y, areaLayer.y);
      areaEncontrada.largura =
        Math.max(rightAtual, rightNovo) - areaEncontrada.x;
      areaEncontrada.altura =
        Math.max(bottomAtual, bottomNovo) - areaEncontrada.y;
    });

    if (!areaEncontrada) {
      return {
        x: 0,
        y: 0,
        largura: mapa.widthInPixels || 320,
        altura: mapa.heightInPixels || 320,
      };
    }

    return areaEncontrada;
  }

  // Divide tilesets grandes em partes menores para o mapa conseguir usar tudo
  prepararTilesetsPosto() {
    const cacheMapa = this.cache.tilemap.get("posto");
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    // Evita aplicar a separação mais de uma vez
    if (dadosMapa.tilesets.some((ts) => ts.name === "Interiors_16x16_S1"))
      return;

    const novosTilesets = [];

    dadosMapa.tilesets.forEach((ts) => {
      if (ts.name === "Interiors_16x16") {
        const base = ts.firstgid;
        const comuns = {
          tilewidth: 16,
          tileheight: 16,
          spacing: 0,
          margin: 0,
          columns: 16,
        };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: "Interiors_16x16_S1",
          tilecount: 4096,
          image: "../tileSets/Interiors_S1_4096.png",
          imagewidth: 256,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 4096,
          name: "Interiors_16x16_S2",
          tilecount: 4096,
          image: "../tileSets/Interiors_S2_4096.png",
          imagewidth: 256,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 8192,
          name: "Interiors_16x16_S3",
          tilecount: 4096,
          image: "../tileSets/Interiors_S3_4096.png",
          imagewidth: 256,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 12288,
          name: "Interiors_16x16_S4",
          tilecount: 4096,
          image: "../tileSets/Interiors_S4_4096.png",
          imagewidth: 256,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 16384,
          name: "Interiors_16x16_S5",
          tilecount: 640,
          image: "../tileSets/Interiors_S5_640.png",
          imagewidth: 256,
          imageheight: 640,
        });
        return;
      }

      if (ts.name === "Modern_Exteriors_Complete_Tileset") {
        const base = ts.firstgid;
        const comuns = {
          tilewidth: 16,
          tileheight: 16,
          spacing: 0,
          margin: 0,
          columns: 176,
        };

        novosTilesets.push({
          ...comuns,
          firstgid: base,
          name: "Modern_Exteriors_S1",
          tilecount: 45056,
          image: "../tileSets/Modern_S1_4096.png",
          imagewidth: 2816,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 45056,
          name: "Modern_Exteriors_S2",
          tilecount: 45056,
          image: "../tileSets/Modern_S2_4096.png",
          imagewidth: 2816,
          imageheight: 4096,
        });
        novosTilesets.push({
          ...comuns,
          firstgid: base + 90112,
          name: "Modern_Exteriors_S3",
          tilecount: 352,
          image: "../tileSets/Modern_S3_32.png",
          imagewidth: 2816,
          imageheight: 32,
        });
        return;
      }

      novosTilesets.push(ts);
    });

    dadosMapa.tilesets = novosTilesets;
  }

  // Percorre os tiles da camada independentemente do formato dos dados
  percorrerTilesDaCamada(layer, callback) {
    const visitarGrade = (grade, offsetX = 0, offsetY = 0) => {
      for (let y = 0; y < grade.length; y++) {
        const row = grade[y] || [];
        for (let x = 0; x < row.length; x++) {
          const cell = row[x];
          const gid = typeof cell === "number" ? cell : cell?.index || 0;
          const tileX =
            typeof cell === "number" ? x + offsetX : (cell?.x ?? x + offsetX);
          const tileY =
            typeof cell === "number" ? y + offsetY : (cell?.y ?? y + offsetY);

          callback({ gid, tileX, tileY, cell });
        }
      }
    };

    if (Array.isArray(layer.data) && layer.data.length > 0) {
      visitarGrade(layer.data);
      return;
    }

    if (Array.isArray(layer.chunks) && layer.chunks.length > 0) {
      layer.chunks.forEach((chunk) => {
        const data = chunk.data || [];

        if (Array.isArray(data[0])) {
          visitarGrade(data, chunk.x || 0, chunk.y || 0);
          return;
        }

        const largura = chunk.width || 0;
        const altura = chunk.height || 0;
        for (let y = 0; y < altura; y++) {
          for (let x = 0; x < largura; x++) {
            const gid = data[y * largura + x] || 0;
            callback({
              gid,
              tileX: (chunk.x || 0) + x,
              tileY: (chunk.y || 0) + y,
              cell: gid,
            });
          }
        }
      });
    }
  }

  // Atualiza movimento, saída da cena e texto de debug
  update() {
    const velocidade = 150;
    const { teclas, spritePersonagem: personagem } = this;

    personagem.setVelocity(0);

    let movendo = false;

    // Movimento horizontal
    if (teclas.left.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("esp_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("esp_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    // Movimento vertical
    if (teclas.up.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("esp_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown) {
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

    // Interação com NPC do posto (padrão supermercado/padaria)
    if (this.npcPosto) {
      const distNpc = Phaser.Math.Distance.Between(
        personagem.x,
        personagem.y,
        this.npcPosto.x,
        this.npcPosto.y,
      );
      const mostrarBotaoE = distNpc < 80;
      const pertoNpc = distNpc < 45;

      if (mostrarBotaoE !== this.perto_npc) {
        this.perto_npc = mostrarBotaoE;
        this.labelNpcPosto.setVisible(mostrarBotaoE && !this.dentroZonaSaida);
      }
      if (mostrarBotaoE) {
        this.labelNpcPosto.setPosition(this.npcPosto.x, this.npcPosto.y + 2);
      }

      if (
        !this.falouComNpc &&
        pertoNpc &&
        Phaser.Input.Keyboard.JustDown(this.teclaE)
      ) {
        this.falouComNpc = true;
        this.registry.set("posto_dialogo_concluido", true);
        this.exclamacaoPosto.setVisible(false);
        this.scene.pause();
        this.scene.launch("SceneDialogoPostoDeGasolina", {
          cenaOrigem: "ScenePostoDeGasolina",
        });
      }
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

    // Evita saída imediata ao entrar na cena: precisa sair da zona uma vez
    if (!this.podeSairPosto && !dentroSaida) {
      this.podeSairPosto = true;
    }

    // Transição automática para a cidade ao entrar na zona de saída
    if (!this.transicionando && this.podeSairPosto && dentroSaida) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2751,
          spawnY: 1332,
        });
      });
    }
  }
}
