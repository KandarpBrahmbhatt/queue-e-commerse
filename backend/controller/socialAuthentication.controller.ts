import jwt from "jsonwebtoken";
import User from "../models/user.model"


export const googleLogin = async(profile: any) =>{
    const {id,name,emails,photos} = profile

    const email = emails?.[0]?.value

    let user = await User.findOne({email}) as any

    if (user) {
        user.providers = user.providers || {};
        user.providers.google = {
            id,
            email
        }

        if(!user.name) user.name = name
        if(!user.avatar) user.avatar = photos?.[0]?.value

        await user.save()
    }else{
        user = await User.create({
            name,
            email,
            avatar:photos?.[0]?.value,
            providers:{
                google:{id,email}
            }
        } as any)
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET || "fallback_secret",{
        expiresIn:"7d"
    })

    return  {user,token}
}