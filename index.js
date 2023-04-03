require('dotenv').config();
const express = require("express");
const cors = require('cors');
const { initDB } = require("./config/initDB.js");
const {auth} = require('./middlewares/authMiddleware')
const router = require("./routes.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(auth);
app.use(router);
initDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`Server up and running on port ${PORT}...`));