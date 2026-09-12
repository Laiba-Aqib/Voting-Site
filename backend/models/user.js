const mongoose = require("mongoose"); // mongoose is a driver that helps node js server to communicate with mongoDB server,,as models describe the schema(the way we will store data in database) so nodejs wants to communicate (tell) this schema to mongodb server
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String,   //as its a voting app and some people from rural areas might not have email so it should'nt stop them from voting
        unique:true,
        sparse:true
    },
    password:{
        type:String,
        required:true
    },
    cnic:{
        type:Number,
        required:true,
        unique:true
    },
    mobile:{
        type:String,
    },
    address:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["voter","admin"],
        default: "voter"
    },
    isVoted:{
        type:Boolean,
        default:false
    }
})

userSchema.pre("save", async function(){
try{
    const user = this;
    if(!user.isModified("password")){
        return 
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password,salt)
    user.password=hashedPassword;

}catch(err){
     console.log(err)
}
})

userSchema.methods.comparePassword = async function(EnteredPassword){
try{
    const isMatch = await bcrypt.compare(EnteredPassword,this.password);
    return isMatch

}catch(err){
    throw err
}
}

const user = mongoose.model("user",userSchema);
module.exports = user;