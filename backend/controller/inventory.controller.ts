import {Request,Response} from 'express'


export const createInventory  = async(req:Request,res:Response) =>{
    try {
        
    } catch (error:any) {
        console.log(`createInventroy error ${error}`)
        return res.status(500).json({message:"createInventory error",error:error.message})
    }
}