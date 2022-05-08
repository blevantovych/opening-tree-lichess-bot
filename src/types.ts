export interface Player {
  getNextMove(
    moves: string[],
    sayInChat: (msg: string) => void
  ): Promise<string>;
}

export type Challenge = {
  type: "challenge";
  challenge: {
    id: string;
    rated: boolean;
    challenger: {
      id: string;
    };
  };
};

export type GameStart = {
  type: "gameStart";
  game: {
    id: string;
  };
};

export type GeneralEvent = Challenge | GameStart;

export type GameFull = {
  type: "gameFull";
  white: {
    name: string;
  };
  state: {
    moves: string;
  };
};

export type GameState = {
  type: "gameState";
  moves: string;
};

export type ChatLine = {
  type: "chatLine";
  username: string;
  room: string;
};

export type GameStateEvent = GameFull | GameState | ChatLine;

export type Account = {
  data: {
    username: string;
  };
};

export type Color = "white" | "black";
