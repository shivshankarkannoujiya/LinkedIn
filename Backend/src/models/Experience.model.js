import mongoose from "mongoose"

const experienceSchema = new mongoose.Schema({

    companyName: {
        type: String,
        required: true
    },

    position: {
        type: String,
        required: true
    },

    startDate: {
        type: Date,
        required: false
    },

    endDate: {
        type: Date,
        required: false
    },

    description: {
        type: String,
        required: false
    }

},{timestamps: true})

const Experience = mongoose.model("Experience", experienceSchema)

export {
    Experience
}