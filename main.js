import SceneInicial from "./src/scenes/SceneInicial.js";
import SceneJogo from "./src/scenes/SceneJogo.js";
import ScenePersonagem from "./src/scenes/ScenePersonagem.js";

//Configuração do jogo phaser
const config = {
  type: Phaser.AUTO,  //Phaser escolhe entreWebGL ou Canvas para renderizar
  pixelArt: true,    //Garantir bordas nítidas para os gráficos pixelados
  width: 1920,  // Define a eesolução base: 1920x1080
  height: 1080,  //Resolução full HD
  backgroundColor: "#000000",  //Define o fundo como preto
  scale: {
    mode: Phaser.Scale.FIT, //Ajusta para caber na tela
    autoCenter: Phaser.Scale.CENTER  //Centraliza o jogo
  },
  physics: {
    default: "arcade",  //Usa o sistema de física arcade (Jogos 2D)
    arcade: {
      gravity: { y: 0 }, //jogo sem quedas então desativa a gravidade vertical
      debug: false   //Desativa linhas de depuração
    }
  },
  scene: [SceneInicial, SceneJogo, ScenePersonagem]
};

new Phaser.Game(config); //Cria o jogo