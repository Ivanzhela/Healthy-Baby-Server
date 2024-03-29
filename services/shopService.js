const ShopProducts = require('../models/Shop');
const ShopUsers = require('../models/UserShop');

exports.getAll = (query) => ShopProducts.find(query);

exports.getOne = (id) => ShopProducts.findById(id);

exports.create = (data) => ShopProducts.create(data);

exports.update = (id, body) => ShopProducts.updateOne({_id: id}, {$set: body}, {runValidators: true});

exports.deleteOne = (id) => ShopProducts.deleteOne({_id: id});

exports.getUser = (id) => ShopUsers.findById(id);