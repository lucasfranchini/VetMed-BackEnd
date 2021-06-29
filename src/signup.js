import bcrypt from "bcrypt";
import joi from "joi";
import connection from "./database.js";
import errorWithStatus from "./errorWithStatus.js";

const newUserStructureSchema = joi.object({
  name: joi.required(),
  email: joi.required(),
  password: joi.required(),
});

const newUserSchema = joi.object({
  name: joi.string().min(1).required(),
  email: joi.string().email().required(),
  password: joi.string().min(1).required(),
});

export default async function signup(req, res) {
  try {
    const { error: structureError } = newUserStructureSchema.validate(req.body);
    if (structureError) throw new errorWithStatus(400);

    const { error: validationError } = newUserSchema.validate(req.body);
    if (validationError) throw new errorWithStatus(422);

    const dbSameEmail = await connection.query(
      `
      SELECT * 
      FROM USERS 
      WHERE email = $1
    ;`,
      [req.body.email]
    );

    if (dbSameEmail.rows.length > 0) throw new errorWithStatus(409);

    await connection.query(
      `
      INSERT INTO users
      (name, email, password)
      VALUES ($1, $2, $3)
    ;`,
      [req.body.name, req.body.email, bcrypt.hashSync(req.body.password, 10)]
    );

    res.sendStatus(201);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}
