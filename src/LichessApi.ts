import * as oboe from "oboe";
import { GameStateEvent, GeneralEvent } from "./types";
import axios from "axios";
import logger from "./logger";

class LichessApi {
    baseURL: string;
    headers: { [key: string]: unknown };
    axiosConfig: { [key: string]: unknown };

    constructor(token: string | undefined) {
        this.baseURL = "https://lichess.org/";
        this.headers = { Authorization: `Bearer ${token}` };
        this.axiosConfig = {
            baseURL: this.baseURL,
            headers: this.headers,
        };
    }

    acceptChallenge(challengeId: string) {
        return this.post(`api/challenge/${challengeId}/accept`);
    }

    declineChallenge(challengeId: string) {
        return this.post(`api/challenge/${challengeId}/decline`);
    }

    upgrade() {
        return this.post("api/bot/account/upgrade");
    }

    accountInfo() {
        return this.get({ URL: "api/account" });
    }

    makeMove(gameId: string, move: string) {
        return this.post(`api/bot/game/${gameId}/move/${move}`);
    }

    abortGame(gameId: string) {
        return this.post(`api/bot/game/${gameId}/abort`);
    }

    resignGame(gameId: string) {
        return this.post(`api/bot/game/${gameId}/resign`);
    }

    streamEvents(handler: (data: GeneralEvent) => void) {
        return this.stream("api/stream/event", handler);
    }

    streamGame(gameId: string, handler: (data: GameStateEvent) => void) {
        return this.stream(`api/bot/game/stream/${gameId}`, handler);
    }

    chat(gameId: string, room: string, text: string) {
        return this.post(`api/bot/game/${gameId}/chat`, {
            room,
            text,
        });
    }

    logAndReturn(data: { data: unknown }) {
        // console.log(JSON.stringify(data.data, null, 4));
        return data;
    }

    async get({ URL }: { URL: string }) {
        logger.info({
            message: `Making GET`,
            url: URL,
        });
        try {
            const data = await axios.get(
                URL + "?v=" + Date.now(),
                this.axiosConfig
            );
            return this.logAndReturn(data);
        } catch (err) {
            logger.error({ message: "Error on GET", error: err });
        }
    }

    async post<T>(URL: string, body?: T) {
        logger.info({
            message: `Making POST`,
            url: URL,
            body,
        });
        try {
            const data = await axios.post(URL, body || {}, this.axiosConfig);
            return this.logAndReturn(data);
        } catch (err) {
            logger.error({ message: "Error on POST", error: err });
        }
    }

    stream<T>(URL: string, handler: (data: T) => void) {
        oboe({
            method: "GET",
            url: this.baseURL + URL,
            headers: this.headers,
        })
            .node("!", function (data: T) {
                logger.info({
                    message: "Got stream data",
                    data,
                });
                handler(data);
            })
            .fail(function (errorReport: unknown) {
                logger.error({
                    message: "streaming fialed",
                    errorReport,
                });
            });
    }
}

export { LichessApi };
