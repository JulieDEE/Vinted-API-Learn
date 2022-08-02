const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DATABASE);

const offerRoutes = require("./routes/offerRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes")
app.use(offerRoutes);
app.use(userRoutes);
app.use(paymentRoutes); 

app.all("*", async (req, res) => {
  res.status(404).send("Oups, page introuvable !");
});

app.listen(process.env.PORT, () => {
  console.log("Server is running on PORT 3000 !");
});
