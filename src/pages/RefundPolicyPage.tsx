import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RefundPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm sticky top-0 z-40 border-b border-border">
        <div className="px-4 py-4 max-w-4xl mx-auto">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-3 hover:bg-accent"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Refund Policy</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Qbuyse Refund Policy</h2>
            <p className="text-muted-foreground mb-6">
              At Qbuyse, we strive to provide a safe and transparent marketplace for all users. 
              Please read our refund policy carefully to understand your rights and responsibilities.
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">1. Marketplace Nature</h3>
              <p className="text-muted-foreground">
                Qbuyse is a peer-to-peer marketplace platform that connects buyers and sellers. 
                We do not sell products directly and act as an intermediary to facilitate transactions 
                between users.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">2. Direct Transactions</h3>
              <p className="text-muted-foreground">
                All transactions on Qbuyse are conducted directly between buyers and sellers. 
                We encourage users to communicate clearly about product conditions, payment terms, 
                and delivery arrangements before completing any transaction.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">3. Dispute Resolution</h3>
              <p className="text-muted-foreground mb-3">
                In case of disputes between buyers and sellers, we recommend:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>First, try to resolve the issue directly with the other party through our chat system</li>
                <li>Keep all communication and transaction records</li>
                <li>Contact our support team if mediation is needed</li>
                <li>Report any fraudulent or suspicious activities immediately</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">4. Platform Fees</h3>
              <p className="text-muted-foreground">
                Currently, Qbuyse does not charge any platform fees for listing or transactions. 
                If this changes in the future, we will notify all users with 30 days advance notice.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">5. User Responsibilities</h3>
              <p className="text-muted-foreground mb-3">Users are responsible for:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Providing accurate product descriptions and images</li>
                <li>Communicating honestly about product conditions</li>
                <li>Meeting agreed-upon payment and delivery terms</li>
                <li>Reporting issues promptly</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">6. Refund Guidelines</h3>
              <p className="text-muted-foreground mb-3">
                While Qbuyse does not process refunds directly, we recommend the following practices:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Inspect items carefully upon receipt</li>
                <li>Report any discrepancies within 24 hours</li>
                <li>Keep original packaging when possible</li>
                <li>Document any issues with photos</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">7. Safety Measures</h3>
              <p className="text-muted-foreground mb-3">For your safety:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Meet in public places for item exchanges</li>
                <li>Verify seller/buyer identity when possible</li>
                <li>Use secure payment methods</li>
                <li>Trust your instincts - if something feels wrong, cancel the transaction</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">8. Contact Support</h3>
              <p className="text-muted-foreground">
                If you need assistance with any transaction or have concerns about another user, 
                please contact our support team through the app or email us at qbuyse0@gmail.com. 
                We are committed to helping resolve issues fairly and maintaining a trustworthy 
                marketplace for all users.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">9. Policy Updates</h3>
              <p className="text-muted-foreground">
                This refund policy may be updated from time to time. We will notify users of any 
                significant changes through the app or email. Continued use of Qbuyse after policy 
                updates constitutes acceptance of the new terms.
              </p>
            </section>
          </div>

          <div className="border-t border-border pt-6 mt-8">
            <p className="text-sm text-muted-foreground">
              Last updated: December 2024<br />
              For questions about this policy, contact us at: qbuyse0@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;