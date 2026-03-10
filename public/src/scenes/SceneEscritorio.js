export default class SceneEscritorio extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneEscritorio' });
  }

  init(data) {
    this.nomePastaEscolhida = data.nomePasta || "Pedro";
    this.prefixoEscolhido = data.prefixo || "HB";
  }

  preload() {
    const nomePasta = this.registry.get('nomePasta');
    const prefixo = this.registry.get('prefixo');

    console.log('nomePasta:', nomePasta);
    console.log('prefixo:', prefixo);

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
      `src/assets/imagens/imagensPersonagens/${nomePasta}/${prefixo}.png`
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

    // ✅ Spawn na porta corretamente
    const spawnLayer = map.getObjectLayer('spawn');
    const portaSpawn = spawnLayer?.objects?.find(obj => obj.name === 'portaSpawn');

    console.log('spawnLayer:', spawnLayer);
    console.log('portaSpawn:', portaSpawn);

    const spawnX = portaSpawn?.x ?? 500;
    const spawnY = portaSpawn?.y ?? 700;

    // ✅ Cria o player na posição do spawn
    this.player = this.physics.add.sprite(spawnX, spawnY, 'playerEscolhido');
    this.player.setCollideWorldBounds(true);

    // ✅ Ajusta o tamanho do sprite automaticamente para caber no tile
    const tileSize = map.tileWidth; // pega o tamanho do tile do próprio mapa
    const spriteWidth = this.player.width;
    const spriteHeight = this.player.height;
    const scaleX = (tileSize * 0.9) / spriteWidth;
    const scaleY = (tileSize * 0.9) / spriteHeight;
    const scale = Math.min(scaleX, scaleY); // mantém proporção

    this.player.setScale(scale);

    // ✅ Ajusta hitbox para ser menor que o sprite visualmente
    const bodyWidth = spriteWidth * scale * 0.5;
    const bodyHeight = spriteHeight * scale * 0.5;
    this.player.body.setSize(
      spriteWidth * 0.5,
      spriteHeight * 0.5
    );

    this.physics.add.collider(this.player, objcomcolis);
    this.physics.add.collider(this.player, obcomcolis2);
    this.physics.add.collider(this.player, borda);

    this.cursors = this.input.keyboard.createCursorKeys();

    // ✅ Câmera configurada para 1024x768
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
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
  }
}