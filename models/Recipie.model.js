const { Schema, model } = require("mongoose");
const recipieSchema = new Schema({

    title: {
        type: [String],
        required: [true, 'Title is required.'],
        trim: true // Removes whitespace from both ends of the string
    },
    ingredients: {
        type: [String], // Array of strings to hold ingredients
        required: [true, 'Ingredients are required.']
    },
    instructions: {
        type: String,
        required: [true, 'add a short description of the recipe.'],
    },
    cookingTime: {
        type: Number, // String to hold cooking time
        required: [true, 'cooking time is required .'],
    },
    servings: {
        type: String,

    },
    category: {
        type: String,
        enum: ['Appetizer', 'Main Course', 'Dessert', 'Snack', 'Drink', 'Other'],

        required: true,
    },
    origin: {
        type: String,
        enum: ['Italian', 'Mexican', 'Indian', 'Asian', 'American', "kid-friendly", 'Other'],
        required: true,
    },
    imageURL: {
        type: String,
        required: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the creation date
    },
    updatedAt: {
        type: Date,
        default: Date.now // Automatically set the update date
    }

},
    {
        timestamps: true // Automatically create createdAt and updatedAt fields
    }
);
const Recipie = model("Recipie", recipieSchema);
module.exports = Recipie