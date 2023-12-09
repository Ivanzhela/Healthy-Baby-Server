const mongoose = require("mongoose");

const userShopSchema = mongoose.Schema({
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
    createdProducts: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'ShopProducts' }]
    },
    savedProducts: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'ShopProducts' }]
    },
    notifications: {
        type: Array
    }
});

const UserShop = mongoose.model('UserShop', userShopSchema);

module.exports = UserShop;