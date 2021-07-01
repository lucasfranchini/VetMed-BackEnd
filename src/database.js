import pg from "pg";

const { Pool } = pg;

const connection = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
  database: process.env.NODE_ENV === "test" ? "vetmed_test" : process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
}
});

export default connection;
