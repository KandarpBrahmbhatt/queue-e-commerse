import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export const generateInvoice = async (
    order: any,
    user: any
) => {

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const subTotal = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const taxAmount = order.taxAmount || 0;
    const shippingAmount = order.shippingAmount || 0;
    const discountAmount = order.discountAmount || 0;
    const totalAmount = order.totalAmount;

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    const statusColor = order.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b';
    const statusBg = order.paymentStatus === 'PAID' ? '#ecfdf5' : '#fffbeb';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 30px;
          background-color: #ffffff;
          -webkit-print-color-adjust: exact;
        }

        .invoice-container {
          max-width: 100%;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 25px;
          margin-bottom: 30px;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
        }

        .logo {
          font-size: 26px;
          font-weight: 800;
          color: #4f46e5;
          letter-spacing: -0.05em;
          margin-bottom: 8px;
        }

        .company-details {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }

        .invoice-title {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
        }

        .invoice-meta {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          border-radius: 9999px;
          letter-spacing: 0.05em;
        }

        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 35px;
          gap: 20px;
        }

        .billing-card {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          font-size: 13px;
          line-height: 1.6;
          color: #475569;
        }

        .billing-card h3 {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          margin: 0 0 8px 0;
          letter-spacing: 0.05em;
        }

        .billing-card strong {
          color: #0f172a;
          font-size: 14px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        th {
          background-color: #0f172a;
          color: #ffffff;
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        th:first-child {
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
        }

        th:last-child {
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
          text-align: right;
        }

        td {
          padding: 14px 16px;
          font-size: 13px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }

        td.num-col {
          text-align: right;
        }

        .totals-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }

        .totals-table {
          width: 320px;
          margin-bottom: 0;
        }

        .totals-table td {
          padding: 8px 16px;
          border: none;
          font-size: 13px;
          color: #475569;
        }

        .totals-table td.num-col {
          font-weight: 500;
          color: #0f172a;
        }

        .totals-table tr.grand-total td {
          font-size: 16px;
          font-weight: 700;
          color: #4f46e5;
          border-top: 2px solid #e2e8f0;
          padding-top: 12px;
        }

        .totals-table tr.grand-total td.num-col {
          color: #4f46e5;
        }

        .footer {
          text-align: center;
          border-top: 2px solid #f1f5f9;
          padding-top: 25px;
          margin-top: 50px;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }
      </style>
    </head>

    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo-container">
            <span class="logo">QUEUE</span>
            <div class="company-details">
              Queue E-Commerce Inc.<br/>
              123 Tech Park, Suite 500<br/>
              Bangalore, KA 560001<br/>
              support@queue-ecommerce.com
            </div>
          </div>
          <div style="text-align: right;">
            <h1 class="invoice-title">INVOICE</h1>
            <div class="invoice-meta">
              <div><strong>Invoice No:</strong> ${order.orderNumber || order._id}</div>
              <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style="margin-top: 8px;">
                <span class="status-badge" style="background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                  ${order.paymentStatus || 'PENDING'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="billing-section">
          <div class="billing-card">
            <h3>Billed To</h3>
            <strong>${user.name}</strong><br/>
            Email: ${user.email}<br/>
            Customer ID: ${user._id}
          </div>
          <div class="billing-card" style="text-align: right;">
            <h3>Payment Details</h3>
            <strong>Method:</strong> Card / Online Checkout<br/>
            <strong>Currency:</strong> INR (₹)<br/>
            <strong>Order Status:</strong> ${order.orderStatus || 'PENDING'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td style="font-weight: 500;">${item.product?.name || item.name || "Product Item"}</td>
                <td style="text-align: center; color: #475569;">${item.quantity}</td>
                <td class="num-col">${formatCurrency(item.price)}</td>
                <td class="num-col" style="font-weight: 500;">${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals-wrapper">
          <table class="totals-table">
            <tr>
              <td>Subtotal</td>
              <td class="num-col">${formatCurrency(subTotal)}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr>
              <td>Discount</td>
              <td class="num-col" style="color: #10b981;">-${formatCurrency(discountAmount)}</td>
            </tr>
            ` : ''}
            ${taxAmount > 0 ? `
            <tr>
              <td>Tax</td>
              <td class="num-col">${formatCurrency(taxAmount)}</td>
            </tr>
            ` : ''}
            ${shippingAmount > 0 ? `
            <tr>
              <td>Shipping</td>
              <td class="num-col">${formatCurrency(shippingAmount)}</td>
            </tr>
            ` : ''}
            <tr class="grand-total">
              <td>Grand Total</td>
              <td class="num-col">${formatCurrency(totalAmount)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for shopping with Queue E-Commerce!</p>
          <p style="font-size: 10px; margin-top: 5px;">If you have any questions about this invoice, please contact support@queue-ecommerce.com</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(html, {
        waitUntil: "load",
    });

    const invoicesDir = path.join(process.cwd(), "invoices");

    if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir);
    }

    const pdfPath = path.join(
        invoicesDir,
        `invoice-${order._id}.pdf`
    );

    await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
    });

    await browser.close();

    return pdfPath;
};