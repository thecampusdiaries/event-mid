const Event = require('../models/event.js')

module.exports.index = async (req, res) => {
    const events = await Event.find().populate('organizer').exec()
    res.render('event/index.ejs', { events })
}

module.exports.addEvent = async (req, res) => {
    const { name, description, date } = req.body;
    const event = new Event({
        name,
        description,
        date,
        organizer: req.user._id
    });
    await event.save();
    res.redirect('/events'); // Redirect to event listing page
}

module.exports.renderNewForm = (req, res) => {
    res.render('event/new.ejs')
}

module.exports.showEvent = async (req, res) => {
    const event = await Event.findById(req.params.eventId)
        .populate('organizer')
        .populate({
            path: 'posts',
            populate: {
                path: 'owner'
            }
        })
        .exec();

    res.render('event/show', { event });
}