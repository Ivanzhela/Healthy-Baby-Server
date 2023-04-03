const Recipe = require('../models/Recipe');


exports.getAll = (query) => Recipe.find(query).populate('owner');

exports.getOne = (id) => Recipe.findById(id).populate('owner');

exports.create = (data) => Recipe.create(data);

exports.update = (id, body) => Recipe.updateOne({_id: id}, {$set: body}, {runValidators: true});

exports.deleteOne = (id) => Recipe.deleteOne({_id: id});
