import { afterAll, expect, it } from "@jest/globals";
import bcrypt from "bcrypt";
import supertest from "supertest";
import joi from "joi";
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
    const headers = { Authorization: `Bearer ${token}` };
    const body = {
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
    }
    const result = await supertest(app).post("/orders").send(body).set(headers);
    expect(result.status).toEqual(201);
  });

  // it("returns status 400 when the request structure is wrong", async () => {
  //   const user = {};
  //   const result = await supertest(app).post("/login").send(user);
  //   expect(result.status).toEqual(400);
  // });

  // it("returns status 401 when the password is wrong", async () => {
  //   const user = { email, password: "wrongpassword" };
  //   const result = await supertest(app).post("/login").send(user);
  //   expect(result.status).toEqual(401);
  // });

  // it("returns status 404 when the email is not found", async () => {
  //   const user = { email: "wrongemail@login.com", password };
  //   const result = await supertest(app).post("/login").send(user);
  //   expect(result.status).toEqual(404);
  // });

  // it("returns status 422 when the values do not match the schema", async () => {
  //   const user = { email: 0, password: 0 };
  //   const result = await supertest(app).post("/login").send(user);
  //   expect(result.status).toEqual(422);
  // });
});

// describe("POST /login/withToken", () => {
//   it("returns status 200 on successful login", async () => {
//     const headers = { Authorization: `Bearer ${token}` };
//     const result = await supertest(app).post("/login/withToken").set(headers);
//     expect(result.status).toEqual(200);
//   });

//   it("returns status 401 when it receives a bad authorization header", async () => {
//     const headers = { Authorization: "" };
//     const result = await supertest(app).post("/login/withToken").set(headers);
//     expect(result.status).toEqual(401);
//   });

//   it("returns status 404 when session can't be found", async () => {
//     const randomToken = uuidv4();
//     const headers = { Authorization: `Bearer ${randomToken}` };
//     const result = await supertest(app).post("/login/withToken").set(headers);
//     expect(result.status).toEqual(404);
//   });
// });
