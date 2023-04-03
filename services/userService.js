const User = require('../models/User');

exports.getUser = (id) => User.findById(id).populate('createdRecipes').populate('savedRecipes');
exports.updatetUser = (id, body) => User.updateOne({_id: id}, {$set: body}, {runValidators: true});