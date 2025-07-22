if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
require("dotenv").config();
const MONGO_URL = process.env.MONGO_URL;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");

const expressError = require("./utils/expressError.js");
const listingroute = require("./routes/listing.js");
const reviewroute = require("./routes/reviews.js");
const userroute = require("./routes/user.js");
const User = require("./models/users.js");


// Database connection
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log(" MongoDB Connected");
  })
  .catch((err) => {
    console.error(" MongoDB Connection Error:", err);
  });

// Session config
const sessionOptions = {
  secret: "mysupersecretkey", // Ideally store this in .env too
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  res.locals.curruser = req.user;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use((req, res, next) => {
  console.log(`🧭 ${req.method} ${req.path}`);
  next();
});

app.use("/listings", listingroute);
app.use("/listings/:id/reviews", reviewroute);
app.use("/", userroute);

// Error handling
app.all("*", (req, res, next) => {
  next(new expressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusc = 500, message = "Something went wrong" } = err;
  res.status(statusc).render("error.ejs", { message });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
