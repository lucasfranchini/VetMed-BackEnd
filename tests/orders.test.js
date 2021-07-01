import '../src/setup.js';
import { afterAll, expect, it } from "@jest/globals";
import bcrypt from "bcrypt";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import toMatchSchema from "./toMatchSchema.js";
import connection from "../src/database.js";
import flushDatabase from "./flushDatabase.js";
import app from "../src/app.js";

expect.extend({ toMatchSchema });

let token;
let id;
let productId;
const password = "}V#bj5nnd)(=_)c%";
const email = "test@login.com";
const name = "autoTester";

beforeAll(async () => {
  await flushDatabase(connection);

  id = undefined;
  token = undefined;
  productId = undefined;
  //
  //create test account using test@login.com as email
  await connection.query(
    `
    INSERT INTO users
    (name, email, password)
    VALUES
    ($1, $2, $3)
  `,
    [name, email, bcrypt.hashSync(password, 10)]
  );
  //
  //get the id for the newly created test account
  const dbId = await connection.query(
    `
    SELECT users.id
    FROM users
    WHERE email = $1 
  `,
    [email]
  );
  id = dbId.rows[0].id;
  //
  //create a session for the newly created test account
  token = uuidv4();
  await connection.query(
    `
    INSERT INTO sessions
    ("userId", token)
    VALUES
    ($1, $2)
  `,
    [id, token]
  );

  //insert a new test category into the database
  const dbCategoryId = await connection.query(`
    INSERT into categories
    (name)
    VALUES
    ('testCategory')
    RETURNING id
  `);
  const categoryId = dbCategoryId.rows[0].id;

  //insert a new test product into the database
  const dbProductId = await connection.query(`
    INSERT INTO products
    (name, description, price, img, "categorieId")
    VALUES
    ('testProduct', 'this is a test', 33, 'https://hiperideal.vteximg.com.br/arquivos/ids/171306-1000-1000/12696.jpg?v=636626179776100000', $1)
    RETURNING id 
  `,[categoryId]);

  productId = dbProductId.rows[0].id;
});

afterAll(() => {
  connection.end();
});

describe("POST /orders", () => {

  it("returns status 201 on successful new order", async () => {
    const validBody = {
      recipient: "test",
      recipientEmail: "test@gmail.com",
      street: "test street",
      number: 42,
      adjunct: "",
      neighbourhood: "test neighbourhood",
      postalCode: "20540-222",
      paymentType: "cc",
      cart: [{
          id: productId,
          qtd: 2,
        }]
    };
    
    const validHeaders = { Authorization: `Bearer ${token}` };

    const result = await supertest(app).post("/orders").send(validBody).set(validHeaders);
    expect(result.status).toEqual(201);
  });

  it("returns status 400 for requests with a bad structure", async () => {
    const validBody = {
      recipient: "test",
      recipientEmail: "test@gmail.com",
      street: "test street",
      number: 42,
      adjunct: "",
      neighbourhood: "test neighbourhood",
      postalCode: "20540-222",
      paymentType: "cc",
      cart: [{
          id: productId,
          qtd: 2,
        }]
    };
    
    const validHeaders = { Authorization: `Bearer ${token}` };

    const body = JSON.parse(JSON.stringify(validBody));
    delete body.cart;
    const result = await supertest(app).post("/orders").send(body).set(validHeaders);
    expect(result.status).toEqual(400);
  });

  it("returns status 401 for requests with invalid authorization", async () => {
    const validBody = {
      recipient: "test",
      recipientEmail: "test@gmail.com",
      street: "test street",
      number: 42,
      adjunct: "",
      neighbourhood: "test neighbourhood",
      postalCode: "20540-222",
      paymentType: "cc",
      cart: [{
          id: productId,
          qtd: 2,
        }]
    };
    
    const validHeaders = { Authorization: `Bearer ${token}` };

    const headers = {};
    const result = await supertest(app).post("/orders").send(validBody).set(headers);
    expect(result.status).toEqual(401);
  });

  it("returns status 404 for requests with token not found", async () => {
    const validBody = {
      recipient: "test",
      recipientEmail: "test@gmail.com",
      street: "test street",
      number: 42,
      adjunct: "",
      neighbourhood: "test neighbourhood",
      postalCode: "20540-222",
      paymentType: "cc",
      cart: [{
          id: productId,
          qtd: 2,
        }]
    };
    
    const validHeaders = { Authorization: `Bearer ${token}` };

    const randomtoken = uuidv4();
    const headers = { Authorization: `Bearer ${randomtoken}` };
    const result = await supertest(app).post("/orders").send(validBody).set(headers);
    expect(result.status).toEqual(404);
  });

  it("returns status 422 for requests with invalid body data", async () => {
    const validBody = {
      recipient: "test",
      recipientEmail: "test@gmail.com",
      street: "test street",
      number: 42,
      adjunct: "",
      neighbourhood: "test neighbourhood",
      postalCode: "20540-222",
      paymentType: "cc",
      cart: [{
          id: productId,
          qtd: 2,
        }]
    };
    
    const validHeaders = { Authorization: `Bearer ${token}` };
    
    const body = JSON.parse(JSON.stringify(validBody));
    body.cart = [];
    const result = await supertest(app).post("/orders").send(body).set(validHeaders);
    expect(result.status).toEqual(422);
  });

});
