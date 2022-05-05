interface Player {
  getNextMove(moves: string, sayInChat: (msg: string) => void): string;
  getReply(): string;
}
