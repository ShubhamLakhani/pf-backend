import { Response } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export type FileType = 'csv' | 'pdf';

const generateExportFile = async (rowsData: any[], columnsList: any[], fileType: FileType, res: Response) => {
  try {
    if (fileType === 'csv') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Booking Report');

      // Define headers and column widths
      worksheet.columns = columnsList;

      // Add rows
      rowsData.forEach(row => {
        worksheet.addRow(row);
      });

      // Format header row
      worksheet.getRow(1).font = { bold: true };

      // Create Excel file in memory and send
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=booking-report.xlsx');
      return res.send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error('Error generating export file:', error);
    res.status(500).send('Error exporting file');
  }
};

export { generateExportFile };
