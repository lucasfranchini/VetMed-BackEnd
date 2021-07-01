import pg from "pg";

const { Pool } = pg;

const connection = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
  database: process.env.NODE_ENV === "test" ? "vetmed_test" : process.env.DB_DATABASE,
});

export default connection;

/* 

CREATE TABLE users (id SERIAL, email TEXT, password TEXT);
CREATE TABLE products (id SERIAL, name TEXT,description TEXT,type text,price integer);
create TABLE stock (id SERIAL, "productId" INTEGER, qtd INTEGER);
create TABLE sales (id SERIAL, "userId" INTEGER, "orderId" INTEGER, "productId" integer,qtd INTEGER);
create TABLE orders (id SERIAL, "userId" INTEGER ,adress TEXT, "paymentType" TEXT);

*/
