const express = require('express');
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const { authMiddleware } = require('../middlewares/index.js')

const eventController = require('../controllers/event.js')

router.get("/",
    wrapAsync(eventController.index)
);

router.post("/",
    authMiddleware.isLoggedIn,
    wrapAsync(eventController.addEvent)
)

router.get('/new',
    authMiddleware.isLoggedIn,
    wrapAsync(eventController.renderNewForm)
)

router.get('/:eventId',
    wrapAsync(eventController.showEvent)
)

module.exports = router;