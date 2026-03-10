export default class SceneFarmacia extends Phaser.Scene {
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
    'farmacia',
    './src/assets/imagens/mapsjson/tileMaps/farmacia.tmj'
  ); 

  this.load.image(
    'farmacia_roombuilder',
    './src/assets/imagens/mapsjson/tileSets/Room_Builder_16x16.png'
  );

  this.load.image(
    'farmacia_tiles', 
    'public/src/assets/imagens/mapsjson/tileSets/Interiors_16x16.png'

  ); 

  this.load.image(
    'playerEscolhido',
    `src/assets/imagens/imagensPersonagens/${nomePasta}/${prefixo}.png` // Carrega a imagem do personagem escolhido usando os dados do registry
  );

}

  create() {
  const map = this.make.tilemap({ key: 'farmacia' });
  const tiles = map.addTilesetImage('farmacia', 'farmacia_roombuilder', 'farmacia_tiles');

  map.createLayer('chao', tiles, 0, 0);
  map.createLayer('parede-c', tiles, 0, 0);
  map.createLayer('parede-n', tiles, 0, 0); 

  const armario0 = map.createLayer('armario0-n', tiles, 0, 0);
  const decoracao = map.createLayer('decoracao-n', tiles, 0, 0);
  const janela = map.createLayer('janela-n', tiles, 0, 0);
  const objetosn = map.createLayer('objetos-n', tiles, 0, 0); 
  const armariosn = map.createLayer('armarios-n', tiles, 0, 0);
  const armario3c = map.createLayer('armario3-c', tiles, 0, 0);
  const armario2c = map.createLayer('armario2-c', tiles, 0, 0);
  const armarioc = map.createLayer('armario-c', tiles, 0, 0);
  const armario0c = map.createLayer('armario0-c', tiles, 0, 0);
  const objetosc = map.createLayer('objetos-c', tiles, 0, 0);
  const cadeiraderodas = map.createLayer('cadeira', tiles, 0, 0); 
  const plantas = map.createLayer('plantas', tiles, 0, 0); 

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