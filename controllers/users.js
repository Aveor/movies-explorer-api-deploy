const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const AuthError = require('../errors/AuthError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

// const createUser = (req, res, next) => {
//   const { name, email, password } = req.body;
//   bcrypt.hash(password, 10, (error, hash) => {
//     User.findOne({ email })
//       .then((user) => {
//         if (user) return next(new ConflictError('Такой пользователь уже существует'));
//         return User.create({ name, email, password: hash })
//           .then((newUser) => res
//             .status(200)
//             .send({ success: true, message: `Пользователь ${newUser.email} успешно создан` }))
//           .catch((err) => console.log(err));
//       })
//       .catch(next);
//   });
// };

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((newUser) => {
      if (!newUser) {
        throw new ValidationError('Запрос некорректен');
      }
      return User.findById(newUser._id);
    })
    .then((newUser) => {
      if (!newUser) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send(newUser);
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Такой пользователь уже существует'));
      }
      next(err);
    });
};

// const login = (req, res, next) => {
//   const { email, password } = req.body;
//   return User.findOne({ email })
//     .select('+password')
//     .then(async (user) => {
//       if (!user) {
//         return next(new AuthError('Такого пользователя не существует'));
//       }
//       const isPasswordMatch = await bcrypt.compare(password, user.password);
//       if (!isPasswordMatch) {
//         return next(new AuthError('Не правильный логин или пароль'));
//       }
//       const token = jwt.sign(
//         { _id: user._id },
//         `${NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'}`,
//         { expiresIn: '7d' },
//       );
//       return res.status(200).send({ token });
//     })
//     .catch(next);
// };

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new AuthError('Такого пользователя не существует');
      }
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        {
          expiresIn: '7d',
        },
      );
      const currentUser = user.toObject();
      delete currentUser.password;

      res
        .cookie('jwt', token, {
          maxAge: 604800000,
          httpOnly: true,
        })
        .send(currentUser);
    })
    .catch((err) => next(err));
};

const logout = (req, res, next) => {
  try {
    res
      .cookie('jwt', '', {
        maxAge: -1,
        httpOnly: true,
      })
      .send({ message: 'Осуществлен выход пользователя' });
  } catch (err) {
    next(new AuthError('Такого пользователя не существует'));
  }
};

const updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      email,
      name,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new Error('NotValidId'))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError({ message: 'Пользователь не найден' });
      }
      throw new ValidationError({ message: 'Запрос некорректен' });
    })
    .then((user) => res.send(user))
    .catch(next);
};

module.exports = {
  getUser,
  createUser,
  login,
  updateUser,
  logout,
};
