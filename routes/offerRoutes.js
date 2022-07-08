const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../isAuthenticated");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post(
  "/offer/publish",
  fileUpload(),
  isAuthenticated,
  async (req, res) => {
    try {
      const convertToBase64 = (file) => {
        return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
      };
      const myPictureInBase64 = convertToBase64(req.files.picture);

      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ETAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
        owner: req.user,
      });

      const idOffer = newOffer._id;

      const pictureUpload = await cloudinary.uploader.upload(
        myPictureInBase64,
        { folder: `vinted/offers/${idOffer}` }
      );

      newOffer.product_image = pictureUpload;

      await newOffer.save();

      res.json(newOffer);
    } catch (error) {
      res.status(400).json(error.message);
    }
  }
);

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const offerToDelete = await Offer.findById(req.body.id);

    if (offerToDelete === null) {
      res
        .status(400)
        .json(
          "Nous n'avons pas pu trouver l'offre que vous souhaitez supprimer"
        );
    } else {
      console.log(String(req.user._id));
      console.log(String(offerToDelete.owner));

      if (String(req.user._id) === String(offerToDelete.owner)) {
        await Offer.findByIdAndDelete(req.body.id);

        res.json("Votre offre a bien été supprimée");
      } else {
        res.status(400).json("Vous ne pouvez pas supprimer cette offre");
      }
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/offers", async (req, res) => {
  let perPage = 3;
  const filters = {};

  if (req.query.title) {
    filters.product_name = new RegExp(req.query.title, "i");
  }

  if (req.query.minPrice) {
    filters.product_price = { $gte: req.query.minPrice };
  }

  if (req.query.maxPrice) {
    if (filters.product_price) {
      filters.product_price.$lte = req.query.maxPrice;
    } else {
      filters.product_price = { $lte: req.query.maxPrice };
    }
  }

  const offers = await Offer.find(filters)
    .sort({ product_price: req.query.sort })
    .select("product_name product_price _id")
    .limit(perPage)
    .skip(perPage * req.query.page);

  const count = await Offer.countDocuments(filters);

  res.json({ count: count, offers: offers });
});

module.exports = router;

//     product_name: new RegExp("chemise", "i"),
//   })
