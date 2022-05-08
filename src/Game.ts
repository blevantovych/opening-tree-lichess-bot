import { LichessApi } from "./LichessApi";
import { Player, Color, GameFull, GameStateEvent } from "./types";
import { OpeningTreeBot } from "./bots/OpeningTreeBot";

class Game {
  api: LichessApi;
  name: string;
  player: Player;
  gameId: string;
  colour: Color;
  fen: string;

  constructor(api: LichessApi, name: string, player: Player) {
    this.api = api;
    this.name = name;
    this.player = player;
    this.sayInChat = this.sayInChat.bind(this);
  }

  start(gameId: string) {
    this.gameId = gameId;
    this.api.streamGame(gameId, (event: GameStateEvent) => this.handler(event));
  }

  handler(event: GameStateEvent) {
    switch (event.type) {
      case "gameFull":
        this.colour = this.playingAs(event);
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
    if (this.isTurn(this.colour, moves)) {
      const nextMove = await (this.player as OpeningTreeBot).getNextMove(
        moves,
        this.sayInChat
      );
      if (nextMove) {
        this.api.makeMove(this.gameId, nextMove);
      }
    }
  }

  playingAs(event: GameFull) {
    return event.white.name === this.name ? "white" : "black";
  }

  isTurn(colour: Color, moves: string[]) {
    var parity = moves.length % 2;
    return colour === "white" ? parity === 0 : parity === 1;
  }
}

export { Game };
