export default class SceneEscritorio extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneEscritorio' });
  }

  preload() {
    this.load.tilemapTiledJSON(
      'escritorio',
      'src/assets/imagens/mapsjson/tileMaps/escritorio.tmj'
    );
    this.load.image(
      'escritorio_tiles',
      'src/assets/imagens/mapsjson/tileSets/escritorio.png'
    );
  }

create() {
  const map = this.make.tilemap({ key: 'escritorio' });
  const tiles = map.addTilesetImage('escritorio', 'escritorio_tiles');

  const chao = map.createLayer('chao', tiles, 0, 0);
  const semcolis = map.createLayer('semcolis', tiles, 0, 0);
  const obcomcolis2 = map.createLayer('obcomcolis2', tiles, 0, 0);
  const objcomcolis = map.createLayer('objcomcolis', tiles, 0, 0);
  const borda = map.createLayer('borda', tiles, 0, 0);

  this.cameras.main.setBackgroundColor('#222222');
  this.cameras.main.setZoom(3);
  this.cameras.main.centerOn(320, 320);

}
}
      
