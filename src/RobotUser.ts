import { LichessApi } from "./LichessApi.ts";
// import { OpeningTreeBot } from "./bots/OpeningTreeBot.ts";
import { Game } from "./Game.ts";
import { Account, Event } from "./types.ts";

/**
 * RobotUser listens for challenges and spawns Games on accepting.
 *
 */
class RobotUser {
  /**
   * Initialise with access token to lichess and a player algorithm.
   */
  account!: Account;
  api: LichessApi;
  player: Player;

  constructor(api: LichessApi, player: Player) {
    this.api = api;
    this.player = player;
  }

  async start() {
    this.account = (await this.api.accountInfo()) as any;
    console.log({ account: this.account });
    console.log("Playing as " + this.account.data.username);
    this.api.streamEvents((event: Event) => this.eventHandler(event));
    return this.account;
  }

  eventHandler(event: Event) {
    switch (event.type) {
      case "challenge":
        this.handleChallenge(event.challenge);
        break;
      case "gameStart":
        console.log({ event });
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

  async handleChallenge(challenge: Event["challenge"]) {
    if (challenge.rated) {
      console.log("Declining rated challenge from " + challenge.challenger.id);
      const response: any = await this.api.declineChallenge(challenge.id);
      console.log("Declined", response.data || response);
    } else {
      console.log(
        "Accepting unrated challenge from " + challenge.challenger.id
      );
      const response: any = await this.api.acceptChallenge(challenge.id);
      console.log("Accepted", response.data || response);
    }
  }
}

export { RobotUser };
