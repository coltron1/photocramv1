var express = require("express");
var router=express.Router();
var Album=require("../models/album");
var Comment = require("../models/comment");
var middleware = require("../middleware"); //AUTOMATICALLY REQUIRES INDEX.JS FILE BY DEFAULT. THIS IS WHY IT IS NAMED INDEX!!!!!!!!!!
 
 
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

//INDEX -- SHOWS ALL ALBUMS
router.get("/", function(req, res){
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Album.find({name: regex}, function(err, allAlbums){
            if(err){
                console.log(err);
            } else {
                res.render("albums/index", {albums: allAlbums, currentUser: req.user, page: "albums"});
            }
        });
    } else {
        Album.find({}, function(err, allAlbums){
            if(err){
                console.log(err);
            } else {
                res.render("albums/index", {albums: allAlbums, currentUser: req.user, page: "albums"});
            }
        }); 
    }
});

router.post("/", middleware.isLoggedIn, upload.array("album[image]"), async function(req, res){
    // add author to album
    req.body.album.author = {
        id: req.user._id,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar,
    };

    req.body.album.image = [];
    req.body.album.imageId = [];
    for (const file of req.files) {
        let result = await cloudinary.v2.uploader.upload(file.path, {quality: 10});
        req.body.album.image.push(result.secure_url);
        req.body.album.imageId.push(result.public_id);
    }

    Album.create(req.body.album, function(err, album) {
        if (err) {
            return res.redirect('back');
        }
        res.redirect('/albums/' + album.id);
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("albums/new"); 
});

// SHOW: Shows more info about one album
router.get("/:id", function(req, res){
    //find the album with provided ID
    Album.findById(req.params.id).populate("comments").exec(function(err, foundAlbum){
       if(err){
           console.log(err);
       } else {
           console.log(foundAlbum);
           //render the show template with that album
           res.render("albums/show", {album: foundAlbum});
       }
    });
});

//EDIT ALBUM ROUTE
router.get("/:id/edit", middleware.checkAlbumOwnership, function(req, res){
    Album.findById(req.params.id, function(err, foundAlbum){
        res.render("albums/edit", {album: foundAlbum});  
    });
});


router.put("/:id", upload.array("album[image]"), function(req, res){
    Album.findById(req.params.id, async function(err, foundAlbum){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    for(var i=0; i<foundAlbum.imageId.length; i++){    
                        await cloudinary.v2.uploader.destroy(foundAlbum.imageId[i]);
                    }                
                    for (const file of req.files) {
                    let result = await cloudinary.v2.uploader.upload(file.path, {quality: "auto"});
                    req.body.album.image.push(result.secure_url);
                    req.body.album.imageId.push(result.public_id);
                    }
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            foundAlbum.name = req.body.name;
            foundAlbum.description = req.body.description;
            foundAlbum.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/albums/" + foundAlbum._id);
        }
    });
});

router.delete('/:id', middleware.checkAlbumOwnership, function(req, res) {
    Album.findById(req.params.id, async function(err, foundAlbum) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        try {
            for(var i=0; i<foundAlbum.imageId.length; i++){
                console.log("this is imageId " + i);
                console.log(foundAlbum.imageId[i]);
                await cloudinary.v2.uploader.destroy(foundAlbum.imageId[i]);
            }
            foundAlbum.remove();
            req.flash("success", "Album was deleted successfully");
            res.redirect("/albums");
        } catch(err){
            if(err){
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;