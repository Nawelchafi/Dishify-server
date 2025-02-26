const express = require("express");
const router = express.Router();
const Recipe = require('../models/Recipie.model');
const { isAuthenticated } = require('../Middlewares/jwt.middleware');
const { ownership } = require("../Middlewares/ownership.middleware");

// Get all recipes

router.get('/recipies', async (req, res, next) => {
    try {
        const recipes = await Recipe.find().populate('user', 'name email');
        res.json(recipes);
    } catch (error) {
        next(error);
    }
});


// Get a single recipe by ID
router.get('/recipies/:recipeId', async (req, res, next) => {
    const recipeId = req.params.recipeId;
    try {
        const recipe = await Recipe.findById(recipeId).populate('user', 'name email');
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        next(error);
    }
});

router.post('/new-recipie', isAuthenticated, async (req, res, next) => {
    const { title, ingredients, instructions, cookingTime, servings, category, origin } = req.body;
    try {
        const recipe = new Recipe({
            title,
            ingredients,
            instructions,
            cookingTime,
            servings,
            category,
            origin,
            user: req.payload._id
        });
        const createdRecipe = await recipe.save();
        res.status(201).json({ recipe: createdRecipe });
    } catch (error) {
        next(error);
    }
});

router.put('/recipies/:recipeId', isAuthenticated, ownership, async (req, res, next) => {

    const { title, description, ingredients, instructions, image, cookingTime, servings, category } = req.body;
    const recipe = req.recipe; // This comes from the ownership middleware

    try {

        // Update the provided fields 
        recipe.title = title || recipe.title;
        recipe.description = description || recipe.description;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.instructions = instructions || recipe.instructions;
        recipe.image = image || recipe.image;
        recipe.prepTime = prepTime || recipe.prepTime;
        recipe.cookingTime = cookingTime || recipe.cookingTime;
        recipe.servings = servings || recipe.servings;
        recipe.category = category || recipe.category;
        recipe.origin = origin || recipe.origin;

        // Save the updated recipe
        const updatedRecipe = await recipe.save();

        // Send the updated recipe in the response
        res.status(200).json({ recipe: updatedRecipe });


    }
    catch (error) {
        next(error);
    }
});
router.delete('/delete/:recipeId', isAuthenticated, ownership, async (req, res, next) => {

    try {
        const recipe = req.recipe;
        console.log(recipe);

        await recipe.deleteOne();
        res.json({ message: 'Recipe deleted successfully' });
    }

    catch (error) {

        next(error);
    }
})
module.exports = router;  