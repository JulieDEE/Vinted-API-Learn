const express = require("express");
const router = express.Router();
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const password = req.body.password;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);
    const userExist = await User.findOne({ email: req.body.email });
    const convertToBase64 = (file) => {
      return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
    };

    const myPictureInBase64 = convertToBase64(req.files.picture);
    const pictureUpload = await cloudinary.uploader.upload(myPictureInBase64);

    if (!req.body.username) {
      res.json("Erreur : le nom de l'utilisateur n'est pas renseigné");
    } else if (userExist === null) {
      const newUser = new User({
        account: {
          username: req.body.username,
          avatar: pictureUpload,
        },
        email: req.body.email,
        newsletter: req.body.newsletter,
        salt: salt,
        hash: hash,
        token: token,
      });

      await newUser.save();

      res.json({
        _id: newUser._id,
        username: req.body.username,
        token: token,
      });
    } else {
      res.json("Erreur : un utilisateur correspond déjà à cet email ! ");
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/user/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const salt = user.salt;
  const token = user.token;
  const hash = user.hash;
  const tempHash = SHA256(req.body.password + salt).toString(encBase64);

  if (tempHash === hash) {
    res.json({
      id: user._id,
      token: token,
      username: user.username,
    });
  } else {
    res.json("Erreur : Le mot de passe est erroné !");
  }
});

module.exports = router;
