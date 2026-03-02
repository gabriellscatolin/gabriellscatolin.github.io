// Módulo de configurações de acessibilidade — compartilhado entre todas as cenas

const PADROES = {
  volume: 0.7,
  brilho: 100,           // 50 a 200 (%)
  altoContraste: false,
  daltonismo: 'normal',  // 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia'
  animacoes: true        // false = desativa transições (vestibular/epilepsia)
};

let _dados = { ...PADROES };
try {
  const salvo = localStorage.getItem('cieloSettings');
  if (salvo) _dados = { ...PADROES, ...JSON.parse(salvo) };
} catch (e) {}

export const GameSettings = _dados;

export function salvarConfiguracoes() {
  try { localStorage.setItem('cieloSettings', JSON.stringify(GameSettings)); } catch (e) {}
}

// Aplica brilho, contraste e daltonismo via CSS no canvas do Phaser
export function aplicarConfiguracoes() {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  _garantirSvgFiltros();

  const filtros = [];
  if (GameSettings.brilho !== 100) filtros.push(`brightness(${GameSettings.brilho / 100})`);
  if (GameSettings.altoContraste)  filtros.push('contrast(2)');
  if (GameSettings.daltonismo !== 'normal') filtros.push(`url(#cielo-${GameSettings.daltonismo})`);

  canvas.style.filter = filtros.join(' ');
}

