const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../Middlewares/jwt.middleware");
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const saltRounds = 10;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; //  Google Client ID
const client = new OAuth2Client(CLIENT_ID); //creatiing a new OAuth2Client instance with the provided client ID

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
// sign up with google OAuth
// POST api/auth/google - Authenticate with Google
router.post('/google', async (req, res, next) => {
    const { token } = req.body;  // Google ID Token
    try {
        // Verify the Google token with Google's API
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  //  Google Client ID
        }); // this function returns a Promise which resolves to a GoogleAuth.TokenPayload object
        const payload = ticket.getPayload();  // The decoded payload from Google
        const { email, name, sub: googleId } = payload; // disconstructuring the payload to get the required fields sub is the unique identifier for the user in google
        // Check if the user exists in the database
        let user = await User.findOne({ googleId });

        if (!user) {
            // If no googleId match, but email exists (manual sign-up), link accounts
            user = await User.findOne({ email });

            if (user) {
                // Optionally update the user to add googleId (merge accounts)
                user.googleId = googleId;
                await user.save();
            } else {
                // Full new user
                user = await User.create({ email, name, googleId });
            }
        }    // Create a JWT token to use in your app
        const jwtPayload = { _id: user._id, email: user.email, name: user.name };
        const authToken = jwt.sign(jwtPayload, process.env.TOKEN_SECRET, {
            algorithm: 'HS256',

        });


        // Send the JWT to the frontend
        res.status(200).json({ token: authToken });

    } catch (error) {
        console.error('Google token verification failed', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});
/******************************** */

router.post('/login', async (req, res, next) => {
    const { email: userEmail, password } = req.body;
    try {

        if (userEmail === '' || password === '') {
            res.status(400).json({ message: "Provide email and password." });
            return;
        }


        const foundUser = await User.findOne({ email: userEmail }); // find the user by email
        if (!foundUser) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        // Compare the provided password with the one saved in the database
        const passwordCorrect = bcrypt.compareSync(password, foundUser.password); // we pass the paintext of the password and the function will occupy of extracting the salts from the foundUser.password and apply it to the passed password  
        if (!passwordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Deconstruct the user object to omit the password
        const { _id, email } = foundUser;
        // Create an object that will be set as the token payload
        const payload = { _id, email };

        // Create and sign the token
        const authToken = jwt.sign(
            payload,
            process.env.TOKEN_SECRET,
            { algorithm: 'HS256' }
        );

        // Send the token as the response
        res.status(200).json({ authToken: authToken });


    }
    catch (error) {
        next(error); // Pass errors to the error handler middleware
    }
});
router.get("/verify", isAuthenticated, (req, res) => {
    // If JWT token is valid the payload gets decoded by the
    // isAuthenticated middleware and made available on `req.payload`
    console.log(`req.payload`, req.payload);

    // Send back the object with user data
    // previously set as the token payload
    res.status(200).json(req.payload);
});

/*GET specific info of a certain user route*/
router.get('/users/:userId', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.populate('recipies')
        const { email: userEmail, name: userName, _id, recipies: userRecipies } = user;
        const userResponse = { email: userEmail, name: userName, _id, recipies: userRecipies };
        return res.send(userResponse);
    }
    catch (error) {
        next(error);
    }

})
/* Update profile information */

router.put('/user/:userId', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.send(user);
    }
    catch (error) {
        next(error);
    }

})
router.put(
    "/update/:id",
    isAuthenticated,
    async (req, res) => {
        const {
            email,
            name,
            currentPassword,
            newPassword,

        } = req.body;
        const userId = req.payload._id;

        // Validate required fields
        if (!email || !name) {
            console.log("Missing fields");
            return res.status(400).json({ message: "Please fill the missing fields" });
        }

        try {
            // Prepare update data
            const updateData = { email, name };

            // Retrieve the user by ID
            const user = await User.findById(userId);

            // Check if user exists
            if (!user) {
                console.log("User not found");
                return res.status(404).json({ message: "User not found." });
            }

            // Handle password update if provided
            if (currentPassword && newPassword) {
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    console.log("Incorrect current password");
                    return res.status(400).json({ message: "Current password is incorrect." });
                }

                const salt = await bcrypt.genSalt(saltRounds);
                const hashedPassword = await bcrypt.hash(newPassword, salt);
                updateData.password = hashedPassword;
            } else if (currentPassword && !newPassword) {
                console.log("Empty new password");
                return res.status(400).json({ message: "Please provide the new password." });
            } else if (!currentPassword && newPassword) {
                console.log("Empty old password");
                return res.status(400).json({ message: "Please provide the old password." });
            }


            // Perform the update operation
            const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
                new: true,
            });


            // Prepare response data
            const {
                email: updatedEmail,
                _id,
                name: updatedName,
            } = updatedUser;

            const responseUser = {
                email: updatedEmail,
                name: updatedName,
                _id,
            };

            // Respond with updated user data
            res.status(200).json({ user: responseUser });
        } catch (err) {
            // Handle errors
            console.error("Error updating user:", err);
            res.status(500).json({ message: "Internal Server Error", err: err.message });
        }
    }
);

module.exports = router;