import connection from "./database.js";
import joi from "joi";
import errorWithStatus from "./errorWithStatus.js";

const orderStructureSchema = joi.object({
  recipient: joi.required(),
  recipientEmail: joi.required(),
  street: joi.required(),
  number: joi.required(),
  adjunct: joi.required(),
  neighbourhood: joi.required(),
  postalCode: joi.required(),
  paymentType: joi.required(),
  cart: joi.required(),
});

const orderSchema = joi.object({
  recipient: joi.string().min(1),
  recipientEmail: joi.string().email(),
  street: joi.string().min(1),
  number: joi.number().integer().min(0),
  adjunct: joi.string(),
  neighbourhood: joi.string().min(1),
  postalCode: joi.string().min(1),
  paymentType: joi.string().pattern(/(^cc$)/),
  cart: joi.array().items(
    joi.object({
      id: joi.number().integer().min(1).required(),
      qtd: joi.number().integer().min(1).required()
    })
  )
});

const authorizationSchema = joi
  .string()
  .pattern(
    /^Bearer\s[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  )
  .required();

export async function postOrder(req,res){
  try{
    //validating data from the frontend
    const {orderStructureError} = orderStructureSchema.validate(req.body);
    if (orderStructureError) throw new errorWithStatus(400);

    const {orderValidationError} = orderSchema.validate(req.body);
    if (orderValidationError) throw new errorWithStatus(422);

    const {authorizationError} = authorizationSchema.validate(req.headers.authorization);
    if (authorizationError) new errorWithStatus(401);
    //
    //checking if user has an active session
    const token = req.headers.authorization.replace('Bearer ',"");
    const dbUserId = await connection.query(`
      SELECT "userId"
      FROM sessions
      WHERE token = $1
    `,[token]);

    if (dbUserId.rows.length !== 1) throw new errorWithStatus(404);
    const userId = dbUserId.rows[0].userId;
    //
    //checking the prices for all the products bought
    const dbAllPrices = await connection.query(`
      SELECT price , id
      FROM products
    `);
    const allPrices = {};
    dbAllPrices.rows.forEach(row=>{
      allPrices[row.id] = row.price;
    });

    const productIdList = req.body.cart.map(product => product.id);
    productIdList.forEach(id=>{
      if (!allPrices.hasOwnProperty(id)) throw new errorWithStatus(404);
    })
    //
    const {recipient,
      recipientEmail,
      street,
      number,
      adjunct,
      neighbourhood,
      postalCode,
      paymentType} = req.body;

    const dbOrderId = await connection.query(`
      INSERT INTO orders
      ("userId", "paymentType", street, number, adjunct, neighbourhood, "postalCode", recipient, "recipientEmail", "createdAt")
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id
    `,[
      userId,
      paymentType,
      street,
      number,
      adjunct,
      neighbourhood,
      postalCode,
      recipient,
      recipientEmail,
    ]);
    const orderId = dbOrderId.rows[0].id;

    const sales = req.body.cart.map(({id,qtd})=>{
      return ({
        userId,
        orderId,
        productId: id,
        qtd,
        unitSoldFor: allPrices[id],
        subTotal: allPrices[id]*qtd
      });
    });

    for (let i=0; i<sales.length; i++){
      await connection.query(`
        INSERT INTO sales
        ("userId", "orderId", "productId", qtd, "unitSoldFor", "subTotal")
        VALUES
        ($1, $2, $3, $4, $5, $6)
      `,[sales[i].userId, sales[i].orderId, sales[i].productId, sales[i].qtd, sales[i].unitSoldFor, sales[i].subTotal]);
    }

    res.sendStatus(201);
  } catch(err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
};