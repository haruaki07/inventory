const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")

require("dotenv/config")

const mariadb = require("mariadb")

/** @param {import("mariadb").Connection} conn */
const migrate = async (conn) => {
  await conn.execute(`CREATE TABLE IF NOT EXISTS products (
    \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`name\` VARCHAR(255) NOT NULL,
    \`price\` DECIMAL(10, 2) NOT NULL
  );`)

  /** @type {{id: number}[]} */
  const rows = await conn.query("SELECT id FROM products")
  if (rows?.length <= 0) {
    await conn.execute(`
      INSERT INTO products (name, price)
        VALUES
          ("Microsoft Surface Pro 9", 13940000),
          ("MacBook Pro M2", 20999000);`)
  }
}

;(async () => {
  try {
    const app = express()
    const conn = await mariadb.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    })

    await migrate(conn).catch((e) => console.error("error on migrate: ", e))

    app.use(bodyParser.urlencoded({ extended: true }))
    app.set("view engine", "ejs")

    app.locals.formatRupiah = (number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(number)
    }

    app.get("/", async (_, res, next) => {
      const rows = await conn
        .query("SELECT id, name, price FROM products")
        .catch(next)

      res.render("pages/index", {
        products: rows,
      })
    })

    app.post("/create", async (req, res, next) => {
      await conn
        .execute("INSERT INTO products (name, price) VALUES (?, ?)", [
          req.body.name,
          req.body.price,
        ])
        .catch(next)

      return res.redirect("/")
    })

    app.get("/create", (req, res) => res.render("pages/create"))

    app.get("/delete/:id", async (req, res, next) => {
      const id = req.params.id
      if (!id) return res.sendStatus(400).end()

      await conn.execute("DELETE FROM products WHERE id = ?", [id]).catch(next)

      return res.redirect("/")
    })

    app.use("/public", express.static(path.join(__dirname, "public")))

    app.use((err, _req, res, _next) => {
      console.error(err)
      return res.sendStatus(500).end()
    })

    app.listen(process.env.PORT, process.env.HOST, () => {
      console.log(
        `HTTP Server listening on ${process.env.HOST}:${process.env.PORT}`
      )
    })
  } catch (e) {
    console.error(e)
  }
})()
