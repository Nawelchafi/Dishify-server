//this middleware checks if the user is the owner of the recipe if yes it modifies the request object by adding the recipe object to the request object (ie.the recipie with that id stored in the database)

const Recipie = require("../models/Recipie.model");

const ownership = async (req, res, next) => {
    const { recipeId } = req.params;  // Get the recipeId from the URL params

    try {
        // Find the recipe by its ID
        const recipe = await Recipie.findById(recipeId);

        // If recipe doesn't exist, return a 404 error
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if the logged-in user is the owner of the recipe
        if (recipe.user.toString() !== req.payload._id) {
            return res.status(403).json({ message: 'You are not authorized to perform this action on this recipe' });
        }
        req.recipe = recipe;
        // If the user is the owner, pass control to the next middleware/route handler
        next();
    } catch (error) {
        next(error);  // If any error occurs, pass it to the next error handler
    }
};

module.exports = {
    ownership,

}