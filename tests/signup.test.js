import { afterAll, expect, it } from "@jest/globals";
import supertest from "supertest";

import connection from "../src/database.js";
import flushDatabase from "./flushDatabase.js";
import app from "../src/app.js";

const password = "}V#bj5nnd)(=_)c%";
const email = "test@signup.com";
const name = "autoTester";

beforeEach(async () => {
  await flushDatabase(connection);
});

afterAll(() => {
  connection.end();
});

describe("POST /signup", () => {
  it("returns status 201 on successful signup", async () => {
    const user = {name, email, password};
    const result = await supertest(app).post("/signup").send(user);
    expect(result.status).toEqual(201);
  });

  it("returns status 400 when the request structure is wrong", async () => {
    const user = {};
    const result = await supertest(app).post("/signup").send(user);
    expect(result.status).toEqual(400);
  });

  it("returns status 409 when the email is already in use", async () => {
    const user = {name,email,password};
    await supertest(app).post("/signup").send(user);
    const result = await supertest(app).post("/signup").send(user);
    expect(result.status).toEqual(409);
  });

  it("returns status 422 when the values do not match the schema", async () => {
    const user = { name: 0, email: 0, password: 0 };
    const result = await supertest(app).post("/signup").send(user);
    expect(result.status).toEqual(422);
  });
});
