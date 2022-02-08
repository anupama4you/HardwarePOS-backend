const sql = require('../../db_config/db');

const SubCategory = function(category) {};

SubCategory.getSubCategory = async (catId) => {
    console.log(catId)
    const result = await new Promise((resolve, reject) => {
      sql.query(`select * from subcategory where category_id = '${catId}';`, 
      (err, res) => {
          if (err) {
          throw err;
          } else {
          resolve(res);
          }
      });
    });
    return result;
};

SubCategory.addsubCategory = async (
    name, cat_id
  ) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `insert into subcategory (name, category_id) values ('${name}', ${cat_id});`,
      (err, res) => {
        if (err) {
          throw err;
        } else {
          console.log(res);
          // eslint-disable-next-line
          res.code = 200;
          resolve(res);
        }
      },
    );
    });
    return result;
  };

module.exports = SubCategory;
