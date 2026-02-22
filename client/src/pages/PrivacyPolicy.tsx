import { motion } from "framer-motion";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">
              Last updated: December 2024
            </p>

            <Card className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  VENTURR PTY LTD ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use VENTURR VALIDT 
                  ("the Service"). We comply with the Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mb-2">2.1 Personal Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>Name and email address (via authentication)</li>
                  <li>Account preferences and settings</li>
                  <li>Usage data and interaction history</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2">2.2 Quote Documents</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>PDF and image files you upload for analysis</li>
                  <li>Extracted data including contractor names, pricing, and project details</li>
                  <li>Analysis results and comparison data</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">2.3 Technical Data</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>IP address and browser information</li>
                  <li>Device type and operating system</li>
                  <li>Session data and cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Providing and improving the quote analysis Service</li>
                  <li>Processing and storing your uploaded documents</li>
                  <li>Generating analysis reports and comparisons</li>
                  <li>Sending notifications about your analysis results</li>
                  <li>Improving our AI models and analysis accuracy (using anonymized data)</li>
                  <li>Responding to your inquiries and support requests</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Encrypted data transmission (TLS/SSL)</li>
                  <li>Secure cloud storage with access controls</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Employee access restrictions and training</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Your data is stored on servers located in Australia or in jurisdictions with equivalent privacy protections.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell your personal information. We may share data with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> Cloud hosting, analytics, and AI processing partners who assist in operating the Service</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize sharing (e.g., sharing reports with contractors)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Under Australian privacy law, you have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data (subject to legal retention requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your data for as long as your account is active or as needed to provide the Service. 
                  Uploaded documents and analysis results are retained for 24 months after creation, after which 
                  they may be deleted. You can request earlier deletion by contacting us. Some data may be retained 
                  longer if required by law or for legitimate business purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Maintain your session and authentication state</li>
                  <li>Remember your preferences</li>
                  <li>Analyze usage patterns to improve the Service</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You can control cookies through your browser settings, but some features may not function properly without them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service may contain links to third-party websites. We are not responsible for the privacy 
                  practices of these external sites. We encourage you to review their privacy policies before 
                  providing any personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service is not intended for individuals under 18 years of age. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from a child, 
                  please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes 
                  by email or through the Service. The "Last updated" date at the top indicates when the policy 
                  was last revised.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>VENTURR PTY LTD</strong><br />
                  Privacy Officer<br />
                  Email: privacy@venturr.com.au<br />
                  ABN: [To be provided]
                </p>
                <p className="text-muted-foreground mt-4">
                  You may also contact the Office of the Australian Information Commissioner (OAIC) at 
                  <a href="https://www.oaic.gov.au" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                    www.oaic.gov.au
                  </a>
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
