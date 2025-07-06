const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const { listingschema, reviewschema } = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

const validatereview = (req, res, next) => {
    const { error } = reviewschema.validate(req.body);
    if (error) {
        throw new expressError(400, error);
    } else {
        next();
    }
}

function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; 
        console.log(req.method);
        console.log(req.session.redirectUrl);
        req.flash("failure", "Please log in");
        return res.redirect("/login");
    }
    next();
}

async function isauther (req, res, next) {
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.auther.equals(res.locals.curruser._id)){
        req.flash("failure","cannot access");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//Review routes
router.post("/", validatereview,isLoggedIn, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id).populate("reviews");
    let newReview = new Review(req.body.review);
    newReview.auther = req.user._id;
    console.log(newReview);
    await newReview.save();
    listing.reviews.push(newReview);
    await listing.save();
    req.flash("success","New review created");
    res.redirect(`/listings/${listing._id}`);
}));
router.delete("/:reviewId",isLoggedIn,isauther,async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
});


module.exports = router;