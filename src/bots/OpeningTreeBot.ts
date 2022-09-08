import { ChessUtils } from "../utils/ChessUtils";
import { Player } from "../types";
import axios from "axios";
import { spawn } from "child_process";

const stockfish = spawn("stockfish");

function getBestMove(): Promise<string> {
  return new Promise((resolve, reject) => {
    stockfish.stdout.on("data", (chunk) => {
      // console.log(`chunk from stockfigh `, chunk.toString());
      if (chunk.toString().includes("bestmove")) {
        const bestmove = chunk.toString().match(/(?<=bestmove )\w+/);
        console.log({ bestmove });
        if (bestmove) {
          resolve(bestmove[0]);
        }
      }
    });
  });
}

stockfish.stdout.pipe(process.stdout);
stockfish.stdin.write("isready\n");
/**
 * Play moves from Lichess's opening tree
 */
class OpeningTreeBot implements Player {
  async getNextMove({
    moves,
    sayInChat,
    fen: initialFen,
  }: {
    moves: string[];
    sayInChat: (msg: string) => void;
    fen?: string;
  }) {
    const chess = new ChessUtils(initialFen);
    chess.applyMoves(moves);
    const fen = chess.fen();
    console.log({ fen });
    const turn = chess.chess.turn() === "b" ? "black" : "white";

    // const player = "Sombranegra30";
    // const player = "ich2";
    const player = "Kazakg_Fighter";

    const openingMoves: { data?: { moves?: { uci: string }[] } } =
      await axios.get(
        // `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}`
        // `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}`
        `https://explorer.lichess.ovh/player?player=${player}&variant=standard&color=${turn}&fen=${fen}&recentGames=0`
      );

    if (openingMoves?.data?.moves?.[0]) {
      console.log("move: ", openingMoves?.data?.moves?.[0]);
      return openingMoves.data.moves[0].uci;
    } else {
      console.log("asking stockfish");
      stockfish.stdin.write("ucinewgame\n");
      stockfish.stdin.write(`position fen ${fen}\n`);
      stockfish.stdin.write(`go movetime 3000\n`);
      const bestMove = await getBestMove();
      stockfish.stdin.write("stop \n");
      console.log(`best move from stockfish ${bestMove}`);
      return bestMove;
    }
  }

  getReply() {
    return "OpeningTreeBot";
  }
}

export { OpeningTreeBot };
