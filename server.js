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
const dbConfig = {
  user: "Sai_123456",        // e.g. sa
  password: "123@Thota",
  server: "192.168.29.102",    // e.g. myserver.database.windows.net
  database: "TestDB",
  options: {
    encrypt: true,              // Use true for Azure/Render MSSQL
    trustServerCertificate: true
  }
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
