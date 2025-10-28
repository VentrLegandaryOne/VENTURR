import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    color: '#64748b',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    color: '#475569',
  },
  value: {
    width: '70%',
    color: '#1e293b',
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1 solid #cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  tableCol1: {
    width: '50%',
  },
  tableCol2: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol3: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '20%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
  terms: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
});

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: number;
}

interface QuotePDFProps {
  quote: {
    quoteNumber: string;
    validUntil: string;
    subtotal: string;
    gst: string;
    total: string;
    terms?: string;
    notes?: string;
    items?: string;
  };
  project: {
    title: string;
    address?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
  };
  business?: {
    name: string;
    abn?: string;
    address?: string;
    phone?: string;
    email?: string;
    tagline?: string;
    logoUrl?: string;
  };
}

const QuotePDF = ({ quote, project, business }: QuotePDFProps) => {
  const lineItems: LineItem[] = quote.items ? JSON.parse(quote.items) : [];
  const today = new Date().toLocaleDateString('en-AU');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>{business?.name || 'Venturr'}</Text>
          <Text style={styles.companyInfo}>{business?.tagline || 'Professional Trade Solutions'}</Text>
          {business?.abn && <Text style={styles.companyInfo}>ABN: {business.abn}</Text>}
          {business?.phone && <Text style={styles.companyInfo}>Phone: {business.phone}</Text>}
          {business?.email && <Text style={styles.companyInfo}>Email: {business.email}</Text>}
        </View>

        {/* Title */}
        <Text style={styles.title}>QUOTATION</Text>

        {/* Quote Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Quote Number:</Text>
            <Text style={styles.value}>{quote.quoteNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{today}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Valid Until:</Text>
            <Text style={styles.value}>{new Date(quote.validUntil).toLocaleDateString('en-AU')}</Text>
          </View>
        </View>

        {/* Project Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Project:</Text>
            <Text style={styles.value}>{project.title}</Text>
          </View>
          {project.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{project.address}</Text>
            </View>
          )}
        </View>

        {/* Client Details */}
        {project.clientName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{project.clientName}</Text>
            </View>
            {project.clientEmail && (
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{project.clientEmail}</Text>
              </View>
            )}
            {project.clientPhone && (
              <View style={styles.row}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{project.clientPhone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Description</Text>
            <Text style={styles.tableCol2}>Qty</Text>
            <Text style={styles.tableCol3}>Unit Price</Text>
            <Text style={styles.tableCol4}>Total</Text>
          </View>
          {lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{item.description}</Text>
              <Text style={styles.tableCol2}>{item.quantity}</Text>
              <Text style={styles.tableCol3}>${parseFloat(item.unitPrice).toFixed(2)}</Text>
              <Text style={styles.tableCol4}>${item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>${parseFloat(quote.subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>GST (10%):</Text>
            <Text>${parseFloat(quote.gst).toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>${parseFloat(quote.total).toFixed(2)}</Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        {quote.terms && (
          <View style={styles.terms}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{quote.terms}</Text>
          </View>
        )}

        {/* Notes */}
        {quote.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={styles.termsText}>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{business?.name || 'Venturr'} | {business?.tagline || 'Professional Trade Solutions'}</Text>
          <Text>This quotation is valid for 30 days from the date of issue</Text>
        </View>
      </Page>
    </Document>
  );
};

export const generateQuotePDF = async (quote: QuotePDFProps['quote'], project: QuotePDFProps['project'], business?: QuotePDFProps['business']) => {
  const blob = await pdf(<QuotePDF quote={quote} project={project} business={business} />).toBlob();
  return blob;
};

export const downloadQuotePDF = async (quote: QuotePDFProps['quote'], project: QuotePDFProps['project'], business: QuotePDFProps['business'] | undefined, filename: string) => {
  const blob = await generateQuotePDF(quote, project, business);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default QuotePDF;

