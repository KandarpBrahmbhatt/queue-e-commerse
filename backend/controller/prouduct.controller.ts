import {Request,Response} from 'express'
import Product from '../models/product.model'


export const createProudct = async(req:Request,res:Response)=>{
    try {
        const {name,slug,description,sku,price,stock,category,images} = req.body
        console.log(req.body)

        if (!name || !slug || !description ||!sku ||!price ||!stock ||!category) {
            return res.status(400).json({meesage:"all field are required"})
        }

        const product  = await Product.findOne({name})

        if (product) {
            return res.status(400).json({message:"productalready exist"})
        }

        const newProduct = await Product.create({
            name,slug,description,sku,price,stock,category,images
        })

        return res.status(200).json({message:"product created sucessfully",newProduct})
    } catch (error) {
        console.log("createProduct error",error)
        return res.status(500).json({message:"created product error",error})
    }
}

export const getAllProduct = async(req:Request,res:Response)=>{
    try {

        // pagination
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10

        //search 
        const keyword  = req.query.search || "";

        const prouduct = await Product.find()
            .skip((page-1) * limit)
            .limit(limit)
            .sort({createdAt:-1})

        if (!prouduct) {
            return res.status(400).json({message:"product not found"})
        }
        
        const total = await Product.countDocuments()

        return res.status(200).json({message:"product getting sucessfully",prouduct,total,totalPages: Math.ceil(total / limit),})
    } catch (error) {
        console.log("getProduct error",error)
        return res.status(500).json({message:"product getting error",error})
    }
}


export const updateProduct = async(req:Request,res:Response)=>{
    try {
        const productId = req.params.id

        const product  = await Product.findByIdAndUpdate(productId,req.body,{new:true})

        if (!product) {
            return res.status(400).json({message:"product not found",product})
        }

        return res.status(200).json({message:"productUpdated sucessfully",product})

    } catch (error) {
        console.log("deletedProduct error",error)
        return res.status(200).json({message:"productUpdated sucessfully",error})

    }
}

export const deletedProduct = async(req:Request,res:Response)=>{
    try {
        const productId = req.params.id
        const product = await Product.findByIdAndDelete(productId)

        if (!product) {
            return res.status(200).json({message:"product not found"})
        }

        return res.status(200).json({message:"product deleted sucessfully",isDeleted:true})
    } catch (error) {
        console.log("updateProduct error",error)
        return res.status(200).json({message:"product deleted sucessfully"})
    }
}
