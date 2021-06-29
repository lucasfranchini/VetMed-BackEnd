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

const userSessionSchema = joi.object({
  name: joi.string().min(1).required(),
  id: joi.number().integer().min(1),
  email: joi.string().email().required(),
  token: joi
    .string()
    .pattern(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
    ),
});

let token;
let id;
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
});

afterAll(() => {
  connection.end();
});

describe("POST /login", () => {
  it("returns a valid user session on successful login", async () => {
    const user = { email, password };
    const result = await supertest(app).post("/login").send(user);
    expect(result.body).toMatchSchema(userSessionSchema);
  });

  it("returns status 200 on successful login", async () => {
    const user = { email, password };
    const result = await supertest(app).post("/login").send(user);
    expect(result.status).toEqual(200);
  });

  it("returns status 400 when the request structure is wrong", async () => {
    const user = {};
    const result = await supertest(app).post("/login").send(user);
    expect(result.status).toEqual(400);
  });

  it("returns status 401 when the password is wrong", async () => {
    const user = { email, password: "wrongpassword" };
    const result = await supertest(app).post("/login").send(user);
    expect(result.status).toEqual(401);
  });

  it("returns status 404 when the email is not found", async () => {
    const user = { email: "wrongemail@login.com", password };
    const result = await supertest(app).post("/login").send(user);
    expect(result.status).toEqual(404);
  });

  it("returns status 422 when the values do not match the schema", async () => {
    const user = { email: 0, password: 0 };
    const result = await supertest(app).post("/login").send(user);
    expect(result.status).toEqual(422);
  });
});

describe("POST /login/withToken", () => {
  it("returns status 200 on successful login", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const result = await supertest(app).post("/login/withToken").set(headers);
    expect(result.status).toEqual(200);
  });

  it("returns status 401 when it receives a bad authorization header", async () => {
    const headers = { Authorization: "" };
    const result = await supertest(app).post("/login/withToken").set(headers);
    expect(result.status).toEqual(401);
  });

  it("returns status 404 when session can't be found", async () => {
    const randomToken = uuidv4();
    const headers = { Authorization: `Bearer ${randomToken}` };
    const result = await supertest(app).post("/login/withToken").set(headers);
    expect(result.status).toEqual(404);
  });
});
