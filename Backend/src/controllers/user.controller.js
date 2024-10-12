import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from '../models/User.model.js'


const registerUser = asyncHandler( async (req, res) => {

    // 1. get User details from frontend
    // 2. validation:- not empty
    // 3. Check if User already exist:- username || email
    // 4. create User object :- create entry in DB
    // 5. remove password and refreshToken field from response
    // 6. Check for User creation, is User created Successfully 
    // 7. return response if User created, else send Error
    

    //TODO: get User details from frontend
    const { fullName, email, username, password } = req.body



    //TODO: validation
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required !!")
    }


    //TODO: Check if User already exist
    const existedUser = await User.findOne({
        $or:[{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already Exist")
    }


    // TODO: create User object :- create entry in DB
    const user = await User.create({
        fullName,
        email,
        username,
        password
    })

    //TODO: Check for User creation, is User created Successfully
    //TODO: remove password and refreshToken field from response

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    )
    
    //TODO: return response if User created, else send Error

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering User")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User registered Successfully"
        )
    )
})

export { registerUser }