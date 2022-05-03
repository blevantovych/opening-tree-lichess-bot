const ChessUtils = require("../utils/ChessUtils");
const PatzerPlayer  = require('./PatzerPlayer')
const axios = require("axios");


/**
 * Do not play moves that leave opponent with mate in one or checks or captures.
 * else random.
 * 
 */
class OpeningTreeBot {

  constructor() {
    // this.outOfBook = false;
  }

  /**
   * @param {string[]} moves
   * @returns {string}
   */
  getNextMove(moves, sayInChat) {
    const patzer = new PatzerPlayer();
    const chess = new ChessUtils();
    chess.applyMoves(moves);
    const fen = chess.fen()
  //  if (this.outOfBook) {
  //      return new Promise(r => r(patzer.getNextMove(moves)));
  //  }
    return axios
      .get(`https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}`)
      // .get(`https://explorer.lichess.ovh/player?player=bodya17&color=black&variant=standard&fen=${fen}`)
      .then(openingMoves => {
        if(openingMoves.data && openingMoves.data.moves && openingMoves.data.moves[0]) {
          return openingMoves.data.moves[0].uci
        }
        // this.outOfBook = true;
        sayInChat('I am out of book! Brace yourself!')
        return patzer.getNextMove(moves);
      })
  }

}

module.exports = OpeningTreeBot;
