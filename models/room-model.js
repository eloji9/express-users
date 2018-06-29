const mongoose      = require("mongoose");

const Schema        = mongoose.Schema;

const roomSchema = Schema({
    // document structure
    name:  {type : String, required :true},
    desc:  {type : String, required :true},
    pictureUrl: {type : String, required :true},
    owner: {
        type : Schema.Types.ObjectId,
        ref : "User", // tells Mongoose that this ID connects to the User model
        required : true,
    }
  }, {
    timestamps: true
});

const Room          = mongoose.model("Room", roomSchema);

module.exports      = Room;