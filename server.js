//jshint esversion:6
require('dotenv').config();


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const ObjectId = require('mongodb').ObjectId;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");



const app = express();


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: "our secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://rahul:1421@cluster0.q6yoqjl.mongodb.net/testDB", { useNewUrlparser: true },()=>{
    console.log("connected to DATABASE SERVER");
});
// userDB", { useNewUrlparser: true });
// mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlparser: true });
// mongodb+srv://admin-rahul:@cluster0.nv2ihbl.mongodb.net/?retryWrites=true&w=majority
// mongodb+srv://<username>:<password>@cluster0.q6yoqjl.mongodb.net/?retryWrites=true&w=majority

// mongoose.set("useCreateIndex",true);
const userSchema = new mongoose.Schema({
    lastupdate: Date,
    firstname: String,
    lastName: String,
    username: String,
    gender: String,
    email: String,
    phone: Number,
    password: String,
    googleId: String,
    secret: Array
});

const postSchema = new mongoose.Schema({
    _id: ObjectId,
    text: String,
    like: Number,




});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Post = new mongoose.model("post", postSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
});

passport.use(new GoogleStrategy({
    clientID: "222587680060-1namhemubvem6makr1de38u4rqej04cg.apps.googleusercontent.com",
    clientSecret: "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",
    // callbackURL: "http://localhost:3000/auth/google/secrets"

    // callbackURL: "https://morning-headland-46007.herokuapp.com/auth/google/secrets"
    callbackURL: "https://campus404.herokuapp.com/auth/google/secrets"

    // userProfileURL:"http://www.googleapis.com/oauth2/v3/userinfo"

},
    function (accessToken, refreshToken, profile, cb) {
        // console.log(profile);



        User.findOrCreate({ googleId: profile.id, username: profile.displayName, firstname: profile.name.givenName, lastName: profile.name.familyName }, function (err, user) {
            if (err) {
                res.render("errorpage", { message: err });
            }
            return cb(err, user);
        });
    }
));


app.get("/signin", function (req, res) {
    const response = req.query.error;
    // var x=req.isAuthenticated();
    res.render("signin", { errortext: response });
});


app.get('/auth/google',
    passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/?error=log" }),
    function (req, res) {
        // Successful authentication, redirect secrests page.
        res.redirect('/');
    });


app.get("/", function (req, res) {

    if (req.isAuthenticated()) {

        var accountuser;
        var userid = req.session.passport.user;
        // User.findOne({ _id: userid }, function (err, data) {
        //     // console.log(data);
        //     if (!err) {
        //         accountuser = data.username;
        //     }
        //     else {
        //         accountuser = err;
        //     }
        // })
        User.find({ "secret": { $ne: null } }).sort({ "lastupdate": -1 }).exec(function (err, foundUser) {
            if (err) {
                // console.log(err);
                res.render("errorpage", { message: err });

            }
            else {


                if (foundUser) {
                    // console.log(req.session);
                    res.render("secrets", { usersWithSecrets: foundUser, accountuser: userid });
                }
            }
        })

    }



    else {
        res.redirect("/signin?error=nes");
    }
});



app.get("/allpost", function (req, res) {

    if (req.isAuthenticated()) {

        var userid = req.session.passport.user;
        User.findOne({ _id: userid }, function (err, accountuserdata) {
            // console.log(data);
            if (!err) {

                Post.find({}, (err, data) => {
                    if (!err) {


                        res.render("allpost", { accountuserdata, data });


                    } else {
                        res.render("errorpage", { message: err });
                    }
                })
            }
            else {
                res.render("errorpage", { message: err });


            }
        });

    }
    else {

        res.redirect("/signin?error=post");

    }

})



app.get("/contact", function (req, res) {
    res.render("contact");
});

app.get("/signup", function (req, res) {

    const response = req.query.error;
    res.render("signup", { errortext: response });
});

app.get("/myaccount", function (req, res) {
    if (req.isAuthenticated()) {
        var username = "";
        var firstname = "";
        var lastName = "";
        var username = "";
        var email = "";
        var phone = "";
        var gender = "";

        var userid = req.session.passport.user;
        User.findOne({ _id: userid }, function (err, data) {

            if (!err) {

                username = data.username,
                    firstname = data.firstname,
                    lastName = data.lastName,
                    username = data.username;
                email = data.email,
                    phone = data.phone,
                    gender = data.gender

                res.render("myaccount", { username, firstname, lastName, gender, email, phone, userid, userSecrets: data.secret });


            }
            else {
                res.render("errorpage", { message: err });


            }


        })

    }
    else {

        res.redirect("/signin?error=acc");

    }
})

app.get("/submit", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit");
    }
    else {
        res.redirect("/signin#LoginSignup");
    }
});

app.get("/feedback", function (req, res) {
    res.render("feedback");
});

app.get("/joinus", function (req, res) {
    res.render("joinus");
});

app.get("/error", function (req, res) {

    res.render("errorpage", { message: " error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error error" });

});

