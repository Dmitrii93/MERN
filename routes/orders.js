const { Router } = require("express");
const auth = require("../middleware/auth");
const router = Router();
const Order = require("../models/order");
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id }).populate("user.userId").lean();
    console.log("orders:", orders);
    res.render("orders", {
      title: "Orders",
      isOrder: true,
      orders: orders.map((o) => {
        return {
          date: o.date,
          _id: o._id,
          user: o.user,
          courses: o.courses,
          price: o.courses.reduce((price, c) => {
            return (price += c.count * c.course.price);
          }, 0),
        };
      }),
    });
  } catch (e) {
    console.log(e);
  }
});
router.post("/", auth, async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId");
    const courses = user.cart.items.map((item) => {
      return { count: item.count, course: { ...item.courseId._doc } };
    });
    const order = new Order({
      user: { name: req.user.name, userId: req.user },
      courses,
    });
    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (e) {
    console.log(e);
  }
});
module.exports = router;
