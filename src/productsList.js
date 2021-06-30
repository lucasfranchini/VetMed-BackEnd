import connection from "./database.js";

export default async function productList(req,res){
    try{
        const limit = req.query.limit || 100;
        const offset = req.query.offset || 0; 
        const id = req.query.id || 0;
        const comparator = id ? '=': '>'
        const result = await connection.query(`
        SELECT products.*,categories.name AS "categoryName"
        FROM products
        JOIN categories 
        ON categories.id=products."categorieId"
        WHERE categories.id ${comparator} $3
        ORDER BY id
        LIMIT $1
        OFFSET $2
        `,[limit,offset,id])
        console.log(result.rows,comparator,id,offset,limit)
        if(result.rowCount===0){
            const categoryExists = await connection.query(`SELECT * FROM categories WHERE id = $1`,[id])
            const test = await connection.query(`SELECT * FROM categories `)
            console.log(test.rows)
            console.log(productExist.rows)
            if(categoryExists.rowCount>0){
                return res.send({name:categoryExists.rows[0].categoryName, products: []})
            }
            else{
                return res.sendStatus(400)
            }
        }
        
        res.send({name:result.rows[0].categoryName, products: result.rows})
    }
    catch (e){
        console.log(e);
        res.sendStatus(500)
    }

}