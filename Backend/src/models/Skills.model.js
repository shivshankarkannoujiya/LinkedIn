import mongoose from "mongoose"

const skillSchema = new mongoose.Schema({

    skillName: {
        type: String
    }

}, {timestamps: true})

const Skill = mongoose.model("Skill", skillSchema)

export {
    Skill
}