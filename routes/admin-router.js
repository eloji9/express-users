const express = require("express");

const User = require("../models/user-model.js")

const router = express.Router();

router.get("/admin/users",(req,res,next)=>{
    if (!req.user || req.user.role !== "admin"){
        // "req.flash()" is defined by the "connect-flash" package
        req.flash("error","You must be an admin !");
        // redirect away if you aren't logged in (authorization!)
        res.redirect("/");
        return;
      }
    User.find()
    .then((userResults)=>{
        res.locals.userArray = userResults;
        res.render("admin-views/admin-list.hbs");
    })
    .catch((err)=>{
        next(err);
    })
})


module.exports = router;