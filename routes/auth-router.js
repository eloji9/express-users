const express = require("express");
const bcrypt = require("bcrypt");
const passport = require ("passport");

const User = require("../models/user-model.js")

const router = express.Router();

router.get("/signup",(req,res,next)=>{
    res.render("auth-views/signup-form.hbs")
});

router.post("/process-signup", (req,res,next)=>{
    const {fullName,email,originalPassword} = req.body;

    if(originalPassword === "" || originalPassword.match(/[0-9]/) === null){
        req.flash("error", "Password can't be blanck and requires a number (0-9).")
        res.redirect("/signup");
        return;
    }
    const encryptedPassword = bcrypt.hashSync(originalPassword, 10);

    User.create({fullName,email, encryptedPassword})
    .then((userDoc)=>{
        req.flash("success", "Signed up successfully! Try logging in.")
        res.redirect("/");
    })
    .catch((err)=>{
        next(err);
    })
});

router.get("/login",(req,res,next)=>{
    res.render("auth-views/login-form.hbs");
});

router.post("/process-login",(req,res,next)=>{
    // res.send(req.body);
    const {email,loginPassword} = req.body

    User.findOne({email})
    .then((userDoc)=>{
        if (!userDoc){
            req.flash("error", "Your email has not been found in the database")
            res.redirect("/login");
            return;
        }
        const {encryptedPassword} = userDoc;
        if (!bcrypt.compareSync(loginPassword,encryptedPassword)){
            req.flash("error", "The Password is INCORRECT")
            res.redirect("/login");
            return;
        }
        // we are ready to LOG THEM IN if we get here (password was okay too)
        // "req.login()" is a Passport method for loggin in a user
        // (behind the scenes, it calls our "passport.serialize() function")
        req.login(userDoc,()=>{
            req.flash("success", "You are logged in !")
            res.redirect("/");
        })
    })
    .catch((err)=>{
        next(err);
    });
})

router.get("/logout", (req,res,next)=>{
    // "req.logout()" is a Passport method for logging out the user
    req.logout();
    req.flash("success", "You are logged out")
    res.redirect("/");
})

// Link to "/google/login" to start the log in with Google process
router.get("/google/login",
    passport.authenticate("google",{
        scope:[
            "https://www.googleapis.com/auth/plus.login",
            "https://www.googleapis.com/auth/plus.profile.emails.read"
          ]
    }));
router.get("/google/success",
    passport.authenticate("google",{
        successRedirect:"/",
        failureRedirect: "/login",
        successFlash:"Google log in success!",
        failureFlash: "Google log in failure!",
}));


// Link to "/github/login" to start the log in with Github process
router.get("/github/login",passport.authenticate("github"));
router.get("/github/success",
    passport.authenticate("github",{
        successRedirect:"/",
        failureRedirect: "/login",
        successFlash:"Google log in success!",
        failureFlash: "Google log in failure!",

}));



module.exports = router;