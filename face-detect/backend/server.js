// import package
import express from "express"
import {config} from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors"
import { connectDb } from "./db/db.js";

import authRoute from "./routes/auth.routes.js"

const app = express();
config();


// middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/api/auth", authRoute)

const port = process.env.PORT || 3000

app.listen(port, ()=>{
    connectDb()
    console.log(`server is running on this ${port}`)
})