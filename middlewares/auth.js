// const jwt = require('jsonwebtoken');
// const AuthError = require('../errors/AuthError');
// const ForbiddenError = require('../errors/ForbiddenError');

// const { NODE_ENV, JWT_SECRET } = process.env;

// module.exports = (req, res, next) => {
//   const { authorization } = req.headers;

//   if (!authorization || !authorization.startsWith('Bearer ')) {
//     next(new ForbiddenError('Необходима авторизация.'));
//   } else {
//     const token = authorization.replace('Bearer ', '');
//     let payload;
//     try {
//       payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
//     } catch (err) {
//       next(new AuthError('Необходима авторизация.'));
//     }
//     req.user = payload;
//     next();
//   }
// };

const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');
const ForbiddenError = require('../errors/ForbiddenError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    next(new ForbiddenError('Необходима авторизация.'));
  }

  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    );
  } catch (err) {
    next(new AuthError('Необходима авторизация.'));
  }

  req.user = payload;
  next();
};
