const dotenv = require('dotenv').config()
const axios = require('axios')
const { soliditySha3 } = require('web3-utils');
const {
  hashPersonalMessage,
  bufferToHex,
  toBuffer,
  ecsign,
} = require('ethereumjs-util');
const { mapValues } = require('lodash');

class Idex {
  constructor(symbol, web3) {
    this.ready = false
    this.apiKey = process.env.IDEX_API_KEY
    this.web3 = web3.web3Http
    this.symbol = symbol.toUpperCase()
    this.market = `ETH_${symbol.toUpperCase()}`
    this.expires = 100000
    this.socket = null
    this.bids = []
    this.asks = []
    this.nonce = null
    this.idexContractAddress = '0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208'
    this.wallet = {
      publicKey: process.env.ETHEREUM_PUBLIC_KEY,
      privateKey: process.env.ETHEREUM_PRIVATE_KEY
    }
    this.addressLookup = {}
    this.init()
  }

  init() {
    Promise.all([this.returnCurrencies(), this.returnContractAddress(), this.returnNextNonce(this.wallet.publicKey)])
      .then(data => {
        this.addressLookup = data[0]
        this.idexContractAddress = data[1]
        this.nonce = data[2]
        this.ready = true
      })
      .catch(error => {
        console.log(error)
      })
  }

  // Contract-Backed Endpoints \\

  orderSell(amountBuy, amountSell) {
    return new Promise( (resolve, reject) => {
      if(!this.ready) return reject('Web3 not ready')
      try {
        const idexContractAddress = this.idexContractAddress;
        const tokenBuy = this.addressLookup['ETH'].address;
        const tokenSell = this.addressLookup[this.symbol].address;
        const expires = this.expires;
        const nonce = this.nonce;
        const address = this.wallet.publicKey;

        const raw = soliditySha3(
          {t: 'address', v: idexContractAddress},
          {t: 'address', v: tokenBuy},
          {t: 'uint256', v: amountBuy},
          {t: 'address', v: tokenSell},
          {t: 'uint256', v: amountSell},
          {t: 'uint256', v: expires},
          {t: 'uint256', v: nonce},
          {t: 'address', v: address}
        )

        const args = {
          tokenBuy,
          amountBuy,
          tokenSell,
          amountSell,
          address,
          nonce,
          expires
        };

        const salted = hashPersonalMessage(toBuffer(raw));
        const vrs = mapValues(
          ecsign(salted, toBuffer(this.wallet.privateKey)),
          (value, key) => key === 'v' ? value : bufferToHex(value)
        );

        const payload = Object.assign(args, vrs)

        axios.post('https://api.idex.market/order', payload, {
          headers: {
            'API-Key': this.apiKey
          }
        })
          .then(data => {
            console.log(data.data)
          })
          .catch(error => {
            console.log(error)
          })

      } catch (error) {
        reject(error)
      }
    })
  }

  // Read-Only Endpoints \\

  returnTicker(market) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnTicker', {market})
        .then(ticker => {
          resolve(ticker.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnCurrencies() {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnCurrencies', {})
        .then(tickers => {
          resolve(tickers.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  return24Volume() {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/return24Volume', {})
        .then(volume => {
          resolve(volume.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnBalances(address) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnBalances', {address})
        .then(balances => {
          resolve(balances.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnCompleteBalances(address) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnCompleteBalances', {address})
        .then(balances => {
          resolve(balances.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnDepositsWithdrawals(address, start = 0, end = Date.now()) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnDepositsWithdrawals', {address, start, end})
        .then(depositWithdrawals => {
          resolve(depositWithdrawals.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnOpenOrders(market, address) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnOpenOrders', {market, address})
        .then(openOrders => {
          resolve(openOrders.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnOrderBook(market, count) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnOrderBook', {market, count})
        .then(orderbook => {
          resolve(orderbook.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnOrderStatus(orderHash) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnOrderStatus', {orderHash})
        .then(order => {
          resolve(order.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnOrderTrades(orderHash) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnOrderTrades', {orderHash})
        .then(order => {
          resolve(order.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnTradeHistory(market, address, count) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnOrderTrades', {market, address, count})
        .then(history => {
          resolve(history.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnContractAddress() {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnContractAddress', {})
        .then(address => {
          resolve(address.data.address)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  returnNextNonce(address) {
    return new Promise( (resolve, reject) => {
      axios.post('https://api.idex.market/returnNextNonce', {address})
        .then(nonce => {
          resolve(nonce.data.nonce)
        })
        .catch(error => {
          reject(error)
        })
    })
  }





}

module.exports = Idex;
