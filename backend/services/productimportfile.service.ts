import Exceljs from "exceljs"
import Product from "../models/product.model";

export const exportProducts = async (stream: any, options: { limit?: number; query?: any } = {}) => {
    const workbook = new Exceljs.stream.xlsx.WorkbookWriter({
        stream: stream,
        useStyles: true,
    });
    const worksheet = workbook.addWorksheet("products");
  
    worksheet.columns = [
        { header: "Name", key: "name", width: 30 },
        { header: "Slug", key: "slug", width: 45 },
        { header: "Description", key: "description", width: 85 },
        { header: "Short Description", key: "shortDescription", width: 85 },
        { header: "SKU", key: "sku", width: 35 },
        { header: "Price", key: "price", width: 15 },
        { header: "Discount Price", key: "discountPrice", width: 15 },
        { header: "Currency", key: "currency", width: 10 },
        { header: "Stock", key: "stock", width: 10 },
        { header: "Sold", key: "sold", width: 10 },
        { header: "Category", key: "category", width: 20 },
        { header: "Images", key: "images", width: 40 },
        { header: "Status", key: "status", width: 15 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.commit();

    let mongooseQuery = Product.find(options.query || {}).lean();
    if (options.limit) {
        mongooseQuery = mongooseQuery.limit(options.limit);
    }
    const cursor = mongooseQuery.cursor();

    for await (const product of cursor) {
        worksheet.addRow({
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDescription: product.shortDescription,
            sku: product.sku,
            price: product.price,
            discountPrice: product.discountPrice,
            currency: product.currency,
            stock: product.stock,
            sold: product.sold,
            category: product.category,
            images: (product.images || []).join(","),
            status: product.status,
        }).commit();
    }

    worksheet.commit();
    await workbook.commit();
}