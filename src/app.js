
import connection from './database.js';
import express from "express";
import cors from "cors";

import { loginWithEmail, loginWithToken } from "./login.js";
import signup from "./signup.js";

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
        console.log(req.query.main)
        if(req.query.main){
            return res.send(
                [{id:1,name:'capsulas',img:'https://images.vexels.com/media/users/3/200358/isolated/preview/7395e5aa40eeb6e600253a52650f816c-p-iacute-lula-de-c-aacute-psula-by-vexels.png'}, 
                {id:2,name:'colirios',img:'https://image.flaticon.com/icons/png/512/647/647289.png'},
                {id:3,name:'higiene',img:'https://cdn2.iconfinder.com/data/icons/hair-salon-line-icons-1/48/17-512.png'},
                {id:4,name:'sprays',img:'https://i.dlpng.com/static/png/6403256_preview.png'},
                {id:5,name:'geis',img:'https://i.pinimg.com/originals/09/eb/1e/09eb1e65da78e084b16647a5ba374277.png'}]
            )
        }
        const result = await connection.query(`SELECT * FROM categories`)
        res.send(result.rows)
    }
    catch (e){
        console.log(e);
        res.sendStatus(500)
    }
})

app.post("/login", (req, res) => loginWithEmail(req, res));
app.post("/login/withtoken", (req, res) => loginWithToken(req, res));
app.post("/signup", (req, res) => signup(req, res));

export default app;
