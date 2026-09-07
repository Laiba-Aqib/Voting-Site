const mongoose = require("mongoose"); // mongoose is a driver that helps node js server to communicate with mongoDB server,,as models describe the schema(the way we will store data in database) so nodejs wants to communicate (tell) this schema to mongodb server


const candidateSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    party:{
        type:String,
        required:true
    },
    votes: [   // a candidate might have many votes so we maintain an array of objects (obj because we wnat more then one info on user like his id and at what time he voted)
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true
            },
            votedAt:{
                type:Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
  
})

const candidate = mongoose.model("candidate",candidateSchema);
module.exports = candidate