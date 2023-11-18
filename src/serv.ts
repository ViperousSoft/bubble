import express from "express";
//import path from "path";

const app=express();
app.use(express.static(__dirname));
app.listen(3000);
