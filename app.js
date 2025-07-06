const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const expressError = require("./utils/expressError.js");
const listingroute = require("./routes/listing.js");
const reviewroute = require("./routes/reviews.js");
const userroute = require("./routes/user.js");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/users.js");
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}
const sessionOptins={
  secret: "mysupersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now()+7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  },
};
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptins));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  res.locals.curruser = req.user;
  next();
})

app.use("/listings", listingroute);
app.use("/listings/:id/reviews", reviewroute);
app.use("/", userroute);


app.all("*", (req, res, next) => {
  next(new expressError(404, "page not found"));
});

app.use((err, req, res, next) => {
  let { statusc = 500, message = "something is fishy" } = err;
  res.render("error.ejs", { message });
});
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
































