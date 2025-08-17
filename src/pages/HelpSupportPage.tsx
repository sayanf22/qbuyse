import { useState } from "react";
import { ArrowLeft, Mail, Phone, MessageCircle, FileText, Users, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const HelpSupportPage = () => {
  const [activeTab, setActiveTab] = useState<"help" | "contact">("help");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleBack = () => {
    window.history.back();
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const faqItems = [
    {
      question: "How do I create a listing?",
      answer: "To create a listing, tap the '+' button in the bottom navigation. Choose between 'Sell' or 'Want', fill in the details, add photos, and publish your listing."
    },
    {
      question: "How do I contact a seller?",
      answer: "On any listing, tap the 'Chat' button to start a conversation with the seller directly. You can negotiate prices and arrange meetups safely."
    },
    {
      question: "Is Qbuyse free to use?",
      answer: "Yes! Qbuyse is completely free to use. You can create listings, chat with buyers/sellers, and browse items without any charges."
    },
    {
      question: "How do I ensure safe transactions?",
      answer: "Always meet in public places, verify items before payment, and trust your instincts. Report any suspicious activity to our support team."
    },
    {
      question: "Can I edit or delete my listings?",
      answer: "Yes, you can edit or delete your listings anytime from your profile page. Go to Settings tab and find your active listings."
    },
    {
      question: "Why can't I see listings from other states?",
      answer: "Qbuyse shows listings based on your selected state to ensure local transactions. You can change your state from the dropdown in the header."
    }
  ];

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const supportCategories = [
    {
      icon: MessageCircle,
      title: "General Help",
      description: "Common questions and troubleshooting",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Learn about safe trading practices",
      color: "green"
    },
    {
      icon: Users,
      title: "Account & Profile",
      description: "Manage your account settings",
      color: "purple"
    },
    {
      icon: FileText,
      title: "Terms & Policies",
      description: "Our terms of service and policies",
      color: "orange"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Help & Support</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("help")}
            className={`flex-1 py-3 text-center font-medium rounded-md transition-colors ${
              activeTab === "help"
                ? "bg-teal-500 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Help Center
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-3 text-center font-medium rounded-md transition-colors ${
              activeTab === "contact"
                ? "bg-teal-500 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Contact Us
          </button>
        </div>

        {activeTab === "help" ? (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-base"
              />
            </div>

            {/* Support Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supportCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${category.color}-50`}>
                          <Icon size={20} className={`text-${category.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{category.title}</CardTitle>
                          <CardDescription className="text-sm">{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                        <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No FAQs found matching your search.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contact Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Mail className="text-blue-600" size={24} />
                  </div>
                  <CardTitle className="text-base">Email Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Get help via email</p>
                  <Button variant="outline" size="sm" className="w-full">
                    qbuyse0@gmail.com
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Phone className="text-green-600" size={24} />
                  </div>
                  <CardTitle className="text-base">Phone Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Mon-Fri, 9 AM - 6 PM</p>
                  <Button variant="outline" size="sm" className="w-full">
                    +91 12345 67890
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <MessageCircle className="text-purple-600" size={24} />
                  </div>
                  <CardTitle className="text-base">Live Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Chat with our team</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>We'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="What can we help you with?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please describe your issue or question in detail..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSupportPage;