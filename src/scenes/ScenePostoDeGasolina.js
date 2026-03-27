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
      "trilhaPostoDeGasolina", 'src/assets/audios/trilhaPostoDeGasolina.mp3'
    );

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
    this.musica = this.sound.add('trilhaPostoDeGasolina', { loop: true, volume: 0.5});
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

    // Usa um spawn fixo calculado dentro da área útil do posto
    const spawnX = this.origemChaoX + this.larguraChao * 0.5;
    const spawnY = this.origemChaoY + this.alturaChao * 0.7;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);

    // Ajusta escala e hitbox para encaixar melhor no cenário
    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite = this.personagem.height;
    const escala = Math.min(
      (tamTile * 0.4) / larguraSprite,
      (tamTile * 0.4) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    if (parede) this.physics.add.collider(this.personagem, parede);
    if (objetos) this.physics.add.collider(this.personagem, objetos);

    // Controles de movimento e interação
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Configura a câmera para seguir o personagem
    this.cameras.main.startFollow(this.personagem);
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

    // Define a zona de saída próxima à porta
    this.zonasSaida = [
      { x: this.origemChaoX + 48, y: this.origemChaoY + 160, raio: 24 },
    ];
    this.dentroZonaSaida = false;
    this.transicionando = false;

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

    // Texto de debug com as coordenadas atuais
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

    // Transição para a cidade ao se aproximar da saída e apertar E
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
          spawnX: 2751,
          spawnY: 1332,
        });
      });
    }

    // Atualiza o texto de debug com as coordenadas atuais
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);
  }
}
