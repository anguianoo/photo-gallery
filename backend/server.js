const express = require("express")
const mysql = require("mysql2")
const multer = require("multer")
const path = require("path")
const cors = require("cors")
require("dotenv").config() // Load environment variables

const app = express()
const PORT = 3000

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

db.connect(err => {
  if (err) {
    console.error("MySQL connection error:", err)
    process.exit(1)
  } else {
    console.log("Connected to MySQL...")
  }
})

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Serve Static Files from the Public Folder
app.use(express.static(path.join(__dirname, "../public")))

// Routes
app.get("/api/photos", (req, res) => {
  db.query("SELECT * FROM photos", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch photos" })
    res.json(results)
  })
})

app.post(
  "/api/photos",
  multer({
    storage: multer.diskStorage({
      destination: "uploads/",
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
      }
    })
  }).single("photo"),
  (req, res) => {
    const { description } = req.body
    const filename = req.file.filename

    db.query(
      "INSERT INTO photos (filename, description) VALUES (?, ?)",
      [filename, description],
      err => {
        if (err)
          return res.status(500).json({ error: "Failed to upload photo" })
        res.json({ message: "Photo uploaded successfully!" })
      }
    )
  }
)

app.delete("/api/photos/:id", (req, res) => {
  const { id } = req.params

  db.query("DELETE FROM photos WHERE id = ?", [id], err => {
    if (err) return res.status(500).json({ error: "Failed to delete photo" })
    res.json({ message: "Photo deleted successfully!" })
  })
})

// Update Photo Description
app.put("/api/photos/:id", (req, res) => {
  const { id } = req.params
  const { description } = req.body

  db.query(
    "UPDATE photos SET description = ? WHERE id = ?",
    [description, id],
    err => {
      if (err)
        return res.status(500).json({ error: "Failed to update description" })
      res.json({ message: "Photo description updated successfully!" })
    }
  )
})

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
