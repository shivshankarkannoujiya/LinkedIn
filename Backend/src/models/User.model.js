import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'





const userSchema = new mongoose.Schema({

    username: {

        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: [true, "Password is required"]
    },

    experiences: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience"
    }],

    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }],

    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill"
    }],

    refreshToken: {
        type: String
    }

},{timestamps: true})


// encrypting password before saving into db 
userSchema.pre("save", async function(next){

    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


// Comparing password and encrypted password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


// generating Access Token
userSchema.methods.generateAccessToken = function(){

    return jwt.sign(
        {
            // Payload
            _id: this._id,
            username: this.username,
            fullName: this.fullName,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


// generating Refresh Token
userSchema.methods.generateRefreshToken = function(){

    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)

