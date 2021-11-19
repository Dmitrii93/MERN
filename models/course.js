const { Schema, model } = require("mongoose");
const course = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: {
    type: String,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// course.method('name', function(){
//   ...
// })

// отдельно у схемы есть метод method , который сетит функцию(2) с названием(1) . не заьываем про function для this
//функция выполняется всегда при всех манипуляциях в начале
module.exports = model("Course", course);
