const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const CryptoModel = require("./crypto.model");

const mainRouter = require("./router");

app.use(cors());
app.use(bodyParser.json());
app.use('/', mainRouter);

mongoose
.connect(
    'mongodb+srv://' + process.env.MONGO_USER + ':' + 
    process.env.MONGO_PASS + '@cluster0.2vwsa.mongodb.net/' +
    process.env.MONGO_DB_NAME + '?retryWrites=true&w=majority'
)
.then(() => {
    console.log("Database connected");
})
.catch(console.error);
app.listen(process.env.PORT, () => console.log("Server started"));