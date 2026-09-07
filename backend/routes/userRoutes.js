const express = require("express");
const router = express.Router();
const {jwtAuthMiddleware,jwtTokenGenerator} = require("../jwtAuth");

const User = require("../models/user");
const Candidate = require("../models/candidate");


router.post('/signup',async (req,res)=>{
   try{
    const data = req.body;
    const newUser = new User(data);
    const admin = await User.findOne({role:"admin"});
    if(!admin || newUser.role === "voter"){
    const saveUser = await newUser.save();

    const payload = {
        id: saveUser.id,
    };
    
    const token = jwtTokenGenerator(payload);

    console.log("voter was registered successfully!");
    console.log("token: ",token);
    res.status(200).json({response: saveUser, token:token});
    }else{
    console.log("u are not authorized to be the admin as one already exists")
    return res.status(401).json({message:"u are not authorized to be the admin as one already exists"})
    }
   }catch(err){
    console.log("Voter was not saved!",err);
    res.status(401).json({error: "Internl server error"});
   }
});

router.post("/login", async(req,res)=>{
    try{

        const {cnic,password} = req.body;
        const user = await User.findOne({cnic:cnic});
        if(!user || ! (await user.comparePassword(password))){
            return res.status(401).json({message:"Incorrect username or password"})
        }
        const payload = {
            id: user.id,
        };
        console.log(JSON.stringify(payload));
        const token = jwtTokenGenerator(payload);
        console.log(token);
        res.status(200).json({token:token});

    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error"});

    }
})

router.get("/profile",jwtAuthMiddleware,async(req,res)=>{ // if no middlware was placed here then it would have thrown err that /profile does not have auth header..coz jwtAuthmiddleware gives back payload data from token and that data is stored in req.user so here how could req.user get data if not for middeware?
    try{
       // const userData = this.username;
        const userData =  req.user;  // we got req.user from jwt auth file because it contains the payload u sent to create token
        const userId = userData.id;
        const user = await User.findById(userId);
        return res.status(200).json(user);

    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error"});
    }
})

router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
       const {currentPassword,newPassword} = req.body;
       const userId = req.user.id;
       const user = await User.findById(userId);

       if(! user.comparePassword(currentPassword)){
       return  res.status(401).json({message:"Invalid Password"});
       }

       user.password=newPassword;
       await user.save();
       res.status(200).json({message:"password updated successfully"});

    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error"});
    }
})

router.get('/candidates',jwtAuthMiddleware,async(req,res)=>{
    try{
    const data = await Candidate.find();
    console.log("Candidates data successfully sent to u!");
    res.status(200).json(data);
    }catch(err){
        console.log("Candidates data could'nt be sent!");
        res.status(500).json({error: "Internal Server error"});
    }
})

router.post('/vote/:candidateId',jwtAuthMiddleware,async(req,res)=>{

const candidateId = req.params.candidateId;
const userID = req.user.id;
const user = await User.findById(userID);
if(!user){
    return res.status(404).json({message:"user not found"});
}
const candidate = await Candidate.findById(candidateId);
if(!candidate){
    return res.status(404).json({message:"candidate not found"});
}
if(user.role==="admin"){
    return res.status(403).json({message:"Admin is not allowed to vote"})
}
if(user.age<18){
    return res.status(403).json({message:"Under 18's are not allowed to vote"})
}

if(user.isVoted === false){

candidate.votes.push({user:userID});
candidate.voteCount++;
await candidate.save();

user.isVoted = true
await user.save();

res.status(200).json({message:"Vote was casted", candidate:candidate})
}else{
    res.status(409).json({message:"You have already casted a vote "});
}
})

router.get('/vote/count',jwtAuthMiddleware,async(req,res)=>{  //will return all candidates in descending order showing who got the highest votes
    try{
        const candidate = await Candidate.find().sort({voteCount:"desc"});
        //u can simply return the candidate now but it will be holding too much data for user to understand so we will map this data to a smaller way which user can understand
        const preciseData = candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
        })
         res.status(200).json({response:preciseData})

    }catch(err){
        console.log("Candidates data could'nt be sent!");
        res.status(500).json({error: "Internal Server error"});

    }
})


module.exports = router;