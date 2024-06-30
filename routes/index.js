const express = require('express');
const router = express.Router();

const ExpressError = require('../utils/ExpressError')

const postsRouter = require('./post2');
const commentsRouter = require('./comment');
const usersRouter = require('./user');
const googleAuthRouter = require('./googleAuth');
const eventRouter = require('./event.js')

router.use('/explore/posts', postsRouter);
router.use('/events', eventRouter)
router.use('/explore/posts/:id/comments', commentsRouter);
router.use('/', googleAuthRouter);
router.use('/users', usersRouter);

router.get('/', (req, res) => {
    res.redirect('/explore');
});

router.all("*", (req, res, next) => {
    next(new ExpressError(404, "This page does not exist."));
});

module.exports = router;