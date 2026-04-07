export default class SceneMapaInterativo extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMapaInterativo" });
  }

  preload() {
    const baseFotos = "src/assets/imagens/imagensMapa/";

    // Fotos dos personagens que aparecem no painel lateral
    this.load.image("fotoAlicia", baseFotos + "fotoAliciaMercado.png");
    this.load.image("fotoEduardo", baseFotos + "fotoEduardoLoja.png");
    this.load.image("fotoGabriel", baseFotos + "fotoGabrielEscritorio.png");
    this.load.image("fotoLucas", baseFotos + "fotoLucasRestaurante.png");
    this.load.image("fotoNicolas", baseFotos + "fotoNicolasPosto.png");
    this.load.image("fotoRachel", baseFotos + "fotoRachelFarmacia.png");
    this.load.image("fotoSofia", baseFotos + "fotoSofiaPadaria.png");

    // Fotos dos locais exibidas no topo do painel lateral
    this.load.image("localAgencia01", baseFotos + "localAgencia01.png");
    this.load.image("localAgencia02", baseFotos + "localAgencia02.png");
    this.load.image("localAgencia03", baseFotos + "localAgencia03.png");
    this.load.image("localEscritorio", baseFotos + "localEscritorio.png");
    this.load.image("localFarmacia", baseFotos + "localFarmacia.png");
    this.load.image("localLojaRoupas", baseFotos + "localLojadeRoupas.png");
    this.load.image("localMercado", baseFotos + "localmercado.png");
    this.load.image("localMetro", baseFotos + "localMetro.png");
    this.load.image("localPadaria", baseFotos + "localPadaria.png");
    this.load.image("localPosto", baseFotos + "localPosto.png");
    this.load.image("localRestaurante", baseFotos + "localRestaurante.png");

    // Imagem de fundo do mapa interativo
    this.load.image("mapaInterativo", baseFotos + "mapaInterativo.png");

    // Som da cena
    this.load.audio(
      "trilhaSceneInicial",
      "src/assets/audios/trilhaSceneInicial.mp3",
    );
  }

  create() {
    const { width, height } = this.cameras.main;

    // Adiciona som na cena
    this.musica = this.sound.add("trilhaSceneInicial", {
      loop: true,
      volume: 0.5,
    });
    this.musica.play();

    // DEBUG — texto no canto inferior esquerdo mostrando as coordenadas
    // do cursor em tempo real. Útil para ajustar as zonas (zona.x/y/w/h).
    const txtDebugCoords = this.add.text(16, height - 16, {
      fontSize: "16px",
    });

    // DADOS DOS ESTABELECIMENTOS
    // Cada objeto representa um local clicável no mapa.
    //
    // Campos obrigatórios:
    //   id        — identificador único (string)
    //   nome      — nome exibido no painel
    //   tipo      — categoria exibida abaixo do nome
    //   zona      — área retangular interativa {x, y, w, h} em pixels do mapa
    //   imgLocal  — chave da imagem do local (carregada no preload)
    //
    // Campo opcional:
    //   personagem — se existir, exibe avatar circular + nome + cargo no painel.
    //                Se NÃO existir (ex: Metro), exibe só o campo "historia".
    //   historia   — texto exibido diretamente quando não há personagem.
    // -----------------------------------------------------------------------
    const estabelecimentos = [
      {
        id: "farmacia",
        nome: "Farmácia",
        tipo: "Saúde",
        zona: { x: 214, y: 574, w: 220, h: 160 },
        imgLocal: "localFarmacia",
        personagem: {
          nome: "Rachel",
          faturamento: "~R$ 300 mil/mês",
          imgPersonagem: "fotoRachel",
          historia:
            "Rachel trabalha na farmácia há anos e é mãe solteira. Ela construiu a farmácia com anos de economia e muito esforço. Divide a rotina entre o negócio e o filho pequeno, vivendo sempre no limite do tempo. É organizada e exigente, porque sabe que qualquer erro vira mais uma coisa para resolver no fim do dia.",
        },
      },
      {
        id: "padaria",
        nome: "Padaria",
        tipo: "Gastronomia",
        zona: { x: 336, y: 334, w: 140, h: 110 },
        imgLocal: "localPadaria",
        personagem: {
          nome: "Sofia",
          faturamento: "~R$ 120 mil/mês",
          imgPersonagem: "fotoSofia",
          historia:
            "Sofia acorda antes do sol para garantir que o pão saia quentinho. Assumiu a padaria após a morte repentina do pai, sem estar totalmente preparada. Aprendeu na prática, errando e acertando, enquanto cuida da mãe idosa em casa. Trabalha todos os dias, abre cedo e fecha tarde. No fim do mês, sente que o dinheiro não acompanha o esforço.",
        },
      },
      {
        id: "mercado",
        nome: "Mercado",
        tipo: "Comércio",
        zona: { x: 1172, y: 77, w: 160, h: 130 },
        imgLocal: "localMercado",
        personagem: {
          nome: "Alicia",
          faturamento: "~R$ 800 mil/mês",
          imgPersonagem: "fotoAlicia",
          historia:
            "Alicia começou como operadora de caixa ainda adolescente e cresceu dentro do negócio da família. Hoje lidera duas unidades e uma equipe grande, lidando com pressão constante. Já enfrentou perdas financeiras que só apareceram dias depois, e isso mudou sua forma de gerir.",
        },
      },
      {
        id: "restaurante",
        nome: "Restaurante",
        tipo: "Gastronomia",
        zona: { x: 1023, y: 40, w: 150, h: 120 },
        imgLocal: "localRestaurante",
        personagem: {
          nome: "Lucas",
          faturamento: "~R$ 800 mil/mês",
          imgPersonagem: "fotoLucas",
          historia:
            "Lucas deixou a estabilidade do mundo corporativo para empreender. Investiu alto, assumiu dívidas e carrega a pressão de fazer o negócio dar certo. Vive com a sensação de que qualquer falha pode comprometer semanas de trabalho.",
        },
      },
      {
        id: "escritorio",
        nome: "Escritório",
        tipo: "Corporativo",
        zona: { x: 527, y: 581, w: 100, h: 130 },
        imgLocal: "localEscritorio",
        personagem: {
          nome: "Gabriel",
          faturamento: "~R$ 80 mil/mês",
          imgPersonagem: "fotoGabriel",
          historia:
            "Gabriel é uma pessoa com deficiência visual parcial, construiu a carreira enfrentando barreiras desde cedo. Desenvolveu um estilo de trabalho extremamente organizado e independente. Prefere processos claros e previsíveis, porque qualquer ruído ou inconsistência gera insegurança.",
        },
      },
      {
        id: "loja",
        nome: "Loja de Roupas",
        tipo: "Moda & Varejo",
        zona: { x: 777, y: 803, w: 130, h: 100 },
        imgLocal: "localLojaRoupas",
        personagem: {
          nome: "Eduardo",
          faturamento: "~R$ 80 mil/mês",
          imgPersonagem: "fotoEduardo",
          historia:
            "Eduardo é um jovem empreendedor, criou a marca a partir do Instagram e transformou a loja em um espaço híbrido, com roupas e serviços de beleza. Enxerga o negócio como experiência, não só venda. Já passou por situações em que falhas no pagamento quebraram o clima com o cliente.",
        },
      },
      {
        id: "posto",
        nome: "Posto de Gasolina",
        tipo: "Combustíveis",
        zona: { x: 1089, y: 722, w: 150, h: 110 },
        imgLocal: "localPosto",
        personagem: {
          nome: "Nicolas",
          faturamento: "~R$ 990 mil/mês",
          imgPersonagem: "fotoNicolas",
          historia:
            "Nicolas assumiu o posto da família e expandiu a operação com muita disciplina. Trabalha praticamente todos os dias e está sempre atento ao funcionamento do negócio. Já teve prejuízos relevantes por falhas de sistema e não aceita qualquer risco de parada.",
        },
      },
      {
        id: "agencia01",
        nome: "Agência 01",
        tipo: "Serviços",
        zona: { x: 60, y: 323, w: 150, h: 120 },
        imgLocal: "localAgencia01",
        historia:
          "Nesta agência você poderá encontrar o PJ e o Gerente responsável pelo atendimento da região.",
      },
      {
        id: "agencia02",
        nome: "Agência 02",
        tipo: "Serviços",
        zona: { x: 549, y: 750, w: 150, h: 120 },
        imgLocal: "localAgencia02", // ← certifique-se que o arquivo no disco se chama localAgencia02.png
        historia:
          "Nesta agência você poderá encontrar o PJ e o Gerente responsável pelo atendimento da região.",
      },
      {
        id: "agencia03",
        nome: "Agência 03",
        tipo: "Serviços",
        zona: { x: 950, y: 314, w: 150, h: 120 }, // ← coordenadas corrigidas
        imgLocal: "localAgencia03",
        historia:
          "Nesta agência você poderá encontrar o PJ e o Gerente responsável pelo atendimento da região.",
      },
      {
        // Metro NÃO tem personagem — só exibe a história do local no painel.
        // A função mostrarPainel trata esse caso separadamente.
        id: "metro",
        nome: "Metro",
        tipo: "Transporte",
        zona: { x: 1237, y: 609, w: 150, h: 120 },
        imgLocal: "localMetro",
        historia:
          "Aqui é o local onde você pode viajar de metro pelo mini mundo Cielo.",
      },
    ];

    // MAPA DE FUNDO
    if (this.textures.exists("mapaInterativo")) {
      this.add
        .image(0, 0, "mapaInterativo")
        .setOrigin(0, 0)
        .setDisplaySize(width * 0.72, height);
    } else {
      // Fallback visual caso a imagem do mapa não carregue
      this.add.rectangle(0, 0, width * 0.72, height, 0x2d5a1b).setOrigin(0, 0);
    }

    // BOTÃO VOLTAR
    const botaoVoltarWidth = 150;
    const botaoVoltarHeight = 44;
    const botaoVoltarX = width - 16; // alinhado à direita com margem de 16px
    const botaoVoltarY = height - 16 - botaoVoltarHeight;

    // Fundo visual do botão
    const btnVoltarBg = this.add
      .rectangle(
        botaoVoltarX,
        botaoVoltarY,
        botaoVoltarWidth,
        botaoVoltarHeight,
        0x222244,
        0.9,
      )
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0xffdd57)
      .setDepth(310);

    // Texto do botão
    this.add
      .text(
        botaoVoltarX - botaoVoltarWidth / 2,
        botaoVoltarY + botaoVoltarHeight / 2,
        "Voltar",
        {
          fontSize: "20px",
          color: "#ffffff",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setDepth(311);

    // Área invisível que recebe os eventos de mouse (fica acima do visual)
    const btnVoltarArea = this.add
      .rectangle(
        botaoVoltarX,
        botaoVoltarY,
        botaoVoltarWidth,
        botaoVoltarHeight,
        0x000000,
        0,
      )
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(312);

    // Retorna a cena de destino salva no registry (padrão: SceneCidade)
    const obterCenaRetorno = () => {
      const cena = this.registry.get("mapaRetornoCena");
      return typeof cena === "string" && cena ? cena : "SceneCidade";
    };

    // Lê as coordenadas de spawn salvas e inicia a cena de retorno
    const retornarCenaAnterior = () => {
      const retornoX = Number(this.registry.get("cidadeRetornoX"));
      const retornoY = Number(this.registry.get("cidadeRetornoY"));
      const dadosRetorno = {};
      if (Number.isFinite(retornoX)) dadosRetorno.spawnX = retornoX;
      if (Number.isFinite(retornoY)) dadosRetorno.spawnY = retornoY;
      this.registry.set("limparDestaqueMissaoCidadeAoRetornarDoMapa", true);
      this.scene.start(obterCenaRetorno(), dadosRetorno);
    };

    // Hover: escurece o fundo ao passar o mouse
    btnVoltarArea.on("pointerover", () => {
      btnVoltarBg.setFillStyle(0x2a2a60, 0.95);
    });
    // Hover out: restaura a cor original
    btnVoltarArea.on("pointerout", () => {
      btnVoltarBg.setFillStyle(0x222244, 0.9);
    });
    // Click: volta para a cena anterior
    btnVoltarArea.on("pointerdown", () => {
      retornarCenaAnterior();
    });

    // PAINEL LATERAL
    const painelX = width * 0.72; // onde o painel começa (X)
    const painelW = width * 0.28; // largura do painel
    const margem = 14; // margem interna padrão
    const fotoH = height * 0.48; // altura reservada para a foto do local
    const avatarSize = 80; // tamanho do avatar circular do personagem

    // Fundo escuro do painel
    this.add.rectangle(painelX, 0, painelW, height, 0x1a1a2e).setOrigin(0, 0);

    // Placeholder cinza por trás da foto do local (visível enquanto a imagem carrega)
    const imgLocalPlaceholder = this.add
      .rectangle(
        painelX + margem,
        margem,
        painelW - margem * 2,
        fotoH,
        0x2a2a3e,
      )
      .setOrigin(0, 0)
      .setVisible(false);

    // Nome do estabelecimento (ex: "Farmácia")
    const txtNomeLocal = this.add
      .text(painelX + margem, 0, "", {
        fontSize: "30px",
        color: "#ffffff",
        fontStyle: "bold",
        wordWrap: { width: painelW - margem * 2 },
      })
      .setVisible(false);

    // Tipo/categoria (ex: "Saúde")
    const txtTipo = this.add
      .text(painelX + margem, 0, "", {
        fontSize: "20px",
        color: "#aaaacc",
        wordWrap: { width: painelW - margem * 2 },
      })
      .setVisible(false);

    // Nome do personagem (ao lado do avatar)
    const txtNomeChar = this.add
      .text(painelX + margem + avatarSize + 10, 0, "", {
        fontSize: "20px",
        color: "#ffdd57",
        fontStyle: "bold",
        wordWrap: { width: painelW - margem * 2 - avatarSize - 10 },
      })
      .setVisible(false);

    // Cargo do personagem (abaixo do nome)
    const txtCargo = this.add
      .text(painelX + margem + avatarSize + 10, 0, "", {
        fontSize: "17px",
        color: "#aaaacc",
        wordWrap: { width: painelW - margem * 2 - avatarSize - 10 },
      })
      .setVisible(false);

    // Texto da história (do personagem ou do local, dependendo do estabelecimento)
    const txtHistoria = this.add
      .text(painelX + margem, 0, "", {
        fontSize: "23px",
        color: "#eeeeff",
        wordWrap: { width: painelW - margem * 2 },
        lineSpacing: 5,
      })
      .setVisible(false);

    // Dica inicial exibida quando nenhum local está selecionado
    const txtHint = this.add
      .text(
        painelX + painelW / 2,
        height / 2,
        "Passe o cursor\nsobre um local\nno mapa",
        {
          fontSize: "25px",
          color: "#666688",
          align: "center",
        },
      )
      .setOrigin(0.5);

    // Referências aos objetos dinâmicos que são destruídos e recriados a cada hover
    let imgLocalSprite = null; // foto do local (recriada a cada troca)
    let imgCharSprite = null; // avatar do personagem (recriado a cada troca)
    let separadorAtual = null; // linha separadora (recriada a cada troca)
    let estabAtivo = null; // estabelecimento atualmente em foco

    // -----------------------------------------------------------------------
    // mostrarPainel(dados)
    // Preenche o painel lateral com as informações do estabelecimento passado.
    // Destrói e recria os objetos dinâmicos (sprites e separador) para evitar
    // acúmulo de objetos na cena a cada troca de hover.
    // -----------------------------------------------------------------------
    const mostrarPainel = (dados) => {
      estabAtivo = dados;
      txtHint.setVisible(false);
      imgLocalPlaceholder.setVisible(true);

      // Foto do local
      // Destrói o sprite anterior antes de criar um novo
      if (imgLocalSprite) imgLocalSprite.destroy();
      if (this.textures.exists(dados.imgLocal)) {
        imgLocalSprite = this.add
          .image(painelX + margem, margem, dados.imgLocal)
          .setOrigin(0, 0)
          .setDisplaySize(painelW - margem * 2, fotoH);
      }

      // curY controla a posição Y atual enquanto empilhamos os elementos
      let curY = margem + fotoH + 10;

      // Nome do local
      txtNomeLocal
        .setPosition(painelX + margem, curY)
        .setText(dados.nome)
        .setVisible(true);
      curY += txtNomeLocal.height + 4;

      // Tipo/categoria
      txtTipo
        .setPosition(painelX + margem, curY)
        .setText(dados.tipo)
        .setVisible(true);
      curY += txtTipo.height + 12;

      // Linha separadora horizontal
      if (separadorAtual) separadorAtual.destroy();
      separadorAtual = this.add
        .line(painelX + margem, curY, 0, 0, painelW - margem * 2, 0, 0x333355)
        .setOrigin(0, 0);
      curY += 14;

      // --- Bloco do personagem (condicional) ---
      if (imgCharSprite) imgCharSprite.destroy();

      if (dados.personagem) {
        // Este estabelecimento TEM personagem: exibe avatar + nome + cargo + história

        // Avatar circular com máscara geométrica
        if (this.textures.exists(dados.personagem.imgPersonagem)) {
          imgCharSprite = this.add
            .image(
              painelX + margem + avatarSize / 2,
              curY + avatarSize / 2,
              dados.personagem.imgPersonagem,
            )
            .setDisplaySize(avatarSize, avatarSize);

          // Cria um círculo como máscara para recortar a imagem em formato redondo
          const maskShape = this.make.graphics({
            x: painelX + margem,
            y: curY,
            add: false,
          });
          maskShape.fillCircle(avatarSize / 2, avatarSize / 2, avatarSize / 2);
          imgCharSprite.setMask(maskShape.createGeometryMask());
        }

        // Nome e cargo ficam à direita do avatar
        txtNomeChar
          .setPosition(painelX + margem + avatarSize + 10, curY)
          .setText(dados.personagem.nome)
          .setVisible(true);

        txtCargo
          .setPosition(
            painelX + margem + avatarSize + 10,
            curY + txtNomeChar.height + 4,
          )
          .setText(dados.personagem.cargo)
          .setVisible(true);

        // Avança curY pelo maior entre o avatar e o bloco de texto (nome + cargo)
        curY +=
          Math.max(avatarSize, txtNomeChar.height + txtCargo.height + 4) + 14;

        // História do personagem
        txtHistoria
          .setPosition(painelX + margem, curY)
          .setText(dados.personagem.historia)
          .setVisible(true);
      } else {
        // Este estabelecimento NÃO tem personagem (ex: Metro, Agência 03):
        // esconde nome/cargo e exibe apenas a história do próprio local
        txtNomeChar.setVisible(false);
        txtCargo.setVisible(false);

        txtHistoria
          .setPosition(painelX + margem, curY)
          .setText(dados.historia ?? "") // fallback para string vazia se não houver história
          .setVisible(true);
      }
    };

    // esconderPainel()
    const esconderPainel = () => {
      // Esconde todos os textos e o placeholder de uma vez
      [
        imgLocalPlaceholder,
        txtNomeLocal,
        txtTipo,
        txtNomeChar,
        txtCargo,
        txtHistoria,
      ].forEach((o) => o.setVisible(false));

      // Destrói os objetos dinâmicos para liberar memória
      if (imgLocalSprite) {
        imgLocalSprite.destroy();
        imgLocalSprite = null;
      }
      if (imgCharSprite) {
        imgCharSprite.destroy();
        imgCharSprite = null;
      }
      if (separadorAtual) {
        separadorAtual.destroy();
        separadorAtual = null;
      }

      // Restaura a dica de "passe o cursor"
      txtHint.setVisible(true);
    };

    // ZONAS INTERATIVAS
    estabelecimentos.forEach((estab) => {
      const { x, y, w, h } = estab.zona;

      // Retângulo invisível que captura eventos de mouse
      const zona = this.add
        .rectangle(x, y, w, h, 0xffff00, 0)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }); // cursor de mãozinha ao passar

      // Borda de destaque (visível apenas durante o hover)
      const borda = this.add
        .rectangle(x, y, w, h)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xffdd57)
        .setFillStyle(0xffdd57, 0.08)
        .setVisible(false);

      // Ao entrar na zona: mostra borda + preenche o painel
      zona.on("pointerover", () => {
        borda.setVisible(true);
        mostrarPainel(estab);
      });

      // Ao sair da zona: esconde borda + limpa painel (só se não estiver arrastando)
      zona.on("pointerout", (pointer) => {
        if (!pointer.isDown) {
          borda.setVisible(false);
          esconderPainel();
        }
      });
    });

    // EVENTO GLOBAL DE MOVIMENTO DO MOUSE
    this.input.on("pointermove", (pointer) => {
      // Atualiza coordenadas de debug
      txtDebugCoords.setText(
        `x: ${Math.round(pointer.x)} y: ${Math.round(pointer.y)}`,
      );

      // Lógica de drag só roda se o botão estiver pressionado
      if (!pointer.isDown) return;

      const px = pointer.x;
      const py = pointer.y;

      // Verifica se o cursor (em drag) está dentro de alguma zona
      const estabArrastado = estabelecimentos.find(
        (e) =>
          px >= e.zona.x &&
          px <= e.zona.x + e.zona.w &&
          py >= e.zona.y &&
          py <= e.zona.y + e.zona.h,
      );

      if (estabArrastado) {
        // Só atualiza o painel se mudou de estabelecimento (evita redesenho desnecessário)
        if (!estabAtivo || estabAtivo.id !== estabArrastado.id) {
          mostrarPainel(estabArrastado);
        }
      } else {
        // Cursor saiu de todas as zonas durante o drag: esconde o painel
        if (estabAtivo) {
          estabAtivo = null;
          esconderPainel();
        }
      }
    });

    // Pausa a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
    });

    // -----------------------------------------------------------------------
    // ATALHO DE TECLADO — ESC
    // Pressionar ESC retorna para a cena anterior (mesmo efeito do botão Voltar).
    // Usa "once" para registrar o listener uma única vez e evitar chamadas duplas.
    // -----------------------------------------------------------------------
    this.input.keyboard?.once("keydown-ESC", () => {
      retornarCenaAnterior();
    });
  }
}
