export default class SceneRestaurante extends Phaser.Scene {
  constructor() {
    super({ key: "SceneRestaurante" });
  }
  //Registra os dados do personagem para uso na cena
  init(dados = {}) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
  }
  //Carrega os recursos necessários para a cena
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneRestaurante] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });
    //____________________________________________________________________________________________

    //_________________________________Carrega os recursos do mapa_________________________________
    this.load.tilemapTiledJSON(
      "restaurante",
      "src/assets/imagens/mapsjson/tileMaps/restauranteJapones.tmj?v=1",
    );
    this.load.image(
      "rest_room_builder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "rest_int_s1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png",
    );
    this.load.image(
      "rest_int_s2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png",
    );
    this.load.image(
      "rest_int_s3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png",
    );
    this.load.image(
      "rest_int_s4",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png",
    );
    this.load.image(
      "rest_int_s5",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png",
    );
    this.load.image(
      "rest_mod_s1",
      "src/assets/imagens/mapsjson/tileSets/Modern_S1_4096.png",
    );
    this.load.image(
      "rest_mod_s2",
      "src/assets/imagens/mapsjson/tileSets/Modern_S2_4096.png",
    );
    this.load.image(
      "rest_mod_s3",
      "src/assets/imagens/mapsjson/tileSets/Modern_S3_32.png",
    );
  //___________________________________________________________________________________________________

  //_________________________________Carrega os recursos do personagem_________________________________
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `rest_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `rest_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `rest_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `rest_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }
//___________________________________________________________________________________________________

