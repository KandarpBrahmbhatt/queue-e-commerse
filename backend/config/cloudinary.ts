import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from "fs"
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables robustly using an absolute path to backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const uploadOnCloudinary = async (filePath: string): Promise<UploadApiResponse | null> => {
    // Configure cloudinary (supports both CLOUDINARY_CLOUD_NAME and CLOUDINARY_NAME)
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

    try {
        // Perform the upload
        const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'auto' })
        
        // Remove the local file after successful upload
        fs.unlinkSync(filePath)
        
        // Return the full uploadResult object so that controllers can read .secure_url, .public_id, etc.
        return uploadResult
    } catch (error) {
        // Remove local file if the upload fails
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
        console.error("uploadOnCloudinary error:", error);
        return null;
    }
}

export default uploadOnCloudinary 