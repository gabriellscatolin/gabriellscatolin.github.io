export default class SceneMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMiniGame' });
    }

    preload() {
        // Fundos
        this.load.image('background1', 'src/assets/imagens/imagensMiniGame/parque.png');
        this.load.image('background2', 'src/assets/imagens/imagensMiniGame/praia.png');
        this.load.image('background3', 'src/assets/imagens/imagensMiniGame/cidade.png');
        this.load.image('background4', 'src/assets/imagens/imagensMiniGame/noite.png');

        // Itens coletáveis
        this.load.image('moedaComum', 'src/assets/imagens/imagensMiniGame/moedaComum.png');
        this.load.image('moedaExtra', 'src/assets/imagens/imagensMiniGame/moedaExtra.png');
        this.load.image('bomba', 'src/assets/imagens/imagensMiniGame/bomba.png');

        // Plataforma de nuvem
        this.load.image('plataformaNuvem', 'src/assets/imagens/imagensMiniGame/plataformaNuvem.png');

        // Sprites do personagem
        this.load.spritesheet('patoBAndandoDireita', 'src/assets/imagens/imagensMiniGame/sprite/patoBAnadandoDireita.png', { frameWidth: 1024, frameHeight: 1024 });
        this.load.spritesheet('patoBAndandoEsquerda', 'src/assets/imagens/imagensMiniGame/sprite/patoBAndandoEsquerda.png', { frameWidth: 1024, frameHeight: 1024 });
        this.load.spritesheet('personagemPulando', 'src/assets/imagens/imagensMiniGame/sprite/personagemPulando.png', { frameWidth: 1024, frameHeight: 1024 });
        this.load.spritesheet('personagemParado', 'src/assets/imagens/imagensMiniGame/sprite/personagemParado.png', { frameWidth: 1024, frameHeight: 1024 });

        // Músicas e som de coleta
        this.load.audio('musicaFase1', 'src/assets/imagens/imagensMiniGame/musicas/musicaCenaParque.mp3');
        this.load.audio('musicaFase2', 'src/assets/imagens/imagensMiniGame/musicas/musicaCenaPraia.mp3');
        this.load.audio('musicaFase3', 'src/assets/imagens/imagensMiniGame/musicas/musicaCenaCidade.mp3');
        this.load.audio('musicaFase4', 'src/assets/imagens/imagensMiniGame/musicas/musicaCenaNoite.mp3');
        this.load.audio('somColeta', 'src/assets/imagens/imagensMiniGame/musicas/somColetaitem.mp3');
    }

    create() {
        // Física e estado inicial
        this.physics.world.gravity.y = 300;
        this.faseAtual = 1;
        this.pontuacao = 0;
        this.direcao = 'direita';
        this.jogoAcabou = false;  // ← trava para evitar gameOver múltiplo

        // Sons
        this.musica = this.sound.add('musicaFase1', { loop: true, volume: 0.5 });
        this.somColeta = this.sound.add('somColeta', { volume: 0.7 });

        // Inicia música após interação do usuário (política do Chrome)
        this.input.keyboard.once('keydown', () => {
            if (this.musica && !this.musica.isPlaying) {
                this.musica.play();
            }
        });
        this.input.once('pointerdown', () => {
            if (this.musica && !this.musica.isPlaying) {
                this.musica.play();
            }
        });

        // Fundo fase 1
        this.fundo1 = this.add.image(1500 / 2, 940 / 2, 'background1');

        // Personagem
        this.patoBranco = this.physics.add.sprite(300, 500, 'patoBAndandoDireita')
            .setScale(0.1)
            .setCollideWorldBounds(true);

        // Teclado
        this.teclado = this.input.keyboard.createCursorKeys();

        // Chão colidível (invisível)
        this.chao1 = this.physics.add.staticImage(1500 / 2, 1140 - 20, null);
        this.chao1.displayWidth = 1500;
        this.chao1.displayHeight = 470;
        this.chao1.refreshBody();
        this.chao1.setVisible(false);
        this.physics.add.collider(this.patoBranco, this.chao1);

        // Plataforma 1
        this.plataformaNuvem = this.physics.add.sprite(500, 350, 'plataformaNuvem');
        this.plataformaNuvem.setScale(0.5);
        this.plataformaNuvem.body.setImmovable(true);
        this.plataformaNuvem.body.allowGravity = false;
        this.plataformaNuvem.body.setSize(650, 80);
        this.plataformaNuvem.body.setOffset(450, 500);
        this.physics.add.collider(this.patoBranco, this.plataformaNuvem);

        // Plataforma 2
        this.plataformaNuvem2 = this.physics.add.sprite(1000, 600, 'plataformaNuvem');
        this.plataformaNuvem2.setScale(0.5);
        this.plataformaNuvem2.body.setImmovable(true);
        this.plataformaNuvem2.body.allowGravity = false;
        this.plataformaNuvem2.body.setSize(650, 80);
        this.plataformaNuvem2.body.setOffset(450, 500);
        this.physics.add.collider(this.patoBranco, this.plataformaNuvem2);

        // Moeda comum
        this.moedaComum = this.physics.add.sprite(1500 / 2, 0, 'moedaComum');
        this.moedaComum.setScale(0.09);
        this.moedaComum.body.setSize(this.moedaComum.width * 0.6, this.moedaComum.height * 0.6);
        this.moedaComum.setCollideWorldBounds(true);
        this.moedaComum.setBounce(0.7);
        this.physics.add.collider(this.moedaComum, this.plataformaNuvem);
        this.physics.add.collider(this.moedaComum, this.plataformaNuvem2);
        this.physics.add.collider(this.moedaComum, this.chao1);

        // Moeda extra (começa inativa)
        this.moedaExtra = this.physics.add.sprite(0, 0, 'moedaExtra');
        this.moedaExtra.setScale(0.09);
        this.moedaExtra.body.setSize(this.moedaExtra.width * 0.6, this.moedaExtra.height * 0.6);
        this.moedaExtra.setCollideWorldBounds(true);
        this.moedaExtra.setBounce(0.7);
        this.moedaExtra.setVisible(false);
        this.moedaExtra.setActive(false);
        this.physics.add.collider(this.moedaExtra, this.plataformaNuvem);
        this.physics.add.collider(this.moedaExtra, this.plataformaNuvem2);
        this.physics.add.collider(this.moedaExtra, this.chao1);

        // Bomba (começa inativa)
        this.bomba = this.physics.add.sprite(0, 0, 'bomba');
        this.bomba.setScale(0.11);
        this.bomba.body.setSize(this.bomba.width * 0.6, this.bomba.height * 0.6);
        this.bomba.setCollideWorldBounds(true);
        this.bomba.setBounce(0.7);
        this.bomba.disableBody(true, true);
        this.physics.add.collider(this.bomba, this.plataformaNuvem);
        this.physics.add.collider(this.bomba, this.plataformaNuvem2);
        this.physics.add.collider(this.bomba, this.chao1);

        // Placar
        this.placar = this.add.text(50, 50, 'Cielocoins: ' + this.pontuacao, {
            fontSize: '45px',
            fontFamily: 'poppins',
            fontStyle: 'bold',
            fill: '#ffffff'
        });

        // Spawn periódico de moeda extra e bomba
        this.time.addEvent({
            delay: 20000,
            callback: this.spawnMoedaExtra,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 10000,
            loop: true,
            callback: () => { this.spawnBomba(); }
        });

        // Coleta de moeda extra (+3 pontos)
        this.physics.add.overlap(this.patoBranco, this.moedaExtra, () => {
            if (!this.moedaExtra.active) return;
            this.somColeta.play();
            this.moedaExtra.disableBody(true, true);
            this.pontuacao += 3;
            this.placar.setText('Cielocoins: ' + this.pontuacao);
        });

        // Coleta de bomba (-1 ponto)
        this.physics.add.overlap(this.patoBranco, this.bomba, () => {
            if (!this.bomba.active) return;
            this.somColeta.play();
            this.bomba.disableBody(true, true);
            this.pontuacao -= 1;
            if (this.pontuacao < 0) this.pontuacao = 0;
            this.placar.setText('Cielocoins: ' + this.pontuacao);
        });

        // Coleta de moeda comum (+1 ponto)
        this.physics.add.overlap(this.patoBranco, this.moedaComum, () => {
            this.moedaComum.setVisible(false);
            this.somColeta.play();
            let posicaoX = Phaser.Math.RND.between(10, 1500);
            this.moedaComum.setPosition(posicaoX, 50);
            this.pontuacao += 40;
            this.placar.setText('Cielocoins: ' + this.pontuacao);
            this.moedaComum.setVisible(true);
        });

        // Animações
        this.anims.create({
            key: 'andar_direita',
            frames: this.anims.generateFrameNumbers('patoBAndandoDireita', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'andar_esquerda',
            frames: this.anims.generateFrameNumbers('patoBAndandoEsquerda', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'pulo',
            frames: this.anims.generateFrameNumbers('personagemPulando', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'parado',
            frames: this.anims.generateFrameNumbers('personagemParado', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });

        // Para a música ao sair da cena
        this.events.on('shutdown', () => {
    if (this.musica) this.musica.stop();

    // ← Limpa animações do minigame para não conflitar com outras cenas
    ['andar_direita', 'andar_esquerda', 'pulo', 'parado'].forEach(key => {
        if (this.anims.exists(key)) {
            this.anims.remove(key);
        }
    });
});
        

    }

    update() {
        // ← Trava: não executa nada se o jogo acabou
        if (this.jogoAcabou) return;

        // Movimento horizontal
        this.patoBranco.setVelocityX(0);

        if (this.teclado.left.isDown) {
            this.patoBranco.setVelocityX(-300);
            this.direcao = 'esquerda';
        } else if (this.teclado.right.isDown) {
            this.patoBranco.setVelocityX(300);
            this.direcao = 'direita';
        }

        // Pulo
        if (this.teclado.up.isDown && this.patoBranco.body.touching.down) {
            this.patoBranco.setVelocityY(-570);
        }

        // Animações
        if (this.patoBranco.body.velocity.y !== 0) {
            this.patoBranco.anims.play('pulo', true);
        } else {
            if (this.patoBranco.body.velocity.x > 0) {
                this.patoBranco.anims.play('andar_direita', true);
            } else if (this.patoBranco.body.velocity.x < 0) {
                this.patoBranco.anims.play('andar_esquerda', true);
            } else {
                this.patoBranco.anims.play('parado', true);
            }
        }

        // Troca de fases por pontuação
        if (this.pontuacao >= 10 && this.faseAtual === 1) {
            this.trocarFase(2, 'background2', 'musicaFase2');
        }
        if (this.pontuacao >= 20 && this.faseAtual === 2) {
            this.trocarFase(3, 'background3', 'musicaFase3');
        }
        if (this.pontuacao >= 30 && this.faseAtual === 3) {
            this.trocarFase(4, 'background4', 'musicaFase4');
        }

        // Game over ao atingir 40 moedas
        if (this.pontuacao >= 40) {
            this.gameOver();
        }
    }

    trocarFase(novaFase, novaImagem, novaMusicaKey) {
        // ← Trava: evita trocar para a mesma fase múltiplas vezes
        if (this.faseAtual === novaFase) return;
        this.faseAtual = novaFase;

        this.cameras.main.fade(400, 0, 0, 0);

        this.time.delayedCall(400, () => {
            this.fundo1.setTexture(novaImagem);

            if (this.musica) this.musica.stop();

            this.musica = this.sound.add(novaMusicaKey, { loop: true, volume: 0.5 });
            this.musica.play();

            this.cameras.main.fadeIn(400, 0, 0, 0);
        });
    }

    gameOver() {
        // ← Trava: evita chamar gameOver múltiplas vezes
        if (this.jogoAcabou) return;
        this.jogoAcabou = true;

        if (this.musica) this.musica.stop();
        this.physics.pause();

        // Salva coins do minigame no registry global (50 CieloCoins por ponto)
        const coinsGanhas = Math.max(0, this.pontuacao) * 50;
        const totalAtual  = Number(this.registry.get("cieloCoins") ?? 0);
        this.registry.set("cieloCoins", totalAtual + coinsGanhas);

        this.add.rectangle(750, 470, 1500, 940, 0x000000, 0.6);

        this.add.text(750, 470, 'Você concluiu o Desafio!', {
            fontSize: '80px',
            fontFamily: 'poppins',
            fontStyle: 'bold',
            fill: '#0099ff'
        }).setOrigin(0.5);

        this.add.text(750, 600,
            `+${coinsGanhas} Cielo Coins acumulados!`, {
            fontSize: '48px',
            fontFamily: 'poppins',
            fontStyle: 'bold',
            fill: '#ffd700',
            resolution: 4,
        }).setOrigin(0.5);

        // Aguarda 3s e volta para a SceneMetro
        this.time.delayedCall(3000, () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('SceneMetro', {
                    nomePasta: this.registry.get('nomePasta'),
                    prefixo: this.registry.get('prefixo'),
                });
            });
        });
    }

    spawnMoedaExtra() {
        if (this.jogoAcabou) return;
        if (!this.moedaExtra.active) {
            let posicaoX = Phaser.Math.Between(100, 1400);
            this.moedaExtra.enableBody(true, posicaoX, 0, true, true);
            this.moedaExtra.setAlpha(1);

            // Começa a piscar após 6s
            this.time.delayedCall(6000, () => {
                if (!this.moedaExtra.active) return;
                this.tweens.add({
                    targets: this.moedaExtra,
                    alpha: 0.2,
                    duration: 200,
                    yoyo: true,
                    repeat: 9
                });
            });

            // Desaparece após 8s
            this.time.delayedCall(8000, () => {
                if (this.moedaExtra.active) {
                    this.moedaExtra.disableBody(true, true);
                }
            });
        }
    }

    spawnBomba() {
        if (this.jogoAcabou) return;
        if (!this.bomba.active) {
            let posicaoX = Phaser.Math.Between(100, 1400);
            this.bomba.enableBody(true, posicaoX, 0, true, true);
            this.bomba.setAlpha(1);

            // Começa a piscar após 4s
            this.time.delayedCall(4000, () => {
                if (!this.bomba.active) return;
                this.tweens.add({
                    targets: this.bomba,
                    alpha: 0.2,
                    duration: 150,
                    yoyo: true,
                    repeat: 9
                });
            });

            // Desaparece após 6s
            this.time.delayedCall(6000, () => {
                if (this.bomba.active) {
                    this.bomba.disableBody(true, true);
                }
            });
        }
    }
}
