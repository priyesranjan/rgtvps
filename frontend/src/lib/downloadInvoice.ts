import jsPDF from "jspdf";

interface InvoiceData {
  id: string;
  type: string;
  date: string;
  amount: string;
  investorName?: string;
  investorId?: string;
}

export function downloadInvoicePDF(inv: InvoiceData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // ── Background (dark navy) ──
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, W, 297, "F");

  // ── Gold header bar ──
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, W, 30, "F");

  // ── Company name ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(11, 17, 32);
  doc.text("ROYAL GOLD TRADERS", 14, 20);

  // ── Tagline right-aligned ──
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Patna, Bihar · royalgoldtraders.in", W - 14, 20, { align: "right" });

  // ── Invoice title ──
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(212, 175, 55);
  doc.text("INVOICE", 14, 52);

  // ── Invoice number + date ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(`Invoice No: ${inv.id}`, 14, 62);
  doc.text(`Date: ${inv.date}`, 14, 68);
  doc.text(`Status: Issued & Verified`, 14, 74);

  // ── Divider ──
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(14, 80, W - 14, 80);

  // ── Billed To ──
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text("BILLED TO", 14, 90);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(inv.investorName ?? "Abhishek Kumar", 14, 98);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(`Client ID: ${inv.investorId ?? "RGT-INV-001"}`, 14, 104);
  doc.text("Patna, Bihar, India", 14, 110);

  // ── Table header ──
  doc.setFillColor(20, 30, 55);
  doc.rect(14, 122, W - 28, 10, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(212, 175, 55);
  doc.text("DESCRIPTION", 18, 129);
  doc.text("DATE", 110, 129);
  doc.text("AMOUNT", W - 18, 129, { align: "right" });

  // ── Table row ──
  doc.setFillColor(15, 23, 42);
  doc.rect(14, 132, W - 28, 14, "F");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 220, 220);
  doc.setFontSize(10);
  doc.text(inv.type, 18, 141);
  doc.text(inv.date, 110, 141);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(212, 175, 55);
  doc.text(inv.amount, W - 18, 141, { align: "right" });

  // ── Divider ──
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.line(14, 148, W - 14, 148);

  // ── Total ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 180, 180);
  doc.text("TOTAL AMOUNT DUE", 14, 158);
  doc.setFontSize(18);
  doc.setTextColor(212, 175, 55);
  doc.text(inv.amount, W - 18, 158, { align: "right" });

  // ── Stamp ──
  doc.setFillColor(212, 175, 55, 0.08);
  doc.circle(W / 2, 215, 28, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.circle(W / 2, 215, 28, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(212, 175, 55);
  doc.text("ROYAL GOLD", W / 2, 212, { align: "center" });
  doc.text("TRADERS", W / 2, 218, { align: "center" });
  doc.setFontSize(7);
  doc.text("VERIFIED", W / 2, 224, { align: "center" });

  // ── Footer ──
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 277, W, 20, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(11, 17, 32);
  doc.text("This is a computer-generated invoice and does not require a physical signature.", W / 2, 286, { align: "center" });
  doc.text("Royal Gold Traders · Patna, Bihar · Contact: +91-XXXXX-XXXXX", W / 2, 291, { align: "center" });

  // ── Save ──
  doc.save(`${inv.id}_RGT_Invoice.pdf`);
}
