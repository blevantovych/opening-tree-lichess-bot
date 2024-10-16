import { LichessApi } from "./LichessApi";
import logger from "./logger";
import { OpeningTreeBot } from "./OpeningTreeBot";

const token = process.env.API_TOKEN || "lip_66PbT8bJt6P2LfvktSuy";
if (token) {
    const lichessBotAPI = new LichessApi(token);
    const bot = new OpeningTreeBot(lichessBotAPI);
    bot.listenForChallenges();
} else {
    logger.error({ message: "No API_TOKEN supplied" });
}
