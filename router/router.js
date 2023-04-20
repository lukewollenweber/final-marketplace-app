const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const router = express.Router()

const authenticateUser = require('../middleware/authenticator')

router.get('/',(req,res)=>{
    //renders home file with Home as locals variable
   res.render('home',{title:"Home"})

})







//Start of the new code


//post request for users
//returns indiviudal user from the request body
router.post('/users/register',async (req,res)=>{
    //new user is made from body of request
    const user = new User(req.body)
    //saves to the db unless an error is thrown 
    try{
        const hashedPW = await bcrypt.hash(user.password,8)
        user.password = hashedPW
        const u = await user.save()
        return res.send(u)
   }catch(error){
        res.redirect('/')
   }
 })

 router.post('/users/login',async (req,res)=>{
    //new user is made from body of request
    try{
        const user = await User.findOne({user_name:req.body.user_name})
        if(!user){
            console.log("Auth error")
            return res.send("Auth error")
            // return res.redirect('/')
        }

        const isMatch = await bcrypt.compare(req.body.password,user.password)
        if(!isMatch){
            console.log("Auth error")
            res.send("Auth error")
            res.send({message: "Error logging in. Incorrect username/password"})
            return res.redirect('/')
        }
        req.session.user_id = user._id
        return res.send({message: "Successfully logged in. Welcome " + user.name})


    } catch(err){
        console.log("Login error")
        return res.send("Login Error")
        // res.redirect('/users/login')
    }
 })

 //get request for users
//  app.get('/users',(req,res)=>{
//     //find method with no arguments (returns entire collection)
//     User.find({},(error,result)=>{
//         if(error){
//             res.send(error)
//         }
//         else{
//             //result shows up in postman
//             res.send(result)
//         }
           
//     })
//  })
//get method for users, username in params
router.get('/users/me',authenticateUser,async(req,res)=>{
    //sets user name to params
    // let user_name = req.params.user_name
    //fidn method in user, uses param as the key, populates the products virtual fields
    // const userPage = User.findOne({user_name:req.user.user_name}).populate('products').exec((error,result)=>{
    //     if(error){
    //         res.send(error)
    //     }
    //     else{
    //         //sends (shows up on postmant)
    //         res.send(result)
    //     }
           
    // })


    // const userPage = await User.findOne({user_name:req.user.user_name}).populate('products')
    // if (!userPage) {
    //     console.log("Error showing page")
    // }
    // else {
    //     res.send(req.user.user_name + "'s page successfully shown")

    // }
    const result = await req.user.populate('products')
    if (!result) {
        console.log("error retrieving products")
        return res.send("error retrieving products")
    }
    else {
        return res.send(result)
    }

    // res.send(req.user.user_name + "'s page successfully shown")

    
 })

 router.post('/users/logout',authenticateUser,async(req,res)=>{
    //sets user name to params
    // let user_name = req.params.user_name
    //fidn method in user, uses param as the key, populates the products virtual fields
    const result = await req.session.destroy(()=>{
        console.log('Logged out successfully')
        res.send("logged out successfully")
        // res.redirect('/users/login')
    })
    if (!result) {
        console.log("logout error")
        return res.send("logout error")
        
    }
    else {
        return res.send("Successfully logged out " + req.user.name)
    }

    
 })
 
