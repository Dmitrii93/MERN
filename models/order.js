const { Schema, model } = require("mongoose");
const order = new Schema({
  date: { type: Date, default: Date.now },
  user: { name: String, userId: { type: Schema.Types.ObjectId, ref: "User", required: true } },
  courses: [
    {
      course: { type: Object, required: true },
      count: { type: Number, required: true },
    },
  ],
});

// course.method('name', function(){
//   ...
// })

// отдельно у схемы есть метод method , который сетит функцию(2) с названием(1) . не заьываем про function для this
//функция выполняется всегда при всех манипуляциях в начале
module.exports = model("Order", order);
