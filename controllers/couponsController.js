const {pool} = require("../config/postgres");

const createCoupon = async (req, res, next) => {
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
      // Coupon,
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
      `INSERT INTO coupons (name)
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
        message: "Successfully insert Coupon",
        data: results[0],
      });
  } catch (error) {
    next(error);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c1.id, c1.name, c1.parent_id, c2.name as parent_Coupon_name FROM coupons c1 INNER JOIN coupons c2 on c1.parent_id = c2.id WHERE c1.deleted_at is null`,
    );

    console.log(rows);
    if(!rows){
      return res.status(400).json({error: false, message: "Successfully get coupons",
        data: []})
    }

    res
      .status(200)
      .json({
        error: false,
        message: "Successfully get coupons",
        data: rows,
      });
  } catch (error) {
    next(error);
  }
};

const getCouponById = async (req, res, next) => {
  try {
    const { id } = req.params

    const { rows } = await pool.query(
      `SELECT * FROM coupons WHERE deleted_at is null AND id = $1`,
      [id],
    );

    console.log('rows', rows, id)
    res
      .status(200)
      .json({ error: false, message: "Successfully get Coupon", data: rows[0] })
  } catch (error) {
    next(error)
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const {
      name
    } = req.body;
    // const { image } = req.body

    const results = await pool.query(
      `UPDATE coupons SET (name)
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
        message: "Successfully update Coupon",
        data: results.rows[0],
      });
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    // const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, Coupon, sku, colors } = req.body
    // const { image } = req.body

    const results = await pool.query(
      `UPDATE coupons SET deleted_at = null WHERE id = $1
      `,
      [id],
    );

    console.log(results);

    res
      .status(200)
      .json({ error: false, message: "Successfully delete Coupon" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCoupon, getCoupons, getCouponById, updateCoupon, deleteCoupon };
