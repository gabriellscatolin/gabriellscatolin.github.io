export default class SceneCidade extends Phaser.Scene {
  constructor() {
    super({ key: "SceneCidade" });
  }

  // Recebe os dados do personagem e uma possível posição personalizada de spawn
  init(dados) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
    this.spawnXCustom = dados.spawnX || null;
    this.spawnYCustom = dados.spawnY || null;
  }

  // Carrega o tilemap, os tilesets e os sprites do personagem
  preload() {
    const nomePasta = this.registry.get("nomePasta") || "Pedro";
    const prefixo = this.registry.get("prefixo") || "HB";

    // Exibe no console qualquer falha no carregamento de assets
    this.load.on("loaderror", (arquivo) => {
      console.error("[SceneCidade] Erro ao carregar:", arquivo.key, arquivo.src);
    });

    this.load.tilemapTiledJSON(
      "mapaGeral",
      "src/assets/imagens/mapsjson/tileMaps/mapaMiniMundoVF.tmj?v=5",
    );
    this.load.image("tilesMapaTopo", "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Top.png?v=1");
    this.load.image("tilesMapaBase", "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Bottom.png?v=1");

    // Carrega os frames do personagem em todas as direções
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(`sprite_frente_${i}`,   `${caminhoBase}/${prefixo}_frente_${i}.png`);
      this.load.image(`sprite_tras_${i}`,     `${caminhoBase}/${prefixo}_tras_${i}.png`);
      this.load.image(`sprite_direita_${i}`,  `${caminhoBase}/${prefixo}_direita_${i}.png`);
      this.load.image(`sprite_esquerda_${i}`, `${caminhoBase}/${prefixo}_esquerda_${i}.png`);
    }
  }

  // Monta o mapa, o personagem, as zonas de interação, o minimapa e a chuva
  create() {
    // Define os limites da área jogável
    const MAPA_X = 720;
    const MAPA_Y = 100;
    const MAPA_LARGURA = 2432;
    const MAPA_ALTURA = 1760;

    // Cria o tilemap e associa os tilesets usados na cidade
    const mapa = this.make.tilemap({ key: "mapaGeral" });
    const tileset1 = mapa.addTilesetImage("ME_Top_1", "tilesMapaTopo");
    const tileset2 = mapa.addTilesetImage("ME_Bottom_1", "tilesMapaBase");
    const tileset3 = mapa.addTilesetImage("ME_Top_2", "tilesMapaTopo");
    const tileset4 = mapa.addTilesetImage("ME_Bottom_2", "tilesMapaBase");
    const tilesets = [tileset1, tileset2, tileset3, tileset4].filter(Boolean);

    let caminhoInferior, carrosVeiculos, objetosInferior2, estabelecimentos;

    if (tilesets.length > 0) {
      // Cria as camadas visuais que não têm colisão
      this._criarCamada(mapa, "objetosSemColid_em_cima_2", tilesets);
      this._criarCamada(mapa, "contorno_preto_do_mapa", tilesets);
      this._criarCamada(mapa, "chao_inferior_de_areia", tilesets);
      this._criarCamada(mapa, "chao", tilesets);
      this._criarCamada(mapa, "n_conchinhas_toalhas_matinhos", tilesets);
      this._criarCamada(mapa, "n_agua_do_mar", tilesets);
      this._criarCamada(mapa, "n_sombras", tilesets);
      this._criarCamada(mapa, "n_objetosSemColid_em_baixo", tilesets);
      this._criarCamada(mapa, "n_objetosSemColi_em_baixo_2", tilesets);
      this._criarCamada(mapa, "n_linhas da rua", tilesets);

      // Cria as camadas sólidas que bloqueiam o personagem
      caminhoInferior = this._criarCamada(
        mapa,
        "c_objetosComColid_em_baixo",
        tilesets,
      );
      carrosVeiculos = this._criarCamada(mapa, "c_carros e Veículos", tilesets);
      objetosInferior2 = this._criarCamada(
        mapa,
        "c_objetosComColid_em_baixo_2",
        tilesets,
      );
      estabelecimentos = this._criarCamada(
        mapa,
        "c_estabelecimentos_Com_Colid",
        tilesets,
      );

      if (caminhoInferior)  caminhoInferior.setCollisionByExclusion([-1]);
      if (carrosVeiculos)   carrosVeiculos.setCollisionByExclusion([-1]);
      if (objetosInferior2) objetosInferior2.setCollisionByExclusion([-1]);
      if (estabelecimentos) estabelecimentos.setCollisionByExclusion([-1]);
    }

    // Cria as animações de caminhada do personagem
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`andar_${dir}`)) {
        this.anims.create({
          key: `andar_${dir}`,
          frames: [
            { key: `sprite_${dir}_1` }, { key: `sprite_${dir}_2` },
            { key: `sprite_${dir}_3` }, { key: `sprite_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Usa o spawn recebido da cena anterior ou o ponto padrão da cidade
    const spawnX = this.spawnXCustom || 840;
    const spawnY = this.spawnYCustom || 900;

    this.personagem = this.physics.add.sprite(
      spawnX,
      spawnY,
      "sprite_frente_1",
    );
    this.personagem.setCollideWorldBounds(true);

    // Ajusta escala e hitbox para encaixar melhor no mapa
    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite  = this.personagem.height;
    const escala = Math.min((tamTile * 0.6) / larguraSprite, (tamTile * 0.6) / alturaSprite);
    this.personagem.setScale(Math.max(escala, 0.03));
    this.personagem.body.setSize(larguraSprite * 0.5, alturaSprite * 0.5);

    if (caminhoInferior)
      this.physics.add.collider(this.personagem, caminhoInferior);
    if (carrosVeiculos)
      this.physics.add.collider(this.personagem, carrosVeiculos);
    if (objetosInferior2)
      this.physics.add.collider(this.personagem, objetosInferior2);
    if (estabelecimentos)
      this.physics.add.collider(this.personagem, estabelecimentos);

    if (tilesets.length > 0) {
      // Camadas decorativas acima do personagem para dar profundidade visual
      const decSup1 = this._criarCamada(
        mapa,
        "n_estabelecimento_Sem_colid",
        tilesets,
      );
      const decSup2 = this._criarCamada(
        mapa,
        "n_objetosSemColid_em_cima",
        tilesets,
      );
      const decSup3 = this._criarCamada(
        mapa,
        "n_objetosSemColid_em_cima_2",
        tilesets,
      );
      if (decSup1) decSup1.setDepth(10);
      if (decSup2) decSup2.setDepth(11);
      if (decSup3) decSup3.setDepth(12);
    }

    // Configura os controles de movimento e interação
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Configura a câmera principal para seguir o personagem
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(MAPA_X, MAPA_Y, MAPA_LARGURA, MAPA_ALTURA);
    this.physics.world.setBounds(MAPA_X, MAPA_Y, MAPA_LARGURA, MAPA_ALTURA);

    // Cria as zonas invisíveis de interação dos estabelecimentos
    this.zonaAgencia = new Phaser.Geom.Rectangle(976, 856, 90, 80);
    this.labelE = this.add.text(976, 856, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.zonaEscritorio = new Phaser.Geom.Rectangle(1741, 1256, 90, 80);
    this.labelEscritorio = this.add.text(1741, 1256, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.zonaPadaria = new Phaser.Geom.Rectangle(1470, 890, 100, 80);
    this.labelPadaria = this.add.text(1484, 840, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.zonaFarmacia = new Phaser.Geom.Rectangle(1081, 1181, 80, 80);
    this.labelFarmacia = this.add.text(1121, 1179, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.zonaRestaurante = new Phaser.Geom.Rectangle(2622, 250, 80, 80);
    this.labelRestaurante = this.add.text(2662, 290, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 0.5).setVisible(false);

    this.zonaMetro = new Phaser.Geom.Rectangle(3040, 1128, 80, 80);
    this.labelMetro = this.add.text(3080, 1168, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 0.5).setVisible(false);

    this.zonaLojaDeRoupas = new Phaser.Geom.Rectangle(2208, 1530, 80, 80);
    this.labelLojaDeRoupas = this.add.text(2248, 1568, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.zonaSupermercado = new Phaser.Geom.Rectangle(2926, 349, 80, 60);
    this.labelSupermercado = this.add.text(2925, 320, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.zonaPostoDeGasolina = new Phaser.Geom.Rectangle(2759, 1310, 80, 60);
    this.labelPostoDeGasolina = this.add.text(2759, 1310, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    this.zonaAgencia02 = new Phaser.Geom.Rectangle(1806, 1590, 80, 60);
    this.labelAgencia02 = this.add.text(1806, 1590, "[E] Entrar", {
      fontSize: "6px", color: "#ffffff", backgroundColor: "#000000cc", padding: { x: 2, y: 1 }, resolution: 4,
    }).setDepth(20).setOrigin(0.5, 1).setVisible(false);

    // Flags de estado evitam transições duplicadas
    this.transicionando = false;
    this.dentroZonaAgencia = false;
    this.dentroZonaEscritorio = false;
    this.dentroZonaFarmacia = false;
    this.dentroZonaRestaurante = false;
    this.dentroZonaMetro = false;
    this.dentroZonaLojaDeRoupas = false;
    this.dentroZonaSupermercado = false;
    this.dentroZonaPadaria = false;
    this.dentroZonaPostoDegasolina = false;
    this.dentroAgencia02 = false; 

    // Texto de debug com as coordenadas do personagem
    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "4px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);

    this.direcaoAtual = "frente";

    // Configura o minimapa com a posição do jogador e o destino atual
    const MM_X = 10,
      MM_Y = 10;
    const TM_W = 3328,
      TM_H = 2048;
    const MM_W = 335;
    const MM_H = Math.round((MM_W * TM_H) / TM_W);

    this.minimapPlayerDot = this.add.graphics();
    this.minimapPlayerDot.fillStyle(0x00ff44, 1);
    this.minimapPlayerDot.fillCircle(0, 0, 55);
    this.minimapPlayerDot.setDepth(52);

    this.minimapDestDot = this.add.graphics();
    this.minimapDestDot.fillStyle(0xff2222, 1);
    this.minimapDestDot.fillCircle(0, 0, 55);
    this.minimapDestDot.setPosition(1121, 1221);
    this.minimapDestDot.setDepth(51);

    // Faz o destino piscar para chamar atenção do jogador
    this.tweens.add({
      targets: this.minimapDestDot,
      alpha: { from: 1, to: 0.1 },
      duration: 450, yoyo: true, repeat: -1,
    });

    // Câmera de borda do minimapa
    this.borderCam = this.cameras.add(MM_X - 2, MM_Y - 2, MM_W + 4, MM_H + 4);
    this.borderCam.setBackgroundColor(0x222222);
    this.borderCam.ignore(this.children.list);

    // Câmera do minimapa com zoom ajustado para mostrar o mapa inteiro
    const zoomFit = Math.min(MM_W / TM_W, MM_H / TM_H);
    this.miniMapCam = this.cameras.add(MM_X, MM_Y, MM_W, MM_H);
    this.miniMapCam.setZoom(zoomFit);
    this.miniMapCam.scrollX = TM_W / 2;
    this.miniMapCam.scrollY = TM_H / 2;
    this.miniMapCam.setBackgroundColor(0x000000);

    // Esconde elementos de interface da câmera principal ou do minimapa
    this.cameras.main.ignore([this.minimapPlayerDot, this.minimapDestDot]);
    this.miniMapCam.ignore([
      this.labelE,
      this.labelEscritorio,
      this.labelPadaria,
      this.labelFarmacia,
      this.labelRestaurante,
      this.labelMetro,
      this.labelLojaDeRoupas,
      this.labelSupermercado,
      this.labelPostoDeGasolina,
      this.labelAgencia02, 
      this.debugTxt,
    ]);

    // Lança a cena da chuva em paralelo sobre a cidade
    this.scene.launch("SceneChuva");
  }

  // Cria camadas do tilemap com tratamento de erro
  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) console.warn("[SceneCidade] Camada não encontrada:", nome);
      return camada;
    } catch (erro) {
      console.error("[SceneCidade] Erro ao criar camada", nome, ":", erro.message);
      return null;
    }
  }

  // Atualiza movimento, zonas de interação, minimapa e transições
  update() {
    // Zera a velocidade a cada frame para parada imediata ao soltar a tecla
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    // Movimento horizontal
    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    // Movimento vertical
    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play("andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    // Se estiver parado, mantém o sprite na última direção usada
    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`sprite_${this.direcaoAtual}_1`);
    }

    // Verifica se o personagem entrou em alguma zona de interação
    const dentroAgencia = Phaser.Geom.Rectangle.Contains(
      this.zonaAgencia,
      personagem.x,
      personagem.y,
    );
    if (dentroAgencia !== this.dentroZonaAgencia) {
      this.dentroZonaAgencia = dentroAgencia;
      this.labelE.setVisible(dentroAgencia);
    }

    const dentroEscritorio = Phaser.Geom.Rectangle.Contains(this.zonaEscritorio, personagem.x, personagem.y);
    if (dentroEscritorio !== this.dentroZonaEscritorio) { this.dentroZonaEscritorio = dentroEscritorio; this.labelEscritorio.setVisible(dentroEscritorio); }

    const dentroPadaria = Phaser.Geom.Rectangle.Contains(this.zonaPadaria, personagem.x, personagem.y);
    if (dentroPadaria !== this.dentroZonaPadaria) { this.dentroZonaPadaria = dentroPadaria; this.labelPadaria.setVisible(dentroPadaria); }

    const dentroFarmacia = Phaser.Geom.Rectangle.Contains(this.zonaFarmacia, personagem.x, personagem.y);
    if (dentroFarmacia !== this.dentroZonaFarmacia) { this.dentroZonaFarmacia = dentroFarmacia; this.labelFarmacia.setVisible(dentroFarmacia); }

    const dentroRestaurante = Phaser.Geom.Rectangle.Contains(this.zonaRestaurante, personagem.x, personagem.y);
    if (dentroRestaurante !== this.dentroZonaRestaurante) { this.dentroZonaRestaurante = dentroRestaurante; this.labelRestaurante.setVisible(dentroRestaurante); }

    const dentroMetro = Phaser.Geom.Rectangle.Contains(this.zonaMetro, personagem.x, personagem.y);
    if (dentroMetro !== this.dentroZonaMetro) { this.dentroZonaMetro = dentroMetro; this.labelMetro.setVisible(dentroMetro); }

    const dentroLojaDeRoupas = Phaser.Geom.Rectangle.Contains(this.zonaLojaDeRoupas, personagem.x, personagem.y);
    if (dentroLojaDeRoupas !== this.dentroZonaLojaDeRoupas) { this.dentroZonaLojaDeRoupas = dentroLojaDeRoupas; this.labelLojaDeRoupas.setVisible(dentroLojaDeRoupas); }

    const dentroSupermercado = Phaser.Geom.Rectangle.Contains(this.zonaSupermercado, personagem.x, personagem.y);
    if (dentroSupermercado !== this.dentroZonaSupermercado) { this.dentroZonaSupermercado = dentroSupermercado; this.labelSupermercado.setVisible(dentroSupermercado); }

    const dentroPostoDeGasolina = Phaser.Geom.Rectangle.Contains(this.zonaPostoDeGasolina, personagem.x, personagem.y);
    if (dentroPostoDeGasolina !== this.dentroZonaPostoDeGasolina) { this.dentroZonaPostoDeGasolina = dentroPostoDeGasolina; this.labelPostoDeGasolina.setVisible(dentroPostoDeGasolina); }

    const dentroAgencia02 = Phaser.Geom.Rectangle.Contains(this.zonaAgencia02, personagem.x, personagem.y);
    if (dentroAgencia02 !== this.dentroZonaAgencia02) { this.dentroZonaAgencia02 = dentroAgencia02; this.labelAgencia02.setVisible(dentroAgencia02); }

    const dentroAgencia03 = Phaser.Geom.Rectangle.Contains(this.zonaAgencia03, personagem.x, personagem.y);
    if (dentroAgencia03 !== this.dentroZonaAgencia03) { this.dentroZonaAgencia03 = dentroAgencia03; this.labelAgencia03.setVisible(dentroAgencia03); }

    // Atualiza debug e posição do jogador no minimapa
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 18);
    this.minimapPlayerDot.setPosition(personagem.x, personagem.y);

    // A tecla E ativa a transição apenas se o personagem estiver dentro de uma zona
    if (!this.transicionando && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      if (dentroAgencia) {
        this.transicionando = true;
        this.labelE.setVisible(false);
        this.scene.stop("SceneChuva"); // Para a chuva ao sair da cidade
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneAg", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido });
        });
      } else if (dentroEscritorio) {
        this.transicionando = true; this.labelEscritorio.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneEscritorio", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido });
        });
      } else if (dentroPadaria) {
        this.transicionando = true; this.labelPadaria.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("ScenePadaria", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido });
        });
      } else if (dentroFarmacia) {
        this.transicionando = true; this.labelFarmacia.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneFarmacia", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido });
        });
      } else if (dentroRestaurante) {
        this.transicionando = true; this.labelRestaurante.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneRestaurante", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido });
        });
      } else if (dentroMetro) {
        this.transicionando = true; this.labelMetro.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneMetro", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido, spawnX: 273, spawnY: 250 });
        });
      } else if (dentroLojaDeRoupas) {
        this.transicionando = true; this.labelLojaDeRoupas.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneLojaDeRoupas", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido });
        });
      } else if (dentroSupermercado) {
        this.transicionando = true; this.labelSupermercado.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneSupermercado", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido });
        });
      } else if (dentroPostoDeGasolina) {
        this.transicionando = true; this.labelPostoDeGasolina.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("ScenePostoDeGasolina", { nomePasta: this.nomePastaEscolhida, prefixo: this.prefixoEscolhido });
        });
      } else if (dentroAgencia02) {
        this.transicionando = true; this.labelAgencia02.setVisible(false); this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneAgencia02", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido, 
          });
        });
      }
    }
  }
}