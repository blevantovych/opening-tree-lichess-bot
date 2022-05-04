const ChessUtils = require("../utils/ChessUtils");
import PatzerPlayer from "./PatzerPlayer.ts";
import axiod from "https://deno.land/x/axiod/mod.ts";

/**
 * Do not play moves that leave opponent with mate in one or checks or captures.
 * else random.
 *
 */
class OpeningTreeBot {
  constructor() {
    // this.outOfBook = false;
  }

  /**
   * @param {string[]} moves
   * @returns {string}
   */
  getNextMove(moves, sayInChat) {
    console.log({ moves });
    const patzer = new PatzerPlayer();
    const chess = new ChessUtils();
    chess.applyMoves(moves);
    const fen = chess.fen();
    const turn = chess.turn() === "b" ? "black" : "white";
    const player = "Sombranegra30";
    //  if (this.outOfBook) {
    //      return new Promise(r => r(patzer.getNextMove(moves)));
    //  }
    return axios
      .get(
        // `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}`
        // `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}`
        `https://explorer.lichess.ovh/player?player=${player}&variant=standard&color=${turn}&fen=${fen}&recentGames=0`
      )
      .then((openingMoves) => {
        if (
          openingMoves.data &&
          openingMoves.data.moves &&
          openingMoves.data.moves[0]
        ) {
          return openingMoves.data.moves[0].uci;
        }
        // this.outOfBook = true;
        sayInChat("I am out of book! Brace yourself!");
        return patzer.getNextMove(moves);
      });
  }

  getReply(chat) {
    return "OpeningTreeBot";
  }
}

export { OpeningTreeBot };
