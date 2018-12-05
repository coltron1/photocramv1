var express = require("express");
var router=express.Router();
var passport = require("passport");
var User = require("../models/user");
var Album = require("../models/album");
var crypto = require("crypto");
var multer = require('multer');
var dotenv = require('dotenv').config();
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'coltron', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:  process.env.CLOUDINARY_API_SECRET
});

router.get("/", function(req, res) {
    res.render("landing");
});

//SHOW REGISTER FORM
router.get("/register", function(req, res){
    res.render("register", {page: "register"});
});

router.post("/register", upload.single('avatar'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, {gravity: "face", width: 150, height: 150, crop: "thumb"}, function(err, result) {
          if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
            // add cloudinary url for the image to the album object under image property
        var newUser = new User(
            {
                username: req.body.username,
                avatar: result.secure_url,
                imageId: result.public_id,
                email: req.body.email,
                firstName: req.body.firstName, 
                lastName: req.body.lastName,
                address: req.body.address, 
                city: req.body.city, 
                state: req.body.state, 
                zipCode: req.body.zipCode
            });
        User.register(newUser, req.body.password, function(err, user){
            if(err){
                req.flash("error", err.message);
                return res.render("register", {error: err.message});
            }
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to PhotoCram " + user.username);
                res.redirect("/albums");
            });
        });
    });
});

// show login form
router.get("/login", function(req, res) {
    res.render("login", {page: "login"});
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/albums",
        failureRedirect: "/login",
        badRequestMessage : 'Missing username or password.',
        failureFlash: true
    }), function(req, res) {
});

//logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
});

//USERS PROFILE ROUTE
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        }
        Album.find().where("author.id").equals(foundUser._id).exec(function(err, albums) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    res.redirect("/");
                }
                res.render("users/show", {user: foundUser, albums: albums});
        });
    });
});


module.exports=router;