import express from "express";
import cors from "cors";

import { loginWithEmail, loginWithToken } from "./login.js";
import signup from "./signup.js";
import categoryList from './categoryList.js';
import productList from "./productsList.js";
import searchProducts from "./searchProducts.js";
import {postOrder} from './orders.js';
import logout from './logout.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/products', (req,res)=>productList(req,res))
app.get('/products/search', (req,res)=>searchProducts(req,res))

app.get('/categories', (req,res)=>categoryList(req,res))

app.post("/login", (req, res) => loginWithEmail(req, res));
app.post("/login/withtoken", (req, res) => loginWithToken(req, res));
app.post("/signup", (req, res) => signup(req, res));

app.post("/orders", (req,res) => postOrder(req,res));
app.post("/logout", (req,res) => logout(req,res));
export default app;
