const routes = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const usersRouter = require('./users');
const moviesRouter = require('./movies');

const { createUser, login, logout } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');

routes.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(5),
    name: Joi.string().max(30).min(2).required(),
  }),
}),
createUser);

routes.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(5),
  }),
}),
login);

routes.get('/signout', logout);
routes.use('/users', auth, usersRouter);
routes.use('/movies', auth, moviesRouter);
routes.use(() => {
  throw new NotFoundError('Запрашиваемый ресурс не найден.');
});
module.exports = routes;
