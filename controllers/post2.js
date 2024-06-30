const Post = require('../models/post.js')
const Event = require('../models/event.js')

module.exports.index = async (req, res) => {
    // Find the event by eventId and populate its posts
    console.log(req.params.eventId)
    const event = await Event.findById(req.params.eventId).populate('posts').exec();

    if (!event) {
        // Handle case where event is not found
        return res.status(404).send('Event not found');
    }
    // Render a view or send a JSON response with the posts
    res.render('post2/index', { event });
}
module.exports.createPost = async (req, res) => {

    const { title, caption, eventId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
        return res.status(404).send('Event not found');
    }
    console.log(event)
    const newPost = new Post({
        title,
        caption,
        owner: event.organizer._id, // Use organizer's ObjectId as the owner
        event: eventId
    });

    const url = req.file.path
    const filename = req.file.filename
    newPost.image = { url, filename }

    console.table([url, filename])

    newPost.owner = req.user._id

    await newPost.save();

    event.posts.push(newPost._id);
    await event.save();
    console.log('all done')
    res.redirect(`/events/${eventId}/posts`); // Redirect to the event page after adding post
};

// Controller action to render form for creating a new post
module.exports.renderPostForm = async (req, res) => {
    const events = await Event.find({ organizer: req.user._id });
    return res.render('post2/new', { events });
};

module.exports.showPost = async (req, res) => {
    let { id } = req.params;
    const post = await Post.findById(id)
        .populate({
            path: "comments",
            populate: {
                path: "author",
            }
        })
        .populate('owner');
    if (!post) {
        req.flash("error", "The post you are trying to access does not exist.")
        res.redirect('/explore')
    }
    res.render('post/show.ejs', { post });
}


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let post = await Post.findById(id);
    console.log('ji')
    if (!post) {
        req.flash("error", "The post you are trying to edit does not exist.")
        res.redirect('/explore')
    }
    let imgUrl = post.image.url;
    imgUrl = imgUrl.replace('/upload', '/upload/w_250')
    res.render('post/edit.ejs', { post, imgUrl });
}

module.exports.updatePost = async (req, res) => {
    let { id } = req.params;
    let post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    if (req.file) {
        const url = req.file.path
        const filename = req.file.filename
        console.table([url, filename])
        post.image = { url, filename }
        await post.save()
    }
    await post.save();
    req.flash("success", "Post Updated Successfully !!")
    res.redirect(`/explore/posts/${id}`);
}

module.exports.deletePost = async (req, res) => {
    let { id } = req.params;
    await Post.findByIdAndDelete(id);
    console.log(`${id} deleted !!`);
    req.flash("success", "Post Deleted Successfully !!")
    res.redirect('/explore');
}

module.exports.likePost = async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    const userId = req.user._id;

    if (!post) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/explore');
    }

    const likedIndex = post.likedBy.indexOf(userId);

    if (likedIndex === -1) {    // If user has not liked the post yet, like it
        post.likes += 1;
        post.likedBy.push(userId);
    } else {    // If user has already liked the post, unlike it
        post.likes -= 1;
        post.likedBy.splice(likedIndex, 1);
    }
    await post.save();
    res.redirect(`/explore/posts/${id}`);
}
