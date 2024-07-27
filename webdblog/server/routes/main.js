const express= require('express');
const router=express.Router();
const post = require('../models/post');


router.get('',async(req,res)=>{
try{
    const data=await post.find();
    res.render('./layouts/index',{data});
}catch(error){
    console.log("error");
}
});

function insertpostdata(){
    post.insertMany([{
        username:"bulding a blog",
        password:"this the body text"
    }]);
} 
insertpostdata();
router.get('/about',(req,res)=>{
    res.render('./layouts/about');
});

module.exports=router;