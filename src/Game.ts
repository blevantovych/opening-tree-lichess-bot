import { LichessApi } from "./LichessApi";
import { Bot, Color, GameStateEvent } from "./types";
import { OpeningTreeBot } from "./OpeningTreeBot";
import { ChessUtils } from "./utils/ChessUtils";
import logger from "./logger";

class Game {
    api: LichessApi;
    botUserName: string;
    opponentUserName: string;
    bot: Bot;
    gameId: string;
    color: Color;
    fen: string;

    constructor(
        api: LichessApi,
        bot: Bot,
        botUserName: string,
        opponentUserName: string
    ) {
        this.api = api;
        this.botUserName = botUserName;
        this.opponentUserName = opponentUserName;
        this.bot = bot;
        this.sayInChat = this.sayInChat.bind(this);
    }

    start({
        gameId,
        color,
        fen,
    }: {
        gameId: string;
        color: Color;
        fen: string;
    }) {
        this.color = color;
        this.gameId = gameId;
        this.fen = fen;
        this.api.streamGame(gameId, (event: GameStateEvent) =>
            this.handler(event)
        );
    }

    handler(event: GameStateEvent) {
        switch (event.type) {
            case "gameFull":
                this.playNextMove(event.state.moves);
                break;
            case "gameState":
                this.playNextMove(event.moves);
                break;
            default:
                logger.info({
                    message: "Unhandled game event",
                    event_type: event.type,
                    event,
                });
        }
    }

    sayInChat(msg: string) {
        this.api.chat(this.gameId, "player", msg);
    }

    async playNextMove(previousMoves: string) {
        const moves = previousMoves === "" ? [] : previousMoves.split(" ");
        if (this.isMyTurn(moves)) {
            const nextMove = await (this.bot as OpeningTreeBot).getNextMove({
                moves,
                fen: this.fen,
                sayInChat: this.sayInChat,
                game: this,
            });
            if (nextMove) {
                return this.api.makeMove(this.gameId, nextMove);
            }
        }
    }

    isMyTurn(moves: string[]) {
        const chess = new ChessUtils(this.fen);
        chess.applyMoves(moves);
        return chess.chess.turn() === this.color[0]; // 'w' || 'b';
    }
}

export { Game };
