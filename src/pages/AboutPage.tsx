
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
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">About Qbuyse</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo size={80} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Qbuyse</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Your trusted local marketplace connecting buyers and sellers across India. 
            Buy, sell, and discover amazing deals in your neighborhood.
          </p>
        </div>

        {/* Our Mission */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            At Qbuyse, we believe in the power of local communities. Our mission is to create a safe, 
            user-friendly platform where people can easily buy and sell items within their state, 
            fostering local commerce and building stronger communities.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We're committed to providing a seamless experience that connects people with what they need, 
            while ensuring trust and security in every transaction.
          </p>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">What Makes Us Special</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <IconComponent size={24} className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Create Your Account</h4>
                <p className="text-gray-600">Sign up with your email and set your location to get started.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Post Your Items</h4>
                <p className="text-gray-600">Upload photos and descriptions of items you want to sell or things you're looking for.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Connect & Chat</h4>
                <p className="text-gray-600">Use our real-time chat feature to communicate with interested buyers or sellers.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Complete Your Deal</h4>
                <p className="text-gray-600">Meet safely in public places and complete your transaction with confidence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Have questions, suggestions, or need help? We'd love to hear from you!
          </p>
          <div className="space-y-2 text-gray-700">
<<<<<<< HEAD
            <p><strong>Email:</strong> support@qbuyse.com</p>
=======
            <p><strong>Email:</strong> qbuyse0@gmail.com</p>
>>>>>>> c919ab7 (updates new)
            <p><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-gray-500">
            Thank you for choosing Qbuyse. Together, we're building stronger local communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
