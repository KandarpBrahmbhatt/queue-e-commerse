import { Request, Response } from 'express'
import ExcelJS from "exceljs"
import fs from "fs"
import { exportProducts } from '../services/productimportfile.service'
import Product from "../models/product.model";
// export const importProducts = async(req:Request,res:Response)=>{
//     try {
//         if (!req.file) {
//             return res.status(400).json({message:"please upload a file"})
//         }

//         return res.status(200).json({message:"product import sucessfully",file:req.file.filename})
//     } catch (error:any) {
//         console.log(`ProductImport error ${error}`)
//         return res.status(500).json({message:"importProducts error",error:error.messsage})
//     }
// }


export const ExportExcel = async (req: Request, res: Response) => {
    try {
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="products.xlsx"'
        );

        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const query: any = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.category) {
            query.category = req.query.category;
        }

        await exportProducts(res, { limit, query });
    } catch (err) {
        console.log(err);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Export failed",
            });
        }
    }
};


export const importExcleProducts = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an Excel file",
            });
        }

        const stream = fs.createReadStream(req.file.path);
        const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(stream, {
            entries: 'emit',
        });

        let totalImported = 0;
        let batch: any[] = [];
        const BATCH_SIZE = 1000;

        for await (const worksheetReader of workbookReader) {
            for await (const row of worksheetReader) {
                if (row.number === 1) continue;

                const getVal = (cellIndex: number) => {
                    const cell = row.getCell(cellIndex);
                    if (cell && typeof cell.value === 'object' && cell.value !== null) {
                        if ('text' in cell.value) {
                            return (cell.value as any).text;
                        }
                        if ('result' in cell.value) {
                            return (cell.value as any).result;
                        }
                    }
                    return cell ? cell.value : undefined;
                };

                const name = getVal(1);
                if (!name) continue;

                batch.push({
                    name: String(name || "").trim(),
                    slug: String(getVal(2) || "").trim(),
                    description: String(getVal(3) || "").trim(),
                    shortDescription: getVal(4) ? String(getVal(4)).trim() : undefined,
                    sku: String(getVal(5) || "").trim(),
                    price: Number(getVal(6) || 0),
                    discountPrice: getVal(7) ? Number(getVal(7)) : undefined,
                    currency: String(getVal(8) || "INR").trim(),
                    stock: Number(getVal(9) || 0),
                    sold: Number(getVal(10) || 0),
                    category: String(getVal(11) || "").trim(),
                    images: String(getVal(12) || "")
                        .split(",")
                        .map((img) => img.trim())
                        .filter(Boolean),
                    status: String(getVal(13) || "ACTIVE").trim(),
                });

                if (batch.length >= BATCH_SIZE) {
                    await Product.insertMany(batch);
                    totalImported += batch.length;
                    batch = [];
                }
            }
        }

        if (batch.length > 0) {
            await Product.insertMany(batch);
            totalImported += batch.length;
        }

        // Clean up the uploaded file to save disk space
        try {
            fs.unlinkSync(req.file.path);
        } catch (err) {
            console.error("Failed to delete temp upload file:", err);
        }

        return res.status(200).json({
            message: "Products imported successfully",
            total: totalImported,
        });
    } catch (error: any) {
        // Clean up file if error occurs
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {}
        }
        return res.status(500).json({
            message: error.message,
        });
    }
};