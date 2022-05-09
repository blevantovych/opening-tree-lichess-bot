import { Chess, ChessInstance } from "chess.js";

class ChessUtils {
  chess: ChessInstance;
  constructor(
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ) {
    this.chess = Chess(fen);
  }

  reset() {
    this.chess.reset();
  }

  applyMoves(moves: string[]) {
    moves.forEach((move) => {
      const res = this.chess.move(move, { sloppy: true });
      if (res === null) {
        // for some reason Lichess API returns e1h1 for white's short castle 🤷
        if (move === "e1h1" || move === "e8h8") {
          this.chess.move("O-O", { sloppy: true });
        }
        if (move === "e1c1" || move === "e8c8") {
          this.chess.move("O-O-O", { sloppy: true });
        }
      }
    });
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
