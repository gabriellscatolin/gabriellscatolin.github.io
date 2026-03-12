export default class SceneEscritorio extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneEscritorio' });
  }

  // Recebe os dados do personagem escolhido na cena anterior
  init(data) {
    this.nomePastaEscolhida = data.nomePasta || "Pedro";
    this.prefixoEscolhido = data.prefixo || "HB";
  }

  preload() {
    const nomePasta = this.registry.get('nomePasta');
    const prefixo = this.registry.get('prefixo');

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

  // Configura o mapa, personagem, controles e câmera
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

    // Camada de objetos sem colisão (decoração) acima do personagem
    const spawnLayer = map.getObjectLayer('spawn');
    const portaSpawn = spawnLayer?.objects?.find(obj => obj.name === 'portaSpawn');

    const spawnX = portaSpawn?.x ?? 500;
    const spawnY = portaSpawn?.y ?? 700;

   // Cria o personagem no ponto de spawn definido no Tiled
    this.player = this.physics.add.sprite(spawnX, spawnY, 'playerEscolhido');
    this.player.setCollideWorldBounds(true);

    // Ajusta escala do personagem para caber melhor no mapa
    const tileSize = map.tileWidth; // pega o tamanho do tile do próprio mapa
    const spriteWidth = this.player.width;
    const spriteHeight = this.player.height;
    const scaleX = (tileSize * 0.9) / spriteWidth;
    const scaleY = (tileSize * 0.9) / spriteHeight;
    const scale = Math.min(scaleX, scaleY); // mantém proporção

    this.player.setScale(scale);

   // Ajusta o corpo de colisão para ser um pouco menor que o sprite, para evitar ficar preso em cantos
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

  // Configura a câmera para seguir o personagem e limitar aos limites do mapa
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  // Lógica de movimento do personagem e animações
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