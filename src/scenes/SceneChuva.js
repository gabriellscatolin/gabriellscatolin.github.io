export default class SceneChuva extends Phaser.Scene {
  constructor() {
    super({ key: "SceneChuva" });
  }

  preload() {
    // Carrega o áudio da cena
    this.load.audio("trilhaChuva", "src/assets/audios/trilhaChuva.mp3");
  }

  create() {
    // Prepara o áudio da chuva, mas só toca quando a chuva iniciar
    this.musica = this.sound.add("trilhaChuva", { loop: true, volume: 0.5 });

    // Mantém o fundo transparente para a chuva aparecer sobre outras cenas
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    const gW = this.scale.width;
    const gH = this.scale.height;

    // Pool de gotas reutilizáveis para evitar criar objetos o tempo todo
    this._gotas = [];
    this._chuvaAtiva = false;

    // Cria várias gotas com valores iniciais zerados/inativos
    for (let i = 0; i < 800; i++) {
      this._gotas.push({
        ativo: false,
        xi: 0,
        yi: 0,
        xf: 0,
        yf: 0,
        x: 0,
        y: 0,
        vx: 0,
        ay: 0,
        vy: 0,
        T: 0,
        t: 0,
        comp: 14,
        frame: 0,
        totalFrames: 0,
        dt: 0,
      });
    }

    // Um único Graphics é redesenhado a cada frame
    this._gfx = this.add.graphics();
    this._gfx.setDepth(99);

    // Controla início, duração e criação das gotas ao longo do tempo
    this._tempoDecorrido = 0;
    this._chuvaIniciada = false;
    this._chuvaEncerrada = false;
    this._tempoCriacao = 0;

    // Índice da gota usada para debug frame a frame
    this._gotaDebug = 0;

    // Pausa  a trilha sonora ao iniciar nova cena
    this.events.on("shutdown", () => {
      this.musica.stop();
    });
  }

  // Atualiza a posição da gota com MU no eixo X e MUV no eixo Y
  animacaoCinematica(g) {
    // Quando o tempo total termina, a gota chega ao destino e é desativada
    if (g.t >= g.T) {
      g.x = g.xf;
      g.y = g.yf;
      g.ativo = false;
      return;
    }

    var t = g.t;

    // No eixo X, a gota se move com velocidade constante
    var x_atual = g.xi + g.vx * t;

    // No eixo Y, a gota acelera para simular a queda
    var vy_atual = g.ay * t;
    var y_atual = g.yi + 0.5 * g.ay * t * t;

    g.x = x_atual;
    g.y = y_atual;

    // Debug de coordenadas desativado
    // console.log(
    //   "[MU  | X] frame:" +
    //     g.frame +
    //     " t:" +
    //     t.toFixed(3) +
    //     "s" +
    //     " vx:" +
    //     g.vx.toFixed(2) +
    //     "px/s" +
    //     " x:" +
    //     x_atual.toFixed(1) +
    //     "px"
    // );
    // console.log(
    //   "[MUV | Y] frame:" +
    //     g.frame +
    //     " t:" +
    //     t.toFixed(3) +
    //     "s" +
    //     " ay:" +
    //     g.ay.toFixed(2) +
    //     "px/s²" +
    //     " vy:" +
    //     vy_atual.toFixed(2) +
    //     "px/s" +
    //     " y:" +
    //     y_atual.toFixed(1) +
    //     "px"
    // );
  }

  // Ativa uma gota livre do pool e define seus parâmetros de movimento
  _lancarGota() {
    const g = this._gotas.find((s) => !s.ativo);
    if (!g) return;

    const gW = this.scale.width;
    const gH = this.scale.height;
    const T = 1.2 + Math.random() * 0.6;

    // Define posição inicial, duração e comprimento visual da gota
    g.comp = Phaser.Math.Between(18, 32);
    g.xi = Phaser.Math.Between(0, gW);
    g.yi = -g.comp;
    g.xf = g.xi + 2 * T;
    g.yf = gH + g.comp;
    g.T = T;
    g.t = 0;
    g.frame = 0;
    g.x = g.xi;
    g.y = g.yi;

    // Pré-calcula os valores usados na equação cinemática
    g.vx = (g.xf - g.xi) / g.T;
    g.ay = (2 * (g.yf - g.yi)) / (g.T * g.T);
    g.vy = 0;

    g.ativo = true;
  }

  // Atualiza o tempo da chuva, cria novas gotas e redesenha as ativas
  update(time, delta) {
    // Converte o delta de milissegundos para segundos
    const dt = delta / 1000;

    // Acumula o tempo total da cena
    this._tempoDecorrido += dt;

    // Inicia a chuva após 30 segundos
    if (!this._chuvaIniciada && this._tempoDecorrido >= 30) {
      this._chuvaIniciada = true;
      this._chuvaAtiva = true;
      this._tempoCriacao = 0;
      if (this.musica && !this.musica.isPlaying) {
        this.musica.play();
      }
      console.log("[SceneChuva] chuva iniciada");
    }

    // Encerra a chuva após 50 segundos de duração
    if (
      this._chuvaIniciada &&
      !this._chuvaEncerrada &&
      this._tempoDecorrido >= 80
    ) {
      this._chuvaAtiva = false;
      this._chuvaEncerrada = true;
      if (this.musica && this.musica.isPlaying) {
        this.musica.stop();
      }
      console.log("[SceneChuva] chuva encerrada");
    }

    // Enquanto a chuva estiver ativa, cria novas gotas em intervalos curtos
    if (this._chuvaAtiva) {
      this._tempoCriacao += delta;
      if (this._tempoCriacao >= 20) {
        this._tempoCriacao = 0;

        // Lança várias gotas por vez para aumentar a densidade visual
        this._lancarGota();
        this._lancarGota();
        this._lancarGota();
        this._lancarGota();
      }
    }

    // Limpa o desenho anterior para redesenhar as gotas na posição atual
    this._gfx.clear();
    let temAtiva = false;

    for (let i = 0; i < this._gotas.length; i++) {
      const g = this._gotas[i];
      if (!g.ativo) continue;

      temAtiva = true;

      // Avança o tempo individual da gota
      g.t += dt;
      g.frame += 1;

      // Recalcula a posição atual da gota
      this.animacaoCinematica(g);

      // Desenha a parte superior mais suave da gota
      this._gfx.lineStyle(2, 0x88ccee, 0.35);
      this._gfx.beginPath();
      this._gfx.moveTo(g.x, g.y - g.comp);
      this._gfx.lineTo(g.x, g.y - g.comp * 0.55);
      this._gfx.strokePath();

      // Desenha a parte inferior mais visível para reforçar o brilho
      this._gfx.lineStyle(2, 0xbbddff, 0.85);
      this._gfx.beginPath();
      this._gfx.moveTo(g.x, g.y - g.comp * 0.55);
      this._gfx.lineTo(g.x, g.y);
      this._gfx.strokePath();
    }
  }
}
