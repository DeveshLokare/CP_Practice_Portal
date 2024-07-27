const mongoose = require('mongoose');
const { type } = require('os');
const schema =mongoose.Schema;
const postschema = new schema({
    username:{
       type : String ,
       required:true
    },
     password:{
           type : String,
            required:true
     },
     createdat:{
      type:Date,
      default:Date.now
     },
     updatedat:{
      type:Date,
      defualt:Date.now
     }
});


module.exports =mongoose.model('post',postschema);