const { json } = require("express");
const express = require("express");
const app = express();

// public - folder with static files (html, css, js)
app.use(express.static("public"));

// pug template
app.set("view engine", "pug");

// connect to db
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "5a3820b2d",
  database: "my_shop",
});

app.listen(3000, () => {
  console.log("Server is working on 3000 PORT");
});

app.get("/", (req, res) => {
  connection.query("SELECT * FROM goods", (error, result) => {
    if (error) throw error;

    const goods = {};
    for (let i = 0; i < result.length; i++) {
      const product = result[i];
      goods[product.id] = product;
    }

    res.render("main.pug", {
      foo: 4,
      bar: 7,
      goods,
    });
  });
});
