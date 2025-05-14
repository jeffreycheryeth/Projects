const model = require('../models/event');
const Rsvp = require('../models/rsvp');
const User = require('../models/user');
const { DateTime } = require('luxon');
const { fileUpload } = require('../middlewares/fileUpload');

exports.index = (req, res, next) => {
    model.find()
    .then(events=> res.render('event/events', {events}))
    .catch(err=>next(err));
}

exports.new = (req, res) => {
    res.render('event/newEvent');
}

exports.create = (req, res,next) => {
    console.log("Im inside");
    let event = new model(req.body);
    event.hostName = req.session.user;
    let image = '/images/' + req.file.filename;
    event.image = image;
    event.save()
    .then(event=>{
        req.flash('success', 'Event was created successfully');
        res.redirect('/events');
})
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status = 400;
        }
        next(err)});
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    model.findById(id).populate('hostName', 'firstName lastName')
    .then(event=>{
        if(event){
            Rsvp.countDocuments({event:id, status: 'YES'})
            .then(count=>{
                res.render('./event/event', {event, count})
            })
            .catch(err=>next(err));
        }
        else{
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
}

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id).lean()
    .then(event=>{
        event.startDate = DateTime.fromJSDate(event.startDate).toISO({includeOffset: false});
        event.endDate = DateTime.fromJSDate(event.endDate).toISO({includeOffset: false});
        return res.render('./event/edit', {event});
    })
    .catch(err=>next(err));
}

exports.update = (req, res, next) => {
    let event = req.body;
    let id = req.params.id;
    if (req.file) {
        event.image = '/images/' + req.file.filename;
    }
    model.findByIdAndUpdate(id, event, {useFindAndModify: false, runValidators:true})
    .then(event=>{
            req.flash('success', 'Event was updated successfully');
            res.redirect('/events/' + id);
    })
    .catch(err=>{
        if(err.name === 'ValidationError')
        {
            err.status = 400;
        }
        next(err);
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    Rsvp.deleteMany({event:id})
    .then(rsvp=>{
        model.findByIdAndDelete(id, {useFindAndModify: false})
        .then(event=>{
            req.flash('success', 'Event was deleted successfully');
            res.redirect('/events');
        })
        .catch(err=>next(err));
        })
    .catch(err=>next(err));
}

exports.rsvp = (req,res,next)=>{
    let id = req.params.id;
    let status = req.body.status;
    const user = req.session.user;
    model.findById(id)
    .then(event=>{
        Rsvp.findOne({user:user._id, event:event._id})
        .then(exist=>{
            Rsvp.findOneAndUpdate(
                {user: user._id, event: event._id},
                {status},
                {new:true, upsert:true}
            )
            .then(rsvp=>{
                if(!exist){
                    req.flash('success', 'Successfully created an RSVP for this event');
                }
                else{
                    req.flash('success', 'Successfully updated an RSVP for this event');
                }
                res.redirect('/users/profile');
            })
            .catch(err=>next(err));
        })
    })
    .catch(err=>next(err));
}

