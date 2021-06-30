
import connection from './database.js';
import express from "express";
import cors from "cors";

import { loginWithEmail, loginWithToken } from "./login.js";
import signup from "./signup.js";
import categoryList from './categoryList.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/products', async (req,res)=>{
    try{
        const limit = req.query.limit || 20;
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
        console.log(result.rows)
        res.send(result.rows)
    }
    catch (e){
        console.log(e);
        res.sendStatus(500)
    }
})

app.get('/categories', (req,res)=>categoryList(req,res))

app.post("/login", (req, res) => loginWithEmail(req, res));
app.post("/login/withtoken", (req, res) => loginWithToken(req, res));
app.post("/signup", (req, res) => signup(req, res));

export default app;
