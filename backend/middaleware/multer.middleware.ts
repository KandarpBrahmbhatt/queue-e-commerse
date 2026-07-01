import multer from "multer";
import path from "node:path";
import fs from 'fs'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter : multer.Options["fileFilter"] = (req,file,cb) =>{
    const allowedTypes = [
        ".xlsx",
        ".xls",
        ".csv"
    ]

    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(extension)) {
        cb(null,true)
    }else{
        cb(new Error("Only  Excel and csv files are allowed"))
    }
}

const upload = multer({ storage ,fileFilter,limits:{
    fileSize :500 * 1024 * 1024
}});

export default upload;