//delet method for users, username as param
router.delete('/users/me',authenticateUser,async (req,res)=>{
    //owner = empty object
    // let owner = {}
    //finds user based on username as key
    // console.log(req.user)



    // const findUser = await User.findOne({user_name:req.user.user_name})
    // if (!findUser) {
    //     console.log("Error finding user")
    //     return res.send("Error finding user")
    // }



    // User.findOne({user_name:req.user.user_name},(error,result)=>{
    //     if(error){
    //         res.send("Error with finding user")
    //     }
    //     else{
    //         //if no error sets owner ot the result
    //         owner = result
    //     }
           
    // })
    const deleteProducts = await Product.deleteMany({owner:req.user.id})
    if (!deleteProducts) {
        console.log("Error deleting products")
        return res.send("Error deleting products")
    }
    const result = await req.session.destroy()
    if (!result) {
        console.log("logout error")
        return res.send("logout error")
        
    }
  
    const deleteUser = await User.deleteOne({user_name:req.user.user_name})
    if (!deleteUser) {
        console.log("Error deleting user")
        return res.send("Error deleting user")
    }
    else {
        return res.send({message: "Successfully deleted user " + req.user.user_name})
    }
    //deletes all posts from product that have an id in owner tha tmatches the owner objects id
    // Product.deleteMany({owner:owner._id},(error,result)=>{
    //     if (error) {
    //         res.send("error with deleting products")
    //     }
    //     else {
    //         //if no error with posts then deletes the user, with username as param using deleteOne method
    //         User.deleteOne({user_name:req.params.user_name},(error,result)=>{
    //             if (error) {
    //                 res.send("error with deleting user")
    //             }
    //             else {
    //                 //success if no error
    //                 res.send("Success")
    //             }
    //         })
    //     }
    // })
})
//post request for products
router.post('/products',authenticateUser,async (req,res)=>{
    //seller equals request's body
    // let seller = req.body.seller
    //find method using the seller var above as the key

    const product = new Product({name:req.body.name,price:req.body.price,owner:req.user.id})
    const saved = await product.save()
    if (!saved) {
        console.log("Error saving product")
        return res.send("Error saving product")
    }
    else {
        return res.send(saved)
    }


    // User.findOne({user_name:req.user.user_name},(error,result)=>{
    //     if(error){
    //         res.send(error)
    //     }
    //     //if no error
    //     else{
    //         // console.log(result._id)
    //         //creates a new product using the name, price, and ownwer's id as params
    //         const product = new Product({name:req.user.name,price:req.user.price,owner:result._id})
    //         //save method to send it to the db
    //         product.save((error,result)=>{
    //         if (error) {
    //             res.send(error)
    //         }
    //         else {
    //             //if no error shows the new product
    //             res.send(result)
    //         }
    // })
    //     }
           
    // })
    
 })
//get meothd for all procuts
router.get('/products',async(req,res)=>{
    //find method on all products, returns entire collection
    const productList = await Product.find({})
    if (!productList) {
        console.log("Error showing products")
        return res.send("Error showing products")
    }
    else {
        return res.send(productList)
    }
 })