app.get("/postDetails", function (req, res) {

    res.render("postDetails");
});



app.get("/postDetails/:postId", function (req, res) {

    const requestedPostId = req.params.postId;

    // User.findOne({ _id: requestedPostId }, function (err, data) {
    //     console.log(data);
    //     res.render("postDetails",{postData:data});
    // })


    if (req.isAuthenticated()) {

        var accountuser;
        var userid = req.session.passport.user;



        User.findOne({ _id: requestedPostId }, function (err, data) {
            if (err) {
                // console.log(err);
                res.render("errorpage", { message: err });

            }
            else {
                if (data) {
                    // console.log(req.session);
                    if (requestedPostId == userid) {
                        accountuser = data.username;
                    }
                    else {
                        accountuser = "Anonymous";
                    }
                    res.render("postDetails", { postData: data, accountuser: accountuser });
                }

            }
        })

    }



    else {
        res.redirect("/signin#LoginSignup");
    }



});

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            // console.log(err);
            res.render("errorpage", { message: err });

        }
        else {
            res.redirect("/signin");

        }
    });
});

app.get("/delete", function (req, res) {
    const requestedUser = req.query.user;
    const requestedPost = req.query.item;
    if (req.isAuthenticated()) {

        User.updateOne({ _id: ObjectId(requestedUser) }, { $pull: { secret: { postId: ObjectId(requestedPost) } } },
            { safe: true, multi: true }, (err) => {
            if (!err) {
            
                Post.findByIdAndDelete(requestedPost, (err) => {
                    
                    if (!err) {
                        console.log("deleted");
                        res.redirect("/myaccount?sucess=true");
                        
                    }
                    else {
                        console.log(err);
                    }
                });

            }
            else {
                console.log(err);
            }
        }
        );

        // User.findById(req.query.user, function (err, foundUser) {
        //     if (err) {
        //         res.render("errorpage", { message: err });
        //     }
        //     else {
        //         if (foundUser) {

        //             foundUser.secret.pull({postId:req.query.item});
        //             console.log(foundUser.secret);
        //             foundUser.save(function () {
        //                 res.redirect("/myaccount");
        //             });
        //         }
        //     }
        // });

    }

    else {
        res.redirect("/signin#LoginSignup");
    }

});




app.post("/updateUserInfo", function (req, res) {
    if (req.isAuthenticated()) {
        const newUserData = {
            firstname: req.body.firstName,
            lastName: req.body.lastName,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone

        }

        User.updateOne({ _id: req.session.passport.user }, { $set: newUserData }, { upsert: true }, function (err) {
            if (!err) {

                res.redirect("/myaccount?status=sucess");

            } else {
                res.render("errorpage", { message: err });
            }
        })

    }
    else {
        res.redirect("/signin");
    }
})


app.post("/submit", function (req, res) {
    const submittedSecrete = {
        userSecretePost: String,
        like:Number,
        postId: String
    }
    const fromto = "/" + req.query.from;
    const postid = ObjectId();
    submittedSecrete.userSecretePost = req.body.secret;
    submittedSecrete.like = 0;
    submittedSecrete.postId = postid;

    User.findById(req.user.id, function (err, foundUser) {
        if (err) {
            res.render("errorpage", { message: err });
        }
        else {
            if (foundUser) {
                foundUser.lastupdate = new Date;
                foundUser.secret.push(submittedSecrete);
                Post.updateOne({ _id: postid }, { $set: {_id: postid, text: req.body.secret, like: 0 } }, { upsert: true }, (err) => {
                    
                    if (!err) {
                        console.log("trending")
                        res.redirect(fromto);
                    }
                    else {
                        console.log(err);
                    }
                })
                foundUser.save(function () {

                });
            }
        }
    });



});



//API LIKE TREND
app.get("/like/:postid", function (req, res) {
    if (req.isAuthenticated()) {


        const fromto = req.query.from;
        Post.updateOne({ _id: req.params.postid}, { $inc: { like: 1 } }, { upsert: true }, function (err) {
            if (!err) {

                // res.redirect(fromto);
                Post.findById(req.params.postid,(err,data)=>{
                    if(!err){
                        res.send({like:data.like});
                    }
                    else{
                        res.redirect(fromto);

                    }
                })
                

            } else {
                res.render("errorpage", { message: err });
            }
        })

    }
    else {
        res.redirect("/signin");
    }
})


app.get("/trend",(req,res)=>{
    Post.find({}).sort({"like":-1}).exec(function (err,data){
        if(!err){
        
            res.send(data.slice(0,10));
        }else{
            res.send({message:"NOT FOUND"});
        }
    })
});






app.post("/signup", function (req, res) {
    const newUser = new User({
        firstname: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        gender: req.body.gender,
        email: req.body.email,
        phone: req.body.phone

    })




    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            // console.log(err);
            res.redirect("/signup?error=exist");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/");
            })
        }
    })




});

app.post("/signin",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/signin?error=log"
    }));





    app.listen(process.env.PORT || 3000, function () {
        console.log("server started on port 3000");
    });
