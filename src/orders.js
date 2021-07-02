import connection from "./database.js";
import joi from "joi";
import errorWithStatus from "./errorWithStatus.js";
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  adjunct: joi.string().allow(""),
  neighbourhood: joi.string().min(1),
  postalCode: joi.string().min(1),
  paymentType: joi.string().pattern(/(^cc$)/),
  cart: joi.array().min(1).items(
    joi.object({
      id: joi.number().integer().min(1).required(),
      qtd: joi.number().integer().min(1).required(),
    })
  )
});

const authorizationSchema = joi
  .string()
  .pattern(
    /^Bearer\s[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  )
  .required();

export async function postOrder(req, res) {
  try {
    //validating data from the frontend
    const { error: orderStructureError } = orderStructureSchema.validate(req.body);
    if (orderStructureError) throw new errorWithStatus(400);

    const { error: orderValidationError } = orderSchema.validate(req.body);
    if (orderValidationError) throw new errorWithStatus(422);

    const { error: authorizationError } = authorizationSchema.validate(
      req.headers?.authorization
    );
    if (authorizationError) throw new errorWithStatus(401);
    //
    //checking if user has an active session
    const token = req.headers.authorization.replace("Bearer ", "");
    const dbUserId = await connection.query(
      `
      SELECT "userId"
      FROM sessions
      WHERE token = $1
    `,
      [token]
    );

    if (dbUserId.rows.length !== 1) throw new errorWithStatus(404);
    const userId = dbUserId.rows[0].userId;
    //
    //checking the prices for all the products bought
    const dbAllPrices = await connection.query(`
      SELECT price , id
      FROM products
    `);
    const allPrices = {};
    dbAllPrices.rows.forEach((row) => {
      allPrices[row.id] = row.price;
    });

    const productIdList = req.body.cart.map((product) => product.id);
    productIdList.forEach((id) => {
      if (!allPrices.hasOwnProperty(id)) throw new errorWithStatus(404);
    });
    //
    const {
      recipient,
      recipientEmail,
      street,
      number,
      adjunct,
      neighbourhood,
      postalCode,
      paymentType,
    } = req.body;

    const dbOrderId = await connection.query(
      `
      INSERT INTO orders
      ("userId", "paymentType", street, number, adjunct, neighbourhood, "postalCode", recipient, "recipientEmail", "createdAt")
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id
    `,
      [
        userId,
        paymentType,
        street,
        number,
        adjunct,
        neighbourhood,
        postalCode,
        recipient,
        recipientEmail,
      ]
    );
    const orderId = dbOrderId.rows[0].id;

    const sales = req.body.cart.map(({ id, qtd }) => {
      return {
        userId,
        orderId,
        productId: id,
        qtd,
        unitSoldFor: allPrices[id],
        subTotal: allPrices[id] * qtd,
      };
    });

    for (let i = 0; i < sales.length; i++) {
      await connection.query(
        `
        INSERT INTO sales
        ("userId", "orderId", "productId", qtd, "unitSoldFor", "subTotal")
        VALUES
        ($1, $2, $3, $4, $5, $6)
      `,
        [
          sales[i].userId,
          sales[i].orderId,
          sales[i].productId,
          sales[i].qtd,
          sales[i].unitSoldFor,
          sales[i].subTotal,
        ]
      );
    };

    const dbProductNames = await connection.query(`
      SELECT *
      FROM products
    `);

    const productNames = {}
    dbProductNames.rows.forEach(row=>{
      productNames[row.id] = row.name;
    });

    let text = `
      Obrigado por comprar com a vetmed!\n
      \n
      o pedido de:\n
    `;
    sales.forEach(sale=>{
      text += `${sale.qtd}x ${productNames[sale.productId]} R$${(sale.subTotal/100).toFixed(2)} \n`
    });

    const total = (sales.reduce((acc,sale)=>acc+=sale.subTotal,0)/100).toFixed(2);
    text+=`
      Com um total de: R$${total}\n
      Será entregue para:\n
      ${recipient}\n
      Rua ${street}\n
      número ${number}\n
      complemento ${adjunct}\n
      cep ${postalCode}\n
    `;

    let html = `
      <p>Obrigado por comprar com a vetmed!</p>
      <br/>
      <p>o pedido de:</p>
    `;
    sales.forEach(sale=>{
      html += `<p>${sale.qtd}x ${productNames[sale.productId]} R$${(sale.subTotal/100).toFixed(2)} </p>`
    });

    html+=`
      <p>Com um total de: R$${total}</p>
      <p>Será entregue para:</p>
      <p>${recipient}</p>
      <p>Rua ${street}</p>
      <p>número ${number}</p>
      <p>complemento ${adjunct}</p>
      <p>cep ${postalCode}</p>
    `;

    const msg = {
      to: recipientEmail,
      from: "vitor.registros@lourencos.net",
      subject: 'Sua compra foi processada!',
      text,
      html,
    };

    await (async () => {
      try {
        await sgMail.send(msg);
      } catch (error) {
        console.error(error);
    
        if (error.response) {
          console.error(error.response.body)
        }
      }
    })();

    res.sendStatus(201);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}
