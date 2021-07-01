import '../src/setup.js';
import { afterAll, expect, it } from "@jest/globals";
import bcrypt from "bcrypt";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import connection from "../src/database.js";

import flushDatabase from "./flushDatabase.js";
import app from "../src/app.js";

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
  const dbId = await connection.query(
    `
    INSERT INTO users
    (name, email, password)
    VALUES
    ($1, $2, $3)
    RETURNING id
  `,
    [name, email, bcrypt.hashSync(password, 10)]
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

describe("POST /logout", () => {
  it("returns status 201 on successful logout", async () => {
    const validHeaders = { Authorization: `Bearer ${token}` };

    const result = await supertest(app).post("/logout").send({}).set(validHeaders);
    expect(result.status).toEqual(201);
  });

  it("returns status 401 for requests with invalid authorization", async () => {
    const headers = {};
    const result = await supertest(app).post("/logout").send({}).set(headers);
    expect(result.status).toEqual(401);
  });
});

