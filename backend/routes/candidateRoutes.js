const express = require("express");
const router = express.Router();
const {jwtAuthMiddleware,jwtTokenGenerator} = require("../jwtAuth");
const User = require("../models/user");
const Candidate = require("../models/candidate");

const checkForAdmin = async (userId)=>{
    try{
    const user = await User.findById(userId);
    return user.role === "admin"

    }catch(err){
        return false
    }
}
router.post('/',jwtAuthMiddleware,async(req,res)=>{
    if(! await checkForAdmin(req.user.id))
        return res.status(401).json({message:"this User does not have an admin role"});

   try{
    const data = req.body;
    const newCandidate = await Candidate(data);
    const saveCandidate = await newCandidate.save()

    res.status(200).json({response:saveCandidate});
    console.log("candidate saved sucessfully");
   }catch(err){
    console.log(err);
    res.status(500).json({message:"Internal Server Error"});

   }

})

router.put('/:candidateId',jwtAuthMiddleware, async (req,res)=>{

 try{
    if(! await checkForAdmin(req.user.id))
      return res.status(401).json({message:"this User does not have an admin role"});

  const candidateId = req.params.candidateId;
  const newData = req.body;
  const updated_candidate = await Candidate.findByIdAndUpdate(candidateId,newData,{
    new:true, // to return the new updated data as a response
    runValidators:true //asking mongoose to validate if every data entered is acc to schema
  });
  if(!updated_candidate){
    return res.status(401).json({message:"no candidate with such id was found"})
  }
  res.status(200).json({message:"candidate info was updated",response:updated_candidate});
 }catch(err){
 console.log(err);
 res.status(500).json({message:"Internal Server Error"});
 }
})

router.delete('/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    try{
    if(! await checkForAdmin(req.user.id))
       return res.status(401).json({message:"this User does not have an admin role"});

    const candidateId = req.params.candidateId;
    const deleted_person = await Candidate.findByIdAndDelete(candidateId);

     if(!deleted_person){
            console.log("no person with this id was found!");
            res.status(404).json({message:"Person not found can't delete"});
        }

    res.status(200).json({message:"Candidate deleted successfully!"});

    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error"});

    }
})

module.exports=router;