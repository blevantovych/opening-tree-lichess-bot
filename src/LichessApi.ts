const oboe = require("oboe");
import { GameStateEvent, GeneralEvent } from "./types";
import axios from "axios";

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
    return this.get("api/account");
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
    console.log(JSON.stringify(data.data));
    return data;
  }

  get(URL: string) {
    console.log(`GET ${URL}`);
    return axios
      .get(URL + "?v=" + Date.now(), this.axiosConfig)
      .then(this.logAndReturn)
      .catch((err) => console.log(err));
  }

  post<T>(URL: string, body?: T) {
    console.log(`POST ${URL} ` + JSON.stringify(body || {}));
    return axios
      .post(URL, body || {}, this.axiosConfig)
      .then(this.logAndReturn)
      .catch((err) => console.log(err.response || err));
  }

  stream<T>(URL: string, handler: (data: T) => void) {
    oboe({
      method: "GET",
      url: this.baseURL + URL,
      headers: this.headers,
    })
      .node("!", function (data: T) {
        console.log("STREAM data : " + JSON.stringify(data));
        handler(data);
      })
      .fail(function (errorReport: unknown) {
        console.error(JSON.stringify(errorReport));
      });
  }
}

export { LichessApi };
