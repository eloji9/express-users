const express = require("express");

const router = express.Router();

const Room = require("../models/room-model.js")

// To upload a file !
// ------------------------------------
const multer = require("multer");
const cloudinary = require("cloudinary")
const cloudinaryStorage = require ("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.cloudinary_name,
    api_key:process.env.cloudinary_key,
    api_secret:process.env.cloudinary_secret,
})

const storage =
    cloudinaryStorage({
        cloudinary,
        folder: "room-pictures"
    });
const uploader = multer({storage});

// ------------------------------------




router.get("/room/add",(req,res,next)=>{
    if (!req.user){
        // "req.flash()" is defined by the "connect-flash" package
        req.flash("error","You must be logged in!");
        // redirect away if you aren't logged in (authorization!)
        res.redirect("/login");
        return;
      }
    res.render("room-views/room-form.hbs")
});

router.post("/process-room", uploader.single("pictureUpload"), (req,res,next)=>{

    // res.send(req.file);
    // return;

    if (!req.user){
        // "req.flash()" is defined by the "connect-flash" package
        req.flash("error","You must be logged in!");
        // redirect away if you aren't logged in (authorization!)
        res.redirect("/login");
        return;
      }

    const {name,desc,pictureUrl} = req.body;
    const {secure_url} = req.file;
    Room.create({
        owner : req.user._id,
        name,
        desc,
        pictureUrl : secure_url})
    .then((roomDoc)=>{
        req.flash("success", "Room created !")
        res.redirect("/");
    })
    .catch((err)=>{
        next(err);
    })
});

router.get("/my-rooms",(req,res,next)=>{
    if (!req.user){
        // "req.flash()" is defined by the "connect-flash" package
        req.flash("error","You must be logged in!");
        // redirect away if you aren't logged in (authorization!)
        res.redirect("/login");
        return;
      }
    Room.find({owner : req.user._id})
    .then((roomResults)=>{
        res.locals.roomArray = roomResults;
        res.render("room-views/room-list.hbs");
    })
    .catch((err)=>{
        next(err);
    })
})

module.exports = router;