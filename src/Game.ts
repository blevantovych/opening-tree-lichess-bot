import { LichessApi } from "./LichessApi";
import { Player, Color, GameFull, GameStateEvent } from "./types";
import { OpeningTreeBot } from "./bots/OpeningTreeBot";
import { ChessUtils } from "./utils/ChessUtils";

class Game {
  api: LichessApi;
  name: string;
  player: Player;
  gameId: string;
  color: Color;
  fen: string;

  constructor(api: LichessApi, name: string, player: Player) {
    this.api = api;
    this.name = name;
    this.player = player;
    this.sayInChat = this.sayInChat.bind(this);
  }

  start({ gameId, color, fen }: { gameId: string; color: Color; fen: string }) {
    this.color = color;
    this.gameId = gameId;
    this.fen = fen;
    this.api.streamGame(gameId, (event: GameStateEvent) => this.handler(event));
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
        console.log("Unhandled game event : " + JSON.stringify(event));
    }
  }

  sayInChat(msg: string) {
    this.api.chat(this.gameId, "player", msg);
  }

  async playNextMove(previousMoves: string) {
    const moves = previousMoves === "" ? [] : previousMoves.split(" ");
    if (this.isTurn(moves)) {
      const nextMove = await (this.player as OpeningTreeBot).getNextMove({
        moves,
        fen: this.fen,
        sayInChat: this.sayInChat,
      });
      if (nextMove) {
        return this.api.makeMove(this.gameId, nextMove);
      }
    }
  }

  playingAs(event: GameFull) {
    return event.white.name === this.name ? "white" : "black";
  }

  isTurn(moves: string[]) {
    const chess = new ChessUtils(this.fen);
    chess.applyMoves(moves);

    return chess.chess.turn() === this.color[0];
  }
}

export { Game };
