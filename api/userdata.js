const express = require('express')
const router = express.Router()
const mysql = require('mysql2')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const dbCon = mysql.createConnection({
    host     : 'localhost',
    user     :'root',
    password : process.env.mysql_pass,
    database:'userdata'
})

router.get('/user',(req,res,next)=>{
    dbCon.query(
        'SELECT * FROM user ',
        function(err, results, fields) {
          console.log(results); // results contains rows returned by server
          console.log(fields); // fields contains extra meta data about results, if available
          res.json({results})
        })
})

router.post('/signup',(req,res,next)=>{
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        dbCon.execute(
            'INSERT INTO user (email, password, fname, lname) VALUES (?,?,?,?)',
            [req.body.email, hash, req.body.fname, req.body.lname],
            function(err, results) {
                if(err){
                    res.json({
                        status:'Error',
                        messege: err
                    })
                    return
                }
                res.json({
                        status:'Ok',
                        messege: results
                })
            })
    })
})

router.post('/login',(req,res,next)=>{
    dbCon.execute(
        'SELECT * FROM user WHERE email = ?',
        [req.body.email],
        function (err, user){
            if(err){
                return res.json({messege:err})
            }
            if (user.length<1){
                return res.json({messege:'Email not found'})
            }
            bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
                if(result){
                    const token = jwt.sign({email: user[0].email},process.env.JWT_key,{expiresIn:'10m'})
                    console.log(token)
                    return res.json({messege:'Login success',Token:token})

                }else{
                    return res.json({messege:"Invalid Password"})
                }
            })
        }
    )
})

router.post('/authen',(req,res,next)=>{
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token,process.env.JWT_key)
        res.json({decode})
    }catch(err){
        res.json({err})
    }

})

module.exports = router