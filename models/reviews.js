const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment : {
        type: String,
        required: true,
    },
    rating:{
        type:Number,
        required: true,
        min: 1,
        max: 5,
    },
    created_At:{
        type: Date,
        default: Date.now(),
    },
    auther:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});
module.exports = mongoose.model("Review", reviewSchema);