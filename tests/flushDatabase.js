export default async function flushDatabase(connection) {
  await connection.query(`DELETE FROM orders`);
  await connection.query(`DELETE FROM products`);
  await connection.query(`DELETE FROM sales`);
  await connection.query(`DELETE FROM sessions`);
  await connection.query(`DELETE FROM stock`);
  await connection.query(`DELETE FROM users`);
}
