const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE);

router.post("/payment", async (req, res) => {
  const stripeToken = req.body.stripeToken;
  const response = await stripe.charges.create({
    amount: req.body.price,
    currency: "eur",
    description: req.body.name,
    source: stripeToken,
  });
  console.log(response.status);

  res.json(response);
});

module.exports = router;
