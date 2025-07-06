const joi = require("joi");
const reviews = require("./models/reviews");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports.listingschema=joi.object({
    listing : joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location: joi.string().required(),
        country: joi.string().required(),
        price:joi.number().required().min(0),
        image: joi.object({  
            filename: joi.string().required(),  
            url: joi.string().uri().allow("",null)
        }),
        reviews: [ 
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Review",
            },
        ],
    }).required()
})

module.exports.reviewschema=joi.object({
    review : joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required()
})

