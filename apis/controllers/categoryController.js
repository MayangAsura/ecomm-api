const pool = require("../config/postgres");

const createCategory = async (req, res, next) => {
  try {
    console.log('req.body', req.body)
    const {
      // image,
      name
      // description,
      // price,
      // original_price,
      // discount,
      // bg_color,
      // panel_color,
      // text_color,
      // stock,
      // category,
      // sku,
      // colors,
    } = req.body;
    // const { image } = req.body


    //   invoice_number varchar(200),
    // total_price int8,
    // total_amount int8,
    // admin_fee int8,
    // total_discount int8,
    // promo_code varchar(100),

    const results = await pool.query(
      `INSERT INTO categories (name)
                            VALUES ( $1 )
      `,
      [
        name
      ],
    );

    console.log(results);

    res
      .status(200)
      .json({
        error: false,
        message: "Successfully insert category",
        data: results[0],
      });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c1.id, c1.name, c1.parent_id, c2.name as parent_category_name FROM categories c1 INNER JOIN categories c2 on c1.parent_id = c2.id WHERE c1.deleted_at is null`,
    );

    console.log(rows);
    if(!rows){
      return res.status(400).json({error: false, message: "Successfully get categories",
        data: []})
    }

    res
      .status(200)
      .json({
        error: false,
        message: "Successfully get categories",
        data: rows,
      });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params

    const { rows } = await pool.query(
      `SELECT * FROM categories WHERE deleted_at is null AND id = $1`,
      [id],
    );

    console.log('rows', rows, id)
    res
      .status(200)
      .json({ error: false, message: "Successfully get category", data: rows[0] })
  } catch (error) {
    next(error)
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const {
      name
    } = req.body;
    // const { image } = req.body

    const results = await pool.query(
      `UPDATE categories SET (name)
                            VALUES ( $1 )
      `,
      [
        name,
      ],
    );

    console.log(results);

    res
      .status(200)
      .json({
        error: false,
        message: "Successfully update category",
        data: results.rows[0],
      });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors } = req.body
    // const { image } = req.body

    const results = await pool.query(
      `UPDATE categories SET deleted_at = null WHERE id = $1
      `,
      [id],
    );

    console.log(results);

    res
      .status(200)
      .json({ error: false, message: "Successfully delete category" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
