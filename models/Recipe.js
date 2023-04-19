const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Name is required!"], minlength: [2 , 'Name must be at least 2 characters long!']},
    prepTime: { type: Number, required: [true, "Preparation Time is required!"], min: [1, 'Preparation time should be a positive number!']},
    cookTime: { type: Number, required: [true, "Cook Time is required!"], min: [1 , 'Cook time should be a positive number!']},
    servings: { type: Number, required: [true, "Servings is required!"], min: [1 , 'Servings should be a positive number!']},
    ingredients: { type: String, required: [true, "Ingredients is required!"]},
    preparation: { type: String, required: [true, "Preparation is required!"]},
    image: { type: String, required: [true, "Image is required!"], match: [ /https?:\/\/.*/m , 'Image should starts with http:// or https:// !']},
    video: { type: String, match: [ /https?:\/\/.*/m , 'Video should starts with http:// or https:// !']},
    age: { type: String, required: [true, "Age is required!"], enum: ['First Foods', '6-9 Months', '9-12 Months', '12-18 Months']},
    mealTime: { type: String, required: [true, "Meal time is required!"], enum: ['Breakfast', 'Brunch', 'Main Meals', 'Light Meals', 'Dessert']},
    comments: [],
    stars: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
    saves: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
    owner: { type: mongoose.Types.ObjectId, ref: 'User'},
});

recipeSchema.index({ name: 'text', ingredients: 'text', preparation: 'text', owner: 'text'});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
