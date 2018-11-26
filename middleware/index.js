var Album = require("../models/album");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that."); //MUST BE BEFORE BEING REDIRECTED!!
    res.redirect("/login");
};

middlewareObj.checkAlbumOwnership = function(req, res, next){
     if(req.isAuthenticated()){
        Album.findById(req.params.id, function(err, foundAlbum){
            if(err){
                req.flash("error", "aLBUM not found.");
                res.redirect("back");
            } else {
                if(foundAlbum.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
        } else {
            res.redirect("back");
        }
};
middlewareObj.checkCommentOwnership = function(req, res, next){
     if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                //does user own the comment?
                console.log(foundComment);
                if(foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
        } else {
            req.flash("error", "You need to be logged in to do that.");
            res.redirect("back");
        }
};


module.exports = middlewareObj;


