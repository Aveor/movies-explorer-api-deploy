const Movie = require('../models/movie');
const ForbiddenError = require('../errors/ForbiddenError');
const ValidationError = require('../errors/ValidationError');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

const addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    movieId,
    nameRU,
    nameEN,
    thumbnail,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    movieId,
    nameRU,
    nameEN,
    thumbnail,
    owner: req.user._id,
  })
    .then((movie) => {
      if (!movie) {
        throw new ValidationError('Ошибка валидации');
      }
      res.send(movie);
    })
    .catch((err) => next(err));
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .select('+owner')
    .then((movie) => {
      if (!movie) {
        throw new ValidationError('Ошибка валидации');
      }
      if (movie.owner.toString() !== req.user._id.toString()) {
        throw new ForbiddenError('Нет прав');
      }
      const deletedMovie = movie;
      movie.remove();
      res.send(deletedMovie);
    })
    .catch((err) => next(err));
};

module.exports = {
  getMovies,
  addMovie,
  deleteMovie,
};
