var express= require("express"),
    app= express(),
    mongoose=require("mongoose"),
    flash=require("connect-flash"),
    passport   = require("passport"),
    bodyParser=require("body-parser"),

    localStrategy= require("passport-local"),
    passportLocalMongoose= require("passport-local-mongoose");
    

mongoose.connect("mongodb+srv://sanchaksh:sanchaksh@cluster0-c0pfl.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true}).then(
    () => {
      console.log("Database connection established!");
    },
    err => {
      console.log("Error connecting Database instance due to: ", err);
    }
  );
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"));
// ===================
// middleware
// ===================
function isLoggedIn (req,res,next){
    if(req.isAuthenticated())
    {
        return next();

    }else
    req.flash("error","You need to login to do that.")
    res.redirect("/login");
};
function isAdmin (req,res,next){
    if(!req.isAuthenticated())
    {   
    req.flash("error","You need to login to do that.")
    res.redirect("/login");
    }else{if(req.user.username=="admin")
    return next();}
    
};







app.use(flash());
// ==================
// Mongoose Schemas
// ==================
var userSchema= new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String

});

userSchema.plugin(passportLocalMongoose);
user= mongoose.model("user",userSchema);


        var companySchema=new mongoose.Schema({
            cname:String,
            oname:String,
            sector: String,
            gstin: String,
            date: Date,
            location: String
            
        
        });
company=mongoose.model("company",companySchema);
var schemeSchema= new mongoose.Schema({
    title: String,
    description: String,
    link: String
    

});
scheme=mongoose.model("scheme",schemeSchema);


//========================
//Passport Configuration
//========================
app.use(require("express-session")({
    secret: "Abhijeet is the worlds best web developer",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()) );
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
 
// app.use(methodOverride("_method"));
app.use(flash());
app.use(function(req,res,next){
    res.locals.currentUser= req.user;
    res.locals.error= req.flash("error");
    res.locals.success=req.flash("success");
    return next();
});




// ======================
// Routes
// ======================
app.get("/",function(req,res){
    res.render("landing");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",function(req,res){
    var newuser= new user({username: req.body.username,name: req.body.name,email:req.body.email});
    user.register(newuser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            return res.redirect("/register");   
        }
        passport.authenticate("local")(req,req,function(){
            req.flash("success","Welcome to Startup Punjab "+ user.username);
            res.redirect("/");
        })
    })
})
app.get("/login",function(req,res){
    res.render("login");
})
app.post("/login",passport.authenticate("local",{
    successRedirect:"/userdashboard",
    failureRedirect: "/login"
}),function(req,res){

})
app.get("/logout",function(req,res){
    req.logOut();
    req.flash("success","succesfully Logged out.");
    res.redirect("/");

});
app.get("/regstartup",isLoggedIn,function(req,res){
    res.render("regstartup");
})
app.post("/regstartup",isLoggedIn,function(req,res){
    console.log(req.body.company);
    company.create(req.body.company,function(err, comp){
        if(err)
        {console.log("Error occured");}
        else
        { console.log("added new company");
        }
        res.redirect("/");

    })
   
})
app.post("/gov/login",passport.authenticate("local",{
    successRedirect:"/userdashboard",
    failureRedirect: "/login"
}),function(req,res){

})

app.get("/userdashboard",isLoggedIn,function(req,res){
   
    res.render("userdashboard");
});
app.get("/addschemes",isAdmin,function(req,res){
    res.render("addschemes");
})
app.post("/addschemes",isAdmin,function(req,res){
    console.log(req.body.scheme);
    scheme.create(req.body.scheme,function(err, sch){
        if(err)
        {console.log("Error occured");}
        else
        { console.log("added new scheme");
        }
        res.redirect("/schemes");

    })
})
app.get("/schemes",function(req,res){
    scheme.find({},function(err,allschemes){
        if(err){
            console.log(err);

        }
        else{
            res.render("schemes",{allschemes});
        }
    })
});
   


app.listen(3000,function(){
    console.log("Server Started");
})