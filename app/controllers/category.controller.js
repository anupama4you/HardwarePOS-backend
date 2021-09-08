const pool = require('../models/db')
const Category = require('../models/category.model')

exports.addCategory = async (req, res) => {
    console.log(req)
    const result = await Category.addCategory(req.body);
    res.send(result);
};
  
exports.getAllCategories = async (req, res) => {
    const result = await Category.getAllCategories();
    res.send(result);
};
