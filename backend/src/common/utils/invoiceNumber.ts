export const generateInvoiceNumber = (year: number, month: number, sequence: number): string => {
  const paddedMonth = month.toString().padStart(2, "0");
  const paddedSeq = sequence.toString().padStart(4, "0");
  return `INV-${year}${paddedMonth}-${paddedSeq}`;
};
