import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import joi from "joi";

import connection from "./database.js";
import errorWithStatus from "./errorWithStatus.js";

const loginBodyStructureSchema = joi.object({
  email: joi.required(),
  password: joi.required(),
});

const loginBodySchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(1).required(),
});

const authorizationSchema = joi
  .string()
  .pattern(
    /^Bearer\s[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  )
  .required();

export async function loginWithEmail(req, res) {
  try {
    const { error: structureError } = loginBodyStructureSchema.validate(
      req.body
    );
    if (structureError) throw new errorWithStatus(400);

    const { error: validationError } = loginBodySchema.validate(req.body);
    if (validationError) throw new errorWithStatus(422);

    const dbSameEmail = await connection.query(
      `
      SELECT * 
      FROM USERS 
      WHERE email = $1
    ;`,
      [req.body.email]
    );

    if (dbSameEmail.rows.length !== 1) throw new errorWithStatus(404);

    const user = dbSameEmail.rows[0];
    if (!bcrypt.compareSync(req.body.password, user.password))
      throw new errorWithStatus(401);

    const token = uuidv4();
    const id = user.id;

    await connection.query(
      `
      INSERT INTO sessions
      ("userId", token)
      VALUES ($1, $2)
    ;`,
      [id, token]
    );

    const { name, email } = user;
    res.send({ id, token, name, email });
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}

export async function loginWithToken(req, res) {
  try {
    const { error: authorizationError } = authorizationSchema.validate(
      req.headers.authorization
    );
    if (authorizationError) throw new errorWithStatus(401);

    const token = req.headers.authorization.replace("Bearer ", "");

    const dbSession = await connection.query(
      `
      SELECT *
      FROM sessions
      WHERE token = $1
    ;`,
      [token]
    );

    if (dbSession.rows.length !== 1) throw new errorWithStatus(404);

    res.sendStatus(200);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}
