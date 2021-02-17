const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUser,
  updateUser,
} = require('../controllers/users');

router.get('/me', getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().max(20).min(2),
    email: Joi.string().required().email(),
  }),
}), updateUser);

module.exports = router;
