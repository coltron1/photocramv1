var express = require("express");
var router=express.Router();
var passport = require("passport");
var User = require("../models/user");
var Album = require("../models/album");
var crypto = require("crypto");

router.get("/", function(req, res) {
    res.render("landing");
});

//SHOW REGISTER FORM
router.get("/register", function(req, res){
    res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User(
        {
            username: req.body.username
            // email: req.body.email
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