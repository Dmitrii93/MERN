const { Router } = require("express");
const { validationResult } = require("express-validator/check");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const { courseValidators } = require("../helpers/validators");
const router = Router();
router.get("/", auth, (req, res) => {
  res.render("add", { title: "Add Course", isAdd: true });
});
router.post("/", auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("works");
    return res
      .status(422)
      .render("add", {
        title: "Add Course",
        isAdd: true,
        error: errors.array()[0].msg,
        data: { title: req.body.title, price: req.body.price, image: req.body.image },
      });
  }
  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    image: req.body.image,
    userId: req.user._id,
  });
  try {
    await course.save();
    res.redirect("/courses");
  } catch (e) {
    console.log(e);
  }
});
module.exports = router;
