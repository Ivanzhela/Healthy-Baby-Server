const mongoose = require('mongoose');

const shopProductSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Name is required!"], minlength: [2 , 'Name must be at least 2 characters long!']},
    price: { type: Number, required: [true, "Price is required!"], min: [1 , 'Price should be a positive number!']},
    img: { type: String, required: true},
    quantity: { type: Number, required: [true, "Quantity is required!"], min: [1 , 'Quantity should be a positive number!']},
    meatPart: { type: String, required: [true, "Meat part is required!"], minLength: [2, 'Meat part must be at least 2 characters long!']},
    description: { type: String, required: [true, "Description is required!"], minLength: [10 , 'Description must be at least 10 characters long!']},
    category: { type: String, required: true, enum: ['стекове', 'дреболии', 'колбаси', 'други']}
});


const ShopProducts = mongoose.model('ShopProducts', shopProductSchema);

module.exports = ShopProducts;