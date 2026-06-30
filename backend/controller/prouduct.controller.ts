import { Request, Response } from 'express'
import Product from '../models/product.model'
import mongoose from 'mongoose'
import connection from '../config/redis'
import uploadOnCloudinary from '../config/cloudinary'
import { AssistantStream } from 'openai/lib/AssistantStream'
import { AuthRequest } from '../models/user.model'
import RecentView from '../models/recentView.model'


export const createProudct = async (req: Request, res: Response) => {
    try {
        const { name, slug, description, sku, price, stock, category, images } = req.body
        console.log(req.body)

        if (!name || !slug || !description || !sku || !price || !stock || !category) {
            return res.status(400).json({ meesage: "all field are required" })
        }

        const product = await Product.findOne({ name })

        if (product) {
            return res.status(400).json({ message: "productalready exist" })
        }
//  image upload on cloudinary 
        let imageUrl = "";
        const fileReq = req as any; // typescript ma type assign karvo pade aetale lakhiyu 6e.

        if (fileReq.file) {
            const result = await uploadOnCloudinary(fileReq.file.path);
            imageUrl = result?.secure_url || "";
        }

        const newProduct = await Product.create({
            name, slug, description, sku, price, stock, category,   images: imageUrl ? [imageUrl] : [],
        })

        return res.status(200).json({ message: "product created sucessfully", newProduct })
    } catch (error) {
        console.log("createProduct error", error)
        return res.status(500).json({ message: "created product error", error })
    }
}

export const getAllProduct = async (req: Request, res: Response) => {
    try {

        // pagination
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10

        //search 
        const keyword = req.query.search || "";

        const prouduct = await Product.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })

        if (!prouduct) {
            return res.status(400).json({ message: "product not found" })
        }

        const total = await Product.countDocuments()

        return res.status(200).json({ message: "product getting sucessfully", prouduct, total, totalPages: Math.ceil(total / limit), })
    } catch (error) {
        console.log("getProduct error", error)
        return res.status(500).json({ message: "product getting error", error })
    }
}

export const getCurrentProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // SAVE RECENT VIEW
    if (req.user?.userId) {
      const existing = await RecentView.findOne({
        user: req.user.userId,
        productId: new mongoose.Types.ObjectId(String(id)),
      });

      if (existing) {
        existing.viewAt = new Date();
        await existing.save();
      } else {
        await RecentView.create({
          user: req.user.userId,
          productId: new mongoose.Types.ObjectId(String(id)),
        });
      }
    }

    return res.status(200).json({
      message: "getting currentProduct successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "getting currentProduct error",
      error: error.message,
    });
  }
};
// getRecentview product

export const getRecentViewed = async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.userId

        const recent = await RecentView.find({user:userId})
                .populate("productId")
                .sort({viewAt:-1})
                .limit(10)

                return res.status(200).json({message:"GettingRecentView successfully",recent})
    } catch (error:any) {
        console.log(`getRecentViewed error ${error}`)
        return res.status(500).json({message:"GettingRecentView successfully",error:error.message})
    }
}

export const clearRecentView  = async(req:AuthRequest,res:Response)=>{
    try {
        await RecentView.deleteMany({user:req.user?.userId})

        return res.status(200).json({message:"clearRecentView sucessfully"})
    } catch (error:any) {
        console.log(`clearRecentView error  ${error}`)
        return res.status(500).json({message:"clearRecentView error",error:error.message})
    }
}
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id

        const product = await Product.findByIdAndUpdate(productId, req.body, { new: true })

        if (!product) {
            return res.status(400).json({ message: "product not found", product })
        }

        return res.status(200).json({ message: "productUpdated sucessfully", product })

    } catch (error) {
        console.log("deletedProduct error", error)
        return res.status(200).json({ message: "productUpdated sucessfully", error })

    }
}

export const deletedProduct = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id
        const product = await Product.findByIdAndDelete(productId)

        if (!product) {
            return res.status(200).json({ message: "product not found" })
        }

        return res.status(200).json({ message: "product deleted sucessfully", isDeleted: true })
    } catch (error) {
        console.log("updateProduct error", error)
        return res.status(200).json({ message: "product deleted sucessfully" })
    }
}


