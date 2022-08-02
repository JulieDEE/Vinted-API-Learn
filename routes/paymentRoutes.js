const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE);

router.post("/payment", async (req, res) => {
  try {
    const stripeToken = req.body.stripeToken;
    const response = await stripe.charges.create({
      source: stripeToken,
      amount: req.body.price * 100,
      currency: "eur",
      description: req.body.name,
    });
    console.log(response.status);

    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
