let user = require('../models/model.js');
const auth =require('../routes/authRoutes.js');
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');


// REGISTERING
module.exports.register_post =async (req,res) =>{
    try{
        const{username ,email,password ,age} =req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
       
        const myUser =new user({username ,email,password:hashedPassword ,age});
        const saveUser = await myUser.save();
        res.status(201).json(saveUser);
        console.log(user);
    }catch (error){
        console.log('Error while registering', error);
        res.status(401).json({error:error.message});
    }
};



// LOGIN
module.exports.login_post =async (req,res) =>{
    try{
       // const myUser= new user( {email , password});
        const {email , password} =req.body;
        const myUser = await user.findOne({email});
        if (!myUser){
            return res.status(401).json({error:'Invalid email'});
        }
        const isPasswordValid =await bcrypt.compare(password, myUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({error: 'Incorrect password'});
      }

// Accessing token
      const accessToken =jwt.sign({userId: user.id, username: user.username},process.env.jwt_Secret, {expiresIn:'30m'}); 

// Refreshing it
      const refreshToken =jwt.sign({userId: user.id, username: user.username},process.env.jwt_Secret, {expiresIn:'2h'});

// Sending these both      
      res.json({ accessToken,refreshToken });
    } catch(error){
        res.status(400).json({error: error.message});
    }
};



// refresh token 
module.exports.renew_token_post =async (req,res) =>{
    try{ const refreshToken =req.headers.authorization;

    jwt.verify(refreshToken,process.env.jwt_Secret,(err,decoded) =>{                             //verification of refreshToken
        if(err){
            return res.status(401).json({error:'Invalid refresh token'});
        }
                                                                                //generatate access token
const accessToken = jwt.sign({userId: decoded.userId, username:decoded.username},process.env.jwt_Secret, {expiresIn:'1h'});
res.json({accessToken});
    });
} catch (error){
    res.status(400).json({error:error.message});
}
}


// LOGOUT

    module.exports.logout_get =async (req,res) =>{
        try{
            const token = req.header('Authorization').split('')[1];
            res.status(200).json({message:"Logout successfully"});
        } catch(error){
            console.log('Error during logout!', error);
            res.status(500).json({error:'logout failed'});
        }
        };
