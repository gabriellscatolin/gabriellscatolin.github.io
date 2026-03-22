// ═══════════════════════════════════════════════════════════════════
//  SceneChuva — cena paralela dedicada à animação cinemática da chuva
// ═══════════════════════════════════════════════════════════════════
export default class SceneChuva extends Phaser.Scene {
  constructor() {
    super({ key: "SceneChuva" });
  }

  create() {
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    const gW = this.scale.width; // 1920
    const gH = this.scale.height; // 1080

    // ── Pool de gotas ────────────────────────────────────────────────
    // Cada gota é um objeto com estado cinemático completo.
    this._gotas = [];
    this._chuvaAtiva = false;

    // Cria 300 slots vazios
    for (let i = 0; i < 300; i++) {
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

    // Graphics único — redesenhado a cada frame no update()
    this._gfx = this.add.graphics();
    this._gfx.setDepth(99);

    // Começa após 30s, dura 50s
    this._tempoDecorrido = 0;
    this._chuvaIniciada = false;
    this._chuvaEncerrada = false;
    this._tempoCriacao = 0; // controla intervalo entre novas gotas
  }

  // ═══════════════════════════════════════════════════════════════════
  //  animacaoCinematica — avança UM frame da gota usando cinemática
  // ═══════════════════════════════════════════════════════════════════
  animacaoCinematica(g) {
    if (g.t >= g.T) {
      g.x = g.xf;
      g.y = g.yf;
      g.ativo = false;
      return;
    }

    var t = g.t;

    // MU — eixo X: posição linear
    var x_atual = g.xi + g.vx * t;

    // MUV — eixo Y: velocidade e posição quadrática
    var vy_atual = g.ay * t;
    var y_atual = g.yi + 0.5 * g.ay * t * t;

    g.x = x_atual;
    g.y = y_atual;

    // Só imprime a cada 10 frames para não travar o console
    if (g.frame % 10 === 0) {
      console.log(
        "[MU  | X] frame:" +
          g.frame +
          " t:" +
          t.toFixed(3) +
          "s" +
          " vx:" +
          g.vx.toFixed(2) +
          "px/s" +
          " x:" +
          x_atual.toFixed(1) +
          "px",
      );
      console.log(
        "[MUV | Y] frame:" +
          g.frame +
          " t:" +
          t.toFixed(3) +
          "s" +
          " ay:" +
          g.ay.toFixed(2) +
          "px/s²" +
          " vy:" +
          vy_atual.toFixed(2) +
          "px/s" +
          " y:" +
          y_atual.toFixed(1) +
          "px",
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  _lançarGota — inicializa uma gota livre do pool
  // ─────────────────────────────────────────────────────────────────
  _lancarGota() {
    const g = this._gotas.find((s) => !s.ativo);
    if (!g) return;

    const gW = this.scale.width;
    const gH = this.scale.height;
    const T = 1.2 + Math.random() * 0.6; // 1.2s a 1.8s

    g.comp = Phaser.Math.Between(18, 32); // comprimento maior = mais visível
    g.xi = Phaser.Math.Between(0, gW);
    g.yi = -g.comp;
    g.xf = g.xi + 2 * T; // vento leve: 2 px/s (MU)
    g.yf = gH + g.comp;
    g.T = T;
    g.t = 0;
    g.frame = 0;
    g.x = g.xi;
    g.y = g.yi;

    // Pré-calcula vx (MU) e ay (MUV) — usados em todo frame
    g.vx = (g.xf - g.xi) / g.T;
    g.ay = (2 * (g.yf - g.yi)) / (g.T * g.T);
    g.vy = 0;

    g.ativo = true;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  UPDATE — loop principal: avança cinemática e redesenha todas gotas
  // ═══════════════════════════════════════════════════════════════════
  update(time, delta) {
    // delta = ms desde o último frame (ex: ~16.67ms a 60fps)
    const dt = delta / 1000; // converte para segundos

    // ── Controle de tempo da chuva ───────────────────────────────────
    this._tempoDecorrido += dt;

    // Inicia chuva após 30s
    if (!this._chuvaIniciada && this._tempoDecorrido >= 30) {
      this._chuvaIniciada = true;
      this._chuvaAtiva = true;
      this._tempoCriacao = 0;
      console.log("[SceneChuva] chuva iniciada");
    }

    // Para a chuva após 80s (30s de espera + 50s de chuva)
    if (
      this._chuvaIniciada &&
      !this._chuvaEncerrada &&
      this._tempoDecorrido >= 80
    ) {
      this._chuvaAtiva = false;
      this._chuvaEncerrada = true;
      console.log("[SceneChuva] chuva encerrada");
    }

    // ── Cria novas gotas a cada 40ms enquanto chuva ativa ───────────
    if (this._chuvaAtiva) {
      this._tempoCriacao += delta;
      if (this._tempoCriacao >= 40) {
        this._tempoCriacao = 0;
        // Lança 2 gotas por vez para densidade maior
        this._lancarGota();
        this._lancarGota();
      }
    }

    // ── Avança cinemática de cada gota ativa ────────────────────────
    this._gfx.clear();
    let temAtiva = false;

    for (let i = 0; i < this._gotas.length; i++) {
      const g = this._gotas[i];
      if (!g.ativo) continue;

      temAtiva = true;

      // Avança o tempo da gota pelo dt real do Phaser
      g.t += dt;
      g.frame += 1;

      // Chama a função cinemática para calcular nova posição
      this.animacaoCinematica(g);

      // ── Desenha a gota ───────────────────────────────────────────
      this._gfx.lineStyle(2, 0x88ccee, 0.35);
      this._gfx.beginPath();
      this._gfx.moveTo(g.x, g.y - g.comp);
      this._gfx.lineTo(g.x, g.y - g.comp * 0.55);
      this._gfx.strokePath();

      // Parte inferior (mais opaca e brilhante)
      this._gfx.lineStyle(2, 0xbbddff, 0.85);
      this._gfx.beginPath();
      this._gfx.moveTo(g.x, g.y - g.comp * 0.55);
      this._gfx.lineTo(g.x, g.y);
      this._gfx.strokePath();
    }
  }
}
