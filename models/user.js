const { Schema, model } = require("mongoose");
const user = new Schema({
  email: { type: String, required: true },
  name: { type: String },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExp: Date,
  avatarUrl: String,
  cart: {
    items: [
      {
        count: { type: Number, required: true, default: 1 },
        courseId: {
          required: true,
          type: Schema.Types.ObjectId,
          ref: "Course",
        },
      },
    ],
  },
});

user.methods.addToCart = function (course) {
  //обязательно использовать function чтобы было возможно работать с this
  const items = [...this.cart.items];
  const idx = items.findIndex((c) => c.courseId.toString() === course._id.toString());
  if (items[idx]) {
    items[idx].count = items[idx].count + 1;
  } else {
    items.push({ count: 1, courseId: course._id });
  }
  // const newCart = { items: items };
  // this.cart = newCart;
  this.cart = { items };
  return this.save();
};

user.methods.removeFromCart = function (id) {
  //обязательно использовать function чтобы было возможно работать с this
  let items = [...this.cart.items];
  const idx = items.findIndex((c) => {
    return c.courseId.toString() === id.toString();
  });
  items[idx].count = items[idx].count - 1;

  if (items[idx].count === 0) {
    items = items.filter((items) => items.courseId.toString() !== id.toString());
  }
  this.cart = { items };
  return this.save();
};

user.methods.clearCart = function () {
  //обязательно использовать function чтобы было возможно работать с this

  this.cart = { items: [] };
  return this.save();
};

module.exports = model("User", user);
