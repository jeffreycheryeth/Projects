const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    category: {type: String, required: [true, 'category of the event is required'], enum: ["Cars and Coffee",
        "Car Show", "Touge Racing", "Drift", "Autocross", "Other"]},
    title: {type: String, required: [true, 'title of the event is required']},
    hostName: {type: Schema.Types.ObjectId, ref:'User'},
    location: {type: String, required: [true, 'Location for the event is required']},
    startDate: {type: Date, required: [true, 'Start Date and time for the event is required']},
    endDate: {type: Date, required: [true, 'End date and time for the event is required']},
    details: {type: String, required: [true, 'title is required'], minLength: [10, 'the content should have atleast 10 characters']},
    image: {type: Buffer, required: [true, 'Image for the event is required']},
});

module.exports = mongoose.model('Event', eventSchema);