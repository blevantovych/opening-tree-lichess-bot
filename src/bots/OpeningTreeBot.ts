import { ChessUtils } from "../utils/ChessUtils.ts";
import { Player } from "./Player.ts";
import axiod from "https://deno.land/x/axiod/mod.ts";
import { createRequire } from "https://deno.land/std/node/module.ts";
const require = createRequire(import.meta.url);
const oboe = require("oboe");

/**
 * Play moves from Lichess's opening tree
 *
 */
class OpeningTreeBot implements Player {
  constructor() {
    // this.outOfBook = false;
  }

  getNextMove(moves: string[], sayInChat: (msg: string) => void) {
    console.log({ moves });
    // const patzer = new PatzerPlayer();
    const chess = new ChessUtils();
    chess.applyMoves(moves);
    const fen = chess.chess.fen();
    const turn = chess.chess.turn() === "b" ? "black" : "white";
    const player = "Sombranegra30";
    //  if (this.outOfBook) {
    //      return new Promise(r => r(patzer.getNextMove(moves)));
    //  }
    return axiod
      .get(
        // `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}`
        // `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}`
        `https://explorer.lichess.ovh/player?player=${player}&variant=standard&color=${turn}&fen=${fen}&recentGames=0`
      )
      .then((openingMoves: { data?: { moves?: { uci: string }[] } }) => {
        if (
          openingMoves.data &&
          openingMoves.data.moves &&
          openingMoves.data.moves[0]
        ) {
          return openingMoves.data.moves[0].uci;
        }
        // this.outOfBook = true;
        sayInChat("I am out of book! Brace yourself!");
      });
  }

  getReply() {
    return "OpeningTreeBot";
  }
}

export { OpeningTreeBot };
