const express = require('express');
const controller = require('../controllers/eventController');
const {fileUpload} = require('../middlewares/fileUpload');
const {isLoggedIn, isHost, isNotHost} = require('../middlewares/auth');
const {validateId, validateEvent, validateRsvp, validateResult} = require('../middlewares/validator');

const router = express.Router();

// GET /events (send all events to the user)
router.get('/', controller.index);

// GET /events/new (send html form for creating a new event)
router.get('/new', isLoggedIn, controller.new);

// POST /events (create a new event)
router.post('/', isLoggedIn, fileUpload, validateEvent, validateResult, controller.create);

// GET /events/:id (send details of event identified by id)
router.get('/:id', validateId, controller.show);

// GET /events/:id/edit (send html form for editing an existing event)
router.get('/:id/edit', isLoggedIn, validateId, isHost, controller.edit);

// PUT /events/:id (update event identified by id)
router.put('/:id', isLoggedIn, validateId, isHost, fileUpload, validateEvent, validateResult, controller.update);

// DELETE /stories/:id (delete the story identified by id)
router.delete('/:id', isLoggedIn, validateId, isHost, controller.delete);

// POST /events/:id/rsvp (handle rsvp request)
router.post('/:id/rsvp', isLoggedIn, isNotHost, validateRsvp, validateResult, controller.rsvp);

module.exports = router;  