const pool = require('../../db_config/db')
const Category = require('../models/category.model')

const addCategory = async (req, res) => {
    const result = await Category.addCategory(req.body);
    res.send(result);
};
  
const getAllCategories = async (req, res) => {
    const result = await Category.getAllCategories();
    res.send(result);
};

module.exports = {addCategory,getAllCategories};