export const getAggregationProduct = async (
    req: Request,
    res: Response
) => {
    console.log("API HIT");

    try {
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
        Redis Cache Key
        =====================================
        */

        const cacheKey = `products:
page=${page}:
limit=${limit}:
search=${search || ""}:
category=${category || ""}:
status=${status || ""}:
sortBy=${sortBy}:
sortOrder=${sortOrder}`;

        /*
        =====================================
        Check Redis
        =====================================
        */

        const cached = await connection.get(cacheKey);
if (cached) {
    console.log(" CACHE HIT");

    const redisData = JSON.parse(cached);

    redisData.source = "redis";

    return res.status(200).json(redisData);
}

        console.log(" CACHE MISS");

        /*
        =====================================
        Dynamic Match Object
        =====================================
        */

        const matchStage: any = {
            isDeleted: false,
        };

        /*
        Search
        */

        if (search) {
            matchStage.$text = {
                $search: String(search),
            };
        }

        /*
        Category Filter
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
        Status Filter
        */

        if (status) {
            matchStage.status = status;
        }

        /*
        Sorting
        */

        const sortStage: any = {};

        sortStage[String(sortBy)] =
            sortOrder === "asc" ? 1 : -1;

        /*
        =====================================
        MongoDB Queries
        =====================================
        */

        const total =
            await Product.countDocuments(matchStage);

        const productList =
            await Product.aggregate([
                {
                    $match: matchStage,
                },
                {
                    $sort: sortStage,
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limitNumber,
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                {
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ]);

        const totalPages = Math.ceil(
            total / limitNumber
        );

        /*
        =====================================
        Final Response
        =====================================
        */

        const response = {
            success: true,
            source: "mongodb",
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
        };

        /*
        =====================================
        Save to Redis
        =====================================
        */
await connection.setex(
    cacheKey,
    300,
    JSON.stringify(response),
);

        console.log(" Cached in Redis");

        return res.status(200).json(response);

    } catch (error) {
        console.log(
            "getAggregationProduct error",
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



// export const getAggregationProduct = async (req: Request, res: Response) => {

//     console.log("API HIT")

//     try {
//         /*
        
//                 page       => Current page number
//                 limit      => Records per page
//                 search     => Search by name/description
//                 category   => Category ObjectId
//                 status     => ACTIVE/INACTIVE/DRAFT
//                 sortBy     => price/createdAt/name
//                 sortOrder  => asc/desc
        
//                 Example:
//                 /api/product/get?page=1&limit=10
//                 /api/product/get?search=iphone
//                 /api/product/get?category=123
//                 /api/product/get?sortBy=price&sortOrder=desc
        
//                 */
//         console.log("API HIT");
//         const {
//             page = "1",
//             limit = "10",
//             search,
//             category,
//             status,
//             sortBy = "createdAt",
//             sortOrder = "desc",
//         } = req.query;

//         const pageNumber = Number(page);
//         const limitNumber = Number(limit);

//         const skip = (pageNumber - 1) * limitNumber;

//         const cachekey = `getAggregationProduct${page}:${limit}`
//         const cached  = await connection.get(cachekey)

//         if (cached) {
//             console.log(`cache HIT`)
//             return res.status(200).json({message:"cached Successfully",source:"redis",...JSON.parse(cached)})
//         }
//         console.log("cache MISS")
//         /*
//         =====================================
//         Dynamic Match Object
//         =====================================
//         */

//         const matchStage: any = {
//             isDeleted: false,
//         };

//         /*
//         Search Product
//         Uses Text Index:
//         productSchema.index({
//             name: "text",
//             description: "text"
//         })
//         */

//         if (search) {
//             matchStage.$text = {
//                 $search: String(search),
//             };
//         }

//         /*
//         Filter by Category
//         */

//         if (
//             category &&
//             mongoose.Types.ObjectId.isValid(
//                 String(category)
//             )
//         ) {
//             matchStage.category =
//                 new mongoose.Types.ObjectId(
//                     String(category)
//                 );
//         }

//         /*
//         Filter by Status
//         */

//         if (status) {
//             matchStage.status = status;
//         }

//         /*
//         =====================================
//         Sorting
//         =====================================
//         */

//         const sortStage: any = {};

//         sortStage[String(sortBy)] =
//             sortOrder === "asc" ? 1 : -1;

//         /*
//         =====================================
//         Aggregation Pipeline
//         =====================================
//         */

//         // Count query
//         const total = await Product.countDocuments(matchStage);

//         // Paginated aggregation query
//         const productList = await Product.aggregate([
//             {
//                 $match: matchStage,
//             },
//             {
//                 $sort: sortStage as any,
//             },
//             {
//                 $skip: skip,
//             },
//             {
//                 $limit: limitNumber,
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "category",
//                     foreignField: "_id",
//                     as: "category",
//                 },
//             },
//             {
//                 $unwind: {
//                     path: "$category",
//                     preserveNullAndEmptyArrays: true,
//                 },
//             },
//         ]);

//         const totalPages = Math.ceil(
//             total / limitNumber
//         );

//         /*
//         =====================================
//         Response
//         =====================================
//         */

//         return res.status(200).json({
//             success: true,

//             data: productList,

//             pagination: {
//                 total,
//                 totalPages,
//                 currentPage: pageNumber,
//                 limit: limitNumber,
//                 hasNextPage:
//                     pageNumber < totalPages,
//                 hasPreviousPage:
//                     pageNumber > 1,
//             },
//         });

//     } catch (error) {

//         console.log(
//             "getAllProduct error",
//             error
//         );

//         return res.status(500).json({
//             success: false,
//             message:
//                 "Failed to fetch products",
//             error,
//         });
//     }
// };