function _garantirSvgFiltros() {
  if (document.getElementById('cielo-svgfiltros')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'cielo-svgfiltros';
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;');
  svg.innerHTML = `<defs>
    <filter id="cielo-deuteranopia">
      <feColorMatrix type="matrix" values=".367 .861 -.228 0 0  .280 .673 .047 0 0  -.012 .043 .969 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cielo-protanopia">
      <feColorMatrix type="matrix" values=".152 1.053 -.205 0 0  .115 .786 .099 0 0  -.004 -.048 1.052 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cielo-tritanopia">
      <feColorMatrix type="matrix" values="1.256 -.077 -.179 0 0  -.078 .931 .148 0 0  .005 .691 .304 0 0  0 0 0 1 0"/>
    </filter>
  </defs>`;
  document.body.insertBefore(svg, document.body.firstChild);
}

export function abrirPopupConfig(scene, { onFechar, depth = 200, scrollFactor = 0 } = {}) {
  const w  = scene.scale.width;
  const h  = scene.scale.height;
  const cx = w / 2;
  const cy = h / 2;
  const els = [];
  const add = obj => { els.push(obj); return obj; };

  const d1 = depth + 1; // profundidade do conteúdo

  // Cria texto com estilo base
  const txt = (x, y, s, cfg = {}) =>
    add(scene.add.text(x, y, s, { color: '#c8d8f0', fontSize: '22px', ...cfg })
      .setDepth(d1).setScrollFactor(scrollFactor));

  // ─── Layout ─────────────────────────────────────────────────────────────────
  const PW = 860, PH = 620;
  const TITLE_H = 54;

  // Margem esquerda dos rótulos (left-edge relativa ao popup)
  const LX = cx - PW / 2 + 30;

  // Coluna de controles ([-] valor [+]):
  //   BTN_W = largura do botão, BTN_H = altura, BTN_GAP = espaço entre eles
  const BTN_W = 52, BTN_H = 42, BTN_GAP = 16;
  const CTRL_CX = cx + 150; // centro horizontal da área de controles
  // Posições dos centros de cada elemento do slider:
  const MINUS_CX = CTRL_CX - BTN_GAP - BTN_W;          // centro do [-]
  const VAL_CX   = CTRL_CX;                              // centro do valor
  const PLUS_CX  = CTRL_CX + BTN_GAP + BTN_W;           // centro do [+]

  // Para linhas de toggle, botão começa na mesma coluna que o [-]
  const TOGGLE_CX = CTRL_CX;
  const TOGGLE_W  = 110;

  // Cada linha de conteúdo tem esta altura total (botões + padding vertical)
  const ROW_H = 58;
  // Offset do rótulo dentro da linha, para centralizar visualmente com o botão
  const LABEL_Y_OFF = (BTN_H - 22) / 2; // (altura botão - font size) / 2

  // ─── Estrutura base ─────────────────────────────────────────────────────────
  // Overlay escuro
  add(scene.add.rectangle(cx, cy, w, h, 0x000000, 0.72)
    .setDepth(depth).setScrollFactor(scrollFactor));

  // Caixa principal do painel
  add(scene.add.rectangle(cx, cy, PW, PH, 0x10141e)
    .setDepth(depth + 0.1).setScrollFactor(scrollFactor));

  // Borda do painel
  add(scene.add.rectangle(cx, cy, PW, PH)
    .setStrokeStyle(2, 0x3a5ba0).setDepth(depth + 0.2).setScrollFactor(scrollFactor));

  // Barra de título
  add(scene.add.rectangle(cx, cy - PH / 2 + TITLE_H / 2, PW, TITLE_H, 0x1d2b4a)
    .setDepth(depth + 0.3).setScrollFactor(scrollFactor));

  add(scene.add.text(cx, cy - PH / 2 + TITLE_H / 2, 'CONFIGURAÇÕES', {
    fontSize: '28px', fontStyle: 'bold', color: '#ffffff'
  }).setOrigin(0.5, 0.5).setDepth(d1).setScrollFactor(scrollFactor));

  // ─── Helpers ────────────────────────────────────────────────────────────────

  // Separador de seção: linha + label colorido
  // Recebe Y do topo da seção, devolve Y da primeira linha de conteúdo
  const secao = (topY, label) => {
    add(scene.add.rectangle(cx, topY, PW - 40, 1, 0x2a3f6a)
      .setDepth(d1).setScrollFactor(scrollFactor));
    txt(LX, topY + 8, label, { fontSize: '16px', color: '#5a8fd4', fontStyle: 'bold' });
    return topY + 40; // Y onde começa a primeira linha de conteúdo
  };

  // Botão quadrado [-] ou [+]: bg é diretamente interativo, sem hitbox separado
  const mkBtnQuadrado = (centerX, centerY, label) => {
    const bg = add(scene.add.rectangle(centerX, centerY, BTN_W, BTN_H, 0x1d2b4a)
      .setStrokeStyle(1, 0x3a5ba0).setDepth(d1).setScrollFactor(scrollFactor)
      .setInteractive({ useHandCursor: true }));
    add(scene.add.text(centerX, centerY, label, {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5).setDepth(d1 + 0.5).setScrollFactor(scrollFactor));
    bg.on('pointerover', () => bg.setFillStyle(0x2a3f6a));
    bg.on('pointerout',  () => bg.setFillStyle(0x1d2b4a));
    return bg;
  };

  // Linha slider: rótulo + [-] valor [+]
  // rowTopY = topo da linha (os botões começam aqui)
  const sliderRow = (rowTopY, rotulo, valorInicial, sufixo, min, max, passo, aoMudar) => {
    const cy_btn = rowTopY + BTN_H / 2; // centro Y dos botões

    txt(LX, rowTopY + LABEL_Y_OFF, rotulo);

    const valTxt = txt(VAL_CX, rowTopY + LABEL_Y_OFF, `${valorInicial}${sufixo}`,
      { color: '#ffd080' }).setOrigin(0.5, 0);

    const hitM = mkBtnQuadrado(MINUS_CX, cy_btn, '−');
    const hitP = mkBtnQuadrado(PLUS_CX,  cy_btn, '+');

    let val = valorInicial;
    hitM.on('pointerdown', () => {
      val = Math.max(min, val - passo);
      valTxt.setText(`${val}${sufixo}`);
      aoMudar(val);
    });
    hitP.on('pointerdown', () => {
      val = Math.min(max, val + passo);
      valTxt.setText(`${val}${sufixo}`);
      aoMudar(val);
    });
  };

  // Linha toggle: rótulo + botão ON/OFF
  const toggleRow = (rowTopY, rotulo, valorInicial, aoMudar) => {
    const cy_btn = rowTopY + BTN_H / 2;
    const cor = v => v ? 0x1a5c1a : 0x5c1a1a;

    txt(LX, rowTopY + LABEL_Y_OFF, rotulo);

    const bg = add(scene.add.rectangle(TOGGLE_CX, cy_btn, TOGGLE_W, BTN_H, cor(valorInicial))
      .setStrokeStyle(1, 0x3a5ba0).setDepth(d1).setScrollFactor(scrollFactor)
      .setInteractive({ useHandCursor: true }));
    const t = add(scene.add.text(TOGGLE_CX, cy_btn,
      valorInicial ? ' ON ' : 'OFF', {
        fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5, 0.5).setDepth(d1 + 0.5).setScrollFactor(scrollFactor));

    let val = valorInicial;
    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout',  () => bg.setAlpha(1));
    bg.on('pointerdown', () => {
      val = !val;
      bg.setFillStyle(cor(val));
      bg.setAlpha(1);
      t.setText(val ? ' ON ' : 'OFF');
      aoMudar(val);
    });
  };

  // ─── Conteúdo do painel ─────────────────────────────────────────────────────
  // Y inicial (abaixo da barra de título + margem)
  let Y = cy - PH / 2 + TITLE_H + 16;

  // ── ÁUDIO
  Y = secao(Y, 'AUDIO');
  sliderRow(Y, 'Volume:', Math.round(GameSettings.volume * 100), '%', 0, 100, 10, v => {
    GameSettings.volume = v / 100;
    scene.sound.volume  = v / 100;
    salvarConfiguracoes();
  });
  Y += ROW_H;

  // ── VISUAL
  Y = secao(Y, 'VISUAL');
  sliderRow(Y, 'Brilho:', GameSettings.brilho, '%', 50, 200, 10, v => {
    GameSettings.brilho = v;
    aplicarConfiguracoes();
    salvarConfiguracoes();
  });
  Y += ROW_H;

  toggleRow(Y, 'Alto Contraste:', GameSettings.altoContraste, v => {
    GameSettings.altoContraste = v;
    aplicarConfiguracoes();
    salvarConfiguracoes();
  });
  Y += ROW_H;

  // ── ACESSIBILIDADE
  Y = secao(Y, 'ACESSIBILIDADE');

  txt(LX, Y + LABEL_Y_OFF, 'Daltonismo:');
  Y += ROW_H - 8;

  // Botões de daltonismo — distribuídos uniformemente na largura útil do painel
  const opcoesDalt = ['normal', 'deuteranopia', 'protanopia', 'tritanopia'];
  const labelDalt  = ['Normal', 'Deuter.', 'Protan.', 'Tritan.'];
  const DALT_W = 175, DALT_H = 42, DALT_GAP = 12;
  const totalDalt = DALT_W * 4 + DALT_GAP * 3;
  const daltStart = cx - totalDalt / 2 + DALT_W / 2; // centro do primeiro botão

  const btnsDalt = opcoesDalt.map((opcao, i) => {
    const bx = daltStart + i * (DALT_W + DALT_GAP);
    const ativo = GameSettings.daltonismo === opcao;
    const bg = add(scene.add.rectangle(bx, Y + DALT_H / 2, DALT_W, DALT_H,
      ativo ? 0x1a4a8a : 0x1d2b4a)
      .setStrokeStyle(1, 0x3a5ba0).setDepth(d1).setScrollFactor(scrollFactor)
      .setInteractive({ useHandCursor: true }));
    add(scene.add.text(bx, Y + DALT_H / 2, labelDalt[i], {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5, 0.5).setDepth(d1 + 0.5).setScrollFactor(scrollFactor));
    bg.on('pointerover', () => { if (GameSettings.daltonismo !== opcao) bg.setFillStyle(0x2a3f6a); });
    bg.on('pointerout',  () => { if (GameSettings.daltonismo !== opcao) bg.setFillStyle(0x1d2b4a); });
    return { bg };
  });

  opcoesDalt.forEach((opcao, i) => {
    btnsDalt[i].bg.on('pointerdown', () => {
      GameSettings.daltonismo = opcao;
      btnsDalt.forEach((b, j) => b.bg.setFillStyle(j === i ? 0x1a4a8a : 0x1d2b4a));
      aplicarConfiguracoes();
      salvarConfiguracoes();
    });
  });

  Y += DALT_H + 14;

  toggleRow(Y, 'Animações:', GameSettings.animacoes, v => {
    GameSettings.animacoes = v;
    salvarConfiguracoes();
  });

  // ── FECHAR
  const FCH_CX = cx;
  const FCH_CY = cy + PH / 2 - 40;
  const FCH_W  = 220, FCH_H = 50;

  const fchBg = add(scene.add.rectangle(FCH_CX, FCH_CY, FCH_W, FCH_H, 0x6a1a1a)
    .setStrokeStyle(1, 0x9a3a3a).setDepth(d1).setScrollFactor(scrollFactor)
    .setInteractive({ useHandCursor: true }));
  add(scene.add.text(FCH_CX, FCH_CY, 'FECHAR', {
    fontSize: '26px', color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5, 0.5).setDepth(d1 + 0.5).setScrollFactor(scrollFactor));

  fchBg.on('pointerover', () => fchBg.setFillStyle(0x8a2a2a));
  fchBg.on('pointerout',  () => fchBg.setFillStyle(0x6a1a1a));
  fchBg.on('pointerdown', () => {
    els.forEach(el => { if (el && el.active) el.destroy(); });
    if (onFechar) onFechar();
  });

  return els;
}
