import { ChessUtils } from "../utils/ChessUtils";
import { Player } from "../types";
import axios from "axios";

/**
 * Play moves from Lichess's opening tree
 */
class OpeningTreeBot implements Player {
  async getNextMove(moves: string[], sayInChat: (msg: string) => void) {
    const chess = new ChessUtils();
    chess.applyMoves(moves);
    const fen = chess.fen();
    const turn = chess.chess.turn() === "b" ? "black" : "white";

    // const player = "Sombranegra30";
    // const player = "ich2";

    const openingMoves: { data?: { moves?: { uci: string }[] } } =
      await axios.get(
        // `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}`
        `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}`
        // `https://explorer.lichess.ovh/player?player=${player}&variant=standard&color=${turn}&fen=${fen}&recentGames=0`
      );

    if (openingMoves?.data?.moves?.[0]) {
      return openingMoves.data.moves[0].uci;
    }

    sayInChat("I am out of book! Brace yourself!");
  }

  getReply() {
    return "OpeningTreeBot";
  }
}

export { OpeningTreeBot };
