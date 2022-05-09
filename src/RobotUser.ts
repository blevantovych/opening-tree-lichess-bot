import { LichessApi } from "./LichessApi";
import { Game } from "./Game";
import { Player, Account, GeneralEvent, Challenge, GameStart } from "./types";

class RobotUser {
  account: Account;
  api: LichessApi;
  player: Player;

  constructor(api: LichessApi, player: Player) {
    this.api = api;
    this.player = player;
  }

  async start() {
    this.account = (await this.api.accountInfo()) as any;
    this.api.streamEvents((event: GeneralEvent) => this.eventHandler(event));
    return this.account;
  }

  eventHandler(event: GeneralEvent) {
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
  }

  handleGameStart(event: GameStart) {
    const game = new Game(this.api, this.account.data.username, this.player);
    const { color, fen, id: gameId } = event.game;

    game.start({ gameId, color, fen });
  }

  async handleChallenge(challenge: Challenge["challenge"]) {
    await this.api.acceptChallenge(challenge.id);
  }
}

export { RobotUser };
