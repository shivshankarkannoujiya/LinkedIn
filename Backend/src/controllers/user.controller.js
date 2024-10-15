import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        //TODO: Save refresh token to db
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access toekn"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // 1. get User details from frontend
    // 2. validation:- not empty
    // 3. Check if User already exist:- username || email
    // 4. create User object :- create entry in DB
    // 5. remove password and refreshToken field from response
    // 6. Check for User creation, is User created Successfully
    // 7. return response if User created, else send Error

    //TODO: get User details from frontend
    const { fullName, email, username, password } = req.body;

    //TODO: validation
    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required !!");
    }

    //TODO: Check if User already exist
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with username or email already Exist");
    }

    // TODO: create User object :- create entry in DB
    const user = await User.create({
        fullName,
        email,
        username,
        password,
    });

    //TODO: Check for User creation, is User created Successfully
    //TODO: remove password and refreshToken field from response

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //TODO: return response if User created, else send Error

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering User");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    /*
    TODO: 
    1. req body
    2. username || email
    3. find the user
    4. password check
    5. access and refresh Token
    6. Send Cookies
    7. Send response
    */

    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credential");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },

                "User loggedIn Successfully"
            )
        );
});

export { registerUser, loginUser };
