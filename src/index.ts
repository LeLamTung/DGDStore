// src/index.ts
import express, { NextFunction, Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import "reflect-metadata";
import ApiRouter from "@routes/api.router";
import { AppDataSource } from "@databases/data-source";
import multer from "multer";
const upload = multer({ dest: 'uploads/' })
// const multer  = require('multer')
import cors from "cors";
import routerClient from "@routes/Client.routes";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001",
          "https://dgd-store-manager.vercel.app","https://dgd-store-client.vercel.app"], // Cho phép cả manager và client
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); 
app.use("/uploads", express.static("uploads"));

//config static file
app.use(express.static('public'));

// config views engine
app.set('view engine', 'ejs');
app.set('views', './src/views');
// parse cookies
app.use(cookieParser());
// app.use(session({
//   secret: 'mykey', // ma hoa ID session
//   resave: false, // khong luu lai session neu khong thay doi
//   saveUninitialized: false, // luu lai session khi chua duoc khoi tao
//   cookie: {
//     secure: false, // true nếu dùng HTTPS
//     httpOnly: true,
//     sameSite: 'lax', // hoặc 'none' nếu cần
//   },
// }))
app.use((req, res,next) => {
  res.locals.session  = req.session;
  next();
})

app.get("/", (req: Request, res: Response) => {
  res.send("Checking Server");
});
AppDataSource.initialize().then(() => {
  console.log('initialized db')
}).catch((err) => {
  console.error('Error while connecting to the database',err)
  process.exit(1)  // exit with error code 1 to indicate failure to connect to the database
});
app.use("/api/admin",ApiRouter)
app.use("/api/client", routerClient)
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
app.use((req, res) => {
  console.error("404 Not Found:", req.method, req.originalUrl);
  res.status(404).json({ message: "Not Found" });
});
