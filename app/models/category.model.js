const sql = require('../../db_config/db');

const Category = function(category) {};

Category.getAllCategories = async () => {
    const result = await new Promise((resolve, reject) => {
      sql.query('select * from category;', (err, res) => {
        if (err) {
          throw err;
        } else {
          resolve(res);
        }
      });
    });
    return result;
};

Category.addCategory = async ({
    catName
  }) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `insert into category (name) values ('${catName}');`,
      (err, res) => {
        if (err) {
          throw err;
        } else {
          console.log(res);
          res.code = 200;
          resolve(res);
        }
      },
    );
    });
    return result;
  };

module.exports = Category;