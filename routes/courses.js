const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const { validationResult } = require("express-validator/check");
const { courseValidators } = require("../helpers/validators");
const router = Router();

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("userId").lean(); // lean чтобы hbs работал, populate раскрывает реф заложенный в поле, select создает объект с полями модельки...
    // в populate вторым параметром можем указывать те поля которые только и нужны из объекта рефа

    res.render("courses", { title: "Courses", isCourses: true, courses, userId: req.user ? req.user._id.toString() : null });
  } catch (e) {
    console.log(e);
  }
});
router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }
    res.render("edit", { layout: "main", title: `Edit course ${course.title}`, course });
  } catch (e) {
    console.log(e);
  }
});
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    res.render("course", { layout: "course", title: `Course ${course.title}`, course });
  } catch (e) {
    console.log(e);
  }
});
router.post("/edit", auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const { id } = req.body;
  if (!errors.isEmpty()) {
    console.log("works");
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
  }
  try {
    delete req.body.id;
    const course = await Course.findById(id);
    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }
    Object.assign(course, req.body);
    await course.save();
    res.redirect("/courses");
  } catch (e) {
    console.log(e);
  }
});

router.post("/delete", auth, async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.body.id, userId: req.user._id });
    res.redirect("/courses");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