//buy method, post request
router.post('/products/buy',authenticateUser, async (req,res)=>{
    //empty objects ofr item, seller, buyer
    let item = {}
    let seller = {}
    let buyer = req.user
    const selectedProduct = await Product.findOne({_id:req.body.productID})
    if (!selectedProduct) {
        console.log("Error finding product")
        return res.send("Error finding product")
    }
    item = selectedProduct
    let idString = item.owner.toString()
    const foundSeller = await User.findOne({_id:idString})
    if (!foundSeller) {
        console.log("Error finding seller")
        return res.send("Error finding seller")
    }
    seller = foundSeller
    if (seller._id.toString() === buyer._id.toString()) {
        return res.send("buyer already owns the item")
    }
    else {
        //if not that check, checks if the price is greater than balcne and returns the according statemnet
    if (buyer.balance < item.price) {
        return res.send("balance isn't enough")
    }
    else {
        //no checks were caught
        //sets balance variables for the buyer and seller based on adding or subbing item price
        let newBalanceBuyer = buyer.balance - item.price
        let newBalanceSeller = seller.balance + item.price

    const updatedBuyer = await User.updateOne({user_name:buyer.user_name},{balance:newBalanceBuyer})
    if (!updatedBuyer) {
        console.log("Error updating buyer")
        return res.send("Error updating buyer")
    }
    const updatedSeller = await User.updateOne({user_name:seller.user_name},{balance:newBalanceSeller})
    if (!updatedSeller) {
        console.log("Error updating seller")
        return res.send("Error updtating seller")
    }
    const updatedProduct = await Product.updateOne({owner:seller._id},{owner:buyer._id})
    if (!updatedProduct) {
        console.log("Error updating product")
        return res.send("Error updating product")
    }
    else {
        return res.send("Transaction successful")
    }
}
}
})

    //finds the user whos usernmae matches the user name in body (buyer)
    // User.findOne({user_name:req.body.user_name},(error,result)=>{
    //     if (error) {
    //         res.send("buyer doesn't exist")
    //     }
    //     else {
    //         //if no error, sets buyer object to rhe object returned in result
    //         buyer = result
    //         // console.log("buyer is " + buyer.user_name)
    //         //findone method to find the product, again uses param from body
    //         Product.findOne({_id:req.body.productID},(error,result)=>{
    //             if (error) {
    //                 res.send("item doesn't exist")
    //             }
    //             else {
    //                 //if no error sets item object to object from result
    //                 item = result
    //                 // console.log(item.owner)
    //                 //sets the id as a string
    //                 let idString = item.owner.toString()
    //                 // console.log(idString)
    //                 //fineone method using id string as the id
    //                 User.findOne({_id:idString},(error,result)=>{
    //                     if (error) {
    //                         res.send("couldn't find seller")
    //                     }
    //                     else {
    //                         //if no error sets seller object to results return value
    //                         // console.log(result)
    //                         seller = result
    //                         // console.log("seller is " + seller)
    //                         //checks the seller and buyer object's id values (if equal returns statemnt)
    //                         if (seller._id.toString() === buyer._id.toString()) {
    //                             res.send("buyer already owns the item")
    //                         }
    //                         else {
    //                             //if not that check, checks if the price is greater than balcne and returns the according statemnet
    //                         if (buyer.balance < item.price) {
    //                             res.send("balance isn't enough")
    //                         }
    //                         else {
    //                             //no checks were caught
    //                             //sets balance variables for the buyer and seller based on adding or subbing item price
    //                             let newBalanceBuyer = buyer.balance - item.price
    //                             let newBalanceSeller = seller.balance + item.price
    //                             //updates teh buyers balance, using the username as a key and passing  in new balance
    //                             User.updateOne({user_name:buyer.user_name},{balance:newBalanceBuyer},(error,result)=>{
    //                                 if (error) {
    //                                     res.send(error)
    //                                 }
    //                                 //if no error
    //                                 else {
    //                                     //update method on seller, same as buyer but with the according username and new seller balance
    //                                     User.updateOne({user_name:seller.user_name},{balance:newBalanceSeller},(error,result)=>{
    //                                         if (error) {
    //                                             res.send(error)
    //                                         }
    //                                         else {
    //                                             //if no error
    //                                             //updates teh product using the sellers id to find it, and sets it to the buyers id
    //                                             Product.updateOne({owner:seller._id},{owner:buyer._id},(error,result)=>{
    //                                                 if (error) {
    //                                                     res.send(error)
    //                                                 }
    //                                                 else {
    //                                                     //no errors thrown or cases matched so postman shows a successful purchases
    //                                                     res.send("Purchase successful")
    //                                                 }
    //                                             })
    //                                         }
    //                                     })
    //                                 }
    //                             })

    //                         }
    //                     }
    //                 }
    //                 })
    //             }
    //         })
    //     }
    // })
//  })

