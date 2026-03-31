export default class SceneFarmacia extends Phaser.Scene {
  constructor() {
    super({ key: "SceneFarmacia" });
  }

  // Recupera os dados do personagem escolhidos anteriormente
  init(dados) {
    this.nomePastaEscolhida =
      dados.nomePasta || this.registry.get("nomePasta") || "Pedro";
    this.prefixoEscolhido =
      dados.prefixo || this.registry.get("prefixo") || "HB";
  }

  // Carrega mapa, tilesets, NPC e sprites do personagem
  preload() {
    const nomePasta = this.nomePastaEscolhida;
    const prefixo = this.prefixoEscolhido;

    // Loga erros de carregamento para facilitar debug
    this.load.on("loaderror", (arquivo) => {
      console.error(
        "[SceneFarmacia] Erro ao carregar:",
        arquivo.key,
        arquivo.src,
      );
    });

    // Tilemap da farmácia
    this.load.tilemapTiledJSON(
      "farmacia",
      "src/assets/imagens/mapsjson/tileMaps/farmacia.tmj?v=1",
    );
    
    //Carrega o áudio
     this.load.audio(
      "trilhaSceneFarmacia", 'src/assets/audios/trilhaScenefarmacia.mp3'
    );

    // Sprite do NPC da farmácia
    this.load.image(
      "npc_farmacia",
      "src/assets/imagens/imagensPersonagens/NPC/npcFarmacia.png",
    );

    // Tilesets do interior
    this.load.image(
      "farm_int_p1",
      "src/assets/imagens/mapsjson/tileSets/Interiors_Part1.png",
    );
    this.load.image(
      "farm_int_p2",
      "src/assets/imagens/mapsjson/tileSets/Interiors_Part2.png",
    );
    this.load.image(
      "farm_int_p3",
      "src/assets/imagens/mapsjson/tileSets/Interiors_Part3.png",
    );
    this.load.image(
      "farm_roombuilder",
      "src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png",
    );

    // Sprites do personagem (4 direções × 4 frames)
    const caminhoBase = `src/assets/imagens/imagensPersonagens/${nomePasta}`;
    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `farm_frente_${i}`,
        `${caminhoBase}/${prefixo}_frente_${i}.png`,
      );
      this.load.image(
        `farm_tras_${i}`,
        `${caminhoBase}/${prefixo}_tras_${i}.png`,
      );
      this.load.image(
        `farm_direita_${i}`,
        `${caminhoBase}/${prefixo}_direita_${i}.png`,
      );
      this.load.image(
        `farm_esquerda_${i}`,
        `${caminhoBase}/${prefixo}_esquerda_${i}.png`,
      );
    }
  }

  // Monta o mapa, personagem, colisões, NPC e interações
  create() {
    const mapa = this.make.tilemap({ key: "farmacia" });
    this.mapa = mapa;

    // Adiciona áudios a cena
    this.musica = this.sound.add('trilhaSceneFarmacia', { loop: true, volume: 0.5});
    this.musica.play();

    // Otimiza tilesets para reduzir uso de memória
    this._otimizarTilesetsPorUso(mapa);

    const tsP1 = mapa.addTilesetImage(
      "Interior_P1",
      this._keyTileset("Interior_P1", "farm_int_p1"),
    );
    const tsP2 = mapa.addTilesetImage(
      "Interior_P2",
      this._keyTileset("Interior_P2", "farm_int_p2"),
    );
    const tsP3 = mapa.addTilesetImage(
      "Interior_P3",
      this._keyTileset("Interior_P3", "farm_int_p3"),
    );
    const tsRoom = mapa.addTilesetImage(
      "roombuilder",
      this._keyTileset("roombuilder", "farm_roombuilder"),
    );

    const tilesets = [tsP1, tsP2, tsP3, tsRoom].filter(Boolean);

    // Fundo neutro para evitar bordas fora do mapa
    this.add
      .rectangle(
        0,
        0,
        mapa.widthInPixels + 200,
        mapa.heightInPixels + 200,
        0x555555,
      )
      .setOrigin(0, 0);

    // Camadas visuais sem colisão
    mapa.createLayer("Chão", tilesets, 0, 0);
    mapa.createLayer("Parede - N", tilesets, 0, 0);
    mapa.createLayer("Armario 0 - N", tilesets, 0, 0);
    mapa.createLayer("Decoração - N", tilesets, 0, 0);
    mapa.createLayer("Janela - N", tilesets, 0, 0);
    mapa.createLayer("Objetos - N", tilesets, 0, 0);
    mapa.createLayer("Armarios - N", tilesets, 0, 0);

    // Camadas com colisão (bloqueiam o movimento)
    const paredeC = mapa.createLayer("Parede - C", tilesets, 0, 0);
    const arm3C = mapa.createLayer("Armario 3 - C", tilesets, 0, 0);
    const arm2C = mapa.createLayer("Armario 2 - C", tilesets, 0, 0);
    const armC = mapa.createLayer("Armario - C", tilesets, 0, 0);
    const arm0C = mapa.createLayer("Armario 0 - C", tilesets, 0, 0);
    const objC = mapa.createLayer("Objetos - C", tilesets, 0, 0);
    const cadeiraC = mapa.createLayer("Cadeira de rodas - C", tilesets, 0, 0);
    const plantasC = mapa.createLayer("Plantas - C", tilesets, 0, 0);

    // Ativa colisão nas camadas sólidas
    [paredeC, arm3C, arm2C, armC, arm0C, objC, cadeiraC, plantasC]
      .filter(Boolean)
      .forEach((c) => c.setCollisionByExclusion([-1]));

    // Cria animações do personagem
    const direcoes = ["frente", "tras", "direita", "esquerda"];
    direcoes.forEach((dir) => {
      if (!this.anims.exists(`farm_andar_${dir}`)) {
        this.anims.create({
          key: `farm_andar_${dir}`,
          frames: [
            { key: `farm_${dir}_1` },
            { key: `farm_${dir}_2` },
            { key: `farm_${dir}_3` },
            { key: `farm_${dir}_4` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Spawn do personagem próximo à entrada
    const spawnX = mapa.widthInPixels / 2;
    const spawnY = mapa.heightInPixels - 24;

    this.personagem = this.physics.add.sprite(spawnX, spawnY, "farm_frente_1");
    this.personagem.setCollideWorldBounds(true);

    // Ajusta escala e hitbox
    this.personagem.setScale(0.028);
    this.personagem.body.setSize(
      this.personagem.width * 0.35,
      this.personagem.height * 0.35,
    );

    // Colisões com o cenário
    [paredeC, arm3C, arm2C, armC, arm0C, objC, cadeiraC, plantasC]
      .filter(Boolean)
      .forEach((c) => this.physics.add.collider(this.personagem, c));

    // Controles (setas + WASD)
    this.teclas = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.W,
      baixo: Phaser.Input.Keyboard.KeyCodes.S,
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Câmera segue o personagem com zoom alto (ambiente interno)
    this.cameras.main.startFollow(this.personagem);
    this.cameras.main.setZoom(7);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Zona de saída da farmácia
    this.zonaSaida = new Phaser.Geom.Rectangle(118, 215, 60, 40);
    this.labelSair = this.add
      .text(148, 232, "[E] Sair", {
        fontSize: "3px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 1, y: 1 },
        resolution: 4,
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    // NPC da farmácia com escala proporcional ao personagem
    this.npcFarmacia = this.add.image(79, 141, "npc_farmacia").setDepth(5);
    const alturaAlvo = this.personagem.displayHeight;
    this.npcFarmacia.setDisplaySize(
      (this.npcFarmacia.width / this.npcFarmacia.height) * alturaAlvo,
      alturaAlvo,
    );

    // Botão [E] igual às outras cenas
    this.labelNpc = this.add
      .text(79, 163, "[E] Falar", {
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
        this.npcFarmacia.x,
        this.npcFarmacia.y - this.npcFarmacia.displayHeight * 0.5,
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

    // Estados de controle de interação e transição
    this.perto_npc = false;
    this.falouComNpc = false;
    this.transicionando = false;
    this.dentroZonaSaida = false;
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.direcaoAtual = "frente";

    // Debug com coordenadas
    this.debugTxt = this.add
      .text(0, 0, "", {
        fontSize: "3px",
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

  // Retorna tileset otimizado ou fallback
  _keyTileset(tmjName, fallbackKey) {
    return (this._tilesetKeys && this._tilesetKeys[tmjName]) || fallbackKey;
  }

  // Identifica quais tiles são realmente usados no mapa
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

  // Recorta tilesets para conter apenas os tiles utilizados
  _otimizarTilesetsPorUso(mapa) {
    const defs = [
      { tmjName: "Interior_P1", baseKey: "farm_int_p1" },
      { tmjName: "Interior_P2", baseKey: "farm_int_p2" },
      { tmjName: "Interior_P3", baseKey: "farm_int_p3" },
      { tmjName: "roombuilder", baseKey: "farm_roombuilder" },
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

  // Atualiza movimento, interação com NPC e saída da cena
  update() {
    const velocidade = 100;
    const { teclas, wasd, personagem } = this;

    personagem.setVelocity(0);
    let movendo = false;

    // Movimento horizontal
    if (teclas.left.isDown || wasd.esquerda.isDown) {
      personagem.setVelocityX(-velocidade);
      personagem.anims.play("farm_andar_esquerda", true);
      this.direcaoAtual = "esquerda";
      movendo = true;
    } else if (teclas.right.isDown || wasd.direita.isDown) {
      personagem.setVelocityX(velocidade);
      personagem.anims.play("farm_andar_direita", true);
      this.direcaoAtual = "direita";
      movendo = true;
    }

    // Movimento vertical com prioridade menor (evita animação diagonal)
    if (teclas.up.isDown || wasd.cima.isDown) {
      personagem.setVelocityY(-velocidade);
      if (!movendo) personagem.anims.play("farm_andar_tras", true);
      this.direcaoAtual = "tras";
      movendo = true;
    } else if (teclas.down.isDown || wasd.baixo.isDown) {
      personagem.setVelocityY(velocidade);
      if (!movendo) personagem.anims.play("farm_andar_frente", true);
      this.direcaoAtual = "frente";
      movendo = true;
    }

    // Mantém sprite parado na última direção
    if (!movendo) {
      personagem.anims.stop();
      personagem.setTexture(`farm_${this.direcaoAtual}_1`);
    }


    // Novo raio maior para mostrar o botão [E] antes de chegar perto do NPC
    const distNpc = Phaser.Math.Distance.Between(
      personagem.x,
      personagem.y,
      79,
      141,
    );
    const mostrarBotaoE = distNpc < 60; // raio maior para mostrar
    const pertoNpc = distNpc < 30; // raio menor para interação

    if (mostrarBotaoE !== this.perto_npc) {
      this.perto_npc = mostrarBotaoE;
      this.labelNpc.setVisible(mostrarBotaoE && !this.dentroZonaSaida);
    }
    if (mostrarBotaoE) {
      this.labelNpc.setPosition(this.npcFarmacia.x, this.npcFarmacia.y + 2);
    }
    if (pertoNpc && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.scene.pause();
      this.scene.launch("SceneDialogoFarmacia", { cenaOrigem: "SceneFarmacia" });
    }

    if (!this.falouComNpc && this.exclamacaoNpc) {
      this.exclamacaoNpc.setPosition(
        this.npcFarmacia.x,
        this.npcFarmacia.y - this.npcFarmacia.displayHeight * 0.5,
      );
    }

    // Interação com NPC ao pressionar E
    if (pertoNpc && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.falouComNpc = true;
      this.exclamacaoNpc.setVisible(false);
      if (this.tweenExclamacaoNpc) this.tweenExclamacaoNpc.stop();
      console.log("[SceneFarmacia] Interagiu com o NPC da farmácia");
    }

    // Detecta entrada na zona de saída
    const dentroSaida = Phaser.Geom.Rectangle.Contains(
      this.zonaSaida,
      personagem.x,
      personagem.y,
    );

    if (dentroSaida !== this.dentroZonaSaida) {
      this.dentroZonaSaida = dentroSaida;
      this.labelSair.setVisible(dentroSaida);
      if (dentroSaida) this.labelNpc.setVisible(false);
    }

    // Transição de volta para a cidade ao pressionar E na saída
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
          spawnX: 1121,
          spawnY: 1261,
        });
      });
    }

    // Atualiza debug com coordenadas
    this.debugTxt.setText(
      `x:${Math.round(personagem.x)} y:${Math.round(personagem.y)}`,
    );
    this.debugTxt.setPosition(personagem.x - 8, personagem.y - 14);
  }
}
