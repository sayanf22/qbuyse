
import { ArrowLeft, Users, Shield, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with local buyers and sellers in your area"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Built with security and privacy as our top priorities"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications and real-time chat functionality"
    },
    {
      icon: Heart,
      title: "User Friendly",
      description: "Simple, intuitive interface designed for everyone"
    }
  ];

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
          <h1 className="text-xl font-bold text-foreground">About Qbuyse</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-card rounded-lg shadow-sm p-8 text-center border border-border">
          <div className="flex justify-center mb-6">
            <Logo size={80} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Welcome to Qbuyse</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your trusted local marketplace connecting buyers and sellers across India. 
            Buy, sell, and discover amazing deals in your neighborhood.
          </p>
        </div>

        {/* Our Mission */}
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
          <p className="text-foreground leading-relaxed mb-4">
            At Qbuyse, we believe in the power of local communities. Our mission is to create a safe, 
            user-friendly platform where people can easily buy and sell items within their state, 
            fostering local commerce and building stronger communities.
          </p>
          <p className="text-foreground leading-relaxed">
            We're committed to providing a seamless experience that connects people with what they need, 
            while ensuring trust and security in every transaction.
          </p>
        </div>

        {/* Features */}
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-6">What Makes Us Special</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-6">How It Works</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Create Your Account</h4>
                <p className="text-muted-foreground">Sign up with your email and set your location to get started.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Post Your Items</h4>
                <p className="text-muted-foreground">Upload photos and descriptions of items you want to sell or things you're looking for.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Connect & Chat</h4>
                <p className="text-muted-foreground">Use our real-time chat feature to communicate with interested buyers or sellers.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Complete Your Deal</h4>
                <p className="text-muted-foreground">Meet safely in public places and complete your transaction with confidence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h3>
          <p className="text-foreground leading-relaxed mb-4">
            Have questions, suggestions, or need help? We'd love to hear from you!
          </p>
          <div className="space-y-2 text-foreground">
            <p><strong>Email:</strong> qbuyse0@gmail.com</p>
            <p><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            Thank you for choosing Qbuyse. Together, we're building stronger local communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
