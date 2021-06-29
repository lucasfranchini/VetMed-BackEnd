import express from 'express';
import cors from 'cors';
import connection from './database.js';

const app = express();
app.use(cors());
app.use(express.json());


app.get('/products', async (req,res)=>{
    try{
        const limit = req.query.limit || 100;
        const offset = req.query.offset || 0; 
        const result = await connection.query(`
        SELECT *
        FROM products
        LIMIT $1
        OFFSET $2
        `,[limit,offset])
        res.send(result.rows)
    }
    catch (e){
        console.log(e);
        res.sendStatus(500)
    }
})

app.get('/categories', async (req,res)=>{
    try{
        const result = await connection.query(`SELECT * FROM categories`)
        res.send(result.rows)
    }
    catch (e){
        console.log(e);
        res.sendStatus(500)
    }
})

export default app;