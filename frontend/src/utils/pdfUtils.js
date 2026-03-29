import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export sales data to PDF (English)
 * @param {Array} sales - array of objects { saleCode, paidAt, branchName, productName, quantity, price, revenue, profit }
 * @param {Object} filter - { from, to } for title
 */
export const exportRevenuePDF = (sales, filter = {}) => {
    if (!sales || sales.length === 0) {
        alert("No sales data available!");
        return;
    }

    const doc = new jsPDF();

    // Header
    doc.setFont("times");
    doc.setFontSize(16);
    const title = filter.from && filter.to
        ? `Sales Report from ${filter.from} to ${filter.to}`
        : "Sales Report";
    doc.text(title, 14, 20);

    // Prepare table data
    const tableData = sales.map((s) => [
        s.saleCode || "",
        s.productName || "",
        s.quantity || 0,
        (s.price || 0).toLocaleString("en-US", { style: "currency", currency: "USD" }),
        (s.revenue || 0).toLocaleString("en-US", { style: "currency", currency: "USD" }),
        (s.profit || 0).toLocaleString("en-US", { style: "currency", currency: "USD" }),
        s.branchName || "",
        new Date(s.paidAt).toLocaleDateString("en-US"),
    ]);

    // Generate table
    autoTable(doc, {
        head: [["Order ID", "Product", "Qty", "Unit Price", "Total", "Profit", "Branch", "Sale Date"]],
        body: tableData,
        startY: 30,
        headStyles: { fillColor: [242, 242, 242], textColor: [0, 0, 0], fontStyle: "bold" },
        styles: { font: "times", fontSize: 10, cellPadding: 3 },
        columnStyles: {
            3: { halign: "right" }, // Unit Price
            4: { halign: "right" }, // Total
            5: { halign: "right" }  // Profit
        },
        theme: "grid",
    });

    doc.save(`Sales_Report_${filter.from || ""}_${filter.to || ""}.pdf`);
};