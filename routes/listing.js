const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const { listingschema, reviewschema } = require("../schema.js");
const Listing = require("../models/listing.js");

async function getCoordinates(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } else {
        return {lat:17.31067505,lng:82.25124878480923}; // No results found
    }
}
const validatelisting = (req, res, next) => {
    const { error } = listingschema.validate(req.body);
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
async function isOwner (req, res, next) {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    console.log("curruser"+res.locals.curruser._id);
    if(!listing.owner.equals(res.locals.curruser._id)){
        req.flash("failure","cannot access");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


//listing routes
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("Listingtempletes/index.ejs", { allListings });
}));
router.get("/new",isLoggedIn, (req, res) => {
        res.render("Listingtempletes/new.ejs");
});
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"auther",},}).populate("owner");
    const cordinates = await getCoordinates(listing.location);
    console.log(cordinates);
    if (!listing) {
        req.flash("failure", "listing not available");
        res.redirect("/listings");
    } else {
        res.render("Listingtempletes/show.ejs", { listing,cordinates });
    }
}));
router.post("/",isLoggedIn, validatelisting, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");
}));
router.get("/:id/edit",isOwner,isLoggedIn, wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("failure", "lising not available");
            res.redirect("/listings");
        } else
            res.render("Listingtempletes/edit.ejs", { listing });
}));
router.put("/:id",isLoggedIn,isOwner,validatelisting, wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "listing updated");
        res.redirect(`/listings/${id}`);
}));
router.delete("/:id", isLoggedIn,isOwner,wrapAsync(async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        req.flash("success", "listing deleted");
        res.redirect("/listings");
}));

router.get("/filters/:x",async (req,res,err)=>{
    let {x} = req.params;
    const allListings = await Listing.find({filter: x});
    res.render("Listingtempletes/index.ejs", { allListings });
});
module.exports = router;