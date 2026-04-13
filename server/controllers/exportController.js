const Tool = require('../models/Tool');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const exportPDF = async (req, res) => {
  try {
    const tools = await Tool.find({ user: req.user._id }).populate('emails');
    const doc = new PDFDocument();
    
    let filename = 'usage_report';
    filename = encodeURIComponent(filename) + '.pdf';
    
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);
    
    doc.fontSize(20).text('AI Tool Usage Report', { align: 'center' });
    doc.moveDown();

    tools.forEach(tool => {
      doc.fontSize(14).text(`Tool: ${tool.toolName}`);
      doc.fontSize(12).text(`User Emails: ${tool.emails.map(e => e.emailAddress).join(', ') || 'N/A'}`);
      doc.fontSize(10).text(`Start Date: ${new Date(tool.startDate).toDateString()}`);
      doc.fontSize(10).text(`End Date: ${new Date(tool.endDate).toDateString()}`);
      doc.fontSize(10).text(`Renewal Date: ${new Date(tool.renewalDate).toDateString()}`);
      doc.fontSize(10).text(`Notes: ${tool.notes || 'None'}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportExcel = async (req, res) => {
  try {
    const tools = await Tool.find({ user: req.user._id }).populate('emails');
    
    const data = tools.map(tool => ({
      'Tool Name': tool.toolName,
      'Emails': tool.emails.map(e => e.emailAddress).join(', '),
      'Start Date': new Date(tool.startDate).toLocaleDateString(),
      'End Date': new Date(tool.endDate).toLocaleDateString(),
      'Renewal Date': new Date(tool.renewalDate).toLocaleDateString(),
      'Notes': tool.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="usage_report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { exportPDF, exportExcel };
