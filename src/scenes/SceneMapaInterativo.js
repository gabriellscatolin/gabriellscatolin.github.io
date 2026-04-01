export default class SceneMapaInterativo extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMapainterativo" });
  }

   preload() {
  this.load.image("foto_hospital", "src/assets/imagens/imagensMapa/localFarmacia.png");
  this.load.image("foto_Rachel", "src/assets/imagens/imagensMapa/fotoRachelFarmacia.png");
  
	}


  create() {
    const { width, height } = this.cameras.main;

    // --- Dados dos estabelecimentos ---
    const estabelecimentos = [
      {
        id: "hospital",
        nome: "Hospital Central",
        tipo: "Serviços de Saúde",
        // Zona do mapa (x, y, largura, altura) — ajuste conforme seu tilemap
        zona: { x: 80, y: 420, w: 220, h: 160 },
        // Chave da imagem do local (pré-carregada no preload)
        imgLocal: "foto_hospital",
        personagem: {
          nome: "Dra. Laura Mendes",
          cargo: "Diretora Clínica",
          imgPersonagem: "foto_laura",
          historia: "Laura chegou à cidade há 12 anos como residente de emergência. Após salvar a vida do prefeito, ganhou a confiança da comunidade. Esconde um segredo sobre o passado do hospital que pode abalar toda a cidade.",
        },
      },
      {
        id: "bakery",
        nome: "Bakery",
        tipo: "Gastronomia",
        zona: { x: 300, y: 270, w: 140, h: 110 },
        imgLocal: "foto_bakery",
        personagem: {
          nome: "Ana Moura",
          cargo: "Padeira & Proprietária",
          imgPersonagem: "foto_ana",
          historia: "Herdou a padaria dos avós portugueses e transformou o lugar num ponto de encontro da vizinhança. Conhece toda a fofoca da cidade — ninguém percebe o quanto ela presta atenção.",
        },
      },
      // Adicione quantos quiser seguindo o mesmo padrão
    ];

    // --- Mapa de fundo ---
    // Se você tiver um tilemap, use this.make.tilemap aqui.
    // Para protótipo simples:
    this.add.rectangle(0, 0, width * 0.72, height, 0x2d5a1b).setOrigin(0, 0);

    // --- Painel lateral ---
    const painelX = width * 0.72;
    const painelW = width * 0.28;
    const painel = this.add.rectangle(painelX, 0, painelW, height, 0x1a1a2e).setOrigin(0, 0);

    // Textos do painel (inicialmente invisíveis)
    const imgLocalPlaceholder = this.add
      .rectangle(painelX + 10, 10, painelW - 20, painelH * 0.35, 0x2a2a3e)
      .setOrigin(0, 0)
      .setVisible(false);

    const txtNomeLocal = this.add
      .text(painelX + 16, 0, "", { fontSize: "15px", color: "#ffffff", fontStyle: "bold", wordWrap: { width: painelW - 32 } })
      .setVisible(false);

    const txtTipo = this.add
      .text(painelX + 16, 0, "", { fontSize: "11px", color: "#aaaacc", wordWrap: { width: painelW - 32 } })
      .setVisible(false);

    const txtNomeChar = this.add
      .text(painelX + 16, 0, "", { fontSize: "13px", color: "#ffdd57", fontStyle: "bold", wordWrap: { width: painelW - 32 } })
      .setVisible(false);

    const txtCargo = this.add
      .text(painelX + 16, 0, "", { fontSize: "11px", color: "#aaaacc", wordWrap: { width: painelW - 32 } })
      .setVisible(false);

    const txtHistoria = this.add
      .text(painelX + 16, 0, "", { fontSize: "11px", color: "#cccccc", wordWrap: { width: painelW - 32 }, lineSpacing: 4 })
      .setVisible(false);

    const txtHint = this.add
      .text(painelX + painelW / 2, height / 2, "Passe o cursor\nsobre um local\nno mapa", {
        fontSize: "13px",
        color: "#666688",
        align: "center",
      })
      .setOrigin(0.5);

    // Imagem do local (instância reutilizável)
    let imgLocalSprite = null;
    let imgCharSprite = null;

    // --- Função que exibe o painel ---
    const mostrarPainel = (dados) => {
      const painelH = height;
      const fotoH = painelH * 0.32;
      const margem = 14;

      txtHint.setVisible(false);
      imgLocalPlaceholder.setVisible(true).setPosition(painelX + margem, margem).setSize(painelW - margem * 2, fotoH);

      // Imagem do local
      if (imgLocalSprite) imgLocalSprite.destroy();
      if (this.textures.exists(dados.imgLocal)) {
        imgLocalSprite = this.add.image(painelX + margem, margem, dados.imgLocal)
          .setOrigin(0, 0)
          .setDisplaySize(painelW - margem * 2, fotoH);
      }

      let curY = margem + fotoH + 10;

      txtNomeLocal.setPosition(painelX + margem, curY).setText(dados.nome).setVisible(true);
      curY += txtNomeLocal.height + 4;

      txtTipo.setPosition(painelX + margem, curY).setText(dados.tipo).setVisible(true);
      curY += txtTipo.height + 16;

      // Separador
      this.add.line(painelX + margem, curY, 0, 0, painelW - margem * 2, 0, 0x333355).setOrigin(0, 0);
      curY += 12;

      // Imagem do personagem (pequena, circular — Phaser não tem clip circular nativo, use máscara)
      const avatarSize = 48;
      if (imgCharSprite) imgCharSprite.destroy();
      if (this.textures.exists(dados.personagem.imgPersonagem)) {
        imgCharSprite = this.add.image(painelX + margem + avatarSize / 2, curY + avatarSize / 2, dados.personagem.imgPersonagem)
          .setDisplaySize(avatarSize, avatarSize);
        // Máscara circular
        const maskShape = this.make.graphics({ x: painelX + margem, y: curY, add: false });
        maskShape.fillCircle(avatarSize / 2, avatarSize / 2, avatarSize / 2);
        imgCharSprite.setMask(maskShape.createGeometryMask());
      }

      txtNomeChar.setPosition(painelX + margem + avatarSize + 10, curY).setText(dados.personagem.nome).setVisible(true);
      txtCargo.setPosition(painelX + margem + avatarSize + 10, curY + txtNomeChar.height + 4).setText(dados.personagem.cargo).setVisible(true);
      curY += Math.max(avatarSize, txtNomeChar.height + txtCargo.height + 4) + 16;

      txtHistoria.setPosition(painelX + margem, curY).setText(dados.personagem.historia).setVisible(true);
    };

    const esconderPainel = () => {
      [imgLocalPlaceholder, txtNomeLocal, txtTipo, txtNomeChar, txtCargo, txtHistoria].forEach(o => o.setVisible(false));
      if (imgLocalSprite) { imgLocalSprite.destroy(); imgLocalSprite = null; }
      if (imgCharSprite) { imgCharSprite.destroy(); imgCharSprite = null; }
      txtHint.setVisible(true);
    };

    // --- Zonas interativas sobre o mapa ---
    estabelecimentos.forEach((estab) => {
      const { x, y, w, h } = estab.zona;

      // Retângulo invisível interativo
      const zona = this.add
        .rectangle(x, y, w, h, 0xffff00, 0) // alpha 0 = invisível
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

      // Borda de highlight (aparece no hover)
      const borda = this.add.rectangle(x, y, w, h).setOrigin(0, 0).setStrokeStyle(2, 0xffdd57).setFillStyle(0xffdd57, 0.08).setVisible(false);

      zona.on("pointerover", () => {
        borda.setVisible(true);
        mostrarPainel(estab);
      });

      zona.on("pointerout", () => {
        borda.setVisible(false);
        esconderPainel();
      });
    });

    // --- ESC para voltar ---
    this.input.keyboard?.once("keydown-ESC", () => {
      const retornoX = Number(this.registry.get("cidadeRetornoX"));
      const retornoY = Number(this.registry.get("cidadeRetornoY"));
      const dadosRetorno = {};
      if (Number.isFinite(retornoX)) dadosRetorno.spawnX = retornoX;
      if (Number.isFinite(retornoY)) dadosRetorno.spawnY = retornoY;
      this.scene.start("SceneCidade", dadosRetorno);
    });
  }
}