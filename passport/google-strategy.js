const passeport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const User = require("../models/user-model.js");

passeport.use(new GoogleStrategy({
    // settings for the strategy
    clientID:process.env.google_id,
    clientSecret:process.env.google_secret,
    callbackURL:"/google/success",
    proxy:true,  // need this for production version to work
},(accessToken, refreshToken, profile, done)=>{
    // what will happen everey time a user logs in with google
    // console.log("GOOGLE profile ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",profile);
    const {id,displayName,emails} = profile;
    User.findOne({
        $or:[
            {googlehubID : id},
            {email : emails[0].value}
        ]
    })
        .then((userDoc)=>{
            if (userDoc) {
                // if user found, already signed up so just log them in
                done(null,userDoc);
                return;
            }
            // Otherwise create a new user account for them before loggin in
            User.create({
                googleID : id,
                fullName : displayName,
                email : emails[0].value,
            })
            .then((userDoc)=>{
                // log in the newly created user
                done(null, userDoc);
            })
            .catch((err)=>{
                done(err);
            })

        })
        .catch((err)=>{
            done(err);
        })
    // done(new Error("fake fail"));
}));