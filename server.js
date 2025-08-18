const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const sql = require("mssql");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));

// ---------- DATABASE CONFIG ----------
// Replace with your MSSQL details
const dbconfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/submit", async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("phone", sql.VarChar, phone)
      .query("INSERT INTO BasicInfo (Name, Email, Phone) VALUES (@name, @email, @phone)");

    res.send(`
      <h2>✅ Data saved to MSSQL successfully!</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <br>
      <a href="/">Go Back</a>
    `);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).send("❌ Error saving data to database. Check server logs.");
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
