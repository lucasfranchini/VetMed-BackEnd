import connection from "./database.js"

export default async function searchProducts(req,res){
    try{
        const product = req.query.product
        console.log(product)
        if(!product) return res.sendStatus(400)
        const result = await connection.query(`
        SELECT *
        FROM products
        WHERE name ILIKE $1
        `,[product+'%'])
        res.send(result.rows)
    }
    catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}