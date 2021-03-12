require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const router = require('./routes/index');
const limiter = require('./middlewares/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { errorHandler } = require('./errors/errorHandler');
const NotFoundError = require('./errors/NotFoundError.js');

const { PORT = 3000, NODE_ENV, MONGO_URL } = process.env;
const app = express();
app.use(limiter);
app.use(cors());

// app.use(
//   '*',
//   cors({
//     origin: [
//       'http://aveor-movie.students.nomoredomains.icu/',
//       'https://aveor-movie.students.nomoredomains.icu/',
//       'http://localhost:3001',
//     ],
//     credentials: true,
//   }),
// );
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

mongoose.connect(NODE_ENV === 'production' ? MONGO_URL : 'mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(requestLogger);
app.use(router);
app.use(errorLogger);
app.use(errors());

app.use(() => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
