import axiod from "https://deno.land/x/axiod/mod.ts";
import { createRequire } from "https://deno.land/std/node/module.ts";
const require = createRequire(import.meta.url);
// const oboe = require("oboe");
// const axiod = require("axiod");

// /**
//  * Programatic interface to the web API of lichess https://lichess.org/api#tag/Bot
//  *
//  */
class LichessApi {
  baseURL: string;
  headers: { [key: string]: unknown };
  axiodConfig: { [key: string]: unknown };
  axiod = axiod;

  /**
   * Initialise with access token from https://lichess.org/account/oauth/token/create.
   */
  constructor(token: string | undefined) {
    this.baseURL = "https://lichess.org/";
    this.headers = { Authorization: `Bearer ${token}` };
    this.axiodConfig = {
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
    return axiod
      .get(URL + "?v=" + Date.now(), this.axiodConfig)
      .then(this.logAndReturn)
      .catch((err: any) => console.log(err));
  }

  post(URL: string, body?: any) {
    console.log(`POST ${URL} ` + JSON.stringify(body || {}));
    return axiod
      .post(URL, body || {}, this.axiodConfig)
      .then(this.logAndReturn)
      .catch((err: any) => console.log(err.response || err));
  }

  /**
   * Connect to stream with handler.
   *
   * The axiod library does not support streams in the browser so use oboe.
   */
  stream(URL: string, handler: (data: any) => void) {
    console.log("streaming on ", this.baseURL + URL);
    return axiod(this.baseURL + URL, {
      method: "get",
      responseType: "stream",
      headers: this.headers,
    })
      .then((response) => {
        console.log("STREAM data : " + JSON.stringify(response.data));
        handler(response.data);
      })
      .catch((err) => console.log(err));
    // console.log(`GET ${URL} stream`);
    // oboe({
    //   method: "GET",
    //   url: this.baseURL + URL,
    //   headers: this.headers,
    // })
    //   .node("!", function (data: any) {
    //     console.log("STREAM data : " + JSON.stringify(data));
    //     handler(data);
    //   })
    //   .fail(function (errorReport: any) {
    //     console.error(JSON.stringify(errorReport));
    //   });
    // }
  }
}

export { LichessApi };
