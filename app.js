require('dotenv').config();
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";


const app = express();
const port = 3000;

const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"Authen",
    password: process.env.PASSWORD,
    port:5432
});

db.connect();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'))

app.get("/",(req,res)=>{
    res.render("home.ejs")
});

app.get("/login",(req,res)=>{
    res.render("login.ejs")
});

app.get("/register",(req,res)=>{
    res.render("register.ejs")
});

app.post("/register", (req,res)=>{
    try{
        bcrypt.hash(req.body.password,10).then(async (hash)=>{
            await db.query("INSERT INTO users VALUES(DEFAULT,$1,$2)",[req.body.username,hash]);
            res.redirect("/");
        })
        
    }catch(err){
        console.error({error: err.message});
    }
});

app.post("/login", async (req,res)=>{
    let username = req.body.username
    let password = req.body.password

    try{
        const result = await db.query("SELECT email, user_pass FROM users WHERE email=$1;",[username]);
        const match = await bcrypt.compare(password,result.rows[0].user_pass);
        if(match){
            res.render("secrets.ejs");
        }else{
            console.log("Unauthorized.")
            res.sendStatus(401)
        }
    }catch(err){
        console.error({error: err.message});
    }
});

app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})
