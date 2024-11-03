const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const { isAuthenticated } = require("./../middleware/jwt.middleware")
const router = express.Router();
const saltRounds = 10;
// POST api/auth/signup  - Creates a new user in the database
router.post('/signup', async (req, res, next) => {

    const { email, password, name } = req.body;
    //validity of email is already done in the validation middleware and user  model.
    // validation the password :

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });

        return;
    }
    // Check the users collection if a user with the same email already exists
    try {
        const foundUser = await User.findOne({ email });
        if (foundUser) {
            return res.status(400).json({ message: "User already exists." });
        }
        // If the email is unique, proceed to hash the password
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create a new user in the database

        const createdUser = await User.create({ email, password: hashedPassword, name });

        // Destructure to get the email, name, and id from the created user
        const { email: userEmail, name: userName, _id } = createdUser;  // destructering using custum new variable names is optional ie use userEmail and userName instead of email and name  destructed from createdUser respectively


        // Create a new object that doesn't expose the password
        const user = { email: userEmail, name: userName, _id }; // assing the custum variable used earlier to the original variable names used in the User model

        // Send a json response containing the user object
        res.status(201).json({ user: user });

    }


    catch (error) {
        next(error); // Pass errors to the error handler middleware
    }
});


