// ─── Sistema de CieloCoins ────────────────────────────────────────────────────
// Fonte: GDD do projeto Cielo Quest
//
// Uso em qualquer cena:
//   import { handleAnswer, checkGoal, getScore, ... } from "../scoring.js";
//   initScoring(this.registry);  // uma vez no init() ou create()
//
// O total global fica salvo no Phaser registry ("cieloCoins") e persiste
// entre cenas durante a sessão de jogo.

export const SCORING_CONFIG = {
  chapter1: {
    correct:      100,
    generic:       50,
    wrong:          0,   // errar não penaliza no cap. 1
    agency_goal:  150,
    phase1_goal:  350,   // Padaria
    phase2_goal:  400,   // Farmácia
    phase3_goal:  450,   // Escritório
  },
  chapter2: {
    correct:      200,
    generic:      100,
    wrong:          0,   // errar não penaliza no cap. 2
    agency_goal:  600,
    phase4_goal:  700,   // Cabeleleiro / Loja de Roupas
    phase5_goal:  null,  // Metrô — minigame separado, sem meta obrigatória
    phase6_goal:  800,   // Restaurante
    phase7_goal:  900,   // Supermercado
  },
  chapter3: {
    correct:      300,
    generic:      150,
    wrong:        -50,   // ATENÇÃO: errar subtrai coins no cap. 3
    agency_goal:  900,
    phase8_goal:  1500,   // Posto de Gasolina
  },
  metro_minigame: {
    coin_value:      50,
    max_collisions:   3,
  },
};

// Metas por fase (para o número real de perguntas de cada fase)
const METAS_BASE = {
  agency1_gg:  150,
  agency1_pj:  150,
  padaria:     350,
  farmacia:    400,
  escritorio:  450,
  agency2:     600,
  cabeleleiro: 700,
  restaurante: 800,
  mercado:     900,
  agency3:     900,
  posto:       1500,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Retorna a meta de coins da fase.
 * @param {string} fase — chave do METAS_BASE (ex: "farmacia")
 */
export function goalEscalado(fase) {
  return METAS_BASE[fase] ?? 0;
}

/**
 * Inicializa o registry para a sessão (chame no init() de cada diálogo).
 * @param {Phaser.Data.DataManager} registry
 */
export function initScoring(registry) {
  if (registry.get("cieloCoins") === undefined || registry.get("cieloCoins") === null) {
    registry.set("cieloCoins", 0);
  }
  if (registry.get("metroColisoes") === undefined) {
    registry.set("metroColisoes", 0);
  }
}

/**
 * Adiciona (ou subtrai, se negativo) coins ao total global da sessão.
 * @param {Phaser.Data.DataManager} registry
 * @param {number} amount
 * @returns {number} novo total
 */
export function addCoins(registry, amount) {
  const atual = Number(registry.get("cieloCoins") ?? 0);
  const novo = atual + amount;
  registry.set("cieloCoins", novo);
  return novo;
}

/**
 * Retorna o total atual de CieloCoins da sessão.
 * @param {Phaser.Data.DataManager} registry
 */
export function getScore(registry) {
  return Number(registry.get("cieloCoins") ?? 0);
}

/**
 * Aplica os coins corretos para uma resposta, de acordo com o capítulo.
 * @param {Phaser.Data.DataManager} registry
 * @param {"chapter1"|"chapter2"|"chapter3"} chapter
 * @param {"correta"|"neutra"|"errada"} tipo
 * @returns {number} coins ganhos (pode ser negativo no cap. 3)
 */
export function handleAnswer(registry, chapter, tipo) {
  const cfg = SCORING_CONFIG[chapter];
  if (!cfg) return 0;

  let amount;
  if (tipo === "correta")         amount = cfg.correct;
  else if (tipo === "neutra")     amount = cfg.generic;
  else                            amount = cfg.wrong;   // "errada"

  addCoins(registry, amount);
  return amount;
}

/**
 * Verifica se o jogador atingiu a meta da fase.
 * @param {string} fase          — chave do METAS_BASE
 * @param {number} pontuacaoFase — coins acumuladas só nesta fase
 */
export function checkGoal(fase, pontuacaoFase) {
  const meta = goalEscalado(fase);
  return pontuacaoFase >= meta;
}

/**
 * Adiciona 50 coins pelo minigame do metrô.
 * @param {Phaser.Data.DataManager} registry
 */
export function handleMetroCoin(registry) {
  return addCoins(registry, SCORING_CONFIG.metro_minigame.coin_value);
}

/**
 * Registra uma colisão no minigame do metrô.
 * @param {Phaser.Data.DataManager} registry
 * @returns {boolean} true se atingiu o limite (encerra o minigame)
 */
export function handleMetroCollision(registry) {
  const atual = Number(registry.get("metroColisoes") ?? 0) + 1;
  registry.set("metroColisoes", atual);
  return atual >= SCORING_CONFIG.metro_minigame.max_collisions;
}

/**
 * Reseta o contador de colisões do metrô (use ao reiniciar o minigame).
 * @param {Phaser.Data.DataManager} registry
 */
export function resetMetro(registry) {
  registry.set("metroColisoes", 0);
}
