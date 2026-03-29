import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Export sales data to Excel
 * @param {Array} sales - array of objects { saleCode, paidAt, branchName, productName, quantity, price, cost, revenue, profit }
 * @param {Object} filter - { from, to } for sheet name
 */
export const exportRevenueExcel = async (sales, filter = {}) => {
    if (!sales || sales.length === 0) {
        alert("Không có dữ liệu bán hàng!");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheetName = filter.from && filter.to ? `Bao_Cao_${filter.from}_${filter.to}` : "Bao_Cao_Doanh_Thu";
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = [
        { header: "Mã đơn", key: "saleCode", width: 15 },
        { header: "Sản phẩm", key: "productName", width: 25 },
        { header: "Số lượng", key: "quantity", width: 12 },
        { header: "Đơn giá ($)", key: "price", width: 15 },
        { header: "Thành tiền ($)", key: "revenue", width: 15 },
        { header: "Lợi nhuận ($)", key: "profit", width: 15 },
        { header: "Chi nhánh", key: "branchName", width: 20 },
        { header: "Ngày bán", key: "paidAt", width: 18 },
    ];

    for (let s of sales) {
        worksheet.addRow({
            saleCode: s.saleCode,
            productName: s.productName,
            quantity: s.quantity,
            price: s.price,
            revenue: s.revenue,
            cost: s.cost,
            profit: s.profit,
            branchName: s.branchName,
            paidAt: new Date(s.paidAt).toLocaleDateString(),
        });
    }

    // format header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { name: "Times New Roman", size: 13, bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F2F2F2" } };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    worksheet.eachRow((row, idx) => {
        if (idx === 1) return;
        row.font = { name: "Times New Roman", size: 13 };
        row.alignment = { vertical: "middle", horizontal: "center" };
        row.eachCell((cell, colNumber) => {
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            if ([4, 5, 6, 7].includes(colNumber)) cell.numFmt = '"$"#,##0';
        });
        row.height = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${sheetName}.xlsx`);
};