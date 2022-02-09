const sql = require('../../db_config/db')
const SubCategory = require('../models/sub_category.model')

exports.getSubCategory = async (req, res) => {
    const result = await SubCategory.getSubCategory(req.params.catId);
    res.send(result);
};
  
exports.addSubCategory = async (req, res) => {
    const result = await SubCategory.addsubCategory(req.body.name, req.body.cat_id);
    res.send(result);
};
