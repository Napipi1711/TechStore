import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const invoiceBill = ({ sale }) => {
  if (!sale) return null;

  const handleExport = () => {
    const doc = new jsPDF();

    // HEADER
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TECHSTORE", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Address: ______________", 14, 28);
    doc.text("Hotline: +1 800-xxxx", 14, 34);

    // INVOICE INFO
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 150, 20);

    doc.setFont("helvetica", "normal");
    doc.text(`Code: ${sale.saleCode || "-"}`, 150, 28);
    doc.text(
      `Date: ${sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "-"}`,
      150,
      34
    );

    // CUSTOMER INFO
    const customer = sale.customer || {};
    doc.setFont("helvetica", "bold");
    doc.text("Customer", 14, 50);

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${customer.name || "Walk-in"}`, 14, 58);
    doc.text(`Phone: ${customer.phone || "N/A"}`, 14, 64);
    doc.text(`Address: ${customer.address || "-"}`, 14, 70);

    // PAYMENT INFO
    const staff = sale.staff || {};
    doc.setFont("helvetica", "bold");
    doc.text("Payment", 120, 50);

    doc.setFont("helvetica", "normal");
    doc.text(`Method: ${sale.paymentMethod || "-"}`, 120, 58);
    doc.text(
      `Date: ${sale.paidAt ? new Date(sale.paidAt).toLocaleString() : "Pending"}`,
      120,
      64
    );
    doc.text(`Staff: ${staff.name || "-"}`, 120, 70);

    // TABLE
    const tableData = (sale.products || []).map((p, i) => [
      i + 1,
      p.name || "-", // đảm bảo có tên
      p.quantity || 0,
      `$${p.price?.toLocaleString() || 0}`,
      `$${((p.price || 0) * (p.quantity || 0)).toLocaleString()}`, // tính total line
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["#", "Product", "Qty", "Price", "Total"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    // TOTAL
    const finalY = doc.lastAutoTable.finalY || 100;
    const totalAmount = (sale.products || []).reduce(
      (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
      0
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Total: $${totalAmount.toLocaleString()}`, 140, finalY + 10);

    // SIGNATURES
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Customer Signature", 20, finalY + 40);
    doc.text("Authorized Signature", 130, finalY + 40);
    doc.text("___________________", 20, finalY + 55);
    doc.text("___________________", 130, finalY + 55);

    // WARRANTY
    const policyY = finalY + 70;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("WARRANTY POLICY:", 14, policyY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const policies = [
      "- Products can be exchanged within 7 days for manufacturing defects.",
      "- Warranty valid only with intact warranty seal and invoice.",
      "- Damage from misuse or water not covered.",
      "- Warranty: 12 months main, 6 months accessories.",
    ];
    policies.forEach((line, index) => doc.text(line, 14, policyY + 6 + index * 5));

    // FOOTER
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your purchase!", 105, policyY + 35, { align: "center" });

    // SAVE PDF
    doc.save(`invoice-${sale.saleCode || "UNKNOWN"}.pdf`);
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

export default invoiceBill;