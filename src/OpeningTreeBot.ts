import { ChessUtils } from "./utils/ChessUtils";
import { Bot, Challenge, GameStart, GeneralEvent } from "./types";
import { spawn } from "child_process";
import { Game } from "./Game";
import { LichessApi } from "./LichessApi";

const stockfish = spawn("stockfish");

const stockfishUseAnnounced = {};

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
class OpeningTreeBot implements Bot {
    api: LichessApi;
    opponentName: string;

    constructor(api: LichessApi) {
        this.api = api;
    }

    async getNextMove({
        moves,
        sayInChat,
        fen: initialFen,
        game
    }: {
        moves: string[];
        sayInChat: (msg: string) => void;
        fen?: string;
        game: Game
    }) {
        const chess = new ChessUtils(initialFen);
        chess.applyMoves(moves);
        const fen = chess.fen();
        console.log({ fen });
        const turn = chess.chess.turn() === "b" ? "black" : "white";

        const player = "Zazuliak";

        const openingMoves: { moves?: { uci: string }[] } = await fetch(
            // `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}`
            `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}`
            // `https://explorer.lichess.ovh/player?player=${player}&variant=standard&color=${turn}&fen=${fen}&recentGames=0`
        ).then((res) => res.json());
        console.log({ openingMoves });

        if (openingMoves?.moves?.length >= 1) {
            // const movesWhereOppositeSideWinsMore = openingMoves.data.moves.filter(
            //   (move) => {
            //     return move[turn] / move[turn === "black" ? "white" : "black"]
            //   }
            // );
            // const randomIndex = Math.floor(
            //   Math.random() *
            //     Math.min(
            //       openingMoves.data.moves.length,
            //       3 /* play one of the top 3 moves */
            //     )
            // );
            // const move = openingMoves.data.moves[randomIndex];
            const move = openingMoves.moves[0];
            console.log("move: ", move);
            return move.uci;
        } else {
            if (!stockfishUseAnnounced[game.opponentUserName]) {
                sayInChat("I am out of book! Using stockfish!");
                stockfishUseAnnounced[game.opponentUserName] = true;
            }

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

    listenForChallenges() {
        this.api.streamEvents((event: GeneralEvent) => {
            switch (event.type) {
                case "challenge":
                    this.handleChallenge(event.challenge);
                    break;
                case "gameStart":
                    this.handleGameStart(event);
                    break;
                default:
                    console.log("Unhandled event : " + JSON.stringify(event));
            }
        });
    }

    async handleGameStart(event: GameStart) {
        const botAccount = (await this.api.accountInfo()) as any;
        const opponentUserName = event.game.opponent.username
        const botUserName = botAccount.data.username;
        const game = new Game(this.api, this, botUserName, opponentUserName);
        const { color, fen, id: gameId } = event.game;

        game.start({ gameId, color, fen });
    }

    async handleChallenge(challenge: Challenge["challenge"]) {
        await this.api.acceptChallenge(challenge.id);
    }

}

export { OpeningTreeBot };
