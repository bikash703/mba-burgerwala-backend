import express, { urlencoded } from "express";
import dotenv from 'dotenv';
import { connectPassport } from "./utils/provider.js";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middelware/errorMiddleware.js";
import cors from 'cors'

const app = express()

dotenv.config({
    path:"./config/config.env"
})

// using middleware

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,

    cookie:{
        secure: process.env.NODE_ENV === "development"? false: true,
        httpOnly:process.env.NODE_ENV === "development"? false: true,
        sameSite:process.env.NODE_ENV === "development"? false: "none"
    }
}))


app.use(cookieParser())
app.use(express.json())
app.use(urlencoded({extended:true}))

app.use(cors({
    credentials:true,
    origin:process.env.FRONTED_URL,
    methods:["GET","POST","PUT","DELETE"]
}))

app.use(passport.authenticate("session"))
app.use(passport.initialize())
app.use(passport.session())

// using for heroku
app.enable("trust proxy")

connectPassport()

// importing router
import userRouter from './routes/user.js';
import orderRouter from './routes/oder.js'

app.use("/api/v1",userRouter)
app.use("/api/v1",orderRouter)

app.use(errorMiddleware)

export default app;