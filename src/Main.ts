import { LichessApi } from "./LichessApi";
import { RobotUser } from "./RobotUser";
import { OpeningTreeBot } from "./bots/OpeningTreeBot";
import { Player } from "./types";

/**
 * Start a RobotUser (lichess account defined by API_TOKEN) that listens for challenges
 * and spawns games for unrated challenges. A player object must be supplied that can
 * produce the next move to play given the previous moves.
 *
 * Token can be created on BOT accounts at https://lichess.org/account/oauth/token/create
 * Put the token in the shell environment with
 *
 * export API_TOKEN=xxxxxxxxxxxxxx
 * yarn install
 * yarn start
 */

async function startBot(token: string | undefined, player: Player) {
  if (token) {
    const robot = new RobotUser(new LichessApi(token), player);
    await robot.start();
  } else {
    console.log("No API_TOKEN supplied");
  }
}

(async function () {
  await startBot(process.env.API_TOKEN || "lip_66PbT8bJt6P2LfvktSuy", new OpeningTreeBot());
})();
