const mongoose = require ("mongoose");
 
const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: [true, 'Username is required!'],
        minlength: [2 , 'Username must be at least 2 characters long!']
    },
    email:{
        type: String,
        required: [true, 'Email is required!'],
        minlength: [8 , 'Email must be at least 8 characters long!']
    },
    password:{
        type: String,
        required: [true, 'Password is required!'],
        minlength: [4 , 'Password must be at least 4 characters long!' ]
    },
    createdRecipes: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Recipe' }]
    },

    savedRecipes: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Recipe' }]
    },

    notifications: {
        type: Array
    }

});
 
const User = mongoose.model('User', userSchema);

module.exports = User;