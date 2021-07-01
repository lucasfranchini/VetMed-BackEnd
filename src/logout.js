import errorWithStatus from "./errorWithStatus.js";
import connection from "./database.js";
import joi from 'joi';

const authorizationSchema = joi
  .string()
  .pattern(
    /^Bearer\s[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  )
  .required();

export default async function logout(req, res) {
  try {
    const { value: authorization, error: authorizationError } =
      authorizationSchema.validate(req.headers["authorization"]);
    if (authorizationError) throw new errorWithStatus(401);
    const token = authorization.replace("Bearer ", "");
    await connection.query(
      `
      DELETE FROM sessions
      WHERE token = $1
    ;`,
      [token]
    );
    res.sendStatus(200);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}