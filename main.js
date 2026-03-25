import SceneInicial from "./src/scenes/SceneInicial.js";
import SceneJogo from "./src/scenes/SceneJogo.js";
import ScenePersonagem from "./src/scenes/ScenePersonagem.js";
import SceneCutscene from "./src/scenes/SceneCutscene.js";
import SceneEscritorio from "./src/scenes/SceneEscritorio.js";
import SceneCidade from "./src/scenes/SceneCidade.js";
import SceneChuva from "./src/scenes/SceneChuva.js"; // CHUVA — nova cena
import SceneFarmacia from "./src/scenes/SceneFarmacia.js";
import SceneRestaurante from "./src/scenes/SceneRestaurante.js";
import SceneMetro from "./src/scenes/SceneMetro.js";
import SceneSupermercado from "./src/scenes/SceneSupermercado.js";
import SceneLojaDeRoupas from "./src/scenes/SceneLojaDeRoupas.js";
import ScenePadaria from "./src/scenes/ScenePadaria.js";
import ScenePostoDeGasolina from "./src/scenes/ScenePostoDeGasolina.js";
import SceneAgencia01 from "./src/scenes/SceneAgencia01.js";
import SceneAgencia02 from "./src/scenes/SceneAgencia02.js"; 
import SceneAgencia03 from "./src/scenes/SceneAgencia03.js";

//Configuração do jogo phaser
const config = {
  type: Phaser.AUTO, //Phaser escolhe entre WebGL ou Canvas para renderizar
  pixelArt: true, //Garantir bordas nítidas para os gráficos pixelados
  roundPixels: true,
  antialias: false,
  width: 1920, // Resolução base: 1920x1080
  height: 1080, // Resolução full HD
  backgroundColor: "#000000", // Fundo preto
  scale: {
    mode: Phaser.Scale.FIT, // Ajusta para caber na tela
    autoCenter: Phaser.Scale.CENTER, // Centraliza o jogo
  },
  physics: {
    default: "arcade", // Sistema de física arcade (jogos 2D)
    arcade: {
      gravity: { y: 0 }, // Sem gravidade vertical
      debug: false,
    },
  },
  scene: [
    SceneCidade,
    SceneInicial,
    ScenePersonagem,
    SceneCutscene,
    SceneChuva, 
    SceneJogo,
    SceneEscritorio,
    ScenePadaria,
    SceneFarmacia,
    SceneRestaurante,
    SceneMetro,
    SceneSupermercado,
    SceneLojaDeRoupas,
    ScenePostoDeGasolina,
    SceneAgencia01,
    SceneAgencia02,
    SceneAgencia03,
  ],
};

new Phaser.Game(config); //
