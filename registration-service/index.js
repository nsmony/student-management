require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/studentdb";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Registration service: MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

const studentSchema = new mongoose.Schema({
  student_id: { type: Number, required: true, unique: true },
  student_name: { type: String, required: true, trim: true },
  student_mobile: { type: String, required: true },
  student_email: { type: String, required: true, unique: true, lowercase: true },
  student_password: { type: String, required: true },
});
const Student = mongoose.model("Student", studentSchema, "students");

const safe = (s) => {
  const o = s.toObject();
  delete o.student_password;
  delete o.__v;
  return o;
};

app.get("/health", (req, res) => res.json({ service: "registration", status: "UP" }));

// Register (store) a student
app.post("/register", async (req, res) => {
  try {
    const { student_id, student_name, student_mobile, student_email, student_password } = req.body;
    if (!student_id || !student_name || !student_mobile || !student_email || !student_password)
      return res.status(400).json({ message: "All fields are required" });

    const hashed = await bcrypt.hash(student_password, 10);
    const student = await Student.create({
      student_id, student_name, student_mobile, student_email,
      student_password: hashed,
    });
    res.status(201).json({ message: "Student registered", student: safe(student) });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "student_id or student_email already exists" });
    res.status(500).json({ message: err.message });
  }
});

// Update a student
app.put("/register/:id", async (req, res) => {
  try {
    const update = { ...req.body };
    delete update.student_id;
    if (update.student_password)
      update.student_password = await bcrypt.hash(update.student_password, 10);

    const student = await Student.findOneAndUpdate(
      { student_id: Number(req.params.id) },
      update,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student updated", student: safe(student) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => console.log(`Registration service running on port ${PORT}`));
