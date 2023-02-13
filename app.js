const { json } = require("express");
const express = require("express");
const app = express();
const { reindex } = require("./helpers/reindex.js");

// public - folder with static files (html, css, js)
app.use(express.static("public"));

// pug template
app.set("view engine", "pug");

// connect to db
const mysql = require("mysql2");

//
app.use(express.json());

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

    // const goods = {};
    // for (let i = 0; i < result.length; i++) {
    //   const product = result[i];
    //   goods[product.id] = product;
    // }

    res.render("main.pug", {
      foo: 4,
      bar: 7,
      goods: reindex(result),
    });
  });
});

app.get("/cat", function (req, res) {
  const catId = req.query.id;

  let cat = new Promise(function (resolve, reject) {
    connection.query(
      "SELECT * FROM category WHERE id=" + catId,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      }
    );
  });
  let goods = new Promise(function (resolve, reject) {
    connection.query(
      "SELECT * FROM goods WHERE category=" + catId,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      }
    );
  });

  Promise.all([cat, goods]).then(function (value) {
    res.render("cat", {
      cat: JSON.parse(JSON.stringify(value[0])),
      goods: JSON.parse(JSON.stringify(value[1])),
    });
  });
});

app.get("/goods", function (req, res) {
  connection.query(
    "SELECT * FROM goods WHERE id=" + req.query.id,
    function (error, result, fields) {
      if (error) throw error;
      res.render("goods", {
        goods: JSON.parse(JSON.stringify(result)),
      });
    }
  );
});

app.post("/get-category-list", function (req, res) {
  connection.query(
    "SELECT id, category FROM category",
    function (error, result, fields) {
      if (error) throw error;
      res.json(result);
    }
  );
});

app.post("/get-goods-info", function (req, res) {
  console.log(req.body.key);

  connection.query(
    `SELECT id, name, cost FROM goods WHERE id IN (${req.body.key.join(",")})`,
    function (error, result, fields) {
      if (error) throw error;
      res.json(reindex(result));
    }
  );
});
