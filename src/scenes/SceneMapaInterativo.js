export default class SceneMapaInterativo extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMapaInterativo" });
  }

  preload() {
    const baseFotos = "src/assets/imagens/imagensMapa/";

    // Fotos dos personagens
    this.load.image("fotoAlicia",   baseFotos + "fotoAliciaMercado.png");
    this.load.image("fotoEduardo",  baseFotos + "fotoEduardoLoja.png");
    this.load.image("fotoGabriel",  baseFotos + "fotoGabrielEscritorio.png");
    this.load.image("fotoLucas",    baseFotos + "fotoLucasRestaurante.png");
    this.load.image("fotoNicolas",  baseFotos + "fotoNicolasPosto.png");
    this.load.image("fotoRachel",   baseFotos + "fotoRachelFarmacia.png");
    this.load.image("fotoSofia",    baseFotos + "fotoSofiaPadaria.png");

    // Fotos dos locais
    this.load.image("localAgencia01",    baseFotos + "localAgencia01.png");
    this.load.image("localAgencia02",    baseFotos + "localAgencia02.png");
    this.load.image("localAgencia03",    baseFotos + "localAgencia03.png");
    this.load.image("localEscritorio",   baseFotos + "localEscritorio.png");
    this.load.image("localFarmacia",     baseFotos + "localFarmacia.png");
    this.load.image("localLojaRoupas",   baseFotos + "localLojadeRoupas.png");
    this.load.image("localMercado",      baseFotos + "localmercado.png");
    this.load.image("localMetro",        baseFotos + "localMetro.png");
    this.load.image("localPadaria",      baseFotos + "localPadaria.png");
    this.load.image("localPosto",        baseFotos + "localPosto.png");
    this.load.image("localRestaurante",  baseFotos + "localRestaurante.png");
    this.load.image("mapaInterativo",   baseFotos + "mapaInterativo.png");
  }

  create() {
    const { width, height } = this.cameras.main;

    const txtDebugCoords = this.add
      .text(16, height - 16, "x: 0 y: 0", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0, 1)
      .setDepth(320);

    const estabelecimentos = [
      {
        id: "farmacia",
        nome: "Farmácia",
        tipo: "Saúde",
        zona: { x: 80, y: 420, w: 220, h: 160 },
        imgLocal: "localFarmacia",
        personagem: {
          nome: "Rachel",
          cargo: "Farmacêutica",
          imgPersonagem: "fotoRachel",
          historia: "Rachel trabalha na farmácia há anos e conhece cada morador pelo nome. Discreta e atenciosa, ela guarda segredos de muita gente da cidade.",
        },
      },
      {
        id: "padaria",
        nome: "Padaria",
        tipo: "Gastronomia",
        zona: { x: 300, y: 270, w: 140, h: 110 },
        imgLocal: "localPadaria",
        personagem: {
          nome: "Sofia",
          cargo: "Padeira & Proprietária",
          imgPersonagem: "fotoSofia",
          historia: "Sofia acorda antes do sol para garantir que o pão saia quentinho. Sua padaria é o coração do bairro — e ela ouve tudo que acontece por aqui.",
        },
      },
      {
        id: "mercado",
        nome: "Mercado",
        tipo: "Comércio",
        zona: { x: 500, y: 300, w: 160, h: 130 },
        imgLocal: "localMercado",
        personagem: {
          nome: "Alicia",
          cargo: "Gerente do Mercado",
          imgPersonagem: "fotoAlicia",
          historia: "Alicia comanda o mercado com mão de ferro e sorriso no rosto. Ninguém passa despercebido pelos seus olhos atentos.",
        },
      },
      {
        id: "restaurante",
        nome: "Restaurante",
        tipo: "Gastronomia",
        zona: { x: 650, y: 180, w: 150, h: 120 },
        imgLocal: "localRestaurante",
        personagem: {
          nome: "Lucas",
          cargo: "Chef & Proprietário",
          imgPersonagem: "fotoLucas",
          historia: "Lucas voltou à cidade após anos trabalhando em restaurantes estrelados no exterior. Ninguém sabe ao certo por que ele largou tudo para abrir um lugar tão pequeno.",
        },
      },
      {
        id: "escritorio",
        nome: "Escritório",
        tipo: "Corporativo",
        zona: { x: 400, y: 100, w: 170, h: 130 },
        imgLocal: "localEscritorio",
        personagem: {
          nome: "Gabriel",
          cargo: "Advogado",
          imgPersonagem: "fotoGabriel",
          historia: "Gabriel representa os clientes mais influentes da cidade. Sua agenda é cheia de nomes que nunca aparecem em nenhum registro público.",
        },
      },
      {
        id: "loja",
        nome: "Loja de Roupas",
        tipo: "Moda & Varejo",
        zona: { x: 200, y: 150, w: 130, h: 100 },
        imgLocal: "localLojaRoupas",
        personagem: {
          nome: "Eduardo",
          cargo: "Vendedor",
          imgPersonagem: "fotoEduardo",
          historia: "Eduardo tem um dom especial para agradar clientes. Por trás do charme, existe uma história que ele prefere não contar.",
        },
      },
      {
        id: "posto",
        nome: "Posto de Gasolina",
        tipo: "Combustíveis",
        zona: { x: 700, y: 400, w: 150, h: 110 },
        imgLocal: "localPosto",
        personagem: {
          nome: "Nicolas",
          cargo: "Frentista & Mecânico",
          imgPersonagem: "fotoNicolas",
          historia: "Todo carro que entra na cidade para no posto de Nicolas. Ele anota tudo — quem chegou, que horas e com quem.",
        },
      },
    ];

    // --- Mapa de fundo ---
    if (this.textures.exists("mapaInterativo")) {
      this.add.image(0, 0, "mapaInterativo").setOrigin(0, 0).setDisplaySize(width * 0.72, height);
    } else {
      this.add.rectangle(0, 0, width * 0.72, height, 0x2d5a1b).setOrigin(0, 0);
    }

    // --- Botão voltar ---
    const botaoVoltarWidth = 150;
    const botaoVoltarHeight = 44;
    const botaoVoltarX = width - 16;
    const botaoVoltarY = height - 16 - botaoVoltarHeight;

    const btnVoltarBg = this.add
      .rectangle(botaoVoltarX, botaoVoltarY, botaoVoltarWidth, botaoVoltarHeight, 0x222244, 0.9)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0xffdd57)
      .setDepth(310);

    const btnVoltarLabel = this.add
      .text(botaoVoltarX - botaoVoltarWidth / 2, botaoVoltarY + botaoVoltarHeight / 2, "Voltar", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(311);

    const btnVoltarArea = this.add
      .rectangle(botaoVoltarX, botaoVoltarY, botaoVoltarWidth, botaoVoltarHeight, 0x000000, 0)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(312);

    const obterCenaRetorno = () => {
      const cena = this.registry.get("mapaRetornoCena");
      return typeof cena === "string" && cena ? cena : "SceneCidade";
    };

    const retornarCenaAnterior = () => {
      const retornoX = Number(this.registry.get("cidadeRetornoX"));
      const retornoY = Number(this.registry.get("cidadeRetornoY"));
      const dadosRetorno = {};
      if (Number.isFinite(retornoX)) dadosRetorno.spawnX = retornoX;
      if (Number.isFinite(retornoY)) dadosRetorno.spawnY = retornoY;
      this.scene.start(obterCenaRetorno(), dadosRetorno);
    };

    btnVoltarArea.on("pointerover", () => {
      btnVoltarBg.setFillStyle(0x2a2a60, 0.95);
    });
    btnVoltarArea.on("pointerout", () => {
      btnVoltarBg.setFillStyle(0x222244, 0.9);
    });
    btnVoltarArea.on("pointerdown", () => {
      retornarCenaAnterior();
    });

    // --- Painel lateral ---
    const painelX = width * 0.72;
    const painelW = width * 0.28;
    this.add.rectangle(painelX, 0, painelW, height, 0x1a1a2e).setOrigin(0, 0);

    const margem = 14;
    const painelH = height;
    const fotoH = painelH * 0.48; // imagem do local ainda maior
    const avatarSize = 80; // avatar ainda maior

    const imgLocalPlaceholder = this.add
      .rectangle(painelX + margem, margem, painelW - margem * 2, fotoH, 0x2a2a3e)
      .setOrigin(0, 0)
      .setVisible(false);

    const txtNomeLocal = this.add
      .text(painelX + margem, 0, "", {
        fontSize: "22px", color: "#ffffff", fontStyle: "bold",
        wordWrap: { width: painelW - margem * 2 },
      })
      .setVisible(false);

    const txtTipo = this.add
      .text(painelX + margem, 0, "", {
        fontSize: "11px", color: "#aaaacc",
        wordWrap: { width: painelW - margem * 2 },
      })
      .setVisible(false);

    const txtNomeChar = this.add
      .text(painelX + margem + avatarSize + 10, 0, "", {
        fontSize: "13px", color: "#ffdd57", fontStyle: "bold",
        wordWrap: { width: painelW - margem * 2 - avatarSize - 10 },
      })
      .setVisible(false);

    const txtCargo = this.add
      .text(painelX + margem + avatarSize + 10, 0, "", {
        fontSize: "11px", color: "#aaaacc",
        wordWrap: { width: painelW - margem * 2 - avatarSize - 10 },
      })
      .setVisible(false);

    const txtHistoria = this.add
      .text(painelX + margem, 0, "", {
        fontSize: "20px", color: "#eeeeff",
        wordWrap: { width: painelW - margem * 2 },
        lineSpacing: 5,
      })
      .setVisible(false);

    const txtHint = this.add
      .text(painelX + painelW / 2, height / 2, "Passe o cursor\nsobre um local\nno mapa", {
        fontSize: "13px", color: "#666688", align: "center",
      })
      .setOrigin(0.5);

    let imgLocalSprite = null;
    let imgCharSprite = null;
    let separadorAtual = null;
    let estabAtivo = null;

    const mostrarPainel = (dados) => {
      estabAtivo = dados;
      txtHint.setVisible(false);
      imgLocalPlaceholder.setVisible(true);

      // Foto do local
      if (imgLocalSprite) imgLocalSprite.destroy();
      if (this.textures.exists(dados.imgLocal)) {
        imgLocalSprite = this.add
          .image(painelX + margem, margem, dados.imgLocal)
          .setOrigin(0, 0)
          .setDisplaySize(painelW - margem * 2, fotoH);
      }

      let curY = margem + fotoH + 10;

      txtNomeLocal.setPosition(painelX + margem, curY).setText(dados.nome).setVisible(true);
      curY += txtNomeLocal.height + 4;

      txtTipo.setPosition(painelX + margem, curY).setText(dados.tipo).setVisible(true);
      curY += txtTipo.height + 12;

      if (separadorAtual) separadorAtual.destroy();
      separadorAtual = this.add
        .line(painelX + margem, curY, 0, 0, painelW - margem * 2, 0, 0x333355)
        .setOrigin(0, 0);
      curY += 14;

      // Foto do personagem com máscara circular
      if (imgCharSprite) imgCharSprite.destroy();
      if (this.textures.exists(dados.personagem.imgPersonagem)) {
        imgCharSprite = this.add
          .image(
            painelX + margem + avatarSize / 2,
            curY + avatarSize / 2,
            dados.personagem.imgPersonagem
          )
          .setDisplaySize(avatarSize, avatarSize);

        const maskShape = this.make.graphics({ x: painelX + margem, y: curY, add: false });
        maskShape.fillCircle(avatarSize / 2, avatarSize / 2, avatarSize / 2);
        imgCharSprite.setMask(maskShape.createGeometryMask());
      }

      txtNomeChar
        .setPosition(painelX + margem + avatarSize + 10, curY)
        .setText(dados.personagem.nome)
        .setVisible(true);

      txtCargo
        .setPosition(painelX + margem + avatarSize + 10, curY + txtNomeChar.height + 4)
        .setText(dados.personagem.cargo)
        .setVisible(true);

      curY += Math.max(avatarSize, txtNomeChar.height + txtCargo.height + 4) + 14;

      txtHistoria
        .setPosition(painelX + margem, curY)
        .setText(dados.personagem.historia)
        .setVisible(true);
    };

    const esconderPainel = () => {
      [imgLocalPlaceholder, txtNomeLocal, txtTipo, txtNomeChar, txtCargo, txtHistoria]
        .forEach(o => o.setVisible(false));

      if (imgLocalSprite) { imgLocalSprite.destroy(); imgLocalSprite = null; }
      if (imgCharSprite)  { imgCharSprite.destroy();  imgCharSprite = null;  }
      if (separadorAtual) { separadorAtual.destroy();  separadorAtual = null; }

      txtHint.setVisible(true);
    };

    // --- Zonas interativas ---
    estabelecimentos.forEach((estab) => {
      const { x, y, w, h } = estab.zona;

      const zona = this.add
        .rectangle(x, y, w, h, 0xffff00, 0)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

      const borda = this.add
        .rectangle(x, y, w, h)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xffdd57)
        .setFillStyle(0xffdd57, 0.08)
        .setVisible(false);

      zona.on("pointerover", () => { borda.setVisible(true);  mostrarPainel(estab); });
      zona.on("pointerout", (pointer) => {
        if (!pointer.isDown) {
          borda.setVisible(false);
          esconderPainel();
        }
      });
    });

    this.input.on("pointermove", (pointer) => {
      txtDebugCoords.setText(`x: ${Math.round(pointer.x)} y: ${Math.round(pointer.y)}`);

      if (!pointer.isDown) return;

      const px = pointer.x;
      const py = pointer.y;
      const estabArrastado = estabelecimentos.find((e) =>
        px >= e.zona.x && px <= e.zona.x + e.zona.w && py >= e.zona.y && py <= e.zona.y + e.zona.h
      );

      if (estabArrastado) {
        if (!estabAtivo || estabAtivo.id !== estabArrastado.id) {
          mostrarPainel(estabArrastado);
        }
      } else {
        if (estabAtivo) {
          estabAtivo = null;
          esconderPainel();
        }
      }
    });

    // --- ESC para voltar ---
    this.input.keyboard?.once("keydown-ESC", () => {
      retornarCenaAnterior();
    });
  }
}