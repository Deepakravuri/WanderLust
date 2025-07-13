const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const { listingschema, reviewschema } = require("../schema.js");
const Listing = require("../models/listing.js");
const getNearbyAttractions = require("../utils/nearbyPlaces.js");
const isValidCity = require("../utils/validateCity");

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
router.get("/sort", async (req, res) => {
  const { sortBy } = req.query;
  let sortOption = {};

  if (sortBy === "price_asc") sortOption.price = 1;
  else if (sortBy === "price_desc") sortOption.price = -1;
  else if (sortBy === "likes_desc") sortOption.likes = -1;

  const listings = await Listing.find({}).sort(sortOption);
  res.render("Listingtempletes/index.ejs", { allListings: listings });
});
router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  const regex = new RegExp(query, "i");

  const listings = await Listing.find({
    $or: [{ title: regex }, { location: regex }]
  }).limit(5);

  res.json(listings.map(listing => ({
    id: listing._id,
    title: listing.title,
    location: listing.location
  })));
});
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "auther" } })
    .populate("owner").populate("messages.sender");

  const cordinates = await getCoordinates(listing.location);
  const nearbyPlaces = await getNearbyAttractions(cordinates.lat, cordinates.lng);

  if (!listing) {
    req.flash("failure", "Listing not available");
    return res.redirect("/listings");
  }

  res.render("Listingtempletes/show.ejs", { listing, cordinates,nearbyPlaces});
}));

router.post("/", isLoggedIn, validatelisting, wrapAsync(async (req, res) => {
    const cityName = req.body.listing.location;

    const valid = await isValidCity(cityName);
    if (!valid) {
        req.flash("failure", "Please enter a valid city name.");
        return res.redirect("/listings/new");
    }

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
router.post('/:id/like', isLoggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    // Prevent duplicate likes
    if (listing.likedBy.includes(req.user._id)) {
      return res.redirect('back');
    }

    listing.likes += 1;
    listing.likedBy.push(req.user._id);
    await listing.save();

    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
router.post("/:id/message", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("failure", "Listing not found");
    return res.redirect("/listings");
  }

  listing.messages.push({
    sender: req.user._id,
    content: message
  });

  await listing.save();
  req.flash("success", "Message sent to owner!");
  res.redirect(`/listings/${id}`);
});

router.get("/filters/:x",async (req,res,err)=>{
    let {x} = req.params;
    const allListings = await Listing.find({filter: x});
    res.render("Listingtempletes/index.ejs", { allListings });
});


module.exports = router;