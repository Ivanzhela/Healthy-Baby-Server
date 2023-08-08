require('dotenv').config();
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDB } = require("./config/initDB.js");
const {auth} = require('./middlewares/authMiddleware')
const router = require("./routes.js");

const app = express();

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:4200','http://localhost:3000', 'https://healthy-baby-recipes.web.app', 'https://explore-b-g.web.app'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-authorization');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      return res.status(200).json({});
    }
  }

  next();
});
app.use(cors());
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(auth);
app.use(router);
initDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`Server up and running on port ${PORT}...`));