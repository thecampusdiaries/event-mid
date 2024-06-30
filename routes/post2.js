const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require('../utils/wrapAsync.js');

const { authMiddleware, postMiddleware, userMiddleware } = require('../middlewares/index.js')
const postController = require('../controllers/post2.js')

const multer = require('multer')
const { storage } = require('../cloudeConfig.js')
const upload = multer({ storage })

router.get('/new',
    authMiddleware.isLoggedIn,
    wrapAsync(postController.renderPostForm))

router.post('/',
    authMiddleware.isLoggedIn,
    upload.single('post[image]'),
    wrapAsync(postController.createPost));

router
    .route("/:id")
    .get(wrapAsync(postController.showPost))
    .put(
        authMiddleware.isLoggedIn,
        userMiddleware.isOwner,
        upload.single('post[image]'),
        // postMiddleware.validatePost,                                                        // Middleware to validate incoming data
        wrapAsync(postController.updatePost)
    )
    .delete(
        authMiddleware.isLoggedIn,
        userMiddleware.isOwner,
        wrapAsync(postController.deletePost)
    )

router.get('/:id/edit',
    // authMiddleware.isLoggedIn,
    // userMiddleware.isOwner,
    postController.renderEditForm
);

router.post('/:id/like',
    authMiddleware.isLoggedIn,
    wrapAsync(postController.likePost)
);
module.exports = router;