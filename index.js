const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const csrf = require("csurf");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);

const keys = require("./keys/index");

const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const cardRoutes = require("./routes/card");
const ordersRoutes = require("./routes/orders");
const loginRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

//middleware
const varMW = require("./middleware/variables");
const userMW = require("./middleware/user");
const errorHandler = require("./middleware/error");
const fileMW = require("./middleware/file");

const app = express();
const PORT = process.env.PORT || 3000;

const hbs = exphbs.create({
  defaultLayout: "main", // используется шаблон по дефолту с которого будет рендериться страница
  extname: "hbs",
  helpers: require("./helpers/hbs-helper"),
}); // создается движок с конфигами

const store = new MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI,
});

app.engine("hbs", hbs.engine); // регистрируется движок приложению
app.set("view engine", "hbs"); // настраивается движок приложению
app.set("views", "views"); // настраивается папка со страницами для выбора страницы во время рендеров

app.use(express.static(path.join(__dirname, "public"))); // установка папки со статическими файлами, в данном случае папка public, то есть все файлы с адрессом "/"
app.use("/images", express.static(path.join(__dirname, "images"))); //чтобы проходил урл не просто к корню а к папке
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use(fileMW.single("avatar"));
app.use(csrf());
app.use(flash());
app.use(varMW);
app.use(userMW);
app.use("/", homeRoutes);
app.use("/add-course", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/card", cardRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", loginRoutes);
app.use("/profile", profileRoutes);
app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, { useNewUrlParser: true });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} ...`);
    });
  } catch (e) {
    console.log(e);
  }
}
start();
