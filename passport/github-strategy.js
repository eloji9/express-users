const passport = require("passport");
const GithubStrategy = require("passport-github").Strategy;

const User = require("../models/user-model.js");

passport.use(new GithubStrategy({
    clientID:process.env.github_id,
    clientSecret:process.env.github_secret,
    callbackURL:"/github/success",
    proxy:true,
},(accessToken,refreshToken,profile,done)=>{
    // console.log("GITHUB profile ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",profile);
    const {id, username, displayName, emails} = profile;
    let email = `${username}@github.com`;
    if (emails){
        email = email[0].value;
    }

    User.findOne({
        $or:[
            {githubID : id},
            {email}
        ]
    })
        .then((userDoc)=>{
            if (userDoc) {
                // if user found, already signed up so just log them in
                done(null,userDoc);
                return;
            }

            let fullName = username;

            if (displayName){
                fullName = displayName;
            }

            User.create({githubID : id, fullName, email})
            .then((userDoc)=>{
                done(null,userDoc);
            })
            .catch((err)=>{
                done(err);
            })
        })
        .catch((err)=>{
            done(err);
        });
            // done(new Error("fake fail"));
}));