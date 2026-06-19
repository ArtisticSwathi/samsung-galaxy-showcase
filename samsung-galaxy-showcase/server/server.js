const express = require('express');
const mongoose = require('mongoose'); // This is the line you were missing!
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected perfectly!"))
  .catch((err) => console.log("Database error:", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});