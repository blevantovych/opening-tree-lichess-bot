const { Chess } = require("chess.js");

import { ChessInstance } from "../types";
/**
 * Wraps chess.js with useful extras.
 */
class ChessUtils {
  chess: ChessInstance;

  constructor(
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ) {
    this.chess = new Chess(fen);
  }

  reset() {
    this.chess.reset();
  }

  applyMoves(moves: string[]) {
    moves.forEach((move) => this.chess.move(move, { sloppy: true }));
  }

  /**
   * Convert a chess.js move to a uci move
   */
  uci(move: { from: string; to: string; flags?: string; piece: string }) {
    return move.from + move.to + (move.flags === "p" ? move.piece : "");
  }

  fen() {
    return this.chess.fen();
  }

  move(move: string) {
    this.chess.move(move);
  }
}

export { ChessUtils };
