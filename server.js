import express from 'express'
const app = express();
import 'dotenv/config'
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
const port = process.env.PORT || 4000

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// ! db connection
const db = async () => {
    try {
        const con = mongoose.connect(process.env.DB)
        if (con) {
            console.log("connected to mongoDB")
        } else {
            console.log("missing connection string")
        }
    } catch (e) {
        console.log(e.message)
    }
}
db()
// ! model

const createModel = new mongoose.Schema({
    user: String,
    email: String,
    mobile: String,
    password: String,
    userProfile: String,
});
const userModel = await mongoose.model("user", createModel)

// * Crud
// * Create
// Resolve public path
// const publicPath = path.resolve(__dirname, "public");
const publicPath = path.join("public/");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, publicPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const userMulter = multer({ storage: storage });

app.post("/createuser", userMulter.single("userProfile"), async (req, res) => {
    const { user, email, mobile, password } = req.body;
    const profile = req.file;
    if (!profile) {
        return res.status(400).json({ message: "Profile upload is required" });
    }
    if (!user || !email || !mobile || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const userData = new userModel({
            user: user,
            email: email,
            mobile: mobile,
            password: password,
            userProfile: profile.filename // Save filename from the uploaded file
        });

        const saveUser = await userData.save();

        if (saveUser) {
            return res.status(201).json({ message: "User created successfully" ,data:saveUser});
        } else {
            return res.status(400).json({ message: "Unable to save user" });
        }
    } catch (e) {
        console.error("Server error:", e.message);
        return res.status(500).json({ message: "Server error" });
    }
});

// ! read data
app.get("/users",async(req,res)=>{

    try{
        const getData=await userModel.find();
        if(!getData)
            return res.status(404).json({message:"data not found"})
        return res.status(200).json({message:getData})
    }catch(e){
       return res.status(500).json({message:e}) 
    }
})
// get by id
app.get("/getone/:id", async(req,res)=>{
    const {id}=req.params;
    // console.log(id)
    if(!id){
        return res.status(400).json({
            message:"id not found"
        })

    }
    if(id){
        try{
            const findone= await userModel.findById(id)
            if(!findone){
                return res.status(400).json({message:"not found user"})
            }
            return res.status(200).json({message:findone})
        }catch(err){
            return res.status(500).json({message:err.message})
        }
    }
    // console.log("rahul")
})

// ! deleter bt user id

app.delete("/delete-user/:userid",async(req,res)=>{
    const {userid} =req.params;

    if(!userid){
        return res.status(404).json({message:"user id not found"})
    }
    try{
        const checkUserId =await userModel.findById(userid)
        if(!checkUserId)
            return res.status(301).json({message:"invalid user id"});
        const deleteUser=await userModel.findOneAndDelete(checkUserId);
        if(!deleteUser)
            return res.status(400).json({message:"cannot delete user"})
            return res.status(200).json({message:"user deleted sucessfully",data:deleteUser})

    }catch(e){
        return res.status(500).json(e)
    }
})




app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})

