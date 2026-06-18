import {Request,Response} from 'express'
import Product from '../models/product.model'
import mongoose from 'mongoose'


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





export const getAggregationProduct = async (req: Request,res: Response) => {


    try {
/*

        page       => Current page number
        limit      => Records per page
        search     => Search by name/description
        category   => Category ObjectId
        status     => ACTIVE/INACTIVE/DRAFT
        sortBy     => price/createdAt/name
        sortOrder  => asc/desc

        Example:
        /api/product/get?page=1&limit=10
        /api/product/get?search=iphone
        /api/product/get?category=123
        /api/product/get?sortBy=price&sortOrder=desc

        */

        const {
            page = "1",
            limit = "10",
            search,
            category,
            status,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const skip = (pageNumber - 1) * limitNumber;

        /*
        =====================================
        Dynamic Match Object
        =====================================
        */

        const matchStage: any = {
            isDeleted: false,
        };

        /*
        Search Product
        Uses Text Index:
        productSchema.index({
            name: "text",
            description: "text"
        })
        */

        if (search) {
            matchStage.$text = {
                $search: String(search),
            };
        }

        /*
        Filter by Category
        */

        if (
            category &&
            mongoose.Types.ObjectId.isValid(
                String(category)
            )
        ) {
            matchStage.category =
                new mongoose.Types.ObjectId(
                    String(category)
                );
        }

        /*
        Filter by Status
        */

        if (status) {
            matchStage.status = status;
        }

        /*
        =====================================
        Sorting
        =====================================
        */

        const sortStage: any = {};

        sortStage[String(sortBy)] =
            sortOrder === "asc" ? 1 : -1;

        /*
        =====================================
        Aggregation Pipeline
        =====================================
        */

        const products = await Product.aggregate([

            /*
            Apply Filters
            */
            {
                $match: matchStage,
            },

            /*
            Populate Category
            */
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },

            /*
            Convert Category Array to Object
            */
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },

            /*
            Sorting
            */
            {
                $sort: sortStage,
            },

            /*
            Pagination + Total Count
            */
            {
                $facet: {

                    /*
                    Product List
                    */
                    products: [
                        {
                            $skip: skip,
                        },
                        {
                            $limit: limitNumber,
                        },
                    ],

                    /*
                    Total Count
                    */
                    totalCount: [
                        {
                            $count: "count",
                        },
                    ],
                },
            },
        ]);

        /*
        =====================================
        Extract Result
        =====================================
        */

        const productList =products[0].products;

        const total =products[0].totalCount[0]?.count || 0;

        const totalPages = Math.ceil(
            total / limitNumber
        );

        /*
        =====================================
        Response
        =====================================
        */

        return res.status(200).json({
            success: true,

            data: productList,

            pagination: {
                total,
                totalPages,
                currentPage: pageNumber,
                limit: limitNumber,
                hasNextPage:
                    pageNumber < totalPages,
                hasPreviousPage:
                    pageNumber > 1,
            },
        });

    } catch (error) {

        console.log(
            "getAllProduct error",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch products",
            error,
        });
    }
};