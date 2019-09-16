const express = require('express');
const router = express.Router();
const Web3 = require('../components/Web3');
const web3 = new Web3();
const Idex = require('../components/Idex');
const idex = new Idex(process.env.SYMBOL, web3);

const successResponse = (response, message = null, data = null) => {
  response.status(200).send({
    success: true,
    timestamp: Date.now(),
    message,
    data
  })
};

const errorResponse = (response, message, status = 403) => {
  response.status(status).send({
    success: false,
    timestamp: Date.now(),
    message
  })
};

router.get('/ping', (request, response) => {
  return successResponse(response, 'pong')
})

router.get('/web3', (request, response) => {
  web3.http.eth.getBlock('latest')
    .then(block => {
      return successResponse(response, 'Latest block', block)
    })
})

router.get('/order', (request, response) => {
  idex.orderSell(500000000, 500000000)
  return successResponse(response, 'triggered')

})


module.exports = router;
