export default class SceneEscritorio extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneEscritorio' }); // Chave única para identificar a cena
  }

  init(data) {  // Recebe os dados passados pela cena anterior (ScenePersonagem)
  this.nomePastaEscolhida = data.nomePasta || "Pedro";
  this.prefixoEscolhido = data.prefixo || "HB";

  }

  preload() {

  const nomePasta = this.registry.get('nomePasta');  // Recupera os dados do personagem escolhido (nome da pasta e prefixo do arquivo) usando o registry
  const prefixo = this.registry.get('prefixo');

  console.log(nomePasta);
  console.log(prefixo);

  this.load.tilemapTiledJSON(
    'escritorio',
    'src/assets/imagens/mapsjson/tileMaps/escritorio.tmj'
  );

  this.load.image(
    'escritorio_tiles',
    'src/assets/imagens/mapsjson/tileSets/escritorio.png'
  );

  this.load.image(
    'playerEscolhido',
    `src/assets/imagens/imagensPersonagens/${nomePasta}/${prefixo}.png` // Carrega a imagem do personagem escolhido usando os dados do registry
  );

}

  create() {
  const map = this.make.tilemap({ key: 'escritorio' });
  const tiles = map.addTilesetImage('escritorio', 'escritorio_tiles');

  map.createLayer('chao', tiles, 0, 0);
  map.createLayer('semcolis', tiles, 0, 0);
  const objcomcolis = map.createLayer('objcomcolis', tiles, 0, 0);
  const obcomcolis2 = map.createLayer('obcomcolis2', tiles, 0, 0);
  const borda = map.createLayer('borda', tiles, 0, 0);

  objcomcolis.setCollisionByExclusion([-1]);
  obcomcolis2.setCollisionByExclusion([-1]);
  borda.setCollisionByExclusion([-1]);

  const spawnLayer = map.getObjectLayer('spawn');
  console.log('spawnLayer:', spawnLayer);

  const portaSpawn = spawnLayer?.objects?.find(obj => obj.name === 'portaSpawn');
  console.log('portaSpawn:', portaSpawn);

  this.player = this.physics.add.sprite(500, 700, 'playerEscolhido');
  this.player.setScale(1);
  this.player.setCollideWorldBounds(true);

  this.physics.add.collider(this.player, objcomcolis);
  this.physics.add.collider(this.player, obcomcolis2);
  this.physics.add.collider(this.player, borda);

  this.cursors = this.input.keyboard.createCursorKeys();

  this.cameras.main.startFollow(this.player);
  this.cameras.main.setZoom(2.5);
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}

 update() {
  const speed = 150;

  this.player.setVelocity(0);

  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-speed);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(speed);
  }

  if (this.cursors.up.isDown) {
    this.player.setVelocityY(-speed);
  } else if (this.cursors.down.isDown) {
    this.player.setVelocityY(speed);
  }
 }}