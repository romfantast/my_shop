const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const cookie = require("cookie");
const { reindex } = require("./helpers/reindex.js");

// public - folder with static files (html, css, js)
app.use(express.static("public"));

// pug template
app.set("view engine", "pug");

// connect to db
const mysql = require("mysql2");

//
app.use(express.json());
app.use(express.urlencoded());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "5a3820b2d",
  database: "my_shop",
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.listen(3000, () => {
  console.log("Server is working on 3000 PORT");
});

app.get("/", (req, res) => {
  let cat = new Promise(function (resolve, reject) {
    connection.query(
      "select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3",
      function (error, result, field) {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
  let catDescription = new Promise(function (resolve, reject) {
    connection.query("SELECT * FROM category", function (error, result, field) {
      if (error) return reject(error);
      resolve(result);
    });
  });
  Promise.all([cat, catDescription]).then(function (value) {
    res.render("index", {
      goods: JSON.parse(JSON.stringify(value[0])),
      cat: JSON.parse(JSON.stringify(value[1])),
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

app.get("/order", function (req, res) {
  res.render("order");
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
  if (!req.body.key.length) return res.send("0");
  connection.query(
    `SELECT id, name, cost FROM goods WHERE id IN (${req.body.key.join(",")})`,
    function (error, result, fields) {
      if (error) throw error;
      res.json(reindex(result));
    }
  );
});

app.post("/finish-order", function (req, res) {
  if (!Object.keys(req.body.key).length) {
    res.send("0");
  } else {
    const key = Object.keys(req.body.key);
    connection.query(
      `SELECT id, name, cost FROM goods WHERE id IN (${key.join(",")})`,
      function (error, result, fields) {
        if (error) throw error;
        sendMailFunc(req.body, result);
        saveOrder(req.body, result);
        res.send("1");
      }
    );
  }
});

async function sendMailFunc(body, res) {
  let mail = "<h2>Order in Lite Shop</h2>";
  let total = 0;

  for (let i = 0; i < res.length; i++) {
    mail += `<p>${res[i].name} - ${body.key[res[i].id]} - ${
      res[i].cost * body.key[res[i].id]
    } uah</p>`;
    total += res[i].cost * body.key[res[i].id];
  }
  mail += "<hr/>";
  mail += `Total: ${total} uah`;
  mail += `<hr> Phone: ${body.phone}`;
  mail += `<hr> Username: ${body.userName}`;
  mail += `<hr> Email: ${body.email}`;
  mail += `<hr> Address: ${body.address}`;

  nodemailerFunc(body, mail);
}

async function nodemailerFunc(body, result) {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  let mailOption = {
    from: "<romfantast@gmail.com>",
    to: "romfantast@gmail.com," + body.email,
    subject: "Lite shop order",
    text: "Hello World",
    html: result,
  };

  let info = await transporter.sendMail(mailOption);
  console.log("Message send: " + info.messageId);
  console.log("Preview send: " + nodemailer.getTestMessageUrl(info));
  return true;
}

function saveOrder(data, result) {
  //data- info about user
  //result - info about product

  let sql;
  sql =
    "INSERT INTO user_info (user_name, user_phone, user_email,address) VALUES ('" +
    data.userName +
    "', '" +
    data.phone +
    "', '" +
    data.email +
    "','" +
    data.address +
    "')";
  connection.query(sql, function (error, resultQuery) {
    if (error) throw error;
    console.log("1 user info saved");
    const userId = resultQuery.insertId;
    date = new Date() / 1000;
    console.log(date);
    for (let i = 0; i < result.length; i++) {
      sql =
        "INSERT INTO shop_order(date, user_id, goods_id, goods_cost, goods_amount, total) VALUES (" +
        date +
        "," +
        userId +
        "," +
        result[i]["id"] +
        ", " +
        result[i]["cost"] +
        "," +
        data.key[result[i]["id"]] +
        ", " +
        data.key[result[i]["id"]] * result[i]["cost"] +
        ")";
      connection.query(sql, function (error, resultQuery) {
        if (error) throw error;
        console.log("1 product saved");
      });
    }
  });
}

app.get("/admin", function (req, res) {
  res.render("admin", {});
});

app.post("/login", function (req, res) {
  console.log(req.body);
  connection.query(
    `SELECT * FROM user WHERE login='${req.body.login}' and password='${req.body.password}'`,
    function (error, result) {
      if (error) throw error;
      //   if (!result.length) {
      //     res.writeHead(404);
      //     res.end("user not found");
      //     return;
      //   }
      //   res.cookie("hash", "cookie_hash");
      //   res.json(result[0]);
    }
  );
});

app.get("/admin-order", function (req, res) {
  connection.query(
    `SELECT
	shop_order.user_id as id ,
	shop_order.user_id as user_id,
    shop_order.goods_id as goods_id,
    shop_order.goods_cost as goods_cost,
    shop_order.goods_amount as goods_amount,
    shop_order.total as total,
    from_unixtime(date, '%Y-%m-%d %H:%i:%s') as human_date,
    user_info.user_name as user,
    user_info.user_phone as phone,
    user_info.address as address
FROM
	my_shop.shop_order
LEFT JOIN
	user_info
ON shop_order.user_id = user_info.id ORDER BY id DESC`,
    function (error, result, fields) {
      if (error) throw error;

      res.render("admin-order", {
        order: JSON.parse(JSON.stringify(result)),
      });
    }
  );
});

app.get("/login", function (req, res) {
  res.render("login", {});
});
