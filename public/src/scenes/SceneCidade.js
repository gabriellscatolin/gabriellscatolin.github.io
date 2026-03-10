export default class SceneCidade extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneCidade' }); // Chave única para identificar a cena
  }

  init(data) {  // Recebe os dados passados pela cena anterior (SceneCutscene)
  this.nomePastaEscolhida = data.nomePasta || "Pedro";
  this.prefixoEscolhido = data.prefixo || "HB";

  }

  preload() {

  const nomePasta = this.registry.get('nomePasta');  // Recupera os dados do personagem escolhido (nome da pasta e prefixo do arquivo) usando o registry
  const prefixo = this.registry.get('prefixo');

  console.log(nomePasta);
  console.log(prefixo);

  this.load.tilemapTiledJSON('mapaGeral', 'scr/assets/imagens/mapsjson/tileMaps/mapaMiniMundoVF.tmj');

  this.load.image('mapa_tiles', 'scr/assets/imagens/mapsjson/tileMaps/Modern_Exteriors_Complete_Tileset.png');
  
  this.load.image('playerEscolhido', 'scr/assets/imagensPersonagens/${nomePasta}/${prefixo}.png');  // Carregar a imagem do personagem escolhido
}

  create() {
  const map = this.make.tilemap({ key: 'mapaGeral'});
  const tiles = map.addTilesImage( 'mapaGeral', 'mapa_tiles');

  map.createLayer('objetosSemColid_em_cima_2', tiles, 0, 0);
  map.createLayer('contorno_preto_do_mapa', tiles, 0, 0);
  map.createLayer('chao_inferior_de_areia', tiles, 0, 0);
  map.createLayer('chao', tiles, 0, 0);
  map.createLayer('n_conchinhas_toalhas_matinhos', tiles, 0, 0);
  map.createLayer('n_agua_do_mar', tiles, 0, 0);
  map.createLayer('n_sombras', tiles, 0, 0);
  map.createLayer('n_objetosSemColid_em_baixo', tiles, 0, 0);
  map.createLayer('n_objetosSemColi_em_baixo_2', tiles, 0, 0);
  map.createLayer('n_linhas da rua', tiles, 0, 0);
  map.createLayer('PLAYER', tiles, 0, 0);
  map.createLayer('c_objetosComColid_em_baixo', tiles, 0, 0);
  map.createLayer('c_carros e Ve\u00edculos', tiles, 0, 0);
  map.createLayer('c_objetosComColid_em_baixo_2', tiles, 0, 0);
  map.createLayer('c_estabelecimentos_Com_Colid', tiles, 0, 0);
  map.createLayer('n_estabelecimento_Sem_colid', tiles, 0, 0);
  map.createLayer('n_objetosSemColid_em_cima', tiles, 0, 0);
  map.createLayer('n_objetosSemColid_em_cima_2', tiles, 0, 0);

}

 update() {
  
 }}
