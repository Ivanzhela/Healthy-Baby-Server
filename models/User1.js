const mongoose = require("mongoose");

const userSchema1 = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required!'],
        minlength: [2, 'Username must be at least 2 characters long!']
    },
    email: {
        type: String,
        required: [true, 'Email is required!'],
        minlength: [8, 'Email must be at least 8 characters long!']
    },
    password: {
        type: String,
        required: [true, 'Password is required!'],
        minlength: [4, 'Password must be at least 4 characters long!']
    },
    createdTrips: {
        type: Array
    },
    savedDestinations: {
        type: Array
    }
});

const User = mongoose.model('User1', userSchema1);

module.exports = User;