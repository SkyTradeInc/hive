const dotenv = require('dotenv').config()
const web3 = require('web3');

class Web3 {
    constructor() {
      this.host = `https://${process.env.ETHEREUM_NETWORK}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      this.http = new web3(new web3.providers.HttpProvider(this.host));

    }

}

module.exports = Web3;
