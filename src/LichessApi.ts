const oboe = require("oboe");
import axios from "axios";

// /**
//  * Programatic interface to the web API of lichess https://lichess.org/api#tag/Bot
//  *
//  */
class LichessApi {
  baseURL: string;
  headers: { [key: string]: unknown };
  axiosConfig: { [key: string]: unknown };

  /**
   * Initialise with access token from https://lichess.org/account/oauth/token/create.
   */
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

  streamEvents(handler: (data: any) => void) {
    return this.stream("api/stream/event", handler);
  }

  streamGame(gameId: string, handler: (data: any) => void) {
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
      .catch((err: any) => console.log(err));
  }

  post(URL: string, body?: any) {
    console.log(`POST ${URL} ` + JSON.stringify(body || {}));
    return axios
      .post(URL, body || {}, this.axiosConfig)
      .then(this.logAndReturn)
      .catch((err: any) => console.log(err.response || err));
  }

  stream(URL: string, handler: (data: any) => void) {
    oboe({
      method: "GET",
      url: this.baseURL + URL,
      headers: this.headers,
    })
      .node("!", function (data: any) {
        console.log("STREAM data : " + JSON.stringify(data));
        handler(data);
      })
      .fail(function (errorReport: any) {
        console.error(JSON.stringify(errorReport));
      });
  }
}

export { LichessApi };
