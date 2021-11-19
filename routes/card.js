const { Router, request } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const router = Router();
function mapCartItems(cart) {
  return cart.items.map((item) => ({
    ...item.courseId._doc, // объект который содержит главные поля (развернутый)
    count: item.count,
  }));
}
function computePrice(cart) {
  let price = 0;
  cart.items.forEach((item) => {
    price += item.courseId.price * item.count;
  });
  return price;
}
router.get("/", auth, async (req, res) => {
  const user = await req.user.populate("cart.items.courseId");
  const courses = mapCartItems(user.cart);
  const price = computePrice(user.cart);
  res.render("card", { title: "Card", isCard: true, courses, price });
});
router.post("/add", auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCart(course);
  res.redirect("/card");
});
router.delete("/remove/:id", auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id);
  const user = await req.user.populate("cart.items.courseId");
  const courses = mapCartItems(user.cart);
  const price = computePrice(user.cart);
  const cart = { courses, price };
  res.status(200).json(cart);
});
module.exports = router;
