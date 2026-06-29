/**
 * Deterministic, stable match id from its position in the bracket, e.g.
 * `matchId(0, 5)` -> "r0m5".
 *
 * Lives in its own dependency-free module so both the bracket engine and the
 * official-results data can use it without forming an import cycle.
 */
export const matchId = (roundIndex: number, indexInRound: number): string =>
  `r${roundIndex}m${indexInRound}`;
