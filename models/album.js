var mongoose = require("mongoose");

var albumSchema = new mongoose.Schema({
   name: String,
   image: [String],
   imageId: [String],
   description: String,
   createdAt: { type: Date, default: Date.now },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
      firstName: String,
      lastName: String,
      avatar: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Album", albumSchema);