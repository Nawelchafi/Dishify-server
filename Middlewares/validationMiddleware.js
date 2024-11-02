const { model } = require("mongoose");

function validationErrorHandler(err, req, res, next) {

    if (err.name === 'ValidationError') {
        // Format each error by field and message
        const errors = Object.keys(err.errors).map(field => ({ //err.errors: This is an object created by Mongoose when validation fails.
            field,
            message: err.errors[field].message
        }));
        // Send a 400 Bad Request status with the formatted errors
        return res.status(400).json({ errors });
    }
    //  if no error accurs call next to Pass any other type of errors to the next error handler
    next(err);
}
model.export = validationErrorHandler