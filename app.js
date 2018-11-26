require('dotenv').config();
var express        = require("express"),
    app            = express(),
    request        = require("request"),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    Album     = require("./models/album"),
    Comment        = require("./models/comment"),
    passport       = require("passport"),
    methodOverride = require("method-override"),
    LocalStrategy  = require("passport-local"),
    flash          = require("connect-flash"),
    User           = require("./models/user");

//REQUIRING ROUTES
var commentRoutes    = require("./routes/comments"),
    albumRoutes = require("./routes/albums"),
    indexRoutes      = require("./routes/index");
    
app.set("view engine", "ejs");
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();
app.locals.moment = require('moment');
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "lkjs ldskjlkjkj dsjlkdsa alkjasdfl;j;dfsajhgei1323",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//EXPRESS ROUTER TO REQUIRE ROUTES AND SHORTEN CODE (GIVES ROUTER.GET IN OTHER ROUTES)
app.use(indexRoutes);
app.use("/albums/:id/comments", commentRoutes);
app.use("/albums", albumRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER HAS STARTED");
});