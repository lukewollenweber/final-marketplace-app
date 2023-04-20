const User = require('../models/user')
async function authenticateUser(req,res,next){
    if(!req.session.user_id){
        res.send({"message": "This page requires you to be logged in"})
        // return res.redirect('/')

    }
    req.user = await User.findById(req.session.user_id)

    next()
}
module.exports = authenticateUser