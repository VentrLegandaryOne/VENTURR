import { motion } from "framer-motion";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">
              Last updated: December 2024
            </p>

            <Card className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using VENTURR VALIDT ("the Service"), you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use the Service. The Service is provided by VENTURR PTY LTD 
                  ("we", "us", or "our") and is designed to assist users in analyzing construction and trade quotes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  VENTURR VALIDT provides AI-powered analysis of construction and trade quotes. The Service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Analyzes uploaded quote documents using artificial intelligence</li>
                  <li>Provides assessments of pricing, materials, compliance, and warranty terms</li>
                  <li>Compares multiple quotes to identify potential value differences</li>
                  <li>References Australian building codes and standards for context</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Important Disclaimers</h2>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                  <p className="text-amber-600 dark:text-amber-400 font-medium mb-2">
                    Please Read Carefully
                  </p>
                  <p className="text-muted-foreground">
                    The Service provides informational analysis only and does not constitute professional advice, 
                    certification, or endorsement of any contractor or quote.
                  </p>
                </div>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Analysis results are AI-generated assessments, not professional certifications</li>
                  <li>We do not verify contractor licenses, insurance, or qualifications</li>
                  <li>Market rate comparisons are estimates based on available data</li>
                  <li>Compliance assessments reference standards but do not guarantee compliance</li>
                  <li>Users should always seek independent professional advice for significant decisions</li>
                  <li>We are not responsible for decisions made based on our analysis</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By using the Service, you agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide accurate information and authentic quote documents</li>
                  <li>Use the Service for lawful purposes only</li>
                  <li>Not upload malicious files or attempt to compromise the Service</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Not share analysis results in a way that misrepresents their nature</li>
                  <li>Acknowledge that AI analysis has limitations and may contain errors</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service, including its design, features, and content, is owned by VENTURR PTY LTD. 
                  You retain ownership of documents you upload. By uploading documents, you grant us a limited 
                  license to process them for analysis purposes. Analysis reports generated by the Service 
                  may be used by you for personal or business purposes but may not be resold or redistributed commercially.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Data Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy for details on how we collect, 
                  use, and protect your data. By using the Service, you consent to our data practices as described 
                  in the Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by Australian law, VENTURR PTY LTD shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages, including but not limited to 
                  loss of profits, data, or business opportunities, arising from your use of the Service. 
                  Our total liability shall not exceed the amount you paid for the Service in the preceding 12 months.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Australian Consumer Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nothing in these Terms excludes, restricts, or modifies any consumer rights under the Australian 
                  Consumer Law that cannot be excluded, restricted, or modified. If the Australian Consumer Law 
                  applies to you, you may have certain rights and remedies that cannot be excluded.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of significant 
                  changes via email or through the Service. Continued use of the Service after changes constitutes 
                  acceptance of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are governed by the laws of New South Wales, Australia. Any disputes arising from 
                  these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the 
                  courts of New South Wales.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about these Terms, please contact us at:
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>VENTURR PTY LTD</strong><br />
                  Email: legal@venturr.com.au<br />
                  ABN: [To be provided]
                </p>
              </section>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
