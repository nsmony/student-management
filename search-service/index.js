require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/studentdb";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Search service: MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

const studentSchema = new mongoose.Schema({
  student_id: Number,
  student_name: String,
  student_mobile: String,
  student_email: String,
  student_password: String,
});
const Student = mongoose.model("Student", studentSchema, "students");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

app.get("/health", (req, res) => res.json({ service: "search", status: "UP" }));

// GET /search?id=1   or   GET /search?name=sophea
app.get("/search", async (req, res) => {
  try {
    const { id, name } = req.query;
    if (!id && !name)
      return res.status(400).json({ message: "Provide ?id= or ?name=" });

    const query = id
      ? { student_id: Number(id) }
      : { student_name: { $regex: escapeRegex(name), $options: "i" } };

    const students = await Student.find(query).select("-student_password -__v");
    if (students.length === 0)
      return res.status(404).json({ message: "No student found" });
    res.json({ count: students.length, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => console.log(`Search service running on port ${PORT}`));
