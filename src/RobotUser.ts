import { LichessApi } from "./LichessApi";
import { Game } from "./Game";
import { Player, Account, GeneralEvent, Challenge } from "./types";

class RobotUser {
  account!: Account;
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
        this.handleGameStart(event.game.id);
        break;
      default:
        console.log("Unhandled event : " + JSON.stringify(event));
    }
  }

  handleGameStart(id: string) {
    const game = new Game(this.api, this.account.data.username, this.player);
    game.start(id);
  }

  async handleChallenge(challenge: Challenge["challenge"]) {
    await this.api.acceptChallenge(challenge.id);
  }
}

export { RobotUser };
