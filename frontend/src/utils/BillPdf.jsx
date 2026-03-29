import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BillPdf = ({ sale }) => {
    if (!sale) return null;

    const handleExport = () => {
        const doc = new jsPDF();

        // ===== HEADER =====
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("TECHSTORE ", 14, 20);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Address: ______________", 14, 28);
        doc.text("Hotline: +1 800-xxxx", 14, 34);

        // ===== INVOICE INFO =====
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE", 150, 20);

        doc.setFont("helvetica", "normal");
        doc.text(`Code: ${sale.saleCode}`, 150, 28);
        doc.text(
            `Date: ${new Date(sale.createdAt).toLocaleDateString()}`,
            150,
            34
        );

        // ===== CUSTOMER =====
        doc.setFont("helvetica", "bold");
        doc.text("Customer", 14, 50);
        doc.setFont("helvetica", "normal");
        doc.text(
            `Name: ${sale.customerName || "Walk-in"}`,
            14,
            58
        );
        doc.text(
            `Phone: ${sale.customerPhone || "N/A"}`,
            14,
            64
        );
        doc.text(`Address: ${sale.customerAddress || "__________________"}`, 14, 70);
        // ===== PAYMENT =====
        doc.setFont("helvetica", "bold");
        doc.text("Payment", 120, 50);

        doc.setFont("helvetica", "normal");
        doc.text(`Method: ${sale.paymentMethod}`, 120, 58);
        doc.text(
            `Date: ${sale.paidAt
                ? new Date(sale.paidAt).toLocaleString()
                : "Pending"
            }`,
            120,
            64
        );
        doc.text(`Staff: ${sale.staffName}`, 120, 70);

        // ===== TABLE =====
        const tableData = sale.products.map((p, i) => [
            i + 1,
            p.productName,
            p.quantity,
            `$${p.price}`,
            `$${p.lineTotal}`,
        ]);

        autoTable(doc, {
            startY: 80,
            head: [["#", "Product", "Qty", "Price", "Total"]],
            body: tableData,
            styles: {
                fontSize: 10,
            },
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
            },
        });

        // ===== TOTAL =====
        const finalY = doc.lastAutoTable.finalY || 100;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(
            `Total: $${sale.totalAmount}`,
            140,
            finalY + 10
        );

        // ===== SIGN =====
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        doc.text("Customer Signature", 20, finalY + 40);
        doc.text("Authorized Signature", 130, finalY + 40);

        doc.text("___________________", 20, finalY + 55);
        doc.text("___________________", 130, finalY + 55);

        const policyY = finalY + 70; // Vị trí bắt đầu của chính sách

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("WARRANTY POLICY:", 14, policyY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const policies = [
            "- Products can be exchanged within 7 days for manufacturing defects.",
            "- Warranty is only valid with an intact warranty seal and this invoice.",
            "- We do not cover damage caused by physical impact, water, or misuse.",
            "- Warranty period: 12 months for main hardware, 6 months for accessories."
        ];

        // In từng dòng chính sách
        policies.forEach((line, index) => {
            doc.text(line, 14, policyY + 6 + (index * 5));
        });

        // ===== FOOTER (ĐẨY XUỐNG DƯỚI CHÍNH SÁCH) =====
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(
            "Thank you for your purchase! See you again.",
            105,
            policyY + 35,
            { align: "center" }
        );

        // SAVE
        doc.save(`invoice-${sale.saleCode}.pdf`);
    };

    return (
        <button
            onClick={handleExport}
            style={{
                padding: "10px 15px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
            }}
        >
            EXPORT PDF
        </button>
    );
};

export default BillPdf;