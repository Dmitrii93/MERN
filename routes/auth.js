const { Router } = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sengrid = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator/check");
const User = require("../models/user");
const keys = require("../keys/index");
const regEmail = require("../emails/registrations");
const resetPass = require("../emails/reset");
const user = require("../models/user");
const { registerValidators, loginValidators } = require("../helpers/validators");
const router = Router();

const transporter = nodemailer.createTransport(sengrid({ auth: { api_key: keys.SENDGRID_API_KEY } }));

router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Authorization", isLogin: true, logError: req.flash("logError"), regError: req.flash("regError") });
});
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  }); // закрыть сессию destroy и сделать то что в колбэке далее
});
router.post("/login", loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    const candidate = await User.findOne({ email });
    if (!errors.isEmpty()) {
      req.flash("logError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#login");
    }

    req.session.user = candidate;
    req.session.isAuthenticated = true;
    req.session.save((e) => {
      if (e) {
        throw e;
      }
      res.redirect("/");
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/register", registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("regError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }
    const hashPass = await bcrypt.hash(password, 10);
    const user = await User({ email, password: hashPass, name, cart: { items: [] } });
    await user.save();
    await transporter.sendMail(regEmail(email));
    res.redirect("/auth/login#login");
  } catch (e) {
    console.log(e);
  }
});
router.get("/reset", async (req, res) => {
  res.render("auth/reset", { title: "Reset Password", error: req.flash("error") });
});
router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Something is wrog");
        return res.redirect("/auth/reset");
      }
      const token = buffer.toString("hex");
      const candidate = await user.findOne({ email: req.body.email });
      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        transporter.sendMail(resetPass(candidate.email, token));
        res.redirect("/auth/login");
      } else {
        req.flash("error", "No such email");
        res.redirect("/auth/reset");
      }
    });
  } catch (e) {
    console.log(e);
  }
});
router.get("/password/:token", async (req, res) => {
  if (!req.params.token) {
    return res.redirect("/auth/login");
  }
  try {
    const user = await User.findOne({ resetToken: req.params.token, resetTokenExp: { $gt: Date.now() } }); // $gt время now еще не наступило к resetTokenExp
    if (!user) {
      return res.redirect("/auth/login");
    } else {
      res.render("auth/password", { title: "Restore password", userId: user._id, token: req.params.token, error: req.flash("error") });
    }
  } catch (e) {
    console.log(e);
  }
});
router.post("/password", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId, resetToken: req.body.token, resetTokenExp: { $gt: Date.now() } });
    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect("/auth/login");
    } else {
      req.flash("logError", "Token is expired");
      res.redirect("/auth/login");
    }
  } catch (e) {
    console.log(e);
  }
});
module.exports = router;