//delete method for producgs, wtih id as a param
router.delete('/products/:_id',authenticateUser, async (req,res)=>{
    let productToDelete = await Product.findOne({_id:req.params._id})
    if (!productToDelete) {
        console.log("Error finding product")
        res.send("Error finding product")
    }
    console.log(productToDelete)
    let idStr = productToDelete.owner.toString()
    let owner = await User.findOne({_id:idStr})
    if (!owner) {
        console.log("Error finding owner")
        res.send("Error finding owner")
    }
    if (req.user._id.toString() !== owner._id.toString()) {
        res.send("User doesn't own the item")
        console.log("User doesn't own the item")
    }
    else {
    let deletedItem = await Product.deleteOne({_id:req.params._id})
    if (!deletedItem) {
        res.send("Error deleting the item")
        console.log("Error deleting the item")
    }
    else {
        res.send("Succsessfully deleted item")
    }
}

   //delete one method, uses id passed in params to match id key
    // Product.deleteOne({_id:req.params._id},(error,result)=>{
    //     if (error) {
    //         res.send("error with deleting products")
    //     }
    //     //if no error
    //     else {
    //         //delete one method alled, uses username as key and params username  to c heck
    //         User.deleteOne({user_name:req.params.user_name},(error,result)=>{
    //             if (error) {
    //                 res.send("error with deleting product")
    //             }
    //             else {
    //                 //if no error shows result (deleted successfully)
    //                 res.send(result)
    //             }
    //         })
    //     }
    // })
})
 
//summary method, get request
router.get('/summary',async (req,res)=>{
    //uses a find method that populates teh products virutal field as well
    let collection = await User.find({}).populate('products')
    if (!collection) {
        return res.send("Error retrieving data")
    }
    else {
        return res.send(collection)
    }
 })


 module.exports = router




//End of new code
//below is the code from the original




//  app.post('/',(req,res)=>{
//     //redirects to the home route
//     res.redirect('/')
//         //renders home file with Home as locals variable
//     res.render('home',{title:"Home"})
//  })

// //login url add on
// app.get('/login',(req,res) => {
//     //if the login is invalid then presents a new page with the login error shown
//     if(req.query.invalid === "true") {
//         //renders page, login is locals value
//         res.render('login_error',{title:"Login"})
//     }
//     else {
//         //renders regular login page
//         res.render('login',{title:"Login"})
//     }
// })
// //post route for login
// app.post('/login',(req,res) => {
//     //calls userLogin method using req and res as params
//     userLogin(req,res)
// })
// //register route
// app.get('/register',(req,res) => {
//     //shows the register error page if the invalid id is shown
//     if(req.query.invalid === "true") {
//         //register error is rendered and register is the locals title
//         res.render('register_error',{title:"Register"})
//     }
//     else {
//         //shows the regular register page 
//         res.render('register',{title:"Register"})
//     }
// })
// //post route for register 
// app.post('/register',(req,res) => {
//     //calls registerUser
//     registerUser(req,res)
// })
// //route for user page (username is parameter from url)
// app.get('/user/:username',(req,res)=>{
//     //calls findUser method to set to curUser
//     let curUser = findUser(req.params.username)
//     //creates user variable from readFile method
//     let users = readFile()
//     //renders user page with username and users array as locals variables
//     res.render('user',{user:curUser,users:users,title:"User Page"})
//  })
//  //post request for user page
//  app.post('/user/:username',(req,res)=>{
//     //current user is again set with findUser method
//     let curUser = findUser(req.params.username)
//     //item id is pulled from the page (item which is selected)
//     let item_id = req.body.item
//     //send data method using buy item returl value as parameter
//     sendData(buyItem(curUser,item_id))
//     //sets users variable again 
//     let users = readFile()
//     //updates curUser so the new items show up when bought
//     curUser = findUser(req.params.username)
//     //renders user page with users and cur user as locals variable
//     res.render('user',{user:curUser,users:users,title:"User Page"})
//  })

