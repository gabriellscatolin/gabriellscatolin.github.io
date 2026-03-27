import SceneInicial from "./src/scenes/SceneInicial.js";
import SceneJogo from "./src/scenes/SceneJogo.js";
import ScenePersonagem from "./src/scenes/ScenePersonagem.js";
import SceneCutscene from "./src/scenes/SceneCutscene.js";
import SceneEscritorio from "./src/scenes/SceneEscritorio.js";
import SceneCidade from "./src/scenes/SceneCidade.js";
import SceneChuva from "./src/scenes/SceneChuva.js";
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
import SceneDialogoAgencia01 from "./src/scenesdialogos/SceneDialogoAgencia01.js";
import SceneDialogoFarmacia from "./src/scenesdialogos/SceneDialogoFarmacia.js";
import SceneDialogoPadaria from "./src/scenesdialogos/SceneDialogoPadaria.js";
import SceneMiniGame from "./src/scenes/SceneMiniGame.js"

const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  width: 1920,
  height: 1080,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    SceneMetro,
    SceneMiniGame,
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
    SceneSupermercado,
    SceneLojaDeRoupas,
    ScenePostoDeGasolina,
    SceneAgencia01,
    SceneAgencia02,
    SceneAgencia03,
    SceneDialogoAgencia01,
    SceneDialogoFarmacia,
    SceneDialogoPadaria,
    
  ],
};

new Phaser.Game(config);