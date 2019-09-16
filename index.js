process.title = "HiveBot v1.0"
const dotenv = require('dotenv').config()
const chalk = require('chalk')
const cluster = require('cluster')
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 1337;
const socket = require('socket.io');
const server = app.listen(port, () => {
  console.log(chalk.green(`[+] Listening on port: ${port}`))
  const router = require('./routes/');
  app.use(express.json());
  app.use(cors());
  app.use('/', router)
})

const io = module.exports = socket(server);

// mongoose.connect('mongodb://127.0.0.1/simulator', { useNewUrlParser: true });
//   mongoose.connection.on('connected', () => {
//   console.log(`[!] Connected to MongoD`);
// });
// mongoose.set('useFindAndModify', false);
//
//
// mongoose.connection.on('error', (err) => {
//   console.log(chalk.red(`[X] ${err}`))
// });
