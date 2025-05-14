const { body, check } = require('express-validator');
const {validationResult} = require('express-validator');

exports.validateId = (req,res, next)=>{
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        return next(err);
    }
    else{
        return next();
    }
};

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().trim().escape(), 
body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(), 
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];

exports.validateLogin = [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];


exports.validateRsvp = [body('status', 'Status can only be Yes, No or Maybe').isIn(['YES', 'NO', 'MAYBE'])];

exports.validateEvent =
    [
    body('category', 'Category is required')
    .notEmpty()
    .isIn(['Cars and Coffee', 'Car Show', 'Touge Racing', 'Drift', 'Autocross', 'Other']).withMessage('Category can only be Cars and Coffee, Car Show, Touge Racing, Drift, Autocross, Other.')
    .trim().escape(),

    body('title')
    .notEmpty().withMessage('Title cannot be empty')
    .trim().escape(),

    body('location')
    .notEmpty().withMessage('Location cannot be empty')
    .trim().escape(),

    body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('The format of Start Date must be YYYY-MM-DDThh:mm:ssTZD')
    .isAfter().withMessage('The Start Date must be after today')
    .trim().escape(),

    body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('The format of End Date must be YYYY-MM-DDThh:mm:ssTZD')
    .trim().escape(),

    body('details')
    .notEmpty().withMessage('Details cannot be empty')
    .isLength({min: 10}).withMessage('Details must be at least 10 characters')
    .trim().escape(),

    //fileupload is not in the body, it is inside req.file. So, created a custom validator to check if a
    //file has been submitted. The file extension is being handled default in multer. 
    check('image')
        .custom((value, {req})=>{
            if(req.file){
                console.log('running validateImage middleware');
                return true;
            }
            throw new Error('Image is required');
            })
];



exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        })
        return res.redirect('back');
    } else {
        return next();
    }
}
