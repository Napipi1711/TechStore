import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportRevenueExcel = (data) => {
    if (!data || data.length === 0) {
        alert("Không có dữ liệu!");
        return;
    }

    const formatted = data.map((item, index) => ({
        STT: index + 1,
        "Mã đơn": item.saleCode || "",
        "Ngày thanh toán": item.paidAt
            ? new Date(item.paidAt).toLocaleString()
            : "",
        "Chi nhánh": item.branchName || "",
        "Sản phẩm": item.productName || "",
        "Số lượng": item.quantity || 0,
        "Giá bán": item.price || 0,

        "Doanh thu": item.revenue || 0,
        "Lợi nhuận": item.profit || 0,
    }));


    const worksheet = XLSX.utils.json_to_sheet(formatted);

    const wscols = Object.keys(formatted[0]).map(() => ({ wch: 20 }));
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    saveAs(
        new Blob([excelBuffer]),
        `Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
};