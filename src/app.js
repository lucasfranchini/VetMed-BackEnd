
import connection from './database.js';
import express from "express";
import cors from "cors";

import { loginWithEmail, loginWithToken } from "./login.js";
import signup from "./signup.js";
import categyList from './categoryList.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/categories', (req,res)=>categyList(req,res))

app.post("/login", (req, res) => loginWithEmail(req, res));
app.post("/login/withtoken", (req, res) => loginWithToken(req, res));
app.post("/signup", (req, res) => signup(req, res));

export default app;
