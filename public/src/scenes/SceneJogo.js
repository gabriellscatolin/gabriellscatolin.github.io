export default class SceneJogo extends Phaser.Scene { 
    constructor() {
        super("SceneJogo");
    }

    init(data) {
        // Recebe os dados da ScenePersonagem ou usa Gabriel/HB como padrão
        this.personagemEscolhido = data.personagem || "Gabriel";
        this.prefixoEscolhido = data.prefixo || "HB";
    }

    preload() {
        this.load.image("mapaPonte", "src/assets/imagens/imagensMapa/mapaPonte.png");
        this.load.image("wasd", "src/assets/imagens/imagensBotoes/wasd.png");

        // Montagem do caminho dinâmico
        const pasta = this.personagemEscolhido; 
        const pre = this.prefixoEscolhido;
        const caminhoBase = `src/assets/imagens/imagensPersonagens/${pasta}`;

        for (let i = 1; i <= 4; i++) {
            // Internamente chamamos sempre de 'hb_...', mas buscamos o arquivo correto (ex: MB_frente_1.png)
            this.load.image(`hb_frente_${i}`, `${caminhoBase}/${pre}_frente_${i}.png`);
            this.load.image(`hb_tras_${i}`, `${caminhoBase}/${pre}_tras_${i}.png`);
            this.load.image(`hb_direita_${i}`, `${caminhoBase}/${pre}_direita_${i}.png`);
            this.load.image(`hb_esquerda_${i}`, `${caminhoBase}/${pre}_esquerda_${i}.png`);
        }
    }

    create() {
        this.fundo = this.add.image(0, 0, "mapaPonte").setOrigin(0, 0);
        this.fundo.displayWidth = this.scale.width;
        this.fundo.displayHeight = this.scale.height;

        this.criarAnimacoes();

        // O sprite usa a chave carregada no preload
        this.personagem = this.add.sprite(this.scale.width / 2, 684, "hb_frente_1").setScale(0.15);
        this.physics.add.existing(this.personagem);

        this.teclas = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.velocidade = 300;
        this.add.image(90, 80, "wasd").setScale(0.12).setScrollFactor(0).setDepth(10);
        this.transicaoEntradaPixel();
    }

    criarAnimacoes() {
        const direcoes = ['frente', 'tras', 'direita', 'esquerda'];
        direcoes.forEach(dir => {
            this.anims.create({
                key: `andar_${dir}`,
                frames: [
                    { key: `hb_${dir}_1` },
                    { key: `hb_${dir}_2` },
                    { key: `hb_${dir}_3` },
                    { key: `hb_${dir}_4` }
                ],
                frameRate: 8,
                repeat: -1
            });
        });
    }

    update() {
        const body = this.personagem.body;
        body.setVelocity(0);
        let andando = false;

        // Movimento Horizontal
        if (this.teclas.a.isDown) {
            body.setVelocityX(-this.velocidade);
            if (this.personagem.anims.currentAnim?.key !== "andar_esquerda") this.personagem.anims.play("andar_esquerda");
            andando = true;
        } else if (this.teclas.d.isDown) {
            body.setVelocityX(this.velocidade);
            if (this.personagem.anims.currentAnim?.key !== "andar_direita") this.personagem.anims.play("andar_direita");
            andando = true;
        }

        // Movimento Vertical
        if (this.teclas.w.isDown) {
            body.setVelocityY(-this.velocidade);
            if (!andando && this.personagem.anims.currentAnim?.key !== "andar_tras") this.personagem.anims.play("andar_tras");
            andando = true;
        } else if (this.teclas.s.isDown) {
            body.setVelocityY(this.velocidade);
            if (!andando && this.personagem.anims.currentAnim?.key !== "andar_frente") this.personagem.anims.play("andar_frente");
            andando = true;
        }

        if (!andando) {
            this.personagem.anims.pause();
        } else {
            this.personagem.anims.resume();
        }

        this.personagem.y = Phaser.Math.Clamp(this.personagem.y, 578, 690);
        this.personagem.x = Phaser.Math.Clamp(this.personagem.x, 0, 1920);
    }

    transicaoEntradaPixel() {
        const cam = this.cameras.main;
        const pixelated = cam.postFX.addPixelate(60);
        this.add.tween({
            targets: pixelated,
            amount: 1, duration: 1000,
            onComplete: () => { cam.postFX.remove(pixelated); }
        });
    }
}