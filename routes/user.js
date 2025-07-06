const express = require("express");
const router = express.Router();
const User = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");



function storeReturnTo(req, res, next) {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl =req.session.redirectUrl || "/listings";
        console.log(res.locals.redirectUrl);
    }else{
        res.locals.redirectUrl = "/listings";
    }
    next();
}

router.get("/signup", (req, res, next) => {
    res.render("usertempletes/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({
            email, username
        });
        const registered = await User.register(newUser, password);
        req.login(registered,(err)=>{
            if(err)
            return next(err);
            req.flash("success", "registered successfully");
            res.redirect("/listings");
        });
    } catch(e) {
        req.flash("failure",e.message);
        res.redirect("/signup");
    }
}));

router.get("/login",(req,res)=>{
    res.render("usertempletes/login.ejs")
});
router.post("/login",storeReturnTo,passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash: {type: "failure", message: "Invalid credentials! Try again."},
}),async (req,res)=>{
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl);
});

router.get("/logout",(req,res) => {
    req.logout((err)=>{
        if(err){
            return next(err);
        }else{
            req.flash("success","logged out!");
            res.redirect("/listings");
        }
    });
});

module.exports = router;