export default class SceneJogo extends Phaser.Scene { 
    constructor() {
        super("SceneJogo");
    }

    // Recebe os dados de transferência entre cenas
    init(data) {
        this.nomePastaEscolhida = data.nomePasta || "Gabriel";
        this.prefixoEscolhido = data.prefixo || "HB";
    }

    preload() {
        // Carregamento do cenário e elementos da interface
        this.load.image("mapaPonteImage", "src/assets/imagens/imagensMapa/mapaPonte.png");
        this.load.image("tutorialWasdImage", "src/assets/imagens/imagensBotoes/wasd.png");

        // Construção do caminho dinâmico para carregar os sprites do personagem selecionado
        const caminhoBase = `src/assets/imagens/imagensPersonagens/${this.nomePastaEscolhida}`;
        const pre = this.prefixoEscolhido;

        for (let i = 1; i <= 4; i++) {
            this.load.image(`sprite_frente_${i}`, `${caminhoBase}/${pre}_frente_${i}.png`);
            this.load.image(`sprite_tras_${i}`, `${caminhoBase}/${pre}_tras_${i}.png`);
            this.load.image(`sprite_direita_${i}`, `${caminhoBase}/${pre}_direita_${i}.png`);
            this.load.image(`sprite_esquerda_${i}`, `${caminhoBase}/${pre}_esquerda_${i}.png`);
        }
    }

    create() {
        // Configuração do ambiente e física do jogo
        this.fundoImage = this.add.image(0, 0, "mapaPonteImage").setOrigin(0, 0);
        this.fundoImage.displayWidth = this.scale.width;
        this.fundoImage.displayHeight = this.scale.height;

        this.criarAnimacoes();

        // Inicialização do sprite do jogador com física
        this.personagemSprite = this.add.sprite(this.scale.width / 2, 684, "sprite_frente_1").setScale(0.15);
        this.physics.add.existing(this.personagemSprite);

        // Mapeamento das teclas de controle
        this.teclasControl = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.velocidadePersonagem = 300;
        this.add.image(90, 80, "tutorialWasdImage").setScale(0.12).setScrollFactor(0).setDepth(10);
        
        this.executarTransicaoEntrada();
    }

    criarAnimacoes() {
        // Definição dos loops de animação para as quatro direções de movimento
        const direcoes = ['frente', 'tras', 'direita', 'esquerda'];
        direcoes.forEach(dir => {
            this.anims.create({
                key: `andar_${dir}`,
                frames: [
                    { key: `sprite_${dir}_1` },
                    { key: `sprite_${dir}_2` },
                    { key: `sprite_${dir}_3` },
                    { key: `sprite_${dir}_4` }
                ],
                frameRate: 8,
                repeat: -1
            });
        });
    }

    update() {
        // Lógica de atualização de movimento e troca de animações por frame
        const corpoFisico = this.personagemSprite.body;
        corpoFisico.setVelocity(0);
        let estaAndando = false;

        if (this.teclasControl.a.isDown) {
            corpoFisico.setVelocityX(-this.velocidadePersonagem);
            this.personagemSprite.anims.play("andar_esquerda", true);
            estaAndando = true;
        } else if (this.teclasControl.d.isDown) {
            corpoFisico.setVelocityX(this.velocidadePersonagem);
            this.personagemSprite.anims.play("andar_direita", true);
            estaAndando = true;
        }

        if (this.teclasControl.w.isDown) {
            corpoFisico.setVelocityY(-this.velocidadePersonagem);
            if (!estaAndando) this.personagemSprite.anims.play("andar_tras", true);
            estaAndando = true;
        } else if (this.teclasControl.s.isDown) {
            corpoFisico.setVelocityY(this.velocidadePersonagem);
            if (!estaAndando) this.personagemSprite.anims.play("andar_frente", true);
            estaAndando = true;
        }

        // Controle de pausa da animação quando o jogador está parado
        if (!estaAndando) {
            this.personagemSprite.anims.pause();
        } else {
            this.personagemSprite.anims.resume();
        }

        // Limitação do espaço de movimentação no mapa (Boundaries)
        this.personagemSprite.y = Phaser.Math.Clamp(this.personagemSprite.y, 578, 690);
        this.personagemSprite.x = Phaser.Math.Clamp(this.personagemSprite.x, 0, 1920);
    }

    executarTransicaoEntrada() {
        // Efeito visual de pixelização ao iniciar a fase
        const cameraPrincipal = this.cameras.main;
        const efeitoPixel = cameraPrincipal.postFX.addPixelate(60);
        
        this.add.tween({
            targets: efeitoPixel,
            amount: 1,
            duration: 1000,
            onComplete: () => { cameraPrincipal.postFX.remove(efeitoPixel); }
        });
    }
}