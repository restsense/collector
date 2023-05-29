import mongoose from 'mongoose';
import server from './server.js';

const mongoURL = process.env.MONGO_URL ? process.env.MONGO_URL : 'mongodb://localhost:27017/restsense';

// Server deploy
mongoose.set('strictQuery', false);
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  server.deploy(process.env).catch((err) => console.log(err));
}).catch((err) => {
  console.error(err);
});

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] Got SIGINT (aka ctrl-c in docker). Graceful shutdown`);
  server.undeploy();
});

// quit properly on docker stop
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] Got SIGTERM (docker container stop). Graceful shutdown`);
  server.undeploy();
});