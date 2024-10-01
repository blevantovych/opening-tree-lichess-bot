import { Game } from "./Game";

export interface Bot {
    getNextMove({
        moves,
        sayInChat,
        game
    }: {
        moves: string[];
        sayInChat: (msg: string) => void;
        game: Game;
    }): Promise<string>;
}

type Variant = {
    key: string;
    name: string;
    shortId?: string;
};

type User = {
    id: string;
    name: string;
    online?: boolean;
    provisional?: boolean;
    rating: number;
    title: string | null;
};

export type Challenge = {
    type: "challenge";
    challenge: {
        challenger: User;
        color: Color | "random";
        destUser: User;
        finalColor: Color;
        id: string;
        initialFen: string;
        rated: boolean;
        speed: string;
        status: string;
        timeControl: {
            type: string;
        };
        url: string;
        variant: Variant;
    };
};

export type GameStart = {
    type: "gameStart";
    game: {
        color: Color;
        compat: {
            bot: boolean;
            board: boolean;
        };
        fen: string;
        fullId: string;
        gameId: string;
        hasMoved: boolean;
        id: string;
        isMyTurn: boolean;
        lastMove: string;
        opponent: {
            id: string;
            username: string;
            rating: number;
        };
        perf: string;
        rated: boolean;
        source: string;
        speed: string;
        variant: Variant;
    };
};

export type GeneralEvent = Challenge | GameStart;

export type GameFull = {
    black: User;
    clock: unknown;
    createdAt: number;
    id: string;
    initialFen: string | "startpos";
    perf: {
        name: string;
    };
    rated: boolean;
    speed: string;
    state: GameState;
    type: "gameFull";
    variant: Variant;
    white: User;
};

export type GameState = {
    binc: number;
    btime: number;
    moves: string;
    status: string;
    type: "gameState";
    winc: number;
    wtime: number;
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
