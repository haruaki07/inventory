const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv/config");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("app.db");

const app = express();

// callback hell :D
while (true) {
  try {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS products (
        name VARCHAR, 
        price DECIMAL(10, 2)
      )`,
      (_, err) => {
        if (err) throw err;

        db.all("SELECT rowid FROM products", (err, rows) => {
          if (err) throw err;

          if (rows.length <= 0) {
            db.exec(`
              INSERT INTO products (name, price)
                VALUES
                  ("Microsoft Surface Pro 9", 13940000),
                  ("MacBook Pro M2", 20999000);
            `);
          }
        });
      }
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  break;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.locals.formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
};

app.get("/", (_, res) => {
  db.all("SELECT rowid as id, name, price FROM products", (err, rows) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500).end();
    }

    res.render("pages/index", {
      products: rows,
    });
  });
});

app.post("/create", (req, res) => {
  db.run(
    `INSERT INTO products (name, price) VALUES (?, ?)`,
    [req.body.name, req.body.price],
    (err) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500).end();
      }

      return res.redirect("/");
    }
  );
});

app.get("/create", (req, res) => res.render("pages/create"));

app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  if (!id) return res.sendStatus(400).end();

  db.run("DELETE FROM products WHERE rowid = ?", id, (_, err) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500).end();
    }

    return res.redirect("/");
  });
});

app.use("/public", express.static(path.join(__dirname, "public")));

app.listen(process.env.PORT, process.env.HOST, () => {
  console.log(
    `HTTP Server listening on ${process.env.HOST}:${process.env.PORT}`
  );
});