//__________________________Cria a cena, o mapa, o personagem e as interações________________________

  prepararTilesetsRestaurante() {
    const cacheMapa = this.cache.tilemap.get("restaurante");
    const dadosMapa = cacheMapa && cacheMapa.data;
    if (!dadosMapa || !Array.isArray(dadosMapa.tilesets)) return;

    // Evita aplicar o split mais de uma vez.
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

  descerTilesForaDoLimite(camada, deslocamentoTiles = 4) {
    if (!camada) return;

    const mover = [];
    camada.forEachTile((tile) => {
      if (!tile || tile.index < 0) return;
      if (tile.y < 0) {
        mover.push({ x: tile.x, y: tile.y, index: tile.index });
      }
    });

    mover.forEach((t) => {
      const destinoY = t.y + deslocamentoTiles;
      camada.removeTileAt(t.x, t.y);
      // Sempre recoloca no destino; se ja houver tile, sobrescreve para nao "sumir".
      camada.putTileAt(t.index, t.x, destinoY, true);
    });
  }

  create() {
    this.prepararTilesetsRestaurante();

    const mapa = this.make.tilemap({ key: "restaurante" });
    const tsRoom = mapa.addTilesetImage(
      "Room_Builder_16x16",
      "rest_room_builder",
      16,
      16,
      0,
      0,
    );
    const tsInt1 = mapa.addTilesetImage(
      "Interiors_16x16_S1",
      "rest_int_s1",
      16,
      16,
      0,
      0,
    );
    const tsInt2 = mapa.addTilesetImage(
      "Interiors_16x16_S2",
      "rest_int_s2",
      16,
      16,
      0,
      0,
    );
    const tsInt3 = mapa.addTilesetImage(
      "Interiors_16x16_S3",
      "rest_int_s3",
      16,
      16,
      0,
      0,
    );
    const tsInt4 = mapa.addTilesetImage(
      "Interiors_16x16_S4",
      "rest_int_s4",
      16,
      16,
      0,
      0,
    );
    const tsInt5 = mapa.addTilesetImage(
      "Interiors_16x16_S5",
      "rest_int_s5",
      16,
      16,
      0,
      0,
    );
    const tsMod1 = mapa.addTilesetImage(
      "Modern_Exteriors_S1",
      "rest_mod_s1",
      16,
      16,
      0,
      0,
    );
    const tsMod2 = mapa.addTilesetImage(
      "Modern_Exteriors_S2",
      "rest_mod_s2",
      16,
      16,
      0,
      0,
    );
    const tsMod3 = mapa.addTilesetImage(
      "Modern_Exteriors_S3",
      "rest_mod_s3",
      16,
      16,
      0,
      0,
    );

    //_________________________________Cria as camadas do mapa_________________________________
    const tilesets = [
      tsRoom,
      tsInt1,
      tsInt2,
      tsInt3,
      tsInt4,
      tsInt5,
      tsMod1,
      tsMod2,
      tsMod3,
    ].filter(Boolean);

    // Camadas na mesma ordem do Tiled (importante para alinhamento visual)
    const chaoN = mapa.createLayer("N- Chão", tilesets, 0, 0);
    const paredeSemC = mapa.createLayer("N - ParedesSemColid", tilesets, 0, 0);
    const paredeC = mapa.createLayer("C - ParedesComColid", tilesets, 0, 0);
    const plantasN = mapa.createLayer("N -Plantas", tilesets, 0, 0);
    const objC = mapa.createLayer("C- ObjetsColid", tilesets, 0, 0);
    const linhasParedeN = mapa.createLayer("N - LinhasParede", tilesets, 0, 0);
    const cozinhaN = mapa.createLayer("N - OjetosCosinha", tilesets, 0, 0);
    const playerN = mapa.createLayer("PLAYER", tilesets, 0, 0);
    const rodape0C = mapa.createLayer("C - Rodapeda parede_0", tilesets, 0, 0);
    const rodapeC = mapa.createLayer("C - Rodapeda parede", tilesets, 0, 0);

    // Ajuste fino para detalhes visuais que ficam acima dos limites do estabelecimento.
    this.descerTilesForaDoLimite(plantasN, 4);
    this.descerTilesForaDoLimite(cozinhaN, 4);

    const camadasMapa = [
      chaoN,
      paredeSemC,
      plantasN,
      linhasParedeN,
      cozinhaN,
      playerN,
      paredeC,
      objC,
      rodape0C,
      rodapeC,
    ].filter(Boolean);

    // Ajusta camera/mundo para o bounds real das layers (mapa infinito com chunks negativos).
    const boundsIniciais = {
      x: Infinity,
      y: Infinity,
      right: -Infinity,
      bottom: -Infinity,
    };
    const boundsMapa = camadasMapa.reduce((acc, camada) => {
      const b = camada.getBounds();
      acc.x = Math.min(acc.x, b.x);
      acc.y = Math.min(acc.y, b.y);
      acc.right = Math.max(acc.right, b.right);
      acc.bottom = Math.max(acc.bottom, b.bottom);
      return acc;
    }, boundsIniciais);
    const larguraMapa = boundsMapa.right - boundsMapa.x;
    const alturaMapa = boundsMapa.bottom - boundsMapa.y;

    // Bounds do estabelecimento baseado na layer base (chao), que define o limite real do cenario.
    const camadasEstruturais = [chaoN].filter(Boolean);
    const conteudoInicial = {
      x: Infinity,
      y: Infinity,
      right: -Infinity,
      bottom: -Infinity,
    };
    const boundsConteudo = camadasEstruturais.reduce((acc, camada) => {
      camada.forEachTile((tile) => {
        if (!tile || tile.index < 0) return;
        const left = camada.x + tile.pixelX;
        const top = camada.y + tile.pixelY;
        acc.x = Math.min(acc.x, left);
        acc.y = Math.min(acc.y, top);
        acc.right = Math.max(acc.right, left + tile.width);
        acc.bottom = Math.max(acc.bottom, top + tile.height);
      });
      return acc;
    }, conteudoInicial);

    const encontrouConteudo =
      Number.isFinite(boundsConteudo.x) && Number.isFinite(boundsConteudo.y);
    const limiteX = encontrouConteudo ? boundsConteudo.x : boundsMapa.x;
    const limiteY = encontrouConteudo ? boundsConteudo.y : boundsMapa.y;
    const limiteRight = encontrouConteudo
      ? boundsConteudo.right
      : boundsMapa.right;
    const limiteBottom = encontrouConteudo
      ? boundsConteudo.bottom
      : boundsMapa.bottom;
    const margem = 0;
    const boundsEstabelecimento = new Phaser.Geom.Rectangle(
      limiteX - margem,
      limiteY - margem,
      limiteRight - limiteX + margem * 2,
      limiteBottom - limiteY + margem * 2,
    );

    // Mascara visual para esconder tiles fora dos limites do estabelecimento.
    const mascaraGrafica = this.make.graphics({ x: 0, y: 0, add: false });
    mascaraGrafica.fillStyle(0xffffff, 1);
    mascaraGrafica.fillRect(
      boundsEstabelecimento.x,
      boundsEstabelecimento.y,
      boundsEstabelecimento.width,
      boundsEstabelecimento.height,
    );
    const mascaraEstabelecimento = mascaraGrafica.createGeometryMask();
    camadasMapa.forEach((camada) => camada.setMask(mascaraEstabelecimento));

    // Fundo para cobrir qualquer area vazia
    this.add
      .rectangle(
        boundsEstabelecimento.x - 200,
        boundsEstabelecimento.y - 200,
        boundsEstabelecimento.width + 400,
        boundsEstabelecimento.height + 400,
        0x555555,
      )
      .setOrigin(0, 0)
      .setDepth(-10);

    [paredeC, objC, rodape0C, rodapeC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));
//____________________________________________________________________________________________

//_________________________________Cria as animações do personagem_________________________________
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`rest_andar_${dir}`)) {
        this.anims.create({
          key: `rest_andar_${dir}`,
          frames: [
            { key: `rest_${dir}_1` },
            { key: `rest_${dir}_2` },
            { key: `rest_${dir}_3` },
            { key: `rest_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    this.spawnXCustom = dados.spawnX ?? null;
    this.spawnYCustom = dados.spawnY ?? null;

    // Spawn solicitado
    const spawnX = this.spawnXCustom || 377;
    const spawnY = this.spawnYCustom || 425;
  //________________________________________________________________________________________________

  //_________________________________Cria o personagem e as colisões_________________________________
    this.personagem = this.physics.add.sprite(spawnX, spawnY, "rest_frente_1");
    this.personagem.setCollideWorldBounds(true);

    // Sprites sao 1024x1024px. Com zoom=7, escala 0.028
    this.personagem.setScale(0.028);
    this.personagem.body.setSize(
      this.personagem.width * 0.35,
      this.personagem.height * 0.35,
    );

    [paredeC, objC, rodape0C, rodapeC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));

    // Barreira horizontal para limitar acesso na secao Y=452
    this.barreiraY = this.add.rectangle(
      boundsEstabelecimento.x + boundsEstabelecimento.width / 2,
      452,
      boundsEstabelecimento.width,
      2,
      0xff0000,
      0,
    );
    this.physics.add.existing(this.barreiraY, true);
    this.physics.add.collider(this.personagem, this.barreiraY);

    // Controles
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });
  //____________________________________________________________________________________________________________

  //_________________________________Configura a câmera para seguir o personagem_________________________________

    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(6);
    this.cameras.main.setBounds(
      boundsEstabelecimento.x,
      boundsEstabelecimento.y,
      boundsEstabelecimento.width,
      boundsEstabelecimento.height,
    );
    this.physics.world.setBounds(
      boundsEstabelecimento.x,
      boundsEstabelecimento.y,
      boundsEstabelecimento.width,
      boundsEstabelecimento.height,
    );
    this.cameras.main.fadeIn(600, 0, 0, 0);

  //Definição da zona de saída (apenas para a porta em x=129, y=200)
    this.zonaSaida = new Phaser.Geom.Rectangle(
      spawnX - 30,
      spawnY - 18,
      60,
      36,
    );
    this.labelSair = this.add
      .text(spawnX, spawnY - 2, "[E] Sair", {
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
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.direcaoAtual = "frente";

    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "3px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);
  }
  //____________________________________________________________________________________________________________

  //__________________________Lógica de movimentação do personagem______________________________________________
  update() {
    const velocidade = 100;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("rest_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("rest_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("rest_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play("rest_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`rest_${this.direcaoAtual}_1`);
    }

    // Detecção por aproximação da porta
    const dentroSaida = Phaser.Geom.Rectangle.Contains(
      this.zonaSaida,
      personagem.x,
      personagem.y,
    );
    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
    }

    // Sai automaticamente ao se aproximar da porta
    if (
      dentroSaida &&
      !this.transicionando &&
      Phaser.Input.Keyboard.JustDown(this.teclaE)
    ) {
      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 2660,
          spawnY: 310,
        });
      });
    }

    //_______________________________________________________________________________________________

    //Debug para mostrar as coordenadas do personagem (pode ser removido depois)
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 8, personagem.y - 14);
  }
}
