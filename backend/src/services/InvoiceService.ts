import { prisma } from "../lib/prisma";
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

export class InvoiceService {
  /**
   * Generates the HTML for a GST Tax Invoice based on a Gold Advance record.
   */
  static async generateGoldAdvanceInvoiceHtml(advanceId: string) {
    console.log(`📄 [InvoiceService] Generating Gold Advance invoice for ID: ${advanceId}`);
    const advance = await prisma.goldAdvance.findUnique({
      where: { id: advanceId },
      include: { user: true }
    });

    // Fetch the performer from the transaction table
    const transaction = await prisma.transaction.findFirst({
      where: { entityId: advanceId, type: "DEPOSIT" },
      include: { performedBy: true }
    });
    const performedByName = transaction?.performedBy?.name || "System Automated";

    if (!advance) {
      console.error(`❌ [InvoiceService] Gold Advance not found for ID: ${advanceId}`);
      throw new Error("Gold Advance not found");
    }

    return await this.generateCommonHtml({
      id: advanceId,
      invoiceNo: advance.invoiceNo,
      type: "Advance Amount Paid for Future Gold Purchase Agreement / भविष्य में सोना खरीदने हेतु अग्रिम राशि अनुबंध",
      date: advance.createdAt,
      user: advance.user,
      amount: Number(advance.advanceAmount),
      description: "Gold Advance Deposit (NotePro GS8000V)",
      hsn: "847290",
      refLabel: "Advance ID",
      isTaxable: true,
      performedByName,
      verificationUrl: `http://localhost:4000/api/gold-advances/${advanceId}/invoice`
    });
  }

