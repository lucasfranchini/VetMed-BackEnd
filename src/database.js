import pg from "pg";

const { Pool } = pg;

const connection = new Pool({
  user: "postgres",
  password: "12345",
  host: "localhost",
  port: 5432,
  database: process.env.NODE_ENV === "test" ? "vetmed_test" : "vetmed",
});

export default connection;

/* 

CREATE TABLE users (id SERIAL, email TEXT, password TEXT);
CREATE TABLE products (id SERIAL, name TEXT,description TEXT);
create TABLE stock (id SERIAL, "productId" INTEGER, qtd INTEGER);
create TABLE sales (id SERIAL, "userId" INTEGER, "orderId" INTEGER, "productId" integer,qtd INTEGER);
create TABLE orders (id SERIAL, "userId" INTEGER ,adress TEXT, "paymentType" TEXT);

*/
