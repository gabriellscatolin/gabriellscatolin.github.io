import { abrirPopupConfig as abrirPopupConfigModule } from "../settings.js";

export default class SceneCidade extends Phaser.Scene {
  constructor() {
    super({ key: "SceneCidade" });
  }

  // Recebe dados do personagem e do ponto de spawn
  init(dados = {}) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
    this.spawnXCustom = dados.spawnX || null;
    this.spawnYCustom = dados.spawnY || null;
    this.missaoCidadeIdCustom = Number.isFinite(Number(dados.missaoCidadeId))
      ? Math.floor(Number(dados.missaoCidadeId))
      : null;
    this.missaoCidadeTextoCustom =
      typeof dados.missaoCidadeTexto === "string"
        ? dados.missaoCidadeTexto.trim()
        : "";
    this.destacarMissaoCidadeNoInicio = Boolean(dados.destacarMissaoCidade);
    this.limparDestaqueMissaoCidadeAoRetornarDoMapa =
      Boolean(dados.limparDestaqueMissaoCidadeAoRetornarDoMapa) ||
      Boolean(this.registry.get("limparDestaqueMissaoCidadeAoRetornarDoMapa"));
    this.retornoFarmacia = Boolean(dados.retornoFarmacia);
    this.escoltaPJSalaoAtiva =
      Boolean(dados.escoltaPJSalao) ||
      Boolean(this.registry.get("ag02_escolta_pj_salao"));
    this.escoltaPJMetroAtiva =
      Boolean(dados.escoltaPJMetro) ||
      Boolean(this.registry.get("ag02_escolta_pj_metro"));
    this.escoltaPJRestauranteAtiva =
      Boolean(dados.escoltaPJRestaurante) ||
      Boolean(this.registry.get("ag02_escolta_pj_restaurante"));
    this.escoltaPJSupermercadoAtiva =
      Boolean(dados.escoltaPJSupermercado) ||
      Boolean(this.registry.get("ag02_escolta_pj_supermercado"));
    const pjDialogoConcluido = Boolean(
      this.registry.get("ag01_dialogo_pj_concluido"),
    );
    const pjJaRetornou = Boolean(this.registry.get("ag01_pj_retorno"));
    const fallbackEscoltaPorProgresso = pjDialogoConcluido && !pjJaRetornou;
    this.escoltaPJAgencia2Ativa =
      Boolean(dados.escoltaPJAgencia2) ||
      Boolean(this.registry.get("ag01_escolta_pj_agencia2")) ||
      fallbackEscoltaPorProgresso;
    if (this.retornoFarmacia) {
      this.escoltaPJAgencia2Ativa = true;
    }
    if (this.escoltaPJSalaoAtiva) {
      this.escoltaPJAgencia2Ativa = true;
    }
    if (this.escoltaPJMetroAtiva) {
      this.escoltaPJAgencia2Ativa = true;
    }
    if (this.escoltaPJRestauranteAtiva) {
      this.escoltaPJAgencia2Ativa = true;
    }
    if (this.escoltaPJSupermercadoAtiva) {
      this.escoltaPJAgencia2Ativa = true;
    }
    this.ocultarSetaAgencia01 =
      Boolean(dados.ocultarSetaAgencia01) ||
      Boolean(this.registry.get("ocultarSetaAgencia01"));
  }

  // Carrega mapa, tilesets, sprites e audios
  preload() {
    const nomePasta = this.registry.get("nomePasta") || "Pedro";
    const prefixo = this.registry.get("prefixo") || "HB";

    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneCidade] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    this.load.audio(
      "trilhaSceneCidade",
      "src/assets/audios/trilhaSceneCidade.mp3",
    );

    this.load.tilemapTiledJSON(
      "mapaGeral",
      "src/assets/imagens/mapsjson/tileMaps/mapaMiniMundoVF.tmj?v=5",
    );
    this.load.image(
      "tilesMapaTopo",
      "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Top.png?v=1",
    );
    this.load.image(
      "tilesMapaBase",
      "src/assets/imagens/mapsjson/tileSets/Modern_Exteriors_Bottom.png?v=1",
    );
    this.load.image("maquininhaCielo", "src/assets/imagens/HUD/maquininha.png");
    this.load.image("cieloCoinsHud", "src/assets/imagens/HUD/cieloCoinHUD.png");
    this.load.image("botaoMapaHud", "src/assets/imagens/HUD/botaoMapa.png");
    this.load.image(
      "botaoConfiguracaoHud",
      "src/assets/imagens/HUD/botaoConfiguracao.png",
    );
    this.load.image(
      "botaoRankingHud",
      "src/assets/imagens/HUD/botaoRanking.png",
    );
    this.load.image("botaoMissaoHud", "src/assets/imagens/HUD/botaoMissao.png");
    this.load.image(
      "falaVanessa",
      "src/assets/imagens/imagensFalas/falaVanessa.png",
    );
    this.load.image("falaTheo", "src/assets/imagens/imagensFalas/falaTheo.png");
    // Sprites do Theo guia (igual Agencia 01) com protecao para nao duplicar chave.
    const carregarTheoGuia = (key, path) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, path);
      }
    };
    carregarTheoGuia(
      "npc_agencia_frente_1",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandofrente01 (parado01).png",
    );
    carregarTheoGuia(
      "npc_agencia_frente_2",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandofrente02.png",
    );
    carregarTheoGuia(
      "npc_agencia_frente_3",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandofrente03.png",
    );
    carregarTheoGuia(
      "npc_agencia_frente_4",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandofrente04.png",
    );
    carregarTheoGuia(
      "npc_agencia_tras_1",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandotras01.png",
    );
    carregarTheoGuia(
      "npc_agencia_tras_2",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandotras02.png",
    );
    carregarTheoGuia(
      "npc_agencia_tras_3",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandotras03.png",
    );
    carregarTheoGuia(
      "npc_agencia_tras_4",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandotras04.png",
    );
    carregarTheoGuia(
      "npc_agencia_direita_1",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandodireita01.png",
    );
    carregarTheoGuia(
      "npc_agencia_direita_2",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandodireita02.png",
    );
    carregarTheoGuia(
      "npc_agencia_direita_3",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandodireita03.png",
    );
    carregarTheoGuia(
      "npc_agencia_direita_4",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandodireita04.png",
    );
    carregarTheoGuia(
      "npc_agencia_esquerda_1",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandoesquerda01.png",
    );
    carregarTheoGuia(
      "npc_agencia_esquerda_2",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandoesquerda02.png",
    );
    carregarTheoGuia(
      "npc_agencia_esquerda_3",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandoesquerda03.png",
    );
    carregarTheoGuia(
      "npc_agencia_esquerda_4",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandoesquerda04.png",
    );

    const carregarCamilaGuia = (key, path) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, path);
      }
    };
    carregarCamilaGuia(
      "npc_camila_frente_1",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandofrente01 (parado01).png",
    );
    carregarCamilaGuia(
      "npc_camila_frente_2",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandofrente02.png",
    );
    carregarCamilaGuia(
      "npc_camila_frente_3",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandofrente03.png",
    );
    carregarCamilaGuia(
      "npc_camila_frente_4",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandofrente04.png",
    );
    carregarCamilaGuia(
      "npc_camila_tras_1",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandotras01.png",
    );
    carregarCamilaGuia(
      "npc_camila_tras_2",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandotras02.png",
    );
    carregarCamilaGuia(
      "npc_camila_tras_3",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandotras03.png",
    );
    carregarCamilaGuia(
      "npc_camila_tras_4",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandotras04.png",
    );
    carregarCamilaGuia(
      "npc_camila_direita_1",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandodireita01.png",
    );
    carregarCamilaGuia(
      "npc_camila_direita_2",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandodireita02.png",
    );
    carregarCamilaGuia(
      "npc_camila_direita_3",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandodireita03.png",
    );
    carregarCamilaGuia(
      "npc_camila_direita_4",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandodireita04.png",
    );
    carregarCamilaGuia(
      "npc_camila_esquerda_1",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandoesquerda01.png",
    );
    carregarCamilaGuia(
      "npc_camila_esquerda_2",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandoesquerda02.png",
    );
    carregarCamilaGuia(
      "npc_camila_esquerda_3",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandoesquerda03.png",
    );
    carregarCamilaGuia(
      "npc_camila_esquerda_4",
      "src/assets/imagens/imagensPersonagens/NPC/Camila/camila_andandoesquerda04.png",
    );

    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `sprite_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `sprite_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `sprite_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `sprite_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  // Monta mapa, personagem e interfaces
  create() {
    // Zona de interação para o supermercado.
    this.zonaSupermercado = new Phaser.Geom.Rectangle(
      2924 - 16,
      344 - 16,
      32,
      32,
    );
    this.labelSupermercado = this.add
      .text(2924, 344, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);
    // Área jogável usada por câmera e física
    const MAPA_X = 720;
    const MAPA_Y = 100;
    const MAPA_LARGURA = 2432;
    const MAPA_ALTURA = 1760;

    // Adiciona audios a cena
    this.musica = this.sound.add("trilhaSceneCidade", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    // Mapa principal e tilesets exportados do Tiled
    const mapa = this.make.tilemap({ key: "mapaGeral" });
    const tileset1 = mapa.addTilesetImage("ME_Top_1", "tilesMapaTopo");
    const tileset2 = mapa.addTilesetImage("ME_Bottom_1", "tilesMapaBase");
    const tileset3 = mapa.addTilesetImage("ME_Top_2", "tilesMapaTopo");
    const tileset4 = mapa.addTilesetImage("ME_Bottom_2", "tilesMapaBase");
    const tilesets = [tileset1, tileset2, tileset3, tileset4].filter(Boolean);

    let caminhoInferior;
    let carrosVeiculos;
    let objetosInferior2;
    let estabelecimentos;

    if (tilesets.length > 0) {
      // Camadas visuais de base
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

      // Camadas com colisão
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

      if (caminhoInferior) caminhoInferior.setCollisionByExclusion([-1]);
      if (carrosVeiculos) carrosVeiculos.setCollisionByExclusion([-1]);
      if (objetosInferior2) objetosInferior2.setCollisionByExclusion([-1]);
      if (estabelecimentos) estabelecimentos.setCollisionByExclusion([-1]);

      // Remove colisao apenas no tile da coordenada solicitada.
      this._removerColisaoNoPonto(caminhoInferior, 1004, 1000);
      this._removerColisaoNoPonto(carrosVeiculos, 1004, 1000);
      this._removerColisaoNoPonto(objetosInferior2, 1004, 1000);
      this._removerColisaoNoPonto(estabelecimentos, 1004, 1000);

      // Remove colisao no ponto informado na farmacia.
      this._removerColisaoNoPonto(caminhoInferior, 1198, 1296);
      this._removerColisaoNoPonto(carrosVeiculos, 1198, 1296);
      this._removerColisaoNoPonto(objetosInferior2, 1198, 1296);
      this._removerColisaoNoPonto(estabelecimentos, 1198, 1296);

      // Adiciona colisao em toda a extensao horizontal solicitada.
      this._adicionarColisaoFaixaHorizontal(caminhoInferior, 1485, 1055, 963);
      this._adicionarColisaoFaixaHorizontal(carrosVeiculos, 1485, 1055, 963);
      this._adicionarColisaoFaixaHorizontal(objetosInferior2, 1485, 1055, 963);
      this._adicionarColisaoFaixaHorizontal(estabelecimentos, 1485, 1055, 963);
    }

    // Cria as animações de caminhada apenas uma vez
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`andar_${dir}`)) {
        this.anims.create({
          key: `andar_${dir}`,
          frames: [
            { key: `sprite_${dir}_1` },
            { key: `sprite_${dir}_2` },
            { key: `sprite_${dir}_3` },
            { key: `sprite_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    const spawnX = this.spawnXCustom || 840;
    const spawnY = this.spawnYCustom || 900;

    // Jogador
    this.personagem = this.physics.add.sprite(
      spawnX,
      spawnY,
      "sprite_frente_1",
    );
    this.personagem.setCollideWorldBounds(true);

    // Label de coordenadas acima do personagem
    this.coordLabel = this.add
      .text(spawnX, spawnY - 40, "", {
        fontSize: "20px",
        fontFamily: "monospace",
        fontStyle: "bold",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
        backgroundColor: "#00000088",
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(1002);

    const tamTile = mapa.tileWidth || 16;
    const larguraSprite = this.personagem.width;
    const alturaSprite = this.personagem.height;
    const escala = Math.min(
      (tamTile * 0.6) / larguraSprite,
      (tamTile * 0.6) / alturaSprite,
    );
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

    // Colisao manual para bloquear o ponto x:1035 y:1048.
    this.colisaoManualCidade = this.add.zone(1035, 1048, 16, 16);
    this.physics.add.existing(this.colisaoManualCidade, true);
    this.physics.add.collider(this.personagem, this.colisaoManualCidade);

    // Colisao manual continua na faixa y:963 de x:1055 ate x:1485.
    this.colisaoFaixaCidade = this.add.zone(
      (1055 + 1485) / 2,
      963,
      1485 - 1055 + 16,
      16,
    );
    this.physics.add.existing(this.colisaoFaixaCidade, true);
    this.physics.add.collider(this.personagem, this.colisaoFaixaCidade);

    // Colisao manual continua na faixa x:1478 de y:980 ate y:1064.
    this.colisaoFaixaVerticalCidade = this.add.zone(
      1478,
      (980 + 1064) / 2,
      16,
      1064 - 980 + 16,
    );
    this.physics.add.existing(this.colisaoFaixaVerticalCidade, true);
    this.physics.add.collider(this.personagem, this.colisaoFaixaVerticalCidade);

    // Colisao manual continua na faixa x:1062 de y:979 ate y:1048.
    this.colisaoFaixaVerticalCidade2 = this.add.zone(
      1062,
      (979 + 1048) / 2,
      16,
      1048 - 979 + 16,
    );
    this.physics.add.existing(this.colisaoFaixaVerticalCidade2, true);
    this.physics.add.collider(
      this.personagem,
      this.colisaoFaixaVerticalCidade2,
    );

    // Colisao manual continua na faixa y:1033 de x:856 ate x:985.
    this.colisaoFaixaCidade2 = this.add.zone(
      (856 + 985) / 2,
      1033,
      985 - 856 + 16,
      16,
    );
    this.physics.add.existing(this.colisaoFaixaCidade2, true);
    this.physics.add.collider(this.personagem, this.colisaoFaixaCidade2);

    // Colisao manual no ponto solicitado x:1192 y:1240.
    this.colisaoManualCidade3 = this.add.zone(1192, 1240, 16, 16);
    this.physics.add.existing(this.colisaoManualCidade3, true);
    this.physics.add.collider(this.personagem, this.colisaoManualCidade3);

    this.pjAcompanhandoAgencia2 =
      this.escoltaPJAgencia2Ativa ||
      this.escoltaPJSalaoAtiva ||
      this.escoltaPJMetroAtiva ||
      this.escoltaPJRestauranteAtiva ||
      this.escoltaPJSupermercadoAtiva;
    this.pjAcompanhamentoEncerrado = false;
    this.pjDespedidaAgencia02Feita = false;
    this.pjPopupAgencia02Ativo = false;
    this.pjAguardandoDespedidaAgencia02 = false;
    this.pjDistanciaMaxJogador = 120;
    this.pjRaioChegadaGuia = 24;
    this.pjVelocidadeGuia = 110;
    this.pjEsperandoJogador = false;
    this.pjRotaWaypoints = [
      // Rota até a padaria
      { x: 985, y: 870 },
      { x: 985, y: 928 },
      { x: 1563, y: 922 },
      { x: 1425, y: 818 }, // Entrada da padaria
      // Após padaria, rota até a farmácia será ativada depois
    ];
    this.pjRotaIndiceAtual = 0;
    this.pjChegouDestinoRota = false;
    this.pjDestinoAtual = "padaria";
    if (this.escoltaPJSalaoAtiva) {
      this.pjDestinoAtual = "loja_roupas";
    }
    if (this.escoltaPJMetroAtiva) {
      this.pjDestinoAtual = "metro";
    }
    if (this.escoltaPJRestauranteAtiva) {
      this.pjDestinoAtual = "restaurante";
    }
    if (this.escoltaPJSupermercadoAtiva) {
      this.pjDestinoAtual = "supermercado";
    }
    this.npcTheoProximaTroca = 0;
    this.npcTheoSpriteAtual = 1;
    this.npcTheoIntervaloTroca = 130;
    this.npcTheoDirecao = "frente";
    this.npcTheoAndandoAnterior = false;

    if (this.pjAcompanhandoAgencia2) {
      this.npcGuiaPrefix =
        this.escoltaPJSalaoAtiva ||
        this.escoltaPJMetroAtiva ||
        this.escoltaPJRestauranteAtiva ||
        this.escoltaPJSupermercadoAtiva
        ? "npc_camila"
        : "npc_agencia";
      const spriteInicialGuia = `${this.npcGuiaPrefix}_frente_1`;
      this.registry.set("ag01_escolta_pj_agencia2", true);
      this.registry.set("ag01_pj_retorno", false);

      this.npcTheoGuia = this.physics.add
        .sprite(spawnX + 24, spawnY + 10, spriteInicialGuia)
        .setDepth(9);
      this.npcTheoGuia.setCollideWorldBounds(true);

      const alturaTheo = this.personagem.displayHeight;
      this.npcTheoGuia.setDisplaySize(
        (this.npcTheoGuia.width / this.npcTheoGuia.height) * alturaTheo,
        alturaTheo,
      );
      this.npcTheoGuia.body.setSize(
        this.npcTheoGuia.displayWidth * 0.4,
        this.npcTheoGuia.displayHeight * 0.4,
      );

      if (caminhoInferior)
        this.physics.add.collider(this.npcTheoGuia, caminhoInferior);
      if (carrosVeiculos)
        this.physics.add.collider(this.npcTheoGuia, carrosVeiculos);
      if (objetosInferior2)
        this.physics.add.collider(this.npcTheoGuia, objetosInferior2);
      if (estabelecimentos)
        this.physics.add.collider(this.npcTheoGuia, estabelecimentos);
      this.physics.add.collider(this.npcTheoGuia, this.colisaoManualCidade);
      this.physics.add.collider(this.npcTheoGuia, this.colisaoFaixaCidade);
      this.physics.add.collider(
        this.npcTheoGuia,
        this.colisaoFaixaVerticalCidade,
      );
      this.physics.add.collider(
        this.npcTheoGuia,
        this.colisaoFaixaVerticalCidade2,
      );
      this.physics.add.collider(this.npcTheoGuia, this.colisaoFaixaCidade2);
      this.physics.add.collider(this.npcTheoGuia, this.colisaoManualCidade3);
      this.physics.add.collider(this.personagem, this.npcTheoGuia);

      this.labelTheoGuia = this.add
        .text(
          this.npcTheoGuia.x,
          this.npcTheoGuia.y - 20,
          "[PJ te acompanhando]",
          {
            fontSize: "6px",
            color: "#ffffff",
            backgroundColor: "#000000cc",
            padding: { x: 2, y: 1 },
            resolution: 4,
          },
        )
        .setDepth(20)
        .setOrigin(0.5, 1)
        .setVisible(true);
    } else {
      this.npcTheoGuia = null;
      this.labelTheoGuia = null;
    }

    // Camadas acima do personagem para efeito de profundidade
    if (tilesets.length > 0) {
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

    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // Câmera principal seguindo o personagem
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(4);
    this.cameras.main.setBounds(MAPA_X, MAPA_Y, MAPA_LARGURA, MAPA_ALTURA);
    this.physics.world.setBounds(MAPA_X, MAPA_Y, MAPA_LARGURA, MAPA_ALTURA);

    // Zonas interativas e labels de entrada
    this.zonaAgencia = new Phaser.Geom.Rectangle(976, 856, 90, 80);
    this.labelE = this.add
      .text(976, 856, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaEscritorio = new Phaser.Geom.Rectangle(1741, 1256, 90, 80);
    this.labelEscritorio = this.add
      .text(1741, 1256, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaPadaria = new Phaser.Geom.Rectangle(1425, 818, 100, 80);
    this.labelPadaria = this.add
      .text(1484, 840, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaFarmacia = new Phaser.Geom.Rectangle(1081, 1181, 80, 80);
    this.labelFarmacia = this.add
      .text(1121, 1179, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaRestaurante = new Phaser.Geom.Rectangle(2622, 250, 80, 80);
    this.labelRestaurante = this.add
      .text(2662, 290, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.zonaMetro = new Phaser.Geom.Rectangle(3040, 1128, 80, 80);
    this.labelMetro = this.add
      .text(3080, 1168, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.zonaLojaDeRoupas = new Phaser.Geom.Rectangle(2208, 1530, 80, 80);
    this.labelLojaDeRoupas = this.add
      .text(2248, 1568, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaSupermercado = new Phaser.Geom.Rectangle(2926, 349, 80, 60);
    this.labelSupermercado = this.add
      .text(2925, 320, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaPostoDeGasolina = new Phaser.Geom.Rectangle(2759, 1310, 80, 60);
    this.labelPostoDeGasolina = this.add
      .text(2759, 1310, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaAgencia02 = new Phaser.Geom.Rectangle(1707, 1486, 180, 180);
    this.labelAgencia02 = this.add
      .text(1797, 1576, "[E] Entrar", {
        fontSize: "6px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 2, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.zonaAgencia03 = new Phaser.Geom.Rectangle(2486, 792, 80, 60);
    this.labelAgencia03 = this.add
      .text(2486, 792, "[E] Entrar", {
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
    this.dentroZonaAgencia = false;
    this.dentroZonaEscritorio = false;
    this.dentroZonaFarmacia = false;
    this.dentroZonaRestaurante = false;
    this.dentroZonaMetro = false;
    this.dentroZonaLojaDeRoupas = false;
    this.dentroZonaSupermercado = false;
    this.dentroZonaPadaria = false;
    this.dentroZonaPostoDeGasolina = false;
    this.dentroZonaAgencia02 = false;
    this.dentroZonaAgencia03 = false;

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

    // Minimapa com câmera separada
    // Sequencia das setas
    this.sequenciaSetas = [
      "agencia1",
      "padaria",
      "farmacia",
      "escritorio",
      "agencia2",
      "cabeleireiro",
      "metro",
      "restaurante",
      "supermercado",
      "agencia3",
      "posto",
      "agencia3",
    ];

    const etapaSalva = Number(this.registry.get("sequenciaSetaCidade"));
    if (Number.isInteger(etapaSalva) && etapaSalva >= 0) {
      this.indiceSetaAtual = etapaSalva;
    } else if (this.ocultarSetaAgencia01) {
      this.indiceSetaAtual = 1;
    } else {
      this.indiceSetaAtual = 0;
    }

    const MM_X = 10;
    const MM_Y = 10;
    const TM_W = 3328;
    const TM_H = 2048;
    const MM_W = 335;
    const MM_H = Math.round((MM_W * TM_H) / TM_W);

    this.minimapPlayerDot = this.add.graphics();
    this.minimapPlayerDot.fillStyle(0x00ff44, 1);
    this.minimapPlayerDot.fillCircle(0, 0, 55);
    this.minimapPlayerDot.setDepth(52);

    this.minimapDestDot = this.add.graphics();
    this.minimapDestDot.fillStyle(0xff2222, 1);
    this.minimapDestDot.fillCircle(0, 0, 55);
    this.minimapDestDot.setPosition(987, 881);
    this.minimapDestDot.setDepth(51);

    // Seta guia no chão para entrada da Agência 01
    this.setaGuiaAgencia = this.add
      .triangle(997, 815, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaAgencia.setStrokeStyle(2, 0x000000, 0.5);

    this.tweens.add({
      targets: this.setaGuiaAgencia,
      y: 809,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada da Padaria
    this.setaGuiaPadaria = this.add
      .triangle(1483, 840, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaPadaria.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaPadaria,
      y: 834,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada da Farmácia
    this.setaGuiaFarmacia = this.add
      .triangle(1118, 1211, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaFarmacia.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaFarmacia,
      y: 1205,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada do Escritório Particular
    this.setaGuiaEscritorio = this.add
      .triangle(1754, 1256, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaEscritorio.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaEscritorio,
      y: 1250,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada da Agência 02
    this.setaGuiaAgencia02 = this.add
      .triangle(1803, 1568, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaAgencia02.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaAgencia02,
      y: 1562,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada da Loja de Roupa
    this.setaGuiaCabeleireiro = this.add
      .triangle(2267, 1570, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaCabeleireiro.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaCabeleireiro,
      y: 1564,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada do Metrô
    this.setaGuiaMetro = this.add
      .triangle(3070, 1180, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaMetro.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaMetro,
      y: 1174,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada do Restaurante
    this.setaGuiaRestaurante = this.add
      .triangle(2676, 290, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaRestaurante.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaRestaurante,
      y: 284,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada do Supermercado
    this.setaGuiaSupermercado = this.add
      .triangle(2936, 356, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaSupermercado.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaSupermercado,
      y: 350,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada da Agência 03
    this.setaGuiaAgencia03 = this.add
      .triangle(2486, 792, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaAgencia03.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaAgencia03,
      y: 786,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Seta guia no chão para entrada do Posto de Gasolina
    this.setaGuiaPostoDeGasolina = this.add
      .triangle(2774, 1310, 0, 14, 12, -8, -12, -8, 0xffe066, 0.95)
      .setDepth(19);
    this.setaGuiaPostoDeGasolina.setStrokeStyle(2, 0x000000, 0.5);
    this.tweens.add({
      targets: this.setaGuiaPostoDeGasolina,
      y: 1304,
      alpha: { from: 1, to: 0.45 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.setasGuia = {
      agencia1: this.setaGuiaAgencia,
      padaria: this.setaGuiaPadaria,
      farmacia: this.setaGuiaFarmacia,
      escritorio: this.setaGuiaEscritorio,
      agencia2: this.setaGuiaAgencia02,
      cabeleireiro: this.setaGuiaCabeleireiro,
      metro: this.setaGuiaMetro,
      restaurante: this.setaGuiaRestaurante,
      supermercado: this.setaGuiaSupermercado,
      agencia3: this.setaGuiaAgencia03,
      posto: this.setaGuiaPostoDeGasolina,
    };
    this._atualizarSetaAtual();

    this.tweens.add({
      targets: this.minimapDestDot,
      alpha: { from: 1, to: 0.1 },
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

    this.borderCam = this.cameras.add(MM_X - 2, MM_Y - 2, MM_W + 4, MM_H + 4);
    this.borderCam.setBackgroundColor(0x222222);
    this.borderCam.ignore(this.children.list);

    const zoomFit = Math.min(MM_W / TM_W, MM_H / TM_H);
    this.miniMapCam = this.cameras.add(MM_X, MM_Y, MM_W, MM_H);
    this.miniMapCam.setZoom(zoomFit);
    this.miniMapCam.scrollX = TM_W / 2;
    this.miniMapCam.scrollY = TM_H / 2;
    this.miniMapCam.setBackgroundColor(0x000000);

    this.cameras.main.ignore([this.minimapPlayerDot, this.minimapDestDot]);
    this.miniMapCam.ignore([
      this.setaGuiaAgencia,
      this.setaGuiaPadaria,
      this.setaGuiaFarmacia,
      this.setaGuiaEscritorio,
      this.setaGuiaAgencia02,
      this.setaGuiaCabeleireiro,
      this.setaGuiaMetro,
      this.setaGuiaRestaurante,
      this.setaGuiaSupermercado,
      this.setaGuiaAgencia03,
      this.setaGuiaPostoDeGasolina,
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
      this.labelAgencia03,
      this.debugTxt,
    ]);

    // HUD da maquininha e das moedas
    this._criarHudCidade();
    this._criarHudCoins();
    this._criarPopupMissaoCidade();

    if (this.escoltaPJSalaoAtiva) {
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga a PJ Camila até a Loja de Roupas.",
      );
      this._atualizarPopupMissaoCidade(true);
    }

    if (this.escoltaPJMetroAtiva) {
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga a PJ Camila até o Metrô.",
      );
      this._atualizarPopupMissaoCidade(true);
    }

    if (this.escoltaPJRestauranteAtiva) {
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga a PJ Camila até o Restaurante.",
      );
      this._atualizarPopupMissaoCidade(true);
    }

    if (this.escoltaPJSupermercadoAtiva) {
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga a PJ Camila até o Mercado.",
      );
      this._atualizarPopupMissaoCidade(true);
    }

    if (this.retornoFarmacia) {
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Vire à direita e siga a rua até a Agência 02.",
      );
      this._atualizarPopupMissaoCidade(true);

      const recadoPJ = this.add
        .text(
          this.personagem.x,
          this.personagem.y - 22,
          "[Vire à direita e siga a rua até a Agência 02. Boa sorte!]",
          {
            fontSize: "6px",
            color: "#ffffff",
            backgroundColor: "#000000cc",
            padding: { x: 2, y: 1 },
            resolution: 4,
          },
        )
        .setDepth(25)
        .setOrigin(0.5, 1);

      this.tweens.add({
        targets: recadoPJ,
        alpha: { from: 1, to: 0 },
        duration: 2800,
        delay: 1800,
        onComplete: () => recadoPJ.destroy(),
      });

      if (this.npcTheoGuia) {
        this.pjAcompanhandoAgencia2 = true;
        this.pjAcompanhamentoEncerrado = false;
        this.pjAguardandoPadaria = false;
        this.pjDestinoAtual = "agencia2";
        this.pjRotaWaypoints = [
          { x: 1126, y: 1295 },
          { x: 1578, y: 1295 },
          { x: 1578, y: 1655 },
          { x: 1806, y: 1655 },
        ];
        this.pjRotaIndiceAtual = 0;
        this.pjChegouDestinoRota = false;
        this.pjDespedidaAgencia02Feita = false;
        this.pjAguardandoDespedidaAgencia02 = false;
        this.registry.set("ag01_escolta_pj_agencia2", true);
        this.registry.set("ag01_pj_retorno", false);
        this.registry.set("missaoCidadeTexto", "Missão: Fale com o PJ Theo.");
        if (this.npcTheoGuia.body) this.npcTheoGuia.body.enable = true;
        this.npcTheoGuia.setVisible(true);
        if (this.labelTheoGuia) {
          this.labelTheoGuia
            .setVisible(true)
            .setText("[Me siga até a Agência 02]")
            .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
        }
      }

      if (this.escoltaPJSalaoAtiva && this.npcTheoGuia) {
        this.pjAcompanhandoAgencia2 = true;
        this.pjAcompanhamentoEncerrado = false;
        this.pjAguardandoPadaria = false;
        this.pjDestinoAtual = "loja_roupas";
        this.pjRotaWaypoints = [
          { x: 1823, y: 1651 },
          { x: 2235, y: 1651 },
          { x: 2280, y: 1575 },
        ];
        this.pjRotaIndiceAtual = 0;
        this.pjChegouDestinoRota = false;
        this.pjDespedidaSalaoFeita = false;
        this.registry.set("ag02_escolta_pj_salao", true);
        this.registry.set("ag02_pj_retorno", false);
        this.registry.set(
          "missaoCidadeTexto",
          "Missão: Siga a PJ Camila até a Loja de Roupas.",
        );
        if (this.npcTheoGuia.body) this.npcTheoGuia.body.enable = true;
        this.npcTheoGuia.setVisible(true);
        if (this.labelTheoGuia) {
          this.labelTheoGuia
            .setVisible(true)
            .setText("[Me siga até a Loja de Roupas]")
            .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
        }
        this._atualizarPopupMissaoCidade(true);
      }
    }

    if (this.escoltaPJSalaoAtiva && this.npcTheoGuia && !this.retornoFarmacia) {
      this.pjAcompanhandoAgencia2 = true;
      this.pjAcompanhamentoEncerrado = false;
      this.pjAguardandoPadaria = false;
      this.pjDestinoAtual = "loja_roupas";
      this.pjRotaWaypoints = [
        { x: 1823, y: 1651 },
        { x: 2235, y: 1651 },
        { x: 2280, y: 1575 },
      ];
      this.pjRotaIndiceAtual = 0;
      this.pjChegouDestinoRota = false;
      this.pjDespedidaSalaoFeita = false;
      this.registry.set("ag02_escolta_pj_salao", true);
      this.registry.set("ag02_pj_retorno", false);
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga a PJ Camila até a Loja de Roupas.",
      );
      if (this.npcTheoGuia.body) this.npcTheoGuia.body.enable = true;
      this.npcTheoGuia.setVisible(true);
      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Me siga até a Loja de Roupas]")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }
      this._atualizarPopupMissaoCidade(true);
    }

    if (this.escoltaPJMetroAtiva && this.npcTheoGuia) {
      this.pjAcompanhandoAgencia2 = true;
      this.pjAcompanhamentoEncerrado = false;
      this.pjAguardandoPadaria = false;
      this.pjDestinoAtual = "metro";
      this.pjRotaWaypoints = [
        { x: 2266, y: 1658 },
        { x: 2536, y: 1658 },
        { x: 2536, y: 1175 },
        { x: 3032, y: 1175 },
      ];
      this.pjRotaIndiceAtual = 0;
      this.pjChegouDestinoRota = false;
      this.registry.set("ag02_escolta_pj_metro", true);
      this.registry.set("ag02_pj_metro_retorno", false);
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga a PJ Camila até o Metrô.",
      );
      if (this.npcTheoGuia.body) this.npcTheoGuia.body.enable = true;
      this.npcTheoGuia.setVisible(true);
      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Me siga até o Metrô]")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }
      this._atualizarPopupMissaoCidade(true);
    }

    if (this.escoltaPJRestauranteAtiva && this.npcTheoGuia) {
      this.pjAcompanhandoAgencia2 = true;
      this.pjAcompanhamentoEncerrado = false;
      this.pjAguardandoPadaria = false;
      this.pjDestinoAtual = "restaurante";
      this.pjRotaWaypoints = [
        { x: 2699, y: 449 },
        { x: 2644, y: 318 },
      ];
      this.pjRotaIndiceAtual = 0;
      this.pjChegouDestinoRota = false;
      this.registry.set("ag02_escolta_pj_restaurante", true);
      this.registry.set("ag02_pj_restaurante_retorno", false);
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga a PJ Camila até o Restaurante.",
      );
      if (this.npcTheoGuia.body) this.npcTheoGuia.body.enable = true;
      this.npcTheoGuia.setVisible(true);
      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Me siga até o Restaurante]")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }
      this._atualizarPopupMissaoCidade(true);
    }

    if (this.escoltaPJSupermercadoAtiva && this.npcTheoGuia) {
      this.pjAcompanhandoAgencia2 = true;
      this.pjAcompanhamentoEncerrado = false;
      this.pjAguardandoPadaria = false;
      this.pjDestinoAtual = "supermercado";
      this.pjRotaWaypoints = [
        { x: 2716, y: 410 },
        { x: 2871, y: 355 },
        { x: 2976, y: 355 },
      ];
      this.pjRotaIndiceAtual = 0;
      this.pjChegouDestinoRota = false;
      this.registry.set("ag02_escolta_pj_supermercado", true);
      this.registry.set("ag02_pj_supermercado_retorno", false);
      this.registry.set(
        "missaoCidadeTexto",
        "Missão: Siga a PJ Camila até o Mercado.",
      );
      if (this.npcTheoGuia.body) this.npcTheoGuia.body.enable = true;
      this.npcTheoGuia.setVisible(true);
      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Me siga até o Mercado]")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }
      this._atualizarPopupMissaoCidade(true);
    }

    // Cena de chuva em paralelo
    this.scene.launch("SceneChuva");

    // Para a trilha sonora ao encerrar a cena.
    this.events.on("shutdown", () => {
      this.musica.stop();
    });
  }

  // Cria camada do tilemap com segurança
  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) console.warn("[SceneCidade] Camada não encontrada:", nome);
      return camada;
    } catch (erro) {
      console.error(
        "[SceneCidade] Erro ao criar camada",
        nome,
        ":",
        erro.message,
      );
      return null;
    }
  }

  _removerColisaoNoPonto(camada, xMundo, yMundo) {
    if (!camada) return;

    const tile = camada.getTileAtWorldXY(xMundo, yMundo, false);
    if (!tile || tile.index === -1) return;

    tile.setCollision(false, false, false, false);
  }

  _adicionarColisaoFaixaHorizontal(camada, xInicialMundo, xFinalMundo, yMundo) {
    if (!camada) return;

    const inicio = Math.min(xInicialMundo, xFinalMundo);
    const fim = Math.max(xInicialMundo, xFinalMundo);
    const larguraTile = this.mapa?.tileWidth || 16;

    for (let x = inicio; x <= fim; x += larguraTile) {
      const tile = camada.getTileAtWorldXY(x, yMundo, false);
      if (!tile || tile.index === -1) continue;
      tile.setCollision(true, true, true, true);
    }
  }

  _criarHudCidade() {
    // Estado inicial da maquininha (canto e compacta)
    this.hudMargemDireita = 34;
    this.hudMargemBaixo = 44;
    this.hudUiScale = 1 / this.cameras.main.zoom;
    this.hudNoCentro = false;
    this.hudAnimando = false;
    this.hudDebugEnabled = false;
    // Garante que debug de coordenadas nunca aparece
    this.hudDebugForceHide = true;
    this.hudIconBaseScale = 0.45 * this.hudUiScale;
    this.hudIconZoomScale = 1.25 * this.hudUiScale;

    this.hudIcon = this.add
      .image(0, 0, "maquininhaCielo")
      .setScale(this.hudIconBaseScale)
      .setOrigin(0.5)
      .setDepth(200)
      .setInteractive({ useHandCursor: true });

    const closeRadius = 12 * this.hudUiScale;
    this.hudCloseBg = this.add
      .circle(0, 0, closeRadius, 0xcf1f1f, 0.95)
      .setStrokeStyle(Math.max(1, Math.round(2 * this.hudUiScale)), 0x7a0000, 1)
      .setDepth(210)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    const closeFont = Math.max(8, Math.round(14 * this.hudUiScale));
    this.hudCloseTxt = this.add
      .text(0, 0, "X", {
        fontSize: `${closeFont}px`,
        color: "#ffecec",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(211)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    // A HUD não aparece no minimapa
    this.miniMapCam.ignore(this.hudIcon);
    this.borderCam.ignore(this.hudIcon);
    this.miniMapCam.ignore([this.hudCloseBg, this.hudCloseTxt]);
    this.borderCam.ignore([this.hudCloseBg, this.hudCloseTxt]);

    this.hudIcon.on("pointerover", () => {
      if (!this.hudNoCentro && !this.hudAnimando) {
        this.hudIcon.setScale(0.5 * this.hudUiScale);
      }
    });
    this.hudIcon.on("pointerout", () => {
      if (!this.hudNoCentro && !this.hudAnimando) {
        this.hudIcon.setScale(this.hudIconBaseScale);
      }
    });

    this.hudIcon.on("pointerdown", () => {
      if (this.hudAnimando) return;

      if (!this.hudNoCentro) {
        // Primeiro clique: vai para o centro e aumenta
        this.hudAnimando = true;
        const cam = this.cameras.main;

        this.tweens.add({
          targets: this.hudIcon,
          x: cam.worldView.centerX,
          y: cam.worldView.centerY,
          scale: this.hudIconZoomScale,
          duration: 260,
          ease: "Quad.Out",
          onComplete: () => {
            this.hudNoCentro = true;
            this.hudAnimando = false;
          },
        });
        return;
      }

      // Clique no centro: feedback rápido
      this.tweens.add({
        targets: this.hudIcon,
        scale: this.hudIconZoomScale * 1.08,
        duration: 90,
        yoyo: true,
        ease: "Sine.Out",
      });
      console.log("[HUD] Maquininha clicada no centro");
    });

    const fecharHud = () => {
      if (!this.hudNoCentro || this.hudAnimando) return;

      // Retorna para o canto
      this.hudAnimando = true;
      this.hudCloseBg.setVisible(false);
      this.hudCloseTxt.setVisible(false);

      const cam = this.cameras.main;
      const alvoX = cam.worldView.right - this.hudMargemDireita;
      const alvoY = cam.worldView.bottom - this.hudMargemBaixo;

      this.tweens.add({
        targets: this.hudIcon,
        x: alvoX,
        y: alvoY,
        scale: this.hudIconBaseScale,
        duration: 240,
        ease: "Quad.InOut",
        onComplete: () => {
          this.hudNoCentro = false;
          this.hudAnimando = false;
        },
      });
    };

    this.hudCloseBg.on("pointerdown", fecharHud);
    this.hudCloseTxt.on("pointerdown", fecharHud);

    this.hudDebugTxt = this.add
      .text(0, 0, "", {
        fontSize: "16px",
        fontFamily: "monospace",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#000000ee",
        padding: { x: 8, y: 6 },
      })
      .setDepth(1000)
      .setScrollFactor(0)
      .setVisible(false);

    this.hudDebugMarker = this.add
      .text(0, 0, "+", {
        fontSize: "18px",
        fontFamily: "monospace",
        fontStyle: "bold",
        color: "#00ff66",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setDepth(1001)
      .setOrigin(0.5)
      .setVisible(false);

    this.miniMapCam.ignore(this.hudDebugTxt);
    this.borderCam.ignore(this.hudDebugTxt);
    this.miniMapCam.ignore(this.hudDebugMarker);
    this.borderCam.ignore(this.hudDebugMarker);
    this._hudDebugWorldPoint = new Phaser.Math.Vector2();

    // Botao: mapa interativo
    this.hudBotao1Area = this.add
      .image(0, 0, "botaoMapaHud")
      .setDepth(206)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.hudBotao1Glow = this.add
      .rectangle(0, 0, 1, 1, 0x6cc8ff, 0.18)
      .setStrokeStyle(2, 0xcdf0ff, 0.95)
      .setDepth(207)
      .setVisible(false);
    this.hudBotao1OffsetX = 1;
    this.hudBotao1OffsetY = -121;
    this.hudBotao1Largura = 314;
    this.hudBotao1Altura = 56;
    this.hudBotao1Hover = false;

    this.hudBotao1Area.on("pointerover", () => {
      if (!this.hudNoCentro || this.hudAnimando || !this.hudBotao1Glow) {
        return;
      }

      this.hudBotao1Hover = true;
      this.hudBotao1Glow.setVisible(true);
      this.hudBotao1Glow.alpha = 0.22;

      if (this.hudBotao1GlowTween) this.hudBotao1GlowTween.stop();
      this.hudBotao1GlowTween = this.tweens.add({
        targets: this.hudBotao1Glow,
        alpha: { from: 0.22, to: 0.65 },
        duration: 260,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    });

    this.hudBotao1Area.on("pointerout", () => {
      this.hudBotao1Hover = false;
      if (this.hudBotao1GlowTween) {
        this.hudBotao1GlowTween.stop();
        this.hudBotao1GlowTween = null;
      }
      if (this.hudBotao1Glow) this.hudBotao1Glow.setVisible(false);
    });

    this.hudBotao1Area.on("pointerdown", () => {
      if (!this.hudNoCentro || this.hudAnimando || this._elementosConfig) {
        return;
      }

      // Guarda a posicao atual para retornar ao mesmo ponto apos fechar o mapa.
      if (this.personagem) {
        this.registry.set("cidadeRetornoX", this.personagem.x);
        this.registry.set("cidadeRetornoY", this.personagem.y);
      }
      this.registry.set("mapaRetornoCena", "SceneCidade");

      this.registry.events.emit("hud-maquininha-botao", "botao_1");
      if (this.scene.isActive("SceneChuva")) {
        this.scene.stop("SceneChuva");
      }
      this.scene.start("SceneMapaInterativo");
      console.log("[HUD] Botao maquininha clicado: botao_1");
    });

    // Botao: configuracoes
    this.hudBotaoConfigArea = this.add
      .image(0, 0, "botaoConfiguracaoHud")
      .setDepth(206)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.hudBotaoConfigGlow = this.add
      .rectangle(0, 0, 1, 1, 0x6cc8ff, 0.28)
      .setStrokeStyle(2, 0xcdf0ff, 0.95)
      .setDepth(208)
      .setVisible(false);
    this.hudBotaoConfigOffsetX = -22;
    this.hudBotaoConfigOffsetY = 14;
    this.hudBotaoConfigLargura = 250;
    this.hudBotaoConfigAltura = 56;
    this.hudBotaoConfigHover = false;

    this.hudBotaoConfigArea.on("pointerover", () => {
      if (!this.hudNoCentro || this.hudAnimando || !this.hudBotaoConfigGlow) {
        return;
      }

      this.hudBotaoConfigHover = true;
      this.hudBotaoConfigGlow.setVisible(true);
      this.hudBotaoConfigGlow.alpha = 0.28;

      if (this.hudBotaoConfigGlowTween) this.hudBotaoConfigGlowTween.stop();
      this.hudBotaoConfigGlowTween = this.tweens.add({
        targets: this.hudBotaoConfigGlow,
        alpha: { from: 0.28, to: 0.66 },
        duration: 260,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    });

    this.hudBotaoConfigArea.on("pointerout", () => {
      this.hudBotaoConfigHover = false;
      if (this.hudBotaoConfigGlowTween) {
        this.hudBotaoConfigGlowTween.stop();
        this.hudBotaoConfigGlowTween = null;
      }
      if (this.hudBotaoConfigGlow) this.hudBotaoConfigGlow.setVisible(false);
    });

    this.hudBotaoConfigArea.on("pointerdown", () => {
      if (!this.hudNoCentro || this.hudAnimando) return;
      if (this._elementosConfig) return;
      this.registry.events.emit("hud-maquininha-botao", "botao_config");
      this.abrirPopupConfig();
      console.log("[HUD] Botao maquininha clicado: botao_config");
    });

    // Botao: ranking
    this.hudBotaoRankingArea = this.add
      .image(0, 0, "botaoRankingHud")
      .setDepth(206)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.hudBotaoRankingGlow = this.add
      .rectangle(0, 0, 1, 1, 0x6cc8ff, 0.24)
      .setStrokeStyle(2, 0xcdf0ff, 0.95)
      .setDepth(208)
      .setVisible(false);
    this.hudBotaoRankingOffsetX = -54;
    this.hudBotaoRankingOffsetY = -52;
    this.hudBotaoRankingLargura = 198;
    this.hudBotaoRankingAltura = 52;
    this.hudBotaoRankingHover = false;

    this.hudBotaoRankingArea.on("pointerover", () => {
      if (!this.hudNoCentro || this.hudAnimando || !this.hudBotaoRankingGlow) {
        return;
      }

      this.hudBotaoRankingHover = true;
      this.hudBotaoRankingGlow.setVisible(true);
      this.hudBotaoRankingGlow.alpha = 0.24;

      if (this.hudBotaoRankingGlowTween) this.hudBotaoRankingGlowTween.stop();
      this.hudBotaoRankingGlowTween = this.tweens.add({
        targets: this.hudBotaoRankingGlow,
        alpha: { from: 0.24, to: 0.62 },
        duration: 260,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    });

    this.hudBotaoRankingArea.on("pointerout", () => {
      this.hudBotaoRankingHover = false;
      if (this.hudBotaoRankingGlowTween) {
        this.hudBotaoRankingGlowTween.stop();
        this.hudBotaoRankingGlowTween = null;
      }
      if (this.hudBotaoRankingGlow) this.hudBotaoRankingGlow.setVisible(false);
    });

    this.hudBotaoRankingArea.on("pointerdown", () => {
      if (!this.hudNoCentro || this.hudAnimando || this._elementosConfig) {
        return;
      }
      this.registry.events.emit("hud-maquininha-botao", "botao_ranking");
      console.log("[HUD] Botao maquininha clicado: botao_ranking");
    });

    // Botao: missao
    this.hudBotaoMissaoArea = this.add
      .image(0, 0, "botaoMissaoHud")
      .setDepth(206)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.hudBotaoMissaoGlow = this.add
      .rectangle(0, 0, 1, 1, 0x6cc8ff, 0.24)
      .setStrokeStyle(2, 0xcdf0ff, 0.95)
      .setDepth(208)
      .setVisible(false);
    this.hudBotaoMissaoOffsetX = -49;
    this.hudBotaoMissaoOffsetY = 78;
    this.hudBotaoMissaoLargura = 196;
    this.hudBotaoMissaoAltura = 52;
    this.hudBotaoMissaoHover = false;

    this.hudBotaoMissaoArea.on("pointerover", () => {
      if (!this.hudNoCentro || this.hudAnimando || !this.hudBotaoMissaoGlow) {
        return;
      }

      this.hudBotaoMissaoHover = true;
      this.hudBotaoMissaoGlow.setVisible(true);
      this.hudBotaoMissaoGlow.alpha = 0.24;

      if (this.hudBotaoMissaoGlowTween) this.hudBotaoMissaoGlowTween.stop();
      this.hudBotaoMissaoGlowTween = this.tweens.add({
        targets: this.hudBotaoMissaoGlow,
        alpha: { from: 0.24, to: 0.62 },
        duration: 260,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    });

    this.hudBotaoMissaoArea.on("pointerout", () => {
      this.hudBotaoMissaoHover = false;
      if (this.hudBotaoMissaoGlowTween) {
        this.hudBotaoMissaoGlowTween.stop();
        this.hudBotaoMissaoGlowTween = null;
      }
      if (this.hudBotaoMissaoGlow) this.hudBotaoMissaoGlow.setVisible(false);
    });

    this.hudBotaoMissaoArea.on("pointerdown", () => {
      if (this._elementosConfig) {
        return;
      }
      this._alternarPopupListaMissoes();
      this.registry.events.emit("hud-maquininha-botao", "botao_missao");
      console.log("[HUD] Botao maquininha clicado: botao_missao");
    });

    this.miniMapCam.ignore(this.hudBotao1Area);
    this.borderCam.ignore(this.hudBotao1Area);
    this.miniMapCam.ignore(this.hudBotao1Glow);
    this.borderCam.ignore(this.hudBotao1Glow);
    this.miniMapCam.ignore(this.hudBotaoConfigArea);
    this.borderCam.ignore(this.hudBotaoConfigArea);
    this.miniMapCam.ignore(this.hudBotaoConfigGlow);
    this.borderCam.ignore(this.hudBotaoConfigGlow);
    this.miniMapCam.ignore(this.hudBotaoRankingArea);
    this.borderCam.ignore(this.hudBotaoRankingArea);
    this.miniMapCam.ignore(this.hudBotaoRankingGlow);
    this.borderCam.ignore(this.hudBotaoRankingGlow);
    this.miniMapCam.ignore(this.hudBotaoMissaoArea);
    this.borderCam.ignore(this.hudBotaoMissaoArea);
    this.miniMapCam.ignore(this.hudBotaoMissaoGlow);
    this.borderCam.ignore(this.hudBotaoMissaoGlow);

    this._atualizarHudCidade();
  }

  _criarHudCoins() {
    // Saldo de moedas (valor global no registry)
    if (typeof this.registry.get("cieloCoins") === "undefined") {
      this.registry.set("cieloCoins", 0);
    }

    this.hudCoinsUiScale = 1 / this.cameras.main.zoom;
    this.hudCoinsValorAtual = -1;
    this.hudCoinsScale = 0.56 * this.hudCoinsUiScale;
    this.hudCoinsOffsetRight = 106 * this.hudCoinsUiScale;
    this.hudCoinsOffsetTop = 8 * this.hudCoinsUiScale;

    this.hudCoinsBg = this.add
      .image(0, 0, "cieloCoinsHud")
      .setOrigin(1, 0)
      .setScale(this.hudCoinsScale)
      .setDepth(230);

    const coinFont = Math.max(7, Math.round(22 * this.hudCoinsUiScale));
    this.hudCoinsTxt = this.add
      .text(0, 0, "", {
        fontSize: `${coinFont}px`,
        color: "#ffe86b",
        fontStyle: "bold",
        stroke: "#4a2a00",
        strokeThickness: 2,
        resolution: 4,
      })
      .setOrigin(0, 0.5)
      .setDepth(231);

    // HUD de moedas também fica fora do minimapa
    this.miniMapCam.ignore([this.hudCoinsBg, this.hudCoinsTxt]);
    this.borderCam.ignore([this.hudCoinsBg, this.hudCoinsTxt]);

    this._atualizarHudCoins();
  }

  _atualizarHudCidade() {
    if (!this.hudIcon) return;

    const cam = this.cameras.main;
    if (this.hudAnimando) return;

    if (this.hudNoCentro) {
      // Enquanto estiver aberta, acompanha o centro da câmera
      const centerX = cam.worldView.centerX;
      const centerY = cam.worldView.centerY;
      this.hudIcon.setPosition(centerX, centerY);

      const closeOffsetX = 112 * this.hudUiScale;
      const closeOffsetY = 292 * this.hudUiScale;
      this.hudCloseBg
        .setPosition(centerX + closeOffsetX, centerY - closeOffsetY)
        .setVisible(true);
      this.hudCloseTxt
        .setPosition(centerX + closeOffsetX, centerY - closeOffsetY - 1)
        .setVisible(true);
      this._atualizarBotao1Hud(centerX, centerY, true);
      this._atualizarBotaoConfigHud(centerX, centerY, true);
      this._atualizarBotaoRankingHud(centerX, centerY, true);
      this._atualizarBotaoMissaoHud(centerX, centerY, true);
      this._atualizarHudDebugCoords();
      return;
    }

    const hudX = cam.worldView.right - this.hudMargemDireita;
    const hudY = cam.worldView.bottom - this.hudMargemBaixo;
    this.hudIcon.setPosition(hudX, hudY);
    this.hudCloseBg.setVisible(false);
    this.hudCloseTxt.setVisible(false);
    if (this.hudDebugTxt) this.hudDebugTxt.setVisible(false);
    if (this.hudDebugMarker) this.hudDebugMarker.setVisible(false);
    this._atualizarBotao1Hud(hudX, hudY, false);
    this._atualizarBotaoConfigHud(hudX, hudY, false);
    this._atualizarBotaoRankingHud(hudX, hudY, false);
    this._atualizarBotaoMissaoHud(hudX, hudY, false);
  }

  _atualizarBotao1Hud(centerX, centerY, visivel) {
    // Atualiza tamanho/posicao/interacao do botao de mapa.
    if (!this.hudBotao1Area) return;

    const largura = this.hudBotao1Largura * this.hudUiScale;
    const altura = this.hudBotao1Altura * this.hudUiScale;
    const posX = centerX + this.hudBotao1OffsetX * this.hudUiScale;
    const posY = centerY + this.hudBotao1OffsetY * this.hudUiScale;

    this.hudBotao1Area
      .setDisplaySize(largura, altura)
      .setPosition(posX, posY)
      .setVisible(visivel);

    if (this.hudBotao1Glow) {
      this.hudBotao1Glow
        .setSize(largura, altura)
        .setPosition(posX, posY)
        .setVisible(visivel && this.hudBotao1Hover);
    }

    if (this.hudBotao1Area.input) {
      this.hudBotao1Area.input.enabled = visivel;
    }

    if (!visivel) {
      this.hudBotao1Hover = false;
      if (this.hudBotao1GlowTween) {
        this.hudBotao1GlowTween.stop();
        this.hudBotao1GlowTween = null;
      }
      if (this.hudBotao1Glow) this.hudBotao1Glow.setVisible(false);
    }
  }

  _atualizarBotaoConfigHud(centerX, centerY, visivel) {
    // Atualiza tamanho/posicao/interacao do botao de configuracoes.
    if (!this.hudBotaoConfigArea) return;

    const largura = this.hudBotaoConfigLargura * this.hudUiScale;
    const altura = this.hudBotaoConfigAltura * this.hudUiScale;
    const posX = centerX + this.hudBotaoConfigOffsetX * this.hudUiScale;
    const posY = centerY + this.hudBotaoConfigOffsetY * this.hudUiScale;

    this.hudBotaoConfigArea
      .setDisplaySize(largura, altura)
      .setPosition(posX, posY)
      .setVisible(visivel);

    if (this.hudBotaoConfigGlow) {
      this.hudBotaoConfigGlow
        .setSize(largura, altura)
        .setPosition(posX, posY)
        .setVisible(visivel && this.hudBotaoConfigHover);
    }

    if (this.hudBotaoConfigArea.input) {
      this.hudBotaoConfigArea.input.enabled = visivel;
    }

    if (!visivel) {
      this.hudBotaoConfigHover = false;
      if (this.hudBotaoConfigGlowTween) {
        this.hudBotaoConfigGlowTween.stop();
        this.hudBotaoConfigGlowTween = null;
      }
      if (this.hudBotaoConfigGlow) this.hudBotaoConfigGlow.setVisible(false);
    }
  }

  _atualizarBotaoRankingHud(centerX, centerY, visivel) {
    // Atualiza tamanho/posicao/interacao do botao de ranking.
    if (!this.hudBotaoRankingArea) return;

    const largura = this.hudBotaoRankingLargura * this.hudUiScale;
    const altura = this.hudBotaoRankingAltura * this.hudUiScale;
    const posX = centerX + this.hudBotaoRankingOffsetX * this.hudUiScale;
    const posY = centerY + this.hudBotaoRankingOffsetY * this.hudUiScale;

    this.hudBotaoRankingArea
      .setDisplaySize(largura, altura)
      .setPosition(posX, posY)
      .setVisible(visivel);

    if (this.hudBotaoRankingGlow) {
      this.hudBotaoRankingGlow
        .setSize(largura, altura)
        .setPosition(posX, posY)
        .setVisible(visivel && this.hudBotaoRankingHover);
    }

    if (this.hudBotaoRankingArea.input) {
      this.hudBotaoRankingArea.input.enabled = visivel;
    }

    if (!visivel) {
      this.hudBotaoRankingHover = false;
      if (this.hudBotaoRankingGlowTween) {
        this.hudBotaoRankingGlowTween.stop();
        this.hudBotaoRankingGlowTween = null;
      }
      if (this.hudBotaoRankingGlow) this.hudBotaoRankingGlow.setVisible(false);
    }
  }

  _atualizarBotaoMissaoHud(centerX, centerY, visivel) {
    // Atualiza tamanho/posicao/interacao do botao de missao.
    if (!this.hudBotaoMissaoArea) return;

    const largura = this.hudBotaoMissaoLargura * this.hudUiScale;
    const altura = this.hudBotaoMissaoAltura * this.hudUiScale;
    const posX = centerX + this.hudBotaoMissaoOffsetX * this.hudUiScale;
    const posY = centerY + this.hudBotaoMissaoOffsetY * this.hudUiScale;

    this.hudBotaoMissaoArea
      .setDisplaySize(largura, altura)
      .setPosition(posX, posY)
      .setVisible(visivel);

    if (this.hudBotaoMissaoGlow) {
      this.hudBotaoMissaoGlow
        .setSize(largura, altura)
        .setPosition(posX, posY)
        .setVisible(visivel && this.hudBotaoMissaoHover);
    }

    if (this.hudBotaoMissaoArea.input) {
      this.hudBotaoMissaoArea.input.enabled = visivel;
    }

    if (!visivel) {
      this.hudBotaoMissaoHover = false;
      if (this.hudBotaoMissaoGlowTween) {
        this.hudBotaoMissaoGlowTween.stop();
        this.hudBotaoMissaoGlowTween = null;
      }
      if (this.hudBotaoMissaoGlow) this.hudBotaoMissaoGlow.setVisible(false);
    }
  }

  _atualizarHudDebugCoords() {
    if (!this.hudDebugTxt || !this.hudIcon || !this._hudDebugWorldPoint) return;
    // Força ocultação do debug de coordenadas
    if (
      this.hudDebugForceHide ||
      !this.hudDebugEnabled ||
      !this.hudNoCentro ||
      this.hudAnimando
    ) {
      this.hudDebugTxt.setVisible(false);
      if (this.hudDebugMarker) this.hudDebugMarker.setVisible(false);
      return;
    }

    const pointer = this.input.activePointer;
    if (!pointer) {
      this.hudDebugTxt.setVisible(false);
      if (this.hudDebugMarker) this.hudDebugMarker.setVisible(false);
      return;
    }

    pointer.positionToCamera(this.cameras.main, this._hudDebugWorldPoint);

    const localX =
      (this._hudDebugWorldPoint.x - this.hudIcon.x) / this.hudUiScale;
    const localY =
      (this._hudDebugWorldPoint.y - this.hudIcon.y) / this.hudUiScale;

    this.hudDebugLocalX = Math.round(localX);
    this.hudDebugLocalY = Math.round(localY);

    this.hudDebugTxt
      .setText(
        `HUD local\nX: ${this.hudDebugLocalX}  Y: ${this.hudDebugLocalY}`,
      )
      .setPosition(14, 140)
      .setVisible(true);

    if (this.hudDebugMarker) {
      this.hudDebugMarker
        .setPosition(this._hudDebugWorldPoint.x, this._hudDebugWorldPoint.y)
        .setVisible(true);
    }
  }

  _atualizarHudCoins() {
    if (!this.hudCoinsBg || !this.hudCoinsTxt) return;

    const cam = this.cameras.main;
    const posX = cam.worldView.right - this.hudCoinsOffsetRight;
    const posY = cam.worldView.top + this.hudCoinsOffsetTop;

    this.hudCoinsBg.setPosition(posX, posY);

    const txtX = posX + 14 * this.hudCoinsUiScale;
    const txtY = posY + this.hudCoinsBg.displayHeight * 0.5;
    this.hudCoinsTxt.setPosition(txtX, txtY);

    const bruto = Number(this.registry.get("cieloCoins") ?? 0);
    const saldo = Number.isFinite(bruto) ? Math.max(0, Math.floor(bruto)) : 0;
    if (saldo !== this.hudCoinsValorAtual) {
      this.hudCoinsValorAtual = saldo;
      this.hudCoinsTxt.setText(`${saldo}`);
    }
  }

  _criarPopupMissaoCidade() {
    if (
      typeof this.registry.get("missaoCidadeId") === "undefined" &&
      !Number.isFinite(this.missaoCidadeIdCustom)
    ) {
      this.registry.set("missaoCidadeId", 1);
    }

    if (Number.isFinite(this.missaoCidadeIdCustom)) {
      this.registry.set("missaoCidadeId", this.missaoCidadeIdCustom);
    }

    if (this.missaoCidadeTextoCustom) {
      this.registry.set("missaoCidadeTexto", this.missaoCidadeTextoCustom);
    }

    this.popupMissaoUiScale = 1 / this.cameras.main.zoom;
    this.popupMissaoOffsetTopo = 102 * this.popupMissaoUiScale;

    const cam = this.cameras.main;
    const popupY = cam.worldView.top + this.popupMissaoOffsetTopo;
    const popupX = cam.worldView.centerX;

    this.missaoCidadeBg = this.add
      .rectangle(popupX, popupY, 360, 56, 0x000000, 0.62)
      .setDepth(240)
      .setScale(this.popupMissaoUiScale);

    this.missaoCidadeTexto = this.add
      .text(popupX, popupY, "", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(241)
      .setScale(this.popupMissaoUiScale);

    this.miniMapCam.ignore([this.missaoCidadeBg, this.missaoCidadeTexto]);
    this.borderCam.ignore([this.missaoCidadeBg, this.missaoCidadeTexto]);

    this._atualizarPopupMissaoCidade(true);
    if (this.destacarMissaoCidadeNoInicio) {
      this._destacarPopupMissaoCidadeTemporario();
    }
    if (this.limparDestaqueMissaoCidadeAoRetornarDoMapa) {
      this._removerDestaquePopupMissaoCidade();
      this.registry.set("limparDestaqueMissaoCidadeAoRetornarDoMapa", false);
    }
    this._criarPopupListaMissoes();
    this._sincronizarPopupListaMissoes();

    this._onMissaoCidadeMudou = () => {
      this._atualizarPopupMissaoCidade(true);
      this._sincronizarPopupListaMissoes();
    };
    this.registry.events.on(
      "changedata-missaoCidadeId",
      this._onMissaoCidadeMudou,
      this,
    );
    this.registry.events.on(
      "changedata-missaoCidadeTexto",
      this._onMissaoCidadeMudou,
      this,
    );
    this.registry.events.on(
      "changedata-ag01_dialogo_pj_concluido",
      this._onMissaoCidadeMudou,
      this,
    );
    this.registry.events.on(
      "changedata-ag01_pj_retorno",
      this._onMissaoCidadeMudou,
      this,
    );
    this.registry.events.on(
      "changedata-padaria_dialogo_concluido",
      this._onMissaoCidadeMudou,
      this,
    );
    this.registry.events.on(
      "changedata-escritorio_dialogo_concluido",
      this._onMissaoCidadeMudou,
      this,
    );

    this.events.once("shutdown", () => {
      this.registry.events.off(
        "changedata-missaoCidadeId",
        this._onMissaoCidadeMudou,
        this,
      );
      this.registry.events.off(
        "changedata-missaoCidadeTexto",
        this._onMissaoCidadeMudou,
        this,
      );
      this.registry.events.off(
        "changedata-ag01_dialogo_pj_concluido",
        this._onMissaoCidadeMudou,
        this,
      );
      this.registry.events.off(
        "changedata-ag01_pj_retorno",
        this._onMissaoCidadeMudou,
        this,
      );
      this.registry.events.off(
        "changedata-padaria_dialogo_concluido",
        this._onMissaoCidadeMudou,
        this,
      );
      this.registry.events.off(
        "changedata-escritorio_dialogo_concluido",
        this._onMissaoCidadeMudou,
        this,
      );
      if (this.missaoCidadeTimer) {
        this.missaoCidadeTimer.remove();
        this.missaoCidadeTimer = null;
      }
      if (this.missaoCidadeDestaqueTweenBg) {
        this.missaoCidadeDestaqueTweenBg.stop();
        this.missaoCidadeDestaqueTweenBg = null;
      }
      if (this.missaoCidadeDestaqueTweenTxt) {
        this.missaoCidadeDestaqueTweenTxt.stop();
        this.missaoCidadeDestaqueTweenTxt = null;
      }
      if (this.missaoCidadeDestaqueTimer) {
        this.missaoCidadeDestaqueTimer.remove();
        this.missaoCidadeDestaqueTimer = null;
      }
      if (this.missaoCidadeExclamacao) {
        this.missaoCidadeExclamacao.destroy();
        this.missaoCidadeExclamacao = null;
      }
      this._destruirPopupListaMissoes();
      this.fecharPopupConfig();
    });
  }

  _criarPopupListaMissoes() {
    const uiScale = 1 / this.cameras.main.zoom;
    const cam = this.cameras.main;
    const popupX = cam.worldView.centerX;
    const popupY = cam.worldView.top + 214 * uiScale;

    this.popupListaMissoesUiScale = uiScale;
    this.popupListaMissoesOffsetTopo = 214 * uiScale;
    this.popupListaMissoesAberto = false;

    this.popupListaMissoesBg = this.add
      .rectangle(popupX, popupY, 760, 430, 0x020914, 0.9)
      .setStrokeStyle(2, 0x2a5ba0, 0.95)
      .setDepth(260)
      .setScale(uiScale)
      .setVisible(false);

    this.popupListaMissoesTitulo = this.add
      .text(popupX, popupY - 182 * uiScale, "Diario de Missoes", {
        fontSize: "24px",
        color: "#e6f2ff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(261)
      .setScale(uiScale)
      .setVisible(false);

    this.popupListaMissoesTexto = this.add
      .text(popupX - 340 * uiScale, popupY - 146 * uiScale, "", {
        fontSize: "19px",
        color: "#d8e7ff",
        lineSpacing: 8,
        wordWrap: { width: 680 },
      })
      .setOrigin(0, 0)
      .setDepth(261)
      .setScale(uiScale)
      .setVisible(false);

    this.popupListaMissoesHint = this.add
      .text(popupX, popupY + 184 * uiScale, "Use o X para fechar", {
        fontSize: "16px",
        color: "#9bbce6",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setDepth(261)
      .setScale(uiScale)
      .setVisible(false);

    this.popupListaMissoesFecharBg = this.add
      .rectangle(
        popupX + 338 * uiScale,
        popupY - 182 * uiScale,
        34,
        34,
        0x17304d,
        0.95,
      )
      .setStrokeStyle(1, 0x9bc9ff, 0.95)
      .setDepth(262)
      .setScale(uiScale)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.popupListaMissoesFecharTxt = this.add
      .text(popupX + 338 * uiScale, popupY - 182 * uiScale, "X", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(263)
      .setScale(uiScale)
      .setVisible(false);

    this.popupListaMissoesFecharBg.on("pointerdown", () => {
      this.popupListaMissoesAberto = false;
      this.popupListaMissoesBg?.setVisible(false);
      this.popupListaMissoesTitulo?.setVisible(false);
      this.popupListaMissoesTexto?.setVisible(false);
      this.popupListaMissoesHint?.setVisible(false);
      this.popupListaMissoesFecharBg?.setVisible(false);
      this.popupListaMissoesFecharTxt?.setVisible(false);
    });

    this.miniMapCam.ignore([
      this.popupListaMissoesBg,
      this.popupListaMissoesTitulo,
      this.popupListaMissoesTexto,
      this.popupListaMissoesHint,
      this.popupListaMissoesFecharBg,
      this.popupListaMissoesFecharTxt,
    ]);
    this.borderCam.ignore([
      this.popupListaMissoesBg,
      this.popupListaMissoesTitulo,
      this.popupListaMissoesTexto,
      this.popupListaMissoesHint,
      this.popupListaMissoesFecharBg,
      this.popupListaMissoesFecharTxt,
    ]);
  }

  _destruirPopupListaMissoes() {
    const elementos = [
      this.popupListaMissoesBg,
      this.popupListaMissoesTitulo,
      this.popupListaMissoesTexto,
      this.popupListaMissoesHint,
      this.popupListaMissoesFecharBg,
      this.popupListaMissoesFecharTxt,
    ];
    elementos.forEach((el) => el?.destroy?.());

    this.popupListaMissoesBg = null;
    this.popupListaMissoesTitulo = null;
    this.popupListaMissoesTexto = null;
    this.popupListaMissoesHint = null;
    this.popupListaMissoesFecharBg = null;
    this.popupListaMissoesFecharTxt = null;
    this.popupListaMissoesAberto = false;
  }

  _construirListaMissoesCidade() {
    const dialogoPJConcluido =
      this.registry.get("ag01_dialogo_pj_concluido") === true;
    const guiouAtePadaria = this.registry.get("ag01_pj_retorno") === true;
    const dialogoPadariaConcluido =
      this.registry.get("padaria_dialogo_concluido") === true;
    const dialogoEscritorioConcluido =
      this.registry.get("escritorio_dialogo_concluido") === true;

    return [
      {
        texto: "Onboarding na Agencia 01 (GG + PJ)",
        status: dialogoPJConcluido ? "concluida" : "pendente",
      },
      {
        texto: "Siga o PJ ate a Padaria",
        status: guiouAtePadaria
          ? "concluida"
          : dialogoPJConcluido
            ? "em_andamento"
            : "pendente",
      },
      {
        texto: "Concluir atendimento na Padaria",
        status: dialogoPadariaConcluido
          ? "concluida"
          : guiouAtePadaria
            ? "em_andamento"
            : "pendente",
      },
      {
        texto: "Ir ate o Escritorio e fazer o atendimento",
        status: dialogoEscritorioConcluido
          ? "concluida"
          : dialogoPadariaConcluido
            ? "em_andamento"
            : "pendente",
      },
    ];
  }

  _formatarListaMissoesCidade() {
    const lista = this._construirListaMissoesCidade();
    return lista
      .map((item, idx) => {
        const marcador = item.status === "concluida" ? "✓ " : "";
        return `${idx + 1}. ${marcador}${item.texto}`;
      })
      .join("\n\n");
  }

  _sincronizarPopupListaMissoes() {
    if (!this.popupListaMissoesTexto) return;
    this.popupListaMissoesTexto.setText(this._formatarListaMissoesCidade());
  }

  _alternarPopupListaMissoes() {
    if (!this.popupListaMissoesBg) {
      this._criarPopupListaMissoes();
      this._sincronizarPopupListaMissoes();
    }

    const abrir = !this.popupListaMissoesAberto;
    this.popupListaMissoesAberto = abrir;

    if (abrir) this._sincronizarPopupListaMissoes();

    this.popupListaMissoesBg?.setVisible(abrir);
    this.popupListaMissoesTitulo?.setVisible(abrir);
    this.popupListaMissoesTexto?.setVisible(abrir);
    this.popupListaMissoesHint?.setVisible(abrir);
    this.popupListaMissoesFecharBg?.setVisible(abrir);
    this.popupListaMissoesFecharTxt?.setVisible(abrir);
  }

  _reposicionarPopupListaMissoes() {
    if (!this.popupListaMissoesBg) return;
    const cam = this.cameras.main;
    const popupX = cam.worldView.centerX;
    const popupY = cam.worldView.top + this.popupListaMissoesOffsetTopo;

    this.popupListaMissoesBg.setPosition(popupX, popupY);
    this.popupListaMissoesTitulo.setPosition(
      popupX,
      popupY - 182 * this.popupListaMissoesUiScale,
    );
    this.popupListaMissoesTexto.setPosition(
      popupX - 340 * this.popupListaMissoesUiScale,
      popupY - 146 * this.popupListaMissoesUiScale,
    );
    this.popupListaMissoesHint.setPosition(
      popupX,
      popupY + 184 * this.popupListaMissoesUiScale,
    );
    this.popupListaMissoesFecharBg.setPosition(
      popupX + 338 * this.popupListaMissoesUiScale,
      popupY - 182 * this.popupListaMissoesUiScale,
    );
    this.popupListaMissoesFecharTxt.setPosition(
      popupX + 338 * this.popupListaMissoesUiScale,
      popupY - 182 * this.popupListaMissoesUiScale,
    );
  }

  abrirPopupConfig() {
    if (this._elementosConfig) return;

    this._elementosConfig = abrirPopupConfigModule(this, {
      depth: 300,
      scrollFactor: 0,
      onFechar: () => {
        this._elementosConfig = null;
      },
    });

    // Reducao visual do popup mantendo proporcoes e centro da tela.
    const escalaPopup = 0.35;
    const centroX = this.scale.width / 2;
    const centroY = this.scale.height / 2;

    this._elementosConfig.forEach((el) => {
      if (el && el.active && typeof el.setScale === "function") {
        const novoX = centroX + (el.x - centroX) * escalaPopup;
        const novoY = centroY + (el.y - centroY) * escalaPopup;
        if (typeof el.setPosition === "function") {
          el.setPosition(novoX, novoY);
        }
        el.setScale(escalaPopup);
      }
    });
  }

  fecharPopupConfig() {
    if (!this._elementosConfig) return;
    this._elementosConfig.forEach((el) => {
      if (el && el.active) el.destroy();
    });
    this._elementosConfig = null;
  }

  _textoMissaoCidadePorId(id) {
    const missoes = {
      1: "Missão: Vá até a Agência e fale com o gerente",
      2: "Missao: Fale com o atendente para iniciar o atendimento.",
      3: "Missao: Va para a Padaria e converse com o comerciante.",
      4: "Missao: Confira seu saldo de Cielo Coins na cidade.",
    };

    return (
      missoes[id] || "Missao: Explore a cidade e conclua seu proximo objetivo."
    );
  }

  _resolverTextoMissaoCidade() {
    const textoCustom = this.registry.get("missaoCidadeTexto");
    if (typeof textoCustom === "string" && textoCustom.trim()) {
      return textoCustom.trim();
    }

    const idBruto = this.registry.get("missaoCidadeId");
    const id = Number.isFinite(Number(idBruto))
      ? Math.floor(Number(idBruto))
      : 1;

    return this._textoMissaoCidadePorId(id);
  }

  _medirLarguraPopupMissaoCidade(texto) {
    const medidor = this.add.text(-9999, -9999, texto, {
      fontSize: "24px",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });
    const largura = medidor.displayWidth + 64;
    medidor.destroy();
    return Phaser.Math.Clamp(largura, 340, this.scale.width - 40);
  }

  _atualizarPopupMissaoCidade(animarTexto) {
    if (!this.missaoCidadeBg || !this.missaoCidadeTexto) return;

    const texto = this._resolverTextoMissaoCidade();
    if (!texto) return;

    const larguraFinal = this._medirLarguraPopupMissaoCidade(texto);
    this.missaoCidadeBg.setSize(larguraFinal, this.missaoCidadeBg.height);

    if (this.missaoCidadeMensagemAtual === texto && !animarTexto) return;
    this.missaoCidadeMensagemAtual = texto;

    if (this.missaoCidadeTimer) {
      this.missaoCidadeTimer.remove();
      this.missaoCidadeTimer = null;
    }

    if (!animarTexto) {
      this.missaoCidadeTexto.setText(texto);
      return;
    }

    let charIndex = 0;
    this.missaoCidadeTexto.setText("");
    this.missaoCidadeTimer = this.time.addEvent({
      delay: 35,
      repeat: texto.length - 1,
      callback: () => {
        charIndex++;
        this.missaoCidadeTexto.setText(texto.substring(0, charIndex));
      },
    });
  }

  _destacarPopupMissaoCidadeTemporario() {
    if (!this.missaoCidadeBg || !this.missaoCidadeTexto) return;

    this._removerDestaquePopupMissaoCidade();

    this.missaoCidadeExclamacao = this.add
      .text(
        this.missaoCidadeBg.x +
          this.missaoCidadeBg.width * 0.5 +
          14 * this.popupMissaoUiScale,
        this.missaoCidadeBg.y,
        "!",
        {
          fontSize: "24px",
          color: "#ffeb3b",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 2,
        },
      )
      .setDepth(242)
      .setScale(this.popupMissaoUiScale)
      .setOrigin(0.5);

    this.missaoCidadeDestaqueTweenBg = this.tweens.add({
      targets: this.missaoCidadeBg,
      alpha: { from: 0.62, to: 1 },
      duration: 260,
      yoyo: true,
      repeat: -1,
    });

    this.missaoCidadeDestaqueTweenTxt = this.tweens.add({
      targets: [this.missaoCidadeTexto, this.missaoCidadeExclamacao],
      alpha: { from: 1, to: 0.25 },
      duration: 260,
      yoyo: true,
      repeat: -1,
    });
  }

  _removerDestaquePopupMissaoCidade() {
    if (this.missaoCidadeDestaqueTweenBg) {
      this.missaoCidadeDestaqueTweenBg.stop();
      this.missaoCidadeDestaqueTweenBg = null;
    }
    if (this.missaoCidadeDestaqueTweenTxt) {
      this.missaoCidadeDestaqueTweenTxt.stop();
      this.missaoCidadeDestaqueTweenTxt = null;
    }
    if (this.missaoCidadeDestaqueTimer) {
      this.missaoCidadeDestaqueTimer.remove();
      this.missaoCidadeDestaqueTimer = null;
    }
    if (this.missaoCidadeBg) {
      this.missaoCidadeBg.setAlpha(0.62);
    }
    if (this.missaoCidadeTexto) {
      this.missaoCidadeTexto.setAlpha(1);
    }
    if (this.missaoCidadeExclamacao) {
      this.missaoCidadeExclamacao.destroy();
      this.missaoCidadeExclamacao = null;
    }
  }

  _reposicionarPopupMissaoCidade() {
    if (!this.missaoCidadeBg || !this.missaoCidadeTexto) return;
    const cam = this.cameras.main;
    const popupX = cam.worldView.centerX;
    const popupY = cam.worldView.top + this.popupMissaoOffsetTopo;
    this.missaoCidadeBg.setX(popupX);
    this.missaoCidadeBg.setY(popupY);
    this.missaoCidadeTexto.setX(popupX);
    this.missaoCidadeTexto.setY(popupY);

    if (this.missaoCidadeExclamacao) {
      this.missaoCidadeExclamacao.setPosition(
        popupX + this.missaoCidadeBg.width * 0.5 + 14 * this.popupMissaoUiScale,
        popupY,
      );
    }
  }

  _abrirPopupDespedidaAgencia02() {
    if (this.pjPopupAgencia02Ativo) return;
    this.pjPopupAgencia02Ativo = true;

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const mensagem =
      "Missão concluída! Foi incrível te acompanhar. Avance para a próxima agência e continue evoluindo na sua jornada de vendas.";

    this.popupDespedidaAgencia02Bg = this.add
      .image(cx, cy, "falaTheo")
      .setDisplaySize(390, 150)
      .setDepth(260)
      .setScrollFactor(0);

    const iW = this.popupDespedidaAgencia02Bg.displayWidth;
    const iH = this.popupDespedidaAgencia02Bg.displayHeight;

    this.popupDespedidaAgencia02Texto = this.add
      .text(cx - iW * 0.12, cy - iH * 0.06, "", {
        fontSize: "13px",
        color: "#000000",
        stroke: "#000000",
        strokeThickness: 1,
        wordWrap: { width: iW * 0.58, useAdvancedWrap: true },
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(261)
      .setScrollFactor(0);

    this.popupDespedidaAgencia02Botao = this.add
      .text(cx, cy + iH * 0.27, "  Continuar  ", {
        fontSize: "12px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#3a7bd5",
        padding: { x: 8, y: 4 },
        stroke: "#1a4fa0",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(262)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.popupDespedidaAgencia02Botao.on("pointerover", () =>
      this.popupDespedidaAgencia02Botao.setStyle({
        backgroundColor: "#1a55b8",
        color: "#ffffff",
      }),
    );
    this.popupDespedidaAgencia02Botao.on("pointerout", () =>
      this.popupDespedidaAgencia02Botao.setStyle({
        backgroundColor: "#3a7bd5",
        color: "#ffffff",
      }),
    );

    this.popupDespedidaAgencia02Botao.on("pointerdown", () => {
      this._fecharPopupDespedidaAgencia02();
    });

    let charIndex = 0;
    this.popupDespedidaAgencia02Timer = this.time.addEvent({
      delay: 45,
      repeat: mensagem.length - 1,
      callback: () => {
        charIndex++;
        this.popupDespedidaAgencia02Texto.setText(
          mensagem.substring(0, charIndex),
        );

        if (charIndex >= mensagem.length) {
          this.popupDespedidaAgencia02Botao.setVisible(true);
          this.input.keyboard.once("keydown-ENTER", () => {
            if (this.pjPopupAgencia02Ativo) {
              this._fecharPopupDespedidaAgencia02();
            }
          });
        }
      },
    });
  }

  _fecharPopupDespedidaAgencia02() {
    if (!this.pjPopupAgencia02Ativo) return;
    this.pjPopupAgencia02Ativo = false;
    this.pjDespedidaAgencia02Feita = true;
    this.pjAguardandoDespedidaAgencia02 = false;
    this.registry.set("ag01_pj_retorno", true);
    this.registry.set("ag01_escolta_pj_agencia2", false);

    if (this.exclamacaoPjAgencia02) {
      this.exclamacaoPjAgencia02.destroy();
      this.exclamacaoPjAgencia02 = null;
    }

    if (this.labelTheoGuia) {
      this.labelTheoGuia.setVisible(false);
    }

    if (this.popupDespedidaAgencia02Timer) {
      this.popupDespedidaAgencia02Timer.remove();
      this.popupDespedidaAgencia02Timer = null;
    }

    if (this.popupDespedidaAgencia02Botao) {
      this.popupDespedidaAgencia02Botao.destroy();
      this.popupDespedidaAgencia02Botao = null;
    }
    if (this.popupDespedidaAgencia02Texto) {
      this.popupDespedidaAgencia02Texto.destroy();
      this.popupDespedidaAgencia02Texto = null;
    }
    if (this.popupDespedidaAgencia02Bg) {
      this.popupDespedidaAgencia02Bg.destroy();
      this.popupDespedidaAgencia02Bg = null;
    }

    if (this.npcTheoGuia) {
      this.npcTheoGuia.setVisible(false);
    }
  }

  // Atualiza movimento, zonas e transições
  _atualizarSetaAtual() {
    if (!this.setasGuia) return;

    Object.values(this.setasGuia).forEach((seta) => {
      if (seta) seta.setVisible(false);
    });

    const nomeSetaAtual = this.sequenciaSetas[this.indiceSetaAtual];
    const setaAtual = this.setasGuia[nomeSetaAtual];
    if (setaAtual) setaAtual.setVisible(true);
  }

  _avancarSequenciaSetas(localAtual) {
    const localEsperado = this.sequenciaSetas[this.indiceSetaAtual];
    if (localAtual !== localEsperado) return;

    this.indiceSetaAtual += 1;
    this.registry.set("sequenciaSetaCidade", this.indiceSetaAtual);
    this.registry.set("ocultarSetaAgencia01", this.indiceSetaAtual > 0);
  }

  _podeEntrarNoEstabelecimento(alvo) {
    if (
      alvo === "agencia2" &&
      (this.pjAguardandoDespedidaAgencia02 || this.pjDespedidaAgencia02Feita)
    ) {
      return true;
    }

    if (alvo === "cabeleireiro" && this.registry.get("ag02_pj_retorno") === true) {
      return true;
    }

    if (
      alvo === "restaurante" &&
      this.registry.get("ag02_pj_restaurante_retorno") === true
    ) {
      return true;
    }

    if (
      alvo === "supermercado" &&
      (this.registry.get("ag02_pj_supermercado_retorno") === true ||
        (this.pjDestinoAtual === "supermercado" && this.pjChegouDestinoRota))
    ) {
      return true;
    }

    if (
      alvo === "metro" &&
      (this.registry.get("ag02_pj_metro_retorno") === true ||
        (this.pjDestinoAtual === "metro" && this.pjChegouDestinoRota))
    ) {
      return true;
    }

    const localEsperado = this.sequenciaSetas[this.indiceSetaAtual];
    if (alvo !== localEsperado) return false;

    const destinoPorAlvo = {
      padaria: "padaria",
      farmacia: "farmacia",
      agencia2: "agencia2",
      cabeleireiro: "loja_roupas",
      metro: "metro",
      restaurante: "restaurante",
      supermercado: "supermercado",
    };

    const destinoRelacionado = destinoPorAlvo[alvo];
    if (!destinoRelacionado) return true;

    // Para destinos guiados pelo PJ, so libera quando o guia realmente chegar.
    if (
      this.pjDestinoAtual === destinoRelacionado &&
      !this.pjChegouDestinoRota
    ) {
      return false;
    }

    return true;
  }

  _atualizarAcompanhamentoPJCidade() {
    if (!this.pjAcompanhandoAgencia2 || !this.npcTheoGuia || !this.personagem)
      return;

    const pontoAtual = this.pjRotaWaypoints[this.pjRotaIndiceAtual];
    if (!pontoAtual) {
      this.npcTheoGuia.body?.setVelocity(0, 0);
      this.pjChegouDestinoRota = true;
      return;
    }

    const chegouNaPadariaComPj =
      this.pjDestinoAtual === "padaria" && this.pjChegouDestinoRota;

    if (chegouNaPadariaComPj) {
      // O PJ espera na padaria até o jogador sair
      this.pjAguardandoPadaria = true;
      this.pjAcompanhandoAgencia2 = false;
      this.pjAcompanhamentoEncerrado = true;
      this.registry.set("ag01_escolta_pj_agencia2", false);
      this.registry.set("ag01_pj_retorno", true);

      if (this.npcTheoGuia.body) {
        this.npcTheoGuia.body.setVelocity(0, 0);
        this.npcTheoGuia.body.enable = false;
      }
      this.npcTheoGuia.setVisible(true);
      if (this.labelTheoGuia)
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Estou esperando você na Padaria]");
      return;
    }

    const chegouNaAgencia02ComPj =
      this.pjDestinoAtual === "agencia2" && this.pjChegouDestinoRota;

    if (chegouNaAgencia02ComPj && !this.pjDespedidaAgencia02Feita) {
      this.pjAcompanhandoAgencia2 = false;
      this.pjAcompanhamentoEncerrado = true;
      this.pjAguardandoDespedidaAgencia02 = true;
      this.registry.set("ag01_escolta_pj_agencia2", false);
      this.registry.set("ag01_pj_retorno", false);

      if (this.npcTheoGuia.body) {
        this.npcTheoGuia.body.setVelocity(0, 0);
        this.npcTheoGuia.body.enable = false;
      }

      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[E] Falar")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }

      if (!this.exclamacaoPjAgencia02) {
        this.exclamacaoPjAgencia02 = this.add
          .text(this.npcTheoGuia.x, this.npcTheoGuia.y - 40, "!", {
            fontSize: "18px",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 3,
            backgroundColor: "#cc0000cc",
            padding: { x: 4, y: 1 },
            resolution: 4,
          })
          .setDepth(25)
          .setOrigin(0.5)
          .setVisible(true);
      } else {
        this.exclamacaoPjAgencia02
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 40)
          .setVisible(true);
      }

      return;
    }

    const chegouNoSalaoComPj =
      this.pjDestinoAtual === "loja_roupas" && this.pjChegouDestinoRota;

    if (chegouNoSalaoComPj && !this.pjDespedidaSalaoFeita) {
      this.pjDespedidaSalaoFeita = true;
      this.pjAcompanhandoAgencia2 = false;
      this.pjAcompanhamentoEncerrado = true;
      this.registry.set("ag02_escolta_pj_salao", false);
      this.registry.set("ag02_pj_retorno", true);

      if (this.npcTheoGuia.body) {
        this.npcTheoGuia.body.setVelocity(0, 0);
        this.npcTheoGuia.body.enable = false;
      }

      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Estou esperando você na Loja de Roupas]")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }
      return;
    }

    const chegouNoMetroComPj =
      this.pjDestinoAtual === "metro" && this.pjChegouDestinoRota;

    if (chegouNoMetroComPj) {
      this.pjAcompanhandoAgencia2 = false;
      this.pjAcompanhamentoEncerrado = true;
      this.registry.set("ag02_escolta_pj_metro", false);
      this.registry.set("ag02_pj_metro_retorno", true);

      if (this.npcTheoGuia.body) {
        this.npcTheoGuia.body.setVelocity(0, 0);
        this.npcTheoGuia.body.enable = false;
      }

      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Chegamos. Entre no Metrô]")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }
      return;
    }

    const chegouNoRestauranteComPj =
      this.pjDestinoAtual === "restaurante" && this.pjChegouDestinoRota;

    if (chegouNoRestauranteComPj) {
      this.pjAcompanhandoAgencia2 = false;
      this.pjAcompanhamentoEncerrado = true;
      this.registry.set("ag02_escolta_pj_restaurante", false);
      this.registry.set("ag02_pj_restaurante_retorno", true);

      if (this.npcTheoGuia.body) {
        this.npcTheoGuia.body.setVelocity(0, 0);
        this.npcTheoGuia.body.enable = false;
      }

      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Chegamos. Entre no Restaurante]")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }
      return;
    }

    const chegouNoSupermercadoComPj =
      this.pjDestinoAtual === "supermercado" && this.pjChegouDestinoRota;

    if (chegouNoSupermercadoComPj) {
      this.pjAcompanhandoAgencia2 = false;
      this.pjAcompanhamentoEncerrado = true;
      this.registry.set("ag02_escolta_pj_supermercado", false);
      this.registry.set("ag02_pj_supermercado_retorno", true);

      if (this.npcTheoGuia.body) {
        this.npcTheoGuia.body.setVelocity(0, 0);
        this.npcTheoGuia.body.enable = false;
      }

      if (this.labelTheoGuia) {
        this.labelTheoGuia
          .setVisible(true)
          .setText("[Chegamos. Entre no Mercado]")
          .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
      }
      return;
    }

    const distJogadorNpc = Phaser.Math.Distance.Between(
      this.personagem.x,
      this.personagem.y,
      this.npcTheoGuia.x,
      this.npcTheoGuia.y,
    );
    const distNpcPonto = Phaser.Math.Distance.Between(
      this.npcTheoGuia.x,
      this.npcTheoGuia.y,
      pontoAtual.x,
      pontoAtual.y,
    );

    if (distJogadorNpc > this.pjDistanciaMaxJogador) {
      this.npcTheoGuia.body?.setVelocity(0, 0);
      this.pjEsperandoJogador = true;
    } else if (
      !this.pjChegouDestinoRota &&
      distNpcPonto > this.pjRaioChegadaGuia
    ) {
      this.physics.moveTo(
        this.npcTheoGuia,
        pontoAtual.x,
        pontoAtual.y,
        this.pjVelocidadeGuia,
      );
      this.pjEsperandoJogador = false;
    } else {
      this.npcTheoGuia.body?.setVelocity(0, 0);
      this.pjEsperandoJogador = true;
    }

    const andando = !this.pjChegouDestinoRota && !this.pjEsperandoJogador;

    const dxDirecao = pontoAtual.x - this.npcTheoGuia.x;
    const dyDirecao = pontoAtual.y - this.npcTheoGuia.y;
    let novaDirecao = this.npcTheoDirecao || "frente";
    if (Math.abs(dxDirecao) > Math.abs(dyDirecao)) {
      novaDirecao = dxDirecao > 0 ? "direita" : "esquerda";
    } else {
      novaDirecao = dyDirecao > 0 ? "frente" : "tras";
    }

    if (novaDirecao !== this.npcTheoDirecao) {
      this.npcTheoSpriteAtual = 1;
      this.npcTheoProximaTroca = this.time.now + this.npcTheoIntervaloTroca;
    }
    this.npcTheoDirecao = novaDirecao;

    if (!andando) {
      this.npcTheoGuia.setTexture(
        `${this.npcGuiaPrefix}_${this.npcTheoDirecao}_1`,
      );
      this.npcTheoSpriteAtual = 1;
    } else if (this.time.now >= this.npcTheoProximaTroca) {
      this.npcTheoSpriteAtual =
        this.npcTheoSpriteAtual >= 4 ? 1 : this.npcTheoSpriteAtual + 1;
      this.npcTheoProximaTroca = this.time.now + this.npcTheoIntervaloTroca;
      this.npcTheoGuia.setTexture(
        `${this.npcGuiaPrefix}_${this.npcTheoDirecao}_${this.npcTheoSpriteAtual}`,
      );
    }
    this.npcTheoAndandoAnterior = andando;

    if (this.labelTheoGuia) {
      const textoChegada =
        this.pjDestinoAtual === "farmacia"
          ? "[Chegamos. Interaja na Farmácia]"
          : this.pjDestinoAtual === "agencia2"
            ? "[Chegamos. Entre na Agência 02]"
            : this.pjDestinoAtual === "loja_roupas"
              ? "[Chegamos. Entre na Loja de Roupas]"
              : this.pjDestinoAtual === "metro"
                ? "[Chegamos. Entre no Metrô]"
                : this.pjDestinoAtual === "restaurante"
                  ? "[Chegamos. Entre no Restaurante]"
                  : this.pjDestinoAtual === "supermercado"
                    ? "[Chegamos. Entre no Mercado]"
              : "[Chegamos. Entre na Padaria]";
      const textoSeguir =
        this.pjDestinoAtual === "farmacia"
          ? "[Me siga até a Farmácia]"
          : this.pjDestinoAtual === "agencia2"
            ? "[Me siga até a Agência 02]"
            : this.pjDestinoAtual === "loja_roupas"
              ? "[Me siga até a Loja de Roupas]"
              : this.pjDestinoAtual === "metro"
                ? "[Me siga até o Metrô]"
                : this.pjDestinoAtual === "restaurante"
                  ? "[Me siga até o Restaurante]"
                  : this.pjDestinoAtual === "supermercado"
                    ? "[Me siga até o Mercado]"
              : "[Siga o PJ]";

      this.labelTheoGuia
        .setVisible(true)
        .setText(
          this.pjAguardandoDespedidaAgencia02
            ? "[E] Falar"
            : this.pjChegouDestinoRota
              ? textoChegada
              : this.pjEsperandoJogador
                ? "[Vem comigo! Estou esperando]"
                : textoSeguir,
        )
        .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
    }

    if (this.exclamacaoPjAgencia02 && this.pjAguardandoDespedidaAgencia02) {
      this.exclamacaoPjAgencia02.setPosition(
        this.npcTheoGuia.x,
        this.npcTheoGuia.y - 40,
      );
    }

    if (!this.pjChegouDestinoRota && distNpcPonto <= this.pjRaioChegadaGuia) {
      if (this.pjRotaIndiceAtual < this.pjRotaWaypoints.length - 1) {
        this.pjRotaIndiceAtual += 1;
      } else {
        this.pjChegouDestinoRota = true;
        this.npcTheoGuia.body?.setVelocity(0, 0);
        if (this.pjDestinoAtual === "agencia2") {
          this.pjAguardandoDespedidaAgencia02 = true;
          this.registry.set("missaoCidadeTexto", "Missão: Fale com o PJ Theo.");
          if (this.labelTheoGuia) {
            this.labelTheoGuia
              .setVisible(true)
              .setText("[E] Falar")
              .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
          }
          if (this.exclamacaoPjAgencia02) {
            this.exclamacaoPjAgencia02
              .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 40)
              .setVisible(true);
          }
        }
      }
    }
  }

  update() {
    // Se o PJ está aguardando na padaria e o jogador saiu da padaria, ativa a escolta para a farmácia
    if (
      this.pjAguardandoPadaria &&
      this.registry.get("padaria_dialogo_concluido") === true
    ) {
      this.pjAguardandoPadaria = false;
      this.pjAcompanhandoAgencia2 = true;
      this.pjAcompanhamentoEncerrado = false;
      this.pjDestinoAtual = "farmacia";
      this.registry.set("ag01_escolta_pj_agencia2", true);
      this.registry.set("ag01_pj_retorno", false);
      // Atualiza waypoints para farmácia passando pelos pontos solicitados.
      this.pjRotaWaypoints = [
        { x: 1488, y: 915 },
        { x: 1596, y: 915 },
        { x: 1596, y: 1295 },
        { x: 1126, y: 1295 },
      ];
      this.pjRotaIndiceAtual = 0;
      this.pjChegouDestinoRota = false;
      if (this.npcTheoGuia) {
        this.npcTheoGuia.setVisible(true);
        if (this.labelTheoGuia)
          this.labelTheoGuia
            .setVisible(true)
            .setText("[Me siga até a Farmácia]");
        if (this.npcTheoGuia.body) this.npcTheoGuia.body.enable = true;
      }
    }
    const velocidade = 150;
    const { teclas, wasd, personagem, coordLabel } = this;

    if (Phaser.Input.Keyboard.JustDown(this.teclaF)) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }

    // Movimento do jogador
    personagem.setVelocity(0);
    let movendo = false;

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

    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`sprite_${this.direcaoAtual}_1`);
    }

    this._atualizarAcompanhamentoPJCidade();

    // Mostra ou oculta labels ao entrar nas zonas
    const dentroAgencia = Phaser.Geom.Rectangle.Contains(
      this.zonaAgencia,
      personagem.x,
      personagem.y,
    );
    if (dentroAgencia !== this.dentroZonaAgencia) {
      this.dentroZonaAgencia = dentroAgencia;
      this.labelE.setVisible(dentroAgencia);
    }

    const dentroEscritorio = Phaser.Geom.Rectangle.Contains(
      this.zonaEscritorio,
      personagem.x,
      personagem.y,
    );
    if (dentroEscritorio !== this.dentroZonaEscritorio) {
      this.dentroZonaEscritorio = dentroEscritorio;
      this.labelEscritorio.setVisible(dentroEscritorio);
    }

    const dentroPadaria = Phaser.Geom.Rectangle.Contains(
      this.zonaPadaria,
      personagem.x,
      personagem.y,
    );
    if (dentroPadaria !== this.dentroZonaPadaria) {
      this.dentroZonaPadaria = dentroPadaria;
      this.labelPadaria.setVisible(dentroPadaria);
    }

    const dentroFarmacia = Phaser.Geom.Rectangle.Contains(
      this.zonaFarmacia,
      personagem.x,
      personagem.y,
    );
    if (dentroFarmacia !== this.dentroZonaFarmacia) {
      this.dentroZonaFarmacia = dentroFarmacia;
      this.labelFarmacia.setVisible(dentroFarmacia);
    }

    const dentroRestaurante = Phaser.Geom.Rectangle.Contains(
      this.zonaRestaurante,
      personagem.x,
      personagem.y,
    );
    if (dentroRestaurante !== this.dentroZonaRestaurante) {
      this.dentroZonaRestaurante = dentroRestaurante;
      this.labelRestaurante.setVisible(dentroRestaurante);
    }

    const dentroMetro = Phaser.Geom.Rectangle.Contains(
      this.zonaMetro,
      personagem.x,
      personagem.y,
    );
    if (dentroMetro !== this.dentroZonaMetro) {
      this.dentroZonaMetro = dentroMetro;
      this.labelMetro.setVisible(dentroMetro);
    }

    const dentroLojaDeRoupas = Phaser.Geom.Rectangle.Contains(
      this.zonaLojaDeRoupas,
      personagem.x,
      personagem.y,
    );
    if (dentroLojaDeRoupas !== this.dentroZonaLojaDeRoupas) {
      this.dentroZonaLojaDeRoupas = dentroLojaDeRoupas;
      this.labelLojaDeRoupas.setVisible(dentroLojaDeRoupas);
    }

    // Mostra o botão [E] para entrar no supermercado ao chegar perto da posição x=2924, y=344
    const dentroSupermercado = Phaser.Geom.Rectangle.Contains(
      this.zonaSupermercado,
      personagem.x,
      personagem.y,
    );
    if (dentroSupermercado !== this.dentroZonaSupermercado) {
      this.dentroZonaSupermercado = dentroSupermercado;
      this.labelSupermercado.setVisible(dentroSupermercado);
    }
    if (dentroSupermercado) {
      this.labelSupermercado.setPosition(2924, 344 - 10);
    }

    const dentroPostoDeGasolina = Phaser.Geom.Rectangle.Contains(
      this.zonaPostoDeGasolina,
      personagem.x,
      personagem.y,
    );
    if (dentroPostoDeGasolina !== this.dentroZonaPostoDeGasolina) {
      this.dentroZonaPostoDeGasolina = dentroPostoDeGasolina;
      this.labelPostoDeGasolina.setVisible(dentroPostoDeGasolina);
    }

    const dentroAgencia02 = Phaser.Geom.Rectangle.Contains(
      this.zonaAgencia02,
      personagem.x,
      personagem.y,
    );
    if (dentroAgencia02 !== this.dentroZonaAgencia02) {
      this.dentroZonaAgencia02 = dentroAgencia02;
      this.labelAgencia02.setVisible(dentroAgencia02);
    }

    const dentroAgencia03 = Phaser.Geom.Rectangle.Contains(
      this.zonaAgencia03,
      personagem.x,
      personagem.y,
    );
    if (dentroAgencia03 !== this.dentroZonaAgencia03) {
      this.dentroZonaAgencia03 = dentroAgencia03;
      this.labelAgencia03.setVisible(dentroAgencia03);
    }

    const hudLocalInfo =
      this.hudNoCentro && Number.isFinite(this.hudDebugLocalX)
        ? `\nhudX:${this.hudDebugLocalX} hudY:${this.hudDebugLocalY}`
        : "";

    // Atualiza label de coordenadas acima do personagem
    if (coordLabel && personagem) {
      coordLabel.setText(
        `x: ${Math.round(personagem.x)}\ny: ${Math.round(personagem.y)}`,
      );
      coordLabel.setPosition(
        personagem.x,
        personagem.y - personagem.displayHeight / 2 - 10,
      );
      coordLabel.setVisible(true);
    }

    this.debugTxt.setVisible(false);
    this.minimapPlayerDot.setPosition(personagem.x, personagem.y);
    this._atualizarHudCidade();
    this._atualizarHudDebugCoords();
    this._atualizarHudCoins();
    this._reposicionarPopupMissaoCidade();
    this._reposicionarPopupListaMissoes();

    // Tecla E para transição entre cenas
    if (!this.transicionando && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      let alvoTentado = null;
      if (dentroAgencia) alvoTentado = "agencia1";
      else if (dentroEscritorio) alvoTentado = "escritorio";
      else if (dentroPadaria) alvoTentado = "padaria";
      else if (dentroFarmacia) alvoTentado = "farmacia";
      else if (dentroRestaurante) alvoTentado = "restaurante";
      else if (dentroMetro) alvoTentado = "metro";
      else if (dentroLojaDeRoupas) alvoTentado = "cabeleireiro";
      else if (dentroSupermercado) alvoTentado = "supermercado";
      else if (dentroPostoDeGasolina) alvoTentado = "posto";
      else if (dentroAgencia02) alvoTentado = "agencia2";
      else if (dentroAgencia03) alvoTentado = "agencia3";

      const podeInteragirComPjNaAgencia02 =
        dentroAgencia02 &&
        this.pjAguardandoDespedidaAgencia02 &&
        !this.pjDespedidaAgencia02Feita;

      if (
        alvoTentado &&
        !podeInteragirComPjNaAgencia02 &&
        !this._podeEntrarNoEstabelecimento(alvoTentado)
      ) {
        return;
      }

      if (dentroAgencia) {
        this.transicionando = true;
        this._avancarSequenciaSetas("agencia1");
        this.labelE.setVisible(false);
        if (this.setaGuiaAgencia) this.setaGuiaAgencia.setVisible(false);
        this.registry.set("ocultarSetaAgencia01", true);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneAg", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
            spawnX: 165,
            spawnY: 185,
          });
        });
      } else if (dentroEscritorio) {
        this.transicionando = true;
        this._avancarSequenciaSetas("escritorio");
        this.labelEscritorio.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneEscritorio", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroPadaria) {
        if (this.pjAcompanhandoAgencia2) {
          this.pjAcompanhandoAgencia2 = false;
          this.pjAcompanhamentoEncerrado = true;
          this.registry.set("ag01_escolta_pj_agencia2", false);
          this.registry.set("ag01_pj_retorno", true);

          if (this.npcTheoGuia?.body) {
            this.npcTheoGuia.body.setVelocity(0, 0);
            this.npcTheoGuia.body.enable = false;
          }
          if (this.npcTheoGuia) this.npcTheoGuia.setVisible(false);
          if (this.labelTheoGuia) this.labelTheoGuia.setVisible(false);
        }

        this.transicionando = true;
        this._avancarSequenciaSetas("padaria");
        this.labelPadaria.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("ScenePadaria", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroFarmacia) {
        this.transicionando = true;
        this._avancarSequenciaSetas("farmacia");
        this.labelFarmacia.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneFarmacia", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroRestaurante) {
        this.transicionando = true;
        this._avancarSequenciaSetas("restaurante");
        this.labelRestaurante.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneRestaurante", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroMetro) {
        this.transicionando = true;
        this._avancarSequenciaSetas("metro");
        this.labelMetro.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneMetro", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
            spawnX: 273,
            spawnY: 250,
          });
        });
      } else if (dentroLojaDeRoupas) {
        if (
          this.pjAcompanhandoAgencia2 ||
          (this.npcTheoGuia && this.npcTheoGuia.visible)
        ) {
          this.pjAcompanhandoAgencia2 = false;
          this.pjAcompanhamentoEncerrado = true;
          this.registry.set("ag02_escolta_pj_salao", false);
          this.registry.set("ag02_pj_retorno", true);
          if (this.npcTheoGuia?.body) {
            this.npcTheoGuia.body.setVelocity(0, 0);
            this.npcTheoGuia.body.enable = false;
          }
          if (this.labelTheoGuia) {
            this.labelTheoGuia
              .setVisible(true)
              .setText("[Boa sorte! Nos vemos depois]")
              .setPosition(this.npcTheoGuia.x, this.npcTheoGuia.y - 18);
          }
          if (this.npcTheoGuia) this.npcTheoGuia.setVisible(false);
        }

        this.transicionando = true;
        this._avancarSequenciaSetas("cabeleireiro");
        this.labelLojaDeRoupas.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneLojaDeRoupas", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroSupermercado) {
        this.transicionando = true;
        this._avancarSequenciaSetas("supermercado");
        this.labelSupermercado.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneSupermercado", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroPostoDeGasolina) {
        this.transicionando = true;
        this._avancarSequenciaSetas("posto");
        this.labelPostoDeGasolina.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("ScenePostoDeGasolina", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroAgencia02) {
        if (
          !this.pjDespedidaAgencia02Feita &&
          this.pjAguardandoDespedidaAgencia02
        ) {
          this._abrirPopupDespedidaAgencia02();
          return;
        }

        this.transicionando = true;
        this._avancarSequenciaSetas("agencia2");
        this.labelAgencia02.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneAgencia02", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
          });
        });
      } else if (dentroAgencia03) {
        this.transicionando = true;
        this._avancarSequenciaSetas("agencia3");
        this.labelAgencia03.setVisible(false);
        this.scene.stop("SceneChuva");
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SceneAgencia03", {
            nomePasta: this.nomePastaEscolhida,
            prefixo: this.prefixoEscolhido,
            spawnX: 955,
            spawnY: 518,
          });
        });
      }
    }
  }
}