  /**
   * Generates the HTML for a Withdrawal Payment Voucher.
   */
  static async generateWithdrawalInvoiceHtml(withdrawalId: string) {
    console.log(`📄 [InvoiceService] Generating Withdrawal voucher for ID: ${withdrawalId}`);
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    });

    // Fetch the performer (Admin who approved) from the transaction table
    const transaction = await prisma.transaction.findFirst({
      where: { entityId: withdrawalId, type: "WITHDRAWAL" },
      include: { performedBy: true }
    });
    const performedByName = transaction?.performedBy?.name || "System Automated";

    if (!withdrawal) {
      console.error(`❌ [InvoiceService] Withdrawal not found for ID: ${withdrawalId}`);
      throw new Error("Withdrawal not found");
    }

    return await this.generateCommonHtml({
      id: withdrawalId,
      invoiceNo: withdrawal.invoiceNo,
      type: "WITHDRAWAL VOUCHER",
      date: withdrawal.createdAt,
      user: withdrawal.user,
      amount: Number(withdrawal.amount),
      description: `Withdrawal Payout (Source: ${withdrawal.source})`,
      hsn: "NIL",
      refLabel: "Withdrawal ID",
      isTaxable: false,
      performedByName,
      verificationUrl: `http://localhost:4000/api/withdrawal-requests/${withdrawalId}/invoice`
    });
  }

  /**
   * Legacy method for compatibility
   */
  static async generateInvoiceHtml(id: string) {
    return this.generateGoldAdvanceInvoiceHtml(id);
  }

  private static async generateCommonHtml(data: {
    id: string;
    invoiceNo: number;
    type: string;
    date: Date;
    user: any;
    amount: number;
    description: string;
    hsn: string;
    refLabel: string;
    isTaxable: boolean;
    performedByName: string;
    verificationUrl: string;
  }) {
    // ── Fetch Global Settings ────────────────────────────────────────────────
    let settings = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = { id: "default", showGST: true, gstPercentage: 18.0 } as any;
    }

    const showGST = settings!.showGST;
    const gstPercent = Number(settings!.gstPercentage); // e.g. 18
    const gstRate = gstPercent / 100;
    const halfGst = gstPercent / 2; // CGST = SGST = half of total
    
    const totalAmount = data.amount;
    
    // For non-taxable (withdrawals) OR if GST is disabled by admin, tax is 0
    const applyTax = data.isTaxable && showGST;

    const taxableAmt = applyTax ? Number((totalAmount / (1 + gstRate)).toFixed(2)) : totalAmount;
    const cgstAmt = applyTax ? Number((taxableAmt * (gstRate / 2)).toFixed(2)) : 0;
    const sgstAmt = applyTax ? Number((taxableAmt * (gstRate / 2)).toFixed(2)) : 0;
    const totalTax = Number((cgstAmt + sgstAmt).toFixed(2));
    
    // Adjust for rounding
    const finalTotal = taxableAmt + cgstAmt + sgstAmt;
    const diff = Number((totalAmount - finalTotal).toFixed(2));
    const adjustedTaxable = taxableAmt + diff;

    const amountInWords = this.numberToWords(totalAmount);
    const paddedInvoiceNo = `RGT-${String(data.invoiceNo).padStart(6, '0')}`;

    const dateStr = new Date(data.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, "-");

    const timeStr = new Date(data.date).toLocaleTimeString("en-IN", {
      hour: '2-digit',
      minute: '2-digit'
    });

    // ── Load Logo ───────────────────────────────────────────────────────────
    let logoBase64 = "";
    let logoMimeType = "image/png"; // Default to PNG
    try {
      // Prefer PNG logo as it's much smaller than the current SVG (577KB vs 4.3MB)
      let logoPath = path.join(__dirname, "../../../frontend/public/RoyalGoldTrader-Logo.png");
      
      // In production (__dirname = backend/dist/src/services), we need 4 levels up
      if (!fs.existsSync(logoPath)) {
        logoPath = path.join(__dirname, "../../../../frontend/public/RoyalGoldTrader-Logo.png");
      }

      // Fallback to SVG if PNG is missing
      if (!fs.existsSync(logoPath)) {
        logoPath = path.join(__dirname, "../../../frontend/public/RoyalGoldTrader-Logo.svg");
        if (!fs.existsSync(logoPath)) {
          logoPath = path.join(__dirname, "../../../../frontend/public/RoyalGoldTrader-Logo.svg");
        }
        if (fs.existsSync(logoPath)) {
            logoMimeType = "image/svg+xml";
        }
      }
      
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = logoData.toString('base64');
      } else {
        console.warn("⚠️ [InvoiceService] Logo file not found at any expected path");
      }
    } catch (error) {
      console.error("❌ [InvoiceService] Error loading logo:", error);
    }

    // ── Generate QR Code ─────────────────────────────────────────────────────
    let qrBase64 = "";
    try {
      qrBase64 = await QRCode.toDataURL(data.verificationUrl, {
        margin: 1,
        width: 100,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error("❌ [InvoiceService] QR Generation failed:", err);
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.type} - ${paddedInvoiceNo}</title>
    <style>
        :root {
            --bg-body: #f4f4f4;
            --bg-invoice: #ffffff;
            --bg-header: #ffffff;
            --bg-section-alt: #fafafa;
            --bg-muted: #f9f9f9;
            --bg-table-header: #f0f0f0;
            --text-primary: #1a1a1a;
            --text-header: #000000;
            --text-secondary: #333333;
            --text-muted: #666666;
            --text-ultra-muted: #999999;
            --text-accent: #058c42;
            --border-primary: #000000;
            --border-secondary: #dddddd;
            --border-gold: #d4af37;
            --qr-bg: #ffffff;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg-body: #0a0f16;
                --bg-invoice: #111827;
                --bg-header: #1f2937;
                --bg-section-alt: #111827;
                --bg-muted: #1f2937;
                --bg-table-header: #374151;
                --text-primary: #f3f4f6;
                --text-header: #ffffff;
                --text-secondary: #d1d5db;
                --text-muted: #9ca3af;
                --text-ultra-muted: #6b7280;
                --text-accent: #10b981;
                --border-primary: #374151;
                --border-secondary: #1f2937;
                --border-gold: #fbbf24;
                --qr-bg: #ffffff; /* Keep QR white for scanning */
            }
            .logo-img { filter: brightness(1.2); }
            .invoice-box { border-color: var(--border-gold) !important; box-shadow: 0 0 20px rgba(212, 175, 55, 0.1); }
        }

        @media print {
            :root {
                --bg-body: #ffffff;
                --bg-invoice: #ffffff;
                --bg-header: #ffffff;
                --bg-section-alt: #ffffff;
                --bg-muted: #ffffff;
                --bg-table-header: #f0f0f0;
                --text-primary: #000000;
                --text-header: #000000;
                --text-secondary: #1a1a1a;
                --text-muted: #444444;
                --text-ultra-muted: #666666;
                --text-accent: #000000;
                --border-primary: #000000;
                --border-secondary: #cccccc;
                --border-gold: #000000;
                --qr-bg: #ffffff;
            }
            .logo-img { filter: none !important; }
            .invoice-box { border: 1.5px solid #000 !important; box-shadow: none !important; }
            body { background: #fff !important; }
        }

        @page { size: A4; margin: 8mm; }
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: var(--text-primary); background: var(--bg-body); font-size: 10.5pt; line-height: 1.35; -webkit-font-smoothing: antialiased; }
        .invoice-box { width: 100%; max-width: 210mm; margin: auto; padding: 0; border: 1.5px solid var(--border-primary); box-sizing: border-box; background: var(--bg-invoice); border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        /* Layout Sections */
        .section { display: flex; border-bottom: 1px solid var(--border-primary); }
        .col { flex: 1; padding: 12px; }
        .col-border { border-right: 1px solid var(--border-primary); }
        
        /* Responsive Overrides */
        @media screen and (max-width: 768px) {
            body { padding: 10px; font-size: 10pt; }
            .invoice-box { border: none; border-radius: 0; }
            .section { flex-direction: column; border-bottom: none; }
            .col-border { border-right: none; border-bottom: 1px solid var(--border-secondary); }
            
            .header { flex-direction: column; }
            .logo-container { width: 100% !important; border-right: none; border-bottom: 1px solid var(--border-primary); padding: 20px; }
            .logo-img { max-height: 80px; width: auto; }
            .header-title { padding: 15px; border-bottom: 1px solid var(--border-primary); }
            .header-right { width: 100% !important; border-left: none !important; border-bottom: 1px solid var(--border-primary); text-align: center !important; }
            
            .totals-section { flex-direction: column; }
            .totals-right { border-left: none; border-top: 1.5px solid var(--border-primary); }
            
            .footer-cols { flex-direction: column; }
            .footer-cols > div { border-right: none; border-left: none; border-bottom: 1px solid var(--border-primary); padding: 15px !important; }
            .footer-cols > div:last-child { border-bottom: none; }
            
            .qr-area { width: 100% !important; border-right: none !important; display: flex !important; flex-direction: row !important; align-items: center !important; gap: 15px; }
            .qr-area img { width: 60px !important; height: 60px !important; }
            
            table { font-size: 9pt; }
            .items-table th:nth-child(1), .items-table td:nth-child(1) { width: 30px; }
            .items-table th:nth-child(3), .items-table td:nth-child(3),
            .items-table th:nth-child(4), .items-table td:nth-child(4) { width: 80px; }
            
            .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
        
        /* Header */
        .header { align-items: stretch; background: var(--bg-header); }
        .logo-container { width: 140px; padding: 15px; display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--border-primary); }
        .logo-img { width: 100%; height: auto; object-fit: contain; }
        .header-title { flex: 2; padding: 15px; display: flex; flex-direction: column; justify-content: center; }
        .seller-info h1 { margin: 0; font-size: 22pt; font-weight: 800; letter-spacing: 1px; color: var(--text-header); text-transform: uppercase; }
        .seller-info p { margin: 2px 0; font-size: 8.5pt; color: var(--text-secondary); font-weight: 500; }

        /* Tables */
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid var(--border-primary); padding: 8px; text-align: left; overflow: hidden; }
        th { background: var(--bg-table-header); color: var(--text-header); font-weight: bold; font-size: 9pt; text-transform: uppercase; }
        
        .items-table th:nth-child(1) { width: 45px; }
        .items-table th:nth-child(2) { width: auto; }
        .items-table th:nth-child(3) { width: 140px; }
        .items-table th:nth-child(4) { width: 160px; }
        
        /* Totals */
        .totals-section { display: flex; border-bottom: 1px solid var(--border-primary); }
        .totals-left { flex: 1.8; padding: 12px; }
        .totals-right { flex: 1.2; border-left: 1px solid var(--border-primary); }
        .totals-right table td { border: none; border-bottom: 1px solid var(--border-secondary); padding: 7px 15px; font-size: 9.5pt; color: var(--text-primary); }
        .totals-right table tr:last-child { border-top: 2px solid var(--border-primary); font-weight: bold; background: var(--bg-section-alt); }
        .totals-right table tr:last-child td { border-bottom: none; font-size: 13pt; padding: 10px 15px; color: var(--text-header); }

        /* Footer */
        .footer-cols { display: flex; min-height: 110px; }
        .qr-area { width: 100px; padding: 10px; display: flex; flex-direction: column; align-items: center; border-right: 1px solid var(--border-primary); }
        .qr-placeholder { width: 80px; height: 80px; border: 1px solid var(--border-secondary); display: flex; align-items: center; justify-content: center; font-size: 7pt; text-align: center; background: var(--qr-bg); color: #000; margin-bottom: 5px; }
        
        .bold { font-weight: bold; }
        .center { text-align: center; }
        .right { text-align: right; }
        .uppercase { text-transform: uppercase; }
        
        @media print {
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
            .invoice-box { border: 1.5px solid #000; width: 100%; height: auto; }
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <!-- HEADER -->
        <div class="section header">
            <div class="logo-container">
                <img class="logo-img" src="data:${logoMimeType};base64,${logoBase64}" alt="Royal Gold Traders Official Logo">
            </div>
            <div class="header-title">
                <div class="seller-info">
                    <h1>ROYAL GOLD TRADERS</h1>
                    <p>B-19, 2nd Floor, Above Airtel Office, PC Colony, Near Lohiya Park, Kankarbagh, Patna – 800020, Bihar, India</p>
                    <p><span class="bold">GSTIN:</span> 10ADJPI8137N1ZE | <span class="bold">Email:</span> support@royalgoldtraders.com</p>
                    <p style="margin-top: 5px; font-weight: bold; color: var(--text-header); font-size: 8pt;">Nature of Business: Sale of 24 Carat (999 Purity) Gold Coins</p>
                </div>
            </div>
            <div class="header-right" style="flex: 1.5; text-align: right; padding: 15px; border-left: 1.5px solid var(--border-primary); background: var(--bg-muted); display: flex; flex-direction: column; justify-content: center;">
                <h2 style="margin: 0; color: var(--text-header); font-size: 11pt; font-weight: 800; text-transform: uppercase; line-height: 1.2;">${data.type}</h2>
                <div style="margin-top: 6px; border-top: 1px solid var(--border-secondary); padding-top: 6px;">
                    <p style="margin: 0; font-size: 8.5pt; font-weight: bold; color: var(--text-muted);">REF NO: <span style="color: var(--text-header); font-size: 10.5pt;">${paddedInvoiceNo}</span></p>
                </div>
            </div>
        </div>

        <!-- DETAILS -->
        <div class="section" style="background: var(--bg-section-alt); font-size: 10pt;">
            <div class="col col-border">
                <p><strong>Transaction ID:</strong> <span style="font-family: monospace; font-size: 9pt;">${paddedInvoiceNo}</span></p>
                <p><strong>Date:</strong> ${dateStr} &nbsp;|&nbsp; <strong>Time:</strong> ${timeStr}</p>
                <p><strong>Processed by:</strong> ${data.performedByName}</p>
                <p><strong>Place:</strong> Patna, Bihar (10)</p>
            </div>
            <div class="col" style="flex: 0.7;">
                <p><strong>Status:</strong> <span style="color: var(--text-accent); font-weight: bold;">SUCCESS</span></p>
                <p><strong>Category:</strong> ${data.isTaxable ? 'GOLD ADVANCE' : 'WITHDRAWAL / PAYOUT'}</p>
                <p><strong>Payment Mode:</strong> DIGITAL WALLET</p>
            </div>
        </div>

        <!-- PARTY DETAILS -->
        <div class="section" style="border-bottom: 2px solid var(--border-primary);">
            <div class="col" style="padding: 15px;">
                <p class="bold" style="text-decoration: underline; margin-bottom: 8px; font-size: 9pt; color: var(--text-muted); letter-spacing: 0.5px;">BENEFICIARY / CUSTOMER DETAILS:</p>
                <p class="bold" style="font-size: 13pt; margin: 0; color: var(--text-header);">${data.user.name}</p>
                <p style="font-size: 10pt; margin: 5px 0; color: var(--text-secondary);">${data.user.address || "Address Not Available In System Records"}</p>
                <div style="margin-top: 10px; display: flex; gap: 20px; font-size: 9.5pt;">
                    <span><strong style="color: var(--text-muted);">Email:</strong> ${data.user.email}</span>
                    <span><strong style="color: var(--text-muted);">Mobile:</strong> +91 ${data.user.contactNo || data.user.mobile || "N/A"}</span>
                </div>
            </div>
        </div>

        <!-- ITEMS TABLE -->
        <div class="table-responsive">
            <table class="items-table">
            <thead>
                <tr>
                    <th class="center">#</th>
                    <th>Description of Service / Transaction</th>
                    <th class="right">Base Amount (₹)</th>
                    <th class="right">Total (₹)</th>
                </tr>
            </thead>
            <tbody>
                <tr style="height: 200px; vertical-align: top;">
                    <td class="center" style="padding-top: 15px;">1</td>
                    <td style="padding-top: 15px;">
                        <p class="bold" style="font-size: 11.5pt; color: var(--text-header); margin-bottom: 5px;">${data.description}</p>
                        <p style="font-size: 9pt; color: var(--text-muted); margin-top: 12px; border-left: 2px solid var(--border-gold); padding-left: 8px;">
                            ${data.refLabel}: ${paddedInvoiceNo}<br>
                            Purpose: Electronic Fund Management
                        </p>
                        <p style="font-size: 8.5pt; color: var(--text-ultra-muted); margin-top: 15px; font-style: italic;">
                            Note: This transaction is processed securely through Royal Gold Traders ecosystem.
                        </p>
                    </td>
                    <td class="right" style="padding-top: 15px;">${adjustedTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="right" style="padding-top: 15px;">${adjustedTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
            </tbody>
        </table>
        </div>

        <!-- TOTALS AREA -->
        <div class="totals-section">
            <div class="totals-left">
                <p class="bold" style="font-size: 9pt; color: var(--text-muted); margin-bottom: 4px;">AMOUNT IN WORDS:</p>
                <p style="margin: 0; font-size: 11pt; font-weight: 700; color: var(--text-header);">${amountInWords} Only</p>
                
                <div style="margin-top: 25px; padding: 10px; background: var(--bg-section-alt); border: 1px dashed var(--border-secondary); border-radius: 4px;">
                    <p style="margin: 0; font-size: 8.5pt; color: var(--text-muted);">
                        <strong>Declaration:</strong> We declare that this document shows the actual price of the services described and that all particulars are true and correct.
                    </p>
                </div>
            </div>
            <div class="totals-right">
                <table style="width: 100%; border: none;">
                    <tr>
                        <td style="color: var(--text-secondary);">Taxable Amount</td>
                        <td class="right">₹${adjustedTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    ${applyTax ? `
                    <tr>
                        <td style="color: var(--text-secondary);">CGST Output (${halfGst}%)</td>
                        <td class="right">₹${cgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-secondary);">SGST Output (${halfGst}%)</td>
                        <td class="right">₹${sgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    ` : `
                    <tr>
                        <td style="color: var(--text-secondary);">Exempted Value</td>
                        <td class="right">₹0.00</td>
                    </tr>
                    `}
                    <tr>
                        <td style="color: var(--text-secondary);">Round Off</td>
                        <td class="right">₹0.00</td>
                    </tr>
                    <tr style="border-top: 2px solid var(--border-primary);">
                        <td><span class="bold">NET PAYABLE</span></td>
                        <td class="right bold" style="font-size: 14pt;">₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer-cols">
            <div class="qr-area">
                ${qrBase64 ? `<img src="${qrBase64}" style="width: 80px; height: 80px; border: 1px solid var(--border-secondary);" alt="Verification QR">` : '<div class="qr-placeholder">E-SIGN<br>VERIFIED</div>'}
                <p style="font-size: 6pt; color: var(--text-ultra-muted); margin: 6px 0 0 0; text-align: center; width: 100%;">E-SIGN VERIFIED</p>
                <p style="font-size: 5pt; color: var(--text-ultra-muted); margin: 2px 0 0 0; text-align: center; width: 100%;">ID: RG-${String(data.invoiceNo).padStart(6, '0')}</p>
            </div>
            <div style="flex: 2; padding: 10px; display: flex; flex-direction: column; justify-content: center;">
                <p style="margin: 0; font-size: 7.5pt; color: var(--text-muted); line-height: 1.4;">
                    * This is a computer generated document and does not require a physical signature.<br>
                    * Printed on: ${new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}<br>
                    * For any discrepancies, please contact us at support@royalgoldtraders.com within 24 hours.<br>
                    * Terms & Conditions apply as per the system user agreement.
                </p>
            </div>
            <div style="flex: 1.2; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; border-left: 1px solid var(--border-primary); background: var(--bg-section-alt);">
                <div style="margin-bottom: 40px;">
                    <p style="margin: 0; font-size: 8pt; color: var(--text-secondary);">For ROYAL GOLD TRADERS</p>
                </div>
                <p style="margin: 0; font-size: 9pt; font-weight: bold; color: var(--text-header); text-transform: uppercase;">Authorized Signatory</p>
            </div>
        </div>
    </div>

    <!-- TERMS AND CONDITIONS PAGE -->
    <div class="invoice-box" style="margin-top: 20px; page-break-before: always; padding: 30px;">
        <h2 style="text-align: center; text-decoration: underline; margin-bottom: 20px; color: var(--text-header);">TERMS AND CONDITIONS</h2>
        <h3 style="text-align: center; margin-top: -10px; margin-bottom: 30px; color: var(--text-secondary);">नियम एवं शर्तें</h3>

        <div style="font-size: 10pt; line-height: 1.6;">
            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">1. Advance Payment</strong><br>
                <em style="color: var(--text-muted);">English:</em> The customer <strong style="color: var(--text-header);">${data.user.name}</strong> has voluntarily deposited an advance amount of <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')} (${amountInWords} Only)</strong> with Royal Gold Traders for the purpose of purchasing 24 Carat (999 Purity) Gold Coins in the future.<br>
                <em style="color: var(--text-muted);">Hindi:</em> ग्राहक <strong style="color: var(--text-header);">श्री ${data.user.name}</strong> ने स्वेच्छा से भविष्य में 24 कैरेट (999 शुद्धता) सोने के सिक्के खरीदने के उद्देश्य से Royal Gold Traders के पास <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')} (${amountInWords} Only)</strong> अग्रिम राशि जमा की है।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">2. Nature of Transaction</strong><br>
                <em style="color: var(--text-muted);">English:</em> This payment shall be treated only as an advance amount for the purchase of gold and shall not be considered an investment, deposit scheme, or interest-bearing transaction.<br>
                <em style="color: var(--text-muted);">Hindi:</em> यह भुगतान केवल सोना खरीदने के लिए अग्रिम राशि माना जाएगा और इसे किसी निवेश योजना, जमा योजना या ब्याज आधारित लेन-देन के रूप में नहीं माना जाएगा।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">3. Gold Purchase Option</strong><br>
                <em style="color: var(--text-muted);">English:</em> The customer may purchase 24 Carat (999 Purity) Gold Coins from Royal Gold Traders equivalent to the deposited amount whenever the customer chooses to buy gold.<br>
                <em style="color: var(--text-muted);">Hindi:</em> ग्राहक जब भी सोना खरीदना चाहे, वह Royal Gold Traders से <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong> के बराबर 24 कैरेट (999 शुद्धता) सोने के सिक्के खरीद सकता है।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">4. Gold Delivery</strong><br>
                <em style="color: var(--text-muted);">English:</em> Upon request from the customer, Royal Gold Traders shall arrange and deliver 24 Carat (999 Purity) Gold Coins equivalent to <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong> within 1 working day, subject to product availability.<br>
                <em style="color: var(--text-muted);">Hindi:</em> ग्राहक के अनुरोध पर Royal Gold Traders <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong> के बराबर 24 कैरेट (999 शुद्धता) सोने के सिक्के उपलब्ध कराएगा और डिलीवरी 1 कार्य दिवस के भीतर दी जाएगी, उपलब्धता के अनुसार।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">5. Refund Option</strong><br>
                <em style="color: var(--text-muted);">English:</em> If the customer decides not to purchase gold and wishes to withdraw the deposited amount, Royal Gold Traders agrees to refund <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong> to the customer within 1 hour through cash or bank transfer.<br>
                <em style="color: var(--text-muted);">Hindi:</em> यदि ग्राहक सोना खरीदना नहीं चाहता और जमा राशि वापस लेना चाहता है, तो Royal Gold Traders ग्राहक के अनुरोध के 1 घंटे के भीतर <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong> वापस कर देगा (नकद या बैंक ट्रांसफर द्वारा)।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">6. Promotional Benefit</strong><br>
                <em style="color: var(--text-muted);">English:</em> As part of a limited promotional marketing program, Royal Gold Traders may provide the customer a voluntary promotional gift while the advance amount remains with the company. This promotional benefit is purely voluntary and discretionary and shall not be treated as interest, profit, or financial return.<br>
                <em style="color: var(--text-muted);">Hindi:</em> कंपनी के सीमित प्रमोशनल मार्केटिंग प्रोग्राम के अंतर्गत, जब तक ग्राहक की राशि कंपनी के पास जमा रहेगी, तब तक Royal Gold Traders ग्राहक को स्वैच्छिक प्रमोशनल गिफ्ट दे सकता है। यह लाभ केवल प्रमोशनल है और इसे ब्याज, मुनाफा या वित्तीय रिटर्न नहीं माना जाएगा।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">7. Duration of Promotional Gift</strong><br>
                <em style="color: var(--text-muted);">English:</em> The promotional gift shall continue only for the period during which the advance amount remains with Royal Gold Traders.<br>
                <em style="color: var(--text-muted);">Hindi:</em> यह प्रमोशनल गिफ्ट केवल उसी अवधि तक दिया जाएगा जब तक ग्राहक की अग्रिम राशि Royal Gold Traders के पास जमा रहेगी।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">8. Termination of Promotional Benefit</strong><br>
                <em style="color: var(--text-muted);">English:</em> The promotional gift shall automatically stop when: (a) The customer purchases gold worth <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong>, OR (b) The customer withdraws the deposited amount of <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong>.<br>
                <em style="color: var(--text-muted);">Hindi:</em> प्रमोशनल गिफ्ट निम्न स्थितियों में स्वतः बंद हो जाएगा: (a) जब ग्राहक <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong> का सोना खरीद लेता है, या (b) जब ग्राहक <strong style="color: var(--text-header);">₹${Number(data.amount).toLocaleString('en-IN')}</strong> की राशि वापस ले लेता है।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">9. Jurisdiction</strong><br>
                <em style="color: var(--text-muted);">English:</em> Any dispute arising from this agreement shall be subject to the jurisdiction of the courts of Patna, Bihar, India.<br>
                <em style="color: var(--text-muted);">Hindi:</em> इस अनुबंध से संबंधित किसी भी विवाद का निपटारा पटना, बिहार (भारत) की अदालतों के अधिकार क्षेत्र में होगा।
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-header);">10. Completion of Agreement</strong><br>
                <em style="color: var(--text-muted);">English:</em> Once the customer either purchases gold or receives the refund amount, this agreement shall be considered fully completed and terminated.<br>
                <em style="color: var(--text-muted);">Hindi:</em> जब ग्राहक सोना खरीद लेता है या अपनी राशि वापस प्राप्त कर लेता है, तब यह अनुबंध पूर्ण रूप से समाप्त माना जाएगा।
            </div>

            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div style="text-align: center; width: 45%;">
                    <div style="border-bottom: 1px solid var(--border-primary); height: 40px; margin-bottom: 10px;"></div>
                    <strong style="color: var(--text-header);">Customer Signature</strong><br>
                    <span style="color: var(--text-secondary);">Name: ${data.user.name}</span>
                </div>
                <div style="text-align: center; width: 45%;">
                    <div style="border-bottom: 1px solid var(--border-primary); height: 40px; margin-bottom: 10px;"></div>
                    <strong style="color: var(--text-header);">For Royal Gold Traders</strong><br>
                    <span style="color: var(--text-secondary);">Authorized Signatory</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  private static numberToWords(num: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
    };

    return inWords(Math.floor(num)) + 'Rupees';
  }
}
