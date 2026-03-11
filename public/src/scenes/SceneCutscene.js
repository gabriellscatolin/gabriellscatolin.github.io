// Cena de cutscene que reproduz um vídeo com transições clock wipe
export default class SceneCutscene extends Phaser.Scene {
  constructor() {
    super("SceneCutscene");

// Configurações e assets da cutscene
    this.CONFIG = {
      WIPE_DURATION: 1000, 
      WIPE_EASE: "Sine.easeInOut", 
      TEMPO_CORTE: 7500, 
      ASSETS: {
        video: "src/assets/imagens/videosCutScene/videoCutSceneInicial.mp4" //Vídeo da cutscene inicial
      }
    };
  }

// Carrega os assets
  preload() {
    this.load.video("cutsceneInicial", this.CONFIG.ASSETS.video);
  }

//Configura os elementos visuais e reproduz o vídeo
  create() {
    const cx = this.scale.width / 2;  
    const cy = this.scale.height / 2; 

    // Reproduz o vídeo centralizado na tela, mantendo proporção original (sem zoom/esticar)
    this.video = this.add.video(cx, cy, "cutsceneInicial");

    //Calcula a escala pra cobrir a tela toda sem bordas pretas (cover)
    this.video.once("play", () => {
      const videoWidth = this.video.width;   
      const videoHeight = this.video.height; 
      const escala = Math.max(this.scale.width / videoWidth, this.scale.height / videoHeight);
      this.video.setScale(escala);

      //Aplica filtro linear no vídeo pra suavizar (ignora o pixelArt global)
      this.video.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    });

    this.video.play();

    //Tecla F para tela cheia
    this.input.keyboard.on("keydown-F", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Aos 7.5 segundos, faz clock wipe no sentido horário
    this.time.delayedCall(this.CONFIG.TEMPO_CORTE, () => {
      this.clockWipe(true, () => {
        this.video.stop();    //Para o vídeo
        this.video.destroy(); //Fica na tela preta por enquanto
        this.scene.start('SceneEscritorio');
      });
    });
  }

  // Transição clock wipe reutilizável
  // clockwise = true: sentido horário | false: sentido anti-horário
  clockWipe(clockwise, onComplete) {
    const cx = this.scale.width / 2;  
    const cy = this.scale.height / 2; 
    const raio = Math.hypot(this.scale.width, this.scale.height) / 2; 

    //Cria o Graphics para usar como máscara na câmera
    const maskGraphics = this.make.graphics();
    const mask = maskGraphics.createGeometryMask();
    this.cameras.main.setMask(mask);

    //Animação do wipe usando tween de progresso 0 a 1
    this.tweens.add({
      targets: { progress: 0 },
      progress: 1,
      duration: this.CONFIG.WIPE_DURATION,
      ease: this.CONFIG.WIPE_EASE,
      onUpdate: (tween) => {
        const progress = tween.getValue();
        maskGraphics.clear();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.beginPath();
        maskGraphics.moveTo(cx, cy);

        if (clockwise) {
          // Sentido horário: área visível encolhe no sentido horário
          const startAngle = -Math.PI / 2 + progress * Math.PI * 2;
          const endAngle = -Math.PI / 2 + Math.PI * 2;
          maskGraphics.arc(cx, cy, raio, startAngle, endAngle, false);
        } else {
          // Sentido anti-horário: área visível encolhe no sentido anti-horário
          const startAngle = -Math.PI / 2;
          const endAngle = -Math.PI / 2 + (1 - progress) * Math.PI * 2;
          maskGraphics.arc(cx, cy, raio, startAngle, endAngle, false);
        }

        maskGraphics.closePath();
        maskGraphics.fillPath();
      },
      onComplete: () => {
        this.cameras.main.clearMask(true); //Remove a máscara da câmera
        maskGraphics.destroy(); //Destrói o Graphics
        if (onComplete) onComplete(); //Executa o callback
      }
    });
  }
}
