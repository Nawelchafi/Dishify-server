import { Schema, model } from "mongoose";
const recipieSchema = new Schema({

    title: {
        type: String,
        required: [true, 'Title is required.'],
        trim: true // Removes whitespace from both ends of the string
    },
    ingredients: {
        type: [String], // Array of strings to hold ingredients
        required: [true, 'Ingredients are required.']
    },
    instructions: {
        type: String,
    },
    cookingTime: {
        type: Number, // Time in minutes
        required: [true, 'Cooking time is required.']
    },
    servings: {
        type: Number,
        required: [true, 'Number of servings is required.']
    },
    imageURL: {
        type: String,
        required: false
    },
    author: {
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