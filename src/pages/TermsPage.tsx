
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-card shadow-sm sticky top-0 z-40 border-b border-border">
        <div className="px-4 py-4 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Terms & Conditions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-6 space-y-6 border border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Terms and Conditions</h2>
            <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h3>
            <p className="text-foreground leading-relaxed">
              By accessing and using Qbuyse, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">2. User Accounts</h3>
            <p className="text-foreground leading-relaxed">
              To access certain features of the service, you may be required to create an account. You are responsible for 
              maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">3. User Content and Conduct</h3>
            <p className="text-foreground leading-relaxed">
              Users are responsible for all content they post on Qbuyse. You agree not to post content that is:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li>Illegal, harmful, or offensive</li>
              <li>Fraudulent or misleading</li>
              <li>Violates intellectual property rights</li>
              <li>Contains spam or unsolicited advertising</li>
              <li>Contains personal information of others without consent</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">4. Buying and Selling</h3>
            <p className="text-foreground leading-relaxed">
              Qbuyse serves as a platform to connect buyers and sellers. We are not responsible for the quality, safety, 
              or legality of items posted, the truth or accuracy of listings, or the ability of sellers to sell items or 
              buyers to pay for items.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">5. Privacy Policy</h3>
            <p className="text-foreground leading-relaxed">
              Your privacy is important to us. We collect and use your information in accordance with our Privacy Policy. 
              By using our service, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">6. Prohibited Activities</h3>
            <p className="text-foreground leading-relaxed">
              You may not use Qbuyse for any unlawful purpose or to solicit others to perform unlawful acts. 
              This includes but is not limited to:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li>Posting fake or duplicate listings</li>
              <li>Attempting to bypass our security measures</li>
              <li>Harassing or threatening other users</li>
              <li>Selling prohibited or restricted items</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">7. Limitation of Liability</h3>
            <p className="text-foreground leading-relaxed">
              Qbuyse shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your use of the service.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">8. Termination</h3>
            <p className="text-foreground leading-relaxed">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice 
              or liability, under our sole discretion, for any reason whatsoever, including without limitation if you 
              breach the Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">9. Changes to Terms</h3>
            <p className="text-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">10. Contact Information</h3>
            <p className="text-foreground leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at qbuyse0@gmail.com
            </p>
          </section>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              By using Qbuyse, you acknowledge that you have read and understood these Terms and Conditions 
              and agree to be bound by them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
