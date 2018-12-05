var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    password: String,
    firstName: String,
    lastName: String,
    imageId: String,
    address: String,
    city: String,
    state: String,
    zipCode: Number,
    username: String,
    email: {type: String, unique: true, required: true},
    avatar: String
    // resetPasswordToken: String,
    // resetPasswordExpires: Date,
    // isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);