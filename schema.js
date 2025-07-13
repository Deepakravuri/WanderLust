const joi = require("joi");
const reviews = require("./models/reviews");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports.listingschema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    image: joi.object({
      url: joi.string().allow(""),
      filename: joi.string().allow("")
    }).optional(),
    price: joi.number().required().min(0),
    location: joi.string().required(),
    country: joi.string().required(),
    filter: joi.string().valid('pool', 'mountain', 'beach', 'forest', 'desert', 'snow', 'valley', 'other').optional()
  }).required()
});
module.exports.reviewschema=joi.object({
    review : joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required()
})

