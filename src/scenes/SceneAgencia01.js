export default class SceneAgencia extends Phaser.Scene {

  constructor() {
    super({ key: "SceneAg" });
  }

  // Inicializa dados do personagem vindos da cena anterior
  init(dados = {}) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
    this.spawnXCustom = dados.spawnX ?? null;
    this.spawnYCustom = dados.spawnY ?? null;
  }

  // Carrega todos os assets necessários para a cena
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    this.load.maxParallelDownloads = 2;

    // Loga erro de carregamento de asset
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneAgencia] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Carrega o áudio da cena
    this.load.audio(
      "trilhaAgencia01",
      "src/assets/audios/trilhaAgencia01.mp3",
    );

    // Mapa e tilesets da agência
    this.load.tilemapTiledJSON(
      "agencia",
      "src/assets/imagens/mapsjson/tileMaps/Agência01.tmj",
    );
    this.load.image(
      "ag_roombuilder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );
    this.load.image(
      "ag_interior_s1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S1_4096.png",
    );
    this.load.image(
      "ag_interior_s2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S2_4096.png",
    );
    this.load.image(
      "ag_interior_s3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S3_4096.png",
    );
    this.load.image(
      "ag_interior_s4",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S4_4096.png",
    );
    this.load.image(
      "ag_interior_s5",
      "src/assets/imagens/mapsjson/tileSets/Interiors_S5_640.png",
    );

    // Sprites do NPC da agência (Theo)
    this.load.image(
      "npc_agencia_frente_1",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandofrente01 (parado01).png",
    );
    this.load.image(
      "npc_agencia_frente_2",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandofrente02.png",
    );
    this.load.image(
      "npc_agencia_frente_3",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandofrente03.png",
    );
    this.load.image(
      "npc_agencia_frente_4",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandofrente04.png",
    );
    this.load.image(
      "npc_agencia_tras_1",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandotras01.png",
    );
    this.load.image(
      "npc_agencia_tras_2",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandotras02.png",
    );
    this.load.image(
      "npc_agencia_tras_3",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandotras03.png",
    );
    this.load.image(
      "npc_agencia_tras_4",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandotras04.png",
    );
    this.load.image(
      "npc_agencia_direita_1",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandodireita01.png",
    );
    this.load.image(
      "npc_agencia_direita_2",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandodireita02.png",
    );
    this.load.image(
      "npc_agencia_direita_3",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandodireita03.png",
    );
    this.load.image(
      "npc_agencia_direita_4",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandodireita04.png",
    );
    this.load.image(
      "npc_agencia_esquerda_1",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandoesquerda01.png",
    );
    this.load.image(
      "npc_agencia_esquerda_2",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandoesquerda02.png",
    );
    this.load.image(
      "npc_agencia_esquerda_3",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandoesquerda03.png",
    );
    this.load.image(
      "npc_agencia_esquerda_4",
      "src/assets/imagens/imagensPersonagens/NPC/Theo/theo_andandoesquerda04.png",
    );

    // Sprites do NPC Iza
    this.load.image(
      "npc_iza_1",
      "src/assets/imagens/imagensPersonagens/NPC/Iza/Iza_parado01.png",
    );
    this.load.image(
      "npc_iza_2",
      "src/assets/imagens/imagensPersonagens/NPC/Iza/Iza_parado02.png",
    );

    // Sprites do personagem selecionado
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

  create() {

    // Adiciona áudios a cena
    this.musica = this.sound.add('trilhaAgencia01', { loop: true, volume: 0.5});
    this.musica.play();

    // ── MAPA ──────────────────────────────────────────────────────────────────
    const mapa = this.make.tilemap({ key: "agencia" });
    this.mapa = mapa;

    const spawnX = this.spawnXCustom ?? 297;
    const spawnY = this.spawnYCustom ?? 395;
    const saidaX = 165;
    const saidaY = 255;

    // Garante que câmera e mundo incluam a posição pedida, mesmo fora do tamanho base do mapa.
    const limiteLargura = Math.max(mapa.widthInPixels, spawnX + 64);
    const limiteAltura = Math.max(mapa.heightInPixels, spawnY + 64);

    const tsRoomBuilder = mapa.addTilesetImage("roombuilder", "ag_roombuilder");
    const tsInteriorS1 = mapa.addTilesetImage("interior_s1", "ag_interior_s1");
    const tsInteriorS2 = mapa.addTilesetImage("interior_s2", "ag_interior_s2");
    const tsInteriorS3 = mapa.addTilesetImage("interior_s3", "ag_interior_s3");
    const tsInteriorS4 = mapa.addTilesetImage("interior_s4", "ag_interior_s4");
    const tsInteriorS5 = mapa.addTilesetImage("interior_s5", "ag_interior_s5");

    const tilesets = [
      tsRoomBuilder,
      tsInteriorS1,
      tsInteriorS2,
      tsInteriorS3,
      tsInteriorS4,
      tsInteriorS5,
    ].filter(Boolean);

    this.add
      .rectangle(0, 0, limiteLargura + 200, limiteAltura + 200, 0x888888)
      .setOrigin(0, 0);

    // ── CAMADAS SEM COLISÃO ───────────────────────────────────────────────────
    this._criarCamada(mapa, "chao", tilesets);
    this._criarCamada(mapa, "tapete", tilesets);
    this._criarCamada(mapa, "parede", tilesets);
    this._criarCamada(mapa, "quadro", tilesets);
    this._criarCamada(mapa, "cadeira - n", tilesets);
    this._criarCamada(mapa, "cadeira 2 - n", tilesets);
    this._criarCamada(mapa, "objetos - n", tilesets);
    this._criarCamada(mapa, "objetos2 - n", tilesets);
    this._criarCamada(mapa, "spawn", tilesets);

    // ── CAMADAS COM COLISÃO ───────────────────────────────────────────────────
    const objC = this._criarCamada(mapa, "objetos - c", tilesets);
    const decC = this._criarCamada(mapa, "decoracao - c", tilesets);
    const decC2 = this._criarCamada(mapa, "decoracao2 - c", tilesets);
    const bordas = this._criarCamada(mapa, "bordas", tilesets);
    const borda2 = this._criarCamada(mapa, "borda2", tilesets);

    const camadasColisao = [objC, decC, decC2, bordas, borda2].filter(Boolean);
    camadasColisao.forEach((c) => c.setCollisionByExclusion([-1]));

    // ── REMOVER COLISÃO NA FAIXA BLOQUEADA ───────────────────────────────────
    // Região problemática: y≈108, x de 40 até 168
    // Em tiles (16px cada): linhas 6-7, colunas 2-10
    // Usamos Math.floor/ceil para cobrir a faixa completa informada
    const tileW = mapa.tileWidth || 16;
    const tileH = mapa.tileHeight || 16;

    const linhaInicio = Math.floor(96 / tileH); // 6
    const linhaFim = Math.ceil(120 / tileH); // 7 (um tile a mais por segurança)
    const colunaInicio = Math.floor(40 / tileW); // 2
    const colunaFim = Math.ceil(168 / tileW); // 10 (inclusive)

    camadasColisao.forEach((camada) => {
      for (let linha = linhaInicio; linha <= linhaFim; linha++) {
        for (let col = colunaInicio; col <= colunaFim; col++) {
          const tile = camada.getTileAt(col, linha);
          if (tile) tile.setCollision(false, false, false, false);
        }
      }
    });

    // Garante espaço livre no ponto de spawn para não empurrar o personagem.
    const colSpawn = Math.floor(spawnX / tileW);
    const linSpawn = Math.floor(spawnY / tileH);
    camadasColisao.forEach((camada) => {
      for (let lin = linSpawn - 1; lin <= linSpawn + 1; lin++) {
        for (let col = colSpawn - 1; col <= colSpawn + 1; col++) {
          const tile = camada.getTileAt(col, lin);
          if (tile) tile.setCollision(false, false, false, false);
        }
      }
    });

    // ── ANIMAÇÕES ─────────────────────────────────────────────────────────────
    ["frente", "tras", "direita", "esquerda"].forEach((dir) => {
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

    // ── PERSONAGEM ────────────────────────────────────────────────────────────
    this.personagem = this.physics.add.sprite(spawnX, spawnY, "esp_frente_1");
    this.personagem.setCollideWorldBounds(true);

    const larguraSprite = this.personagem.width;
    const alturaSprite = this.personagem.height;
    const escala = Math.min(
      (tileW * 0.4) / larguraSprite,
      (tileW * 0.4) / alturaSprite,
    );
    this.personagem.setScale(Math.max(escala, 0.04));
    this.personagem.body.setSize(larguraSprite * 0.4, alturaSprite * 0.4);

    camadasColisao.forEach((c) =>
      this.physics.add.collider(this.personagem, c),
    );

    // ── NPC ───────────────────────────────────────────────────────────────────
    this.npcAgencia = this.physics.add
      .sprite(65, 57, "npc_agencia_frente_1")
      .setDepth(5);
    this.npcAgenciaDirecao = "frente";
    this.npcAgenciaFrame = 1;
    this.npcAgenciaTrocaTempo = 0;
    this.npcAgenciaTrocaIntervalo = 250;
    this.npcAgencia.body.setImmovable(true);
    const alturaAlvo = this.personagem.displayHeight;
    this.npcAgencia.setDisplaySize(
      (this.npcAgencia.width / this.npcAgencia.height) * (alturaAlvo * 1.2),
      alturaAlvo * 1.2,
    );
    this.npcAgencia.refreshBody();

    this.physics.add.collider(this.personagem, this.npcAgencia);

    this.labelNpc = this.add
      .text(65, 76, "[E] Falar", {
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
        this.npcAgencia.x,
        this.npcAgencia.y - this.npcAgencia.displayHeight * 0.5,
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

    // ── NPC IZA ───────────────────────────────────────────────────────────────
    this.npcIza = this.physics.add
      .sprite(183, 126, "npc_iza_1")
      .setDepth(5);
    this.npcIza.body.setImmovable(true);
    const alturaAlvo2 = this.personagem.displayHeight;
    this.npcIza.setDisplaySize(
      (this.npcIza.width / this.npcIza.height) * (alturaAlvo2 * 1),
      alturaAlvo2 * 1,
    );
    this.npcIza.refreshBody();
    this.physics.add.collider(this.personagem, this.npcIza);

    // Animação contínua de alternância de sprites
    this.npcIzaProximaTroca = 0;
    this.npcIzaSpriteAtual = 1; // começa com sprite 1
    this.npcIzaIntervaloTroca = 500; // alterna a cada 500ms

    // Label de fala para Iza
    this.labelNpcIza = this.add
      .text(183, 145, "[E] Falar", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    // Exclamação da Iza
    this.exclamacaoIza = this.add
      .text(
        this.npcIza.x,
        this.npcIza.y - this.npcIza.displayHeight * 0.5,
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
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.tweenExclamacaoIza = this.tweens.add({
      targets: this.exclamacaoIza,
      alpha: { from: 1, to: 0.25 },
      duration: 450,
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    // ── CONTROLES ─────────────────────────────────────────────────────────────
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // ── CÂMERA ────────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(6.5);
    const larguraVisivel = this.cameras.main.width / this.cameras.main.zoom;
    const alturaVisivel = this.cameras.main.height / this.cameras.main.zoom;
    const meiaLargura = larguraVisivel * 0.5;
    const meiaAltura = alturaVisivel * 0.5;

    // Trava o scroll para a direita: a câmera só pode ir para a esquerda a partir do spawn.
    const limiteCameraLargura = Math.max(larguraVisivel, spawnX + meiaLargura);
    const limiteCameraAltura = Math.max(limiteAltura, spawnY + meiaAltura);

    this.cameras.main.setBounds(0, 0, limiteCameraLargura, limiteCameraAltura);
    this.physics.world.setBounds(0, 0, limiteLargura, limiteAltura);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.scrollXMaxInicial = this.cameras.main.scrollX;
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.direcaoAtual = "frente";

    // ── ZONA DE SAÍDA ─────────────────────────────────────────────────────────
    this.zonasSaida = [{ x: saidaX, y: saidaY, raio: 25 }];
    this.labelSair = this.add
      .text(saidaX, saidaY, "[Saída]", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.dentroZonaSaida = false;
    this.transicionando = false;
    this.perto_npc = false;
    this.dialogoGGConcluido = this.registry.get("ag01_dialogo_gg_concluido") === true;
    this.dialogoPJConcluido = this.registry.get("ag01_dialogo_pj_concluido") === true;
    this.falouComIza = this.dialogoGGConcluido;
    this.falouComNpc = this.dialogoPJConcluido;
    this.pjGuiandoParaSaida = false;
    this.pjChegouNaSaida = false;
    this.pjEsperandoJogador = false;
    this.velocidadePJGuia = 95;
    this.distanciaMaximaSeguirPJ = 120;
    this.raioChegadaSaida = 22;
    this.alvoSaidaPJ = { x: saidaX, y: saidaY };
    this.tweenIzaRodando = false;
    this.npcAgenciaSpriteAtual = 1;
    this.npcAgenciaProximaTroca = 0;
    this.npcAgenciaIntervaloTroca = 130;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // ── DEBUG ─────────────────────────────────────────────────────────────────
    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "4px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(999);

    // HUD de missão no topo da cena (mesma lógica visual da cidade).
    this._criarPopupMissaoAgencia();

    // Pausa  a trilha sonora ao iniciar nova cena
     this.events.on("shutdown", () => {
     this.musica.stop();
    });
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────

  _criarCamada(mapa, nome, tilesets) {
    try {
      const camada = mapa.createLayer(nome, tilesets, 0, 0);
      if (!camada) console.warn("[SceneAgencia] Camada não encontrada:", nome);
      return camada;
    } catch (erro) {
      console.error(
        "[SceneAgencia] Erro ao criar camada",
        nome,
        ":",
        erro.message,
      );
      return null;
    }
  }

  _atualizarGuiaPJ() {
    if (!this.pjGuiandoParaSaida || !this.npcAgencia || !this.personagem) return;

    const distNpcSaida = Phaser.Math.Distance.Between(
      this.npcAgencia.x,
      this.npcAgencia.y,
      this.alvoSaidaPJ.x,
      this.alvoSaidaPJ.y,
    );

    if (distNpcSaida <= this.raioChegadaSaida) {
      this.npcAgencia.body?.setVelocity(0, 0);
      this.npcAgencia.setImmovable(true);
      this.pjGuiandoParaSaida = false;
      this.pjChegouNaSaida = true;
      this.pjEsperandoJogador = true;
      // Parar sprite andando
      this.npcAgencia.setTexture(`npc_agencia_${this.npcAgenciaDirecao}_1`);
      this.npcAgenciaSpriteAtual = 1;
      return;
    }

    const distJogadorNpc = Phaser.Math.Distance.Between(
      this.personagem.x,
      this.personagem.y,
      this.npcAgencia.x,
      this.npcAgencia.y,
    );

    if (distJogadorNpc > this.distanciaMaximaSeguirPJ) {
      this.npcAgencia.body?.setVelocity(0, 0);
      this.pjEsperandoJogador = true;
      // Parar sprite andando
      this.npcAgencia.setTexture(`npc_agencia_${this.npcAgenciaDirecao}_1`);
      this.npcAgenciaSpriteAtual = 1;
      return;
    }

    this.pjEsperandoJogador = false;
    this.physics.moveTo(
      this.npcAgencia,
      this.alvoSaidaPJ.x,
      this.alvoSaidaPJ.y,
      this.velocidadePJGuia,
    );

    // Atualiza direção e sprite do NPC acompanhante
    const dx = this.alvoSaidaPJ.x - this.npcAgencia.x;
    const dy = this.alvoSaidaPJ.y - this.npcAgencia.y;
    let novaDirecao = this.npcAgenciaDirecao;
    if (Math.abs(dx) > Math.abs(dy)) {
      novaDirecao = dx > 0 ? "direita" : "esquerda";
    } else {
      novaDirecao = dy > 0 ? "frente" : "tras";
    }

    if (novaDirecao !== this.npcAgenciaDirecao) {
      this.npcAgenciaSpriteAtual = 1;
      this.npcAgenciaProximaTroca = this.time.now + this.npcAgenciaIntervaloTroca;
    }
    this.npcAgenciaDirecao = novaDirecao;

    // Troca de frame animado em 4 passos quando o PJ está andando
    const agora = this.time.now;
    if (agora >= this.npcAgenciaProximaTroca) {
      this.npcAgenciaSpriteAtual = this.npcAgenciaSpriteAtual >= 4 ? 1 : this.npcAgenciaSpriteAtual + 1;
      this.npcAgenciaProximaTroca = agora + this.npcAgenciaIntervaloTroca;
    }
    this.npcAgencia.setTexture(`npc_agencia_${this.npcAgenciaDirecao}_${this.npcAgenciaSpriteAtual}`);
  }

  _resolverTextoMissaoAgencia() {
    const textoCustom = this.registry.get("missaoAgencia01Texto");
    if (typeof textoCustom === "string" && textoCustom.trim()) {
      return textoCustom.trim();
    }

    const falouComIza = this.registry.get("ag01_dialogo_gg_concluido") === true;
    if (falouComIza) {
      return "Missão: Suba e fale com o PJ Theo.";
    }

    return "Missão: Fale com a gerente Iza.";
  }

  _medirLarguraPopupMissaoAgencia(texto) {
    const medidor = this.add.text(-9999, -9999, texto, {
      fontSize: "20px",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });
    const largura = medidor.displayWidth + 48;
    medidor.destroy();
    return Phaser.Math.Clamp(largura, 260, this.scale.width - 40);
  }

  _atualizarPopupMissaoAgencia(animarTexto) {
    if (!this.missaoAgenciaBg || !this.missaoAgenciaTexto) return;

    const texto = this._resolverTextoMissaoAgencia();
    if (!texto) return;

    const larguraFinal = this._medirLarguraPopupMissaoAgencia(texto);
    this.missaoAgenciaBg.setSize(larguraFinal, this.missaoAgenciaBg.height);

    if (this.missaoAgenciaMensagemAtual === texto && !animarTexto) return;
    this.missaoAgenciaMensagemAtual = texto;

    if (this.missaoAgenciaTimer) {
      this.missaoAgenciaTimer.remove();
      this.missaoAgenciaTimer = null;
    }

    if (!animarTexto) {
      this.missaoAgenciaTexto.setText(texto);
      return;
    }

    let charIndex = 0;
    this.missaoAgenciaTexto.setText("");
    this.missaoAgenciaTimer = this.time.addEvent({
      delay: 35,
      repeat: texto.length - 1,
      callback: () => {
        charIndex++;
        this.missaoAgenciaTexto.setText(texto.substring(0, charIndex));
      },
    });
  }

  _reposicionarPopupMissaoAgencia() {
    if (!this.missaoAgenciaBg || !this.missaoAgenciaTexto) return;
    const cam = this.cameras.main;
    const popupX = cam.worldView.centerX;
    const popupY = cam.worldView.top + this.popupMissaoAgenciaOffsetTopo;
    this.missaoAgenciaBg.setX(popupX);
    this.missaoAgenciaBg.setY(popupY);
    this.missaoAgenciaTexto.setX(popupX);
    this.missaoAgenciaTexto.setY(popupY);
  }

  _criarPopupMissaoAgencia() {
    this.popupMissaoAgenciaUiScale = 1 / this.cameras.main.zoom;
    this.popupMissaoAgenciaOffsetTopo = 92 * this.popupMissaoAgenciaUiScale;

    const cam = this.cameras.main;
    const popupY = cam.worldView.top + this.popupMissaoAgenciaOffsetTopo;
    const popupX = cam.worldView.centerX;

    this.missaoAgenciaBg = this.add
      .rectangle(popupX, popupY, 300, 44, 0x000000, 0.55)
      .setDepth(240)
      .setVisible(true)
      .setScale(this.popupMissaoAgenciaUiScale);

    this.missaoAgenciaTexto = this.add
      .text(popupX, popupY, "", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(241)
      .setVisible(true)
      .setScale(this.popupMissaoAgenciaUiScale);

    this._atualizarPopupMissaoAgencia(true);

    this._onMissaoAgenciaMudou = () => {
      this._atualizarPopupMissaoAgencia(true);
    };

    this.registry.events.on(
      "changedata-missaoAgencia01Texto",
      this._onMissaoAgenciaMudou,
      this,
    );
    this.registry.events.on(
      "changedata-ag01_dialogo_gg_concluido",
      this._onMissaoAgenciaMudou,
      this,
    );

    this.events.once("shutdown", () => {
      this.registry.events.off(
        "changedata-missaoAgencia01Texto",
        this._onMissaoAgenciaMudou,
        this,
      );
      this.registry.events.off(
        "changedata-ag01_dialogo_gg_concluido",
        this._onMissaoAgenciaMudou,
        this,
      );

      if (this.missaoAgenciaTimer) {
        this.missaoAgenciaTimer.remove();
        this.missaoAgenciaTimer = null;
      }
    });
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────

  update() {
    const velocidade = 150;
    const { teclas, wasd, personagem } = this;
    const izaConcluidaAgora = this.registry.get("ag01_dialogo_gg_concluido") === true;

    if (izaConcluidaAgora && !this.falouComIza) {
      this.falouComIza = true;
      this.registry.set("missaoAgencia01Texto", "Missão: Suba e fale com o PJ Theo.");
      if (this.exclamacaoIza) this.exclamacaoIza.setVisible(false);
      if (this.tweenExclamacaoIza) this.tweenExclamacaoIza.stop();
      this.tweenIzaRodando = false;
      if (this.exclamacaoNpc) {
        this.exclamacaoNpc.setVisible(true);
        this.exclamacaoNpc.setPosition(
          this.npcAgencia.x,
          this.npcAgencia.y - this.npcAgencia.displayHeight * 0.5,
        );
        if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.play();
      }

      this._atualizarPopupMissaoAgencia(true);
    }

    // Assim que o dialogo do PJ termina, ele ja passa a guiar automaticamente.
    const pjConcluidoAgora = this.registry.get("ag01_dialogo_pj_concluido") === true;
    if (pjConcluidoAgora && !this.pjChegouNaSaida && !this.pjGuiandoParaSaida) {
      this.falouComNpc = true;
      this.pjGuiandoParaSaida = true;
      this.npcAgencia.setImmovable(false);
      if (this.exclamacaoNpc) this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
    }

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

    // ── INTERAÇÃO COM NPC ───────────────────────────────────────────────────
    const distNpc = Phaser.Math.Distance.Between(
      personagem.x,
      personagem.y,
      this.npcAgencia.x,
      this.npcAgencia.y,
    );
    const raioInteracaoPJ = 46;
    const pertoNpc = distNpc < raioInteracaoPJ;

    this.perto_npc = pertoNpc;
    this.labelNpc.setVisible(pertoNpc);

    if (pertoNpc) {
      this.labelNpc.setPosition(this.npcAgencia.x, this.npcAgencia.y + 19);
    }

    if (!this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setPosition(
        this.npcAgencia.x,
        this.npcAgencia.y - this.npcAgencia.displayHeight * 0.5,
      );
    }

    if (pertoNpc && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      if (this.registry.get("ag01_dialogo_gg_concluido") !== true) {
        return;
      }

      if (this.registry.get("ag01_dialogo_pj_concluido") === true) {
        this.falouComNpc = true;
        if (this.exclamacaoNpc) this.exclamacaoNpc.setVisible(false);
        if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
        this.pjGuiandoParaSaida = true;
        this.npcAgencia.setImmovable(false);
        return;
      }

      this.scene.pause();
      this.scene.launch("SceneDialogoAgencia01", {
        cenaOrigem: "SceneAg",
        tipoDialogo: "PJ",
      });
      return;
    }

    // ── ALTERNÂNCIA DE SPRITES DA IZA ──────────────────────────────────────────
    if (this.npcIza) {
      const tempoAtual = this.time.now;
      if (tempoAtual >= this.npcIzaProximaTroca) {
        this.npcIzaProximaTroca = tempoAtual + this.npcIzaIntervaloTroca;
        
        // Alterna sprite
        if (this.npcIzaSpriteAtual === 1) {
          this.npcIza.setTexture("npc_iza_2");
          this.npcIzaSpriteAtual = 2;
        } else {
          this.npcIza.setTexture("npc_iza_1");
          this.npcIzaSpriteAtual = 1;
        }
      }

      // Detecção de proximidade com Iza
      const distIza = Phaser.Math.Distance.Between(
        personagem.x,
        personagem.y,
        this.npcIza.x,
        this.npcIza.y,
      );
      const raioInteracaoIza = 46;
      const pertoIza = distIza < raioInteracaoIza;
      this.labelNpcIza.setVisible(!izaConcluidaAgora && pertoIza);

      // Mostrar exclamação da Iza (se ainda não falou com ela)
      if (!this.falouComIza && this.exclamacaoIza) {
        this.exclamacaoIza.setVisible(true);
        this.exclamacaoIza.setPosition(
          this.npcIza.x,
          this.npcIza.y - this.npcIza.displayHeight * 0.5,
        );
        if (!this.tweenIzaRodando && this.tweenExclamacaoIza) {
          this.tweenExclamacaoIza.play();
          this.tweenIzaRodando = true;
        }
      }

      if (!izaConcluidaAgora && pertoIza) {
        this.labelNpcIza.setPosition(this.npcIza.x, this.npcIza.y + 19);

        if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
          this.scene.pause();
          this.scene.launch("SceneDialogoAgencia01", {
            cenaOrigem: "SceneAg",
            tipoDialogo: "GG",
          });
          return;
        }
      }
    }

    this._atualizarGuiaPJ();

    // ── SAÍDA AUTOMÁTICA ─────────────────────────────────────────────────────
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
      if (dentroSaida) this.labelNpc.setVisible(false);
    }

    // Mantém a câmera sem scroll para a direita (apenas para esquerda).
    if (typeof this.scrollXMaxInicial === "number") {
      this.cameras.main.scrollX = Math.min(
        this.cameras.main.scrollX,
        this.scrollXMaxInicial,
      );
    }

    // Transição para a cidade: ocorre ao entrar na saída ou quando o PJ conclui o guia até a saída.
    const podeTransicionarParaCidade =
      dentroSaida || (pjConcluidoAgora && this.pjChegouNaSaida);

    if (podeTransicionarParaCidade && !this.transicionando) {

      this.transicionando = true;
      this.labelSair.setVisible(false);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        const pjConcluido = this.registry.get("ag01_dialogo_pj_concluido") === true;
        const escoltaAtiva = pjConcluido;

        if (escoltaAtiva) {
          this.registry.set("ag01_escolta_pj_agencia2", true);
          this.registry.set("ag01_pj_retorno", false);
          this.registry.set("missaoCidadeTexto", "Missao: Siga o PJ ate a Padaria.");
        }

        this.scene.start("SceneCidade", {
          nomePasta: this.nomePastaEscolhida,
          prefixo: this.prefixoEscolhido,
          spawnX: 976,
          spawnY: 856,
          ocultarSetaAgencia01: true,
          escoltaPJAgencia2: escoltaAtiva,
          missaoCidadeTexto: escoltaAtiva ? "Missao: Siga o PJ ate a Padaria." : undefined,
        });
      });
    }

    // ── Debug ─────────────────────────────────────────────────────────────
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 10, personagem.y - 14);

    const textoMissaoAtual = this._resolverTextoMissaoAgencia();
    if (textoMissaoAtual && textoMissaoAtual !== this.missaoAgenciaMensagemAtual) {
      this._atualizarPopupMissaoAgencia(true);
    }
    if (this.missaoAgenciaBg) this.missaoAgenciaBg.setVisible(true).setAlpha(1);
    if (this.missaoAgenciaTexto) this.missaoAgenciaTexto.setVisible(true).setAlpha(1);

    this._reposicionarPopupMissaoAgencia();
  }
}