// /* Basic 404 response*/
// //if none of the otehr page requests are valid
// app.get('/*',(req,res)=>{
//     res.status(404)
//     res.type('txt')
//     res.write("Oops, this page does not exist")
//     res.send()
// })
// //findUser funciton with username as parameter
// function findUser(username) {
//     //sets users variable
//     let users = readFile()
//     //loops thorugh the users array
//     for (let i = 0; i < users.length; i++) {
//         //checks to see if the username matches the intput parameter
//         if (users[i].user_name === username) {
//             //returns user object
//            return users[i]
//         }
//     }
// }
// //registerUser function
// function registerUser(req,res) {
//     //pulls username from page
//     let user_name = req.body.username
//     //pulls name from page
//     let name = req.body.name
//     //pulls balance from page
//     let balance = req.body.balance
//     //file set to teh output of the readFile method 
//     let users = readFile()
//     //bool var
//     let found = false
//     //for loop to iterate through and check username
//     for (let i = 0; i < users.length; i++) {
//         if (users[i].user_name === user_name) {
//             //updates bool var
//             res.redirect('/register?invalid=true')
//             found = true
//             break
//         }
//     }
//     //if statement runs if bool still false
//     if (found === false) {
//         //empty user object
//         let user  = {}
//         //sets username to username held in the arg parameter
//         user.user_name = user_name
//         //sets name to the name held in the arg parameter
//         user.name = name
//         //checks if balance manually entered
//         if (balance === "" || balance === undefined) {
//             user.balance = 100
//         }
//         else {
//             //sets balance to balance of arg
//         user.balance = balance
//         }
//         //sets items as an array
//         user.items = new Array()
//         //push method pushes user object to array
//         users.push(user)
//         //sendData method call using the file as a parameter
//         sendData(users)
//         res.redirect(`/user/${user_name}`)
        
//     }
// }
// //userLogin function
// function userLogin(req,res) {
//     //pulls username from the page
//     let user_name = req.body.username
//     //readFile method call set to users variable
//     let users = readFile()
//     //bool var
//     let found = false
//     //for loop to iterate through and check username
//     for (let i = 0; i < users.length; i++) {
//         if (users[i].user_name === user_name) {
//             //updates bool var
//             found = true
//             break
//         }
//     }//if statement to check found variable
//     if (found === true) {
//         //redirects ot user page with username passes as an argumnet in the url
//         res.redirect(`/user/${user_name}`)
//     }
//     //if not true
//     else if (found === false) {
//         //reidrecs to the login page with invalid being true
//         res.redirect('/login?invalid=true')
//     }
// }

// function readFile(){
//     //input file var using fs function and set to a string
//     let inputFile = fs.readFileSync('users.json').toString()
//     //if statement to check length
//     if (inputFile.length === 0) {
//         //sets var for empty array
//         let arr = []
//         //return empty arr variable
//         return arr
//     }
//     //else if not 0
//     else {
//         //sets users to a JSON object parsed from input file
//         let users = JSON.parse(inputFile)
//         //returns object
//         return users
//     }
// }
// //sends it to the json file
// //writes the data  
// function sendData(users){
//     //object that calls stringify method on the users (passed from parameters)
//     let JSONstr =JSON.stringify(users)
//     //fs funciton to write to json file we created
//     fs.writeFileSync('users.json',JSONstr)
// }
// //buyItem function
// function buyItem(selectedUser,id) {
//      //users set to readFile return value
//      let users = readFile()
//      //temporary variables for user later
//      let itemIndex
//      let buyerIndex
//      let sellerIndex
//      //loops through users array and finds the index of the buyer
//      for (let i = 0; i < users.length; i++) {
//         if (users[i].user_name === selectedUser.user_name) {
//             buyerIndex = i
//         }
//      }
//      //loops through the array and checks the id of the items for each user
//     for (let x = 0; x < users.length; x++) {
//         for (let y = 0; y < users[x].items.length; y++) {
//             //checks id case
//             if (users[x].items[y].item_id == id) {
//                 //sets variables for later use as references outsid eloops 
//                 sellerIndex = x
//                 itemIndex = y
//             }    
//         }
//     }
//          //updates the balance of the buyer
//          users[buyerIndex].balance =  users[buyerIndex].balance - users[sellerIndex].items[itemIndex].item_price
//          //updates seller balance
//          users[sellerIndex].balance =  users[sellerIndex].balance + users[sellerIndex].items[itemIndex].item_price
//          //adds item to buyer array
//          users[buyerIndex].items.push(users[sellerIndex].items[itemIndex])
//          //removes item from seller
//          users[sellerIndex].items.splice(itemIndex,1)
//          //updates the json file and infomrs of a successful trnaasation
//          sendData(users)
//          return users
// }