
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
<<<<<<< HEAD
=======
import { categories } from "@/utils/categories";
>>>>>>> c919ab7 (updates new)

const PostPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [postType, setPostType] = useState<"SELL" | "WANT">("SELL");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    images: [] as string[],
  });
<<<<<<< HEAD
=======
  const [selectedCategory, setSelectedCategory] = useState("Others");
>>>>>>> c919ab7 (updates new)


  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
    "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", 
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const [selectedState, setSelectedState] = useState("Maharashtra");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("posts").insert({
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        type: postType,
        state: selectedState,
<<<<<<< HEAD
=======
        category: selectedCategory,
>>>>>>> c919ab7 (updates new)
        images: formData.images,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been successfully created.",
      });

      // Navigate to home to see the new post
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToImgbb = async (file: File): Promise<string> => {
    console.log('🔄 Starting secure image upload...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 Sending request to secure upload endpoint...');
    const response = await supabase.functions.invoke('upload-image', {
      body: formData,
    });

    if (response.error) {
      console.error('❌ Upload function error:', response.error);
      throw new Error(response.error.message || 'Failed to upload image');
    }

    if (!response.data?.success) {
      console.error('❌ Upload failed:', response.data);
      throw new Error(response.data?.error || 'Upload failed');
    }

    console.log('✅ Image uploaded successfully:', response.data.url);
    return response.data.url;
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (formData.images.length >= 3) {
      toast({
        title: "Maximum images reached",
        description: "You can upload up to 3 images only.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const imageUrl = await uploadImageToImgbb(file);
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl],
      });
      
      toast({
        title: "Image uploaded!",
        description: "Your image has been successfully uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImage = () => {
    if (formData.images.length >= 3) {
      toast({
        title: "Maximum images reached",
        description: "You can upload up to 3 images only.",
        variant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Post Type Selection */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Label className="text-base font-semibold">What are you doing?</Label>
          <div className="flex space-x-2 mt-2">
            <button
              type="button"
              onClick={() => setPostType("SELL")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                postType === "SELL"
                  ? "bg-green-500 text-white transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Selling Something
            </button>
            <button
              type="button"
              onClick={() => setPostType("WANT")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                postType === "WANT"
                  ? "bg-blue-500 text-white transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Looking for Something
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* State Selection */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
=======
        {/* Category Selection */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Label className="text-base font-semibold">Select Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full mt-2 rounded-xl border border-gray-200 bg-white px-3 py-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <IconComponent size={16} />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* State Selection */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
>>>>>>> c919ab7 (updates new)
          <Label className="text-base font-semibold">Select State</Label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-full mt-2 rounded-xl border border-gray-200 bg-white px-3 py-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {indianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
<<<<<<< HEAD
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
=======
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
>>>>>>> c919ab7 (updates new)
          <Label htmlFor="title" className="text-base font-semibold">
            {postType === "SELL" ? "What are you selling?" : "What are you looking for?"}
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={postType === "SELL" ? "e.g., iPhone 15 Pro Max" : "e.g., Looking for iPhone 15"}
            className="rounded-xl py-3 transition-all"
            required
          />
        </div>

        {/* Price */}
<<<<<<< HEAD
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
=======
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
>>>>>>> c919ab7 (updates new)
          <Label htmlFor="price" className="text-base font-semibold">
            {postType === "SELL" ? "Price" : "Budget"} (Optional)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0"
              className="rounded-xl py-3 pl-8 transition-all"
            />
          </div>
        </div>

        {/* Description */}
<<<<<<< HEAD
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
=======
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
>>>>>>> c919ab7 (updates new)
          <Label htmlFor="description" className="text-base font-semibold">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your item in detail..."
            className="rounded-xl min-h-[120px] resize-none transition-all"
            required
          />
        </div>

        {/* Images */}
<<<<<<< HEAD
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
=======
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
>>>>>>> c919ab7 (updates new)
          <Label className="text-base font-semibold">Photos (Up to 3)</Label>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          <div className="grid grid-cols-3 gap-3">
            {formData.images.map((image, index) => (
              <div key={index} className="relative aspect-square animate-scale-in">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl border-2 border-gray-200 transition-transform hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {formData.images.length < 3 && (
              <button
                type="button"
                onClick={handleAddImage}
                disabled={uploadingImage}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-teal-400 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? (
                  <>
                    <Upload size={24} className="text-teal-500 mb-2 animate-pulse" />
                    <span className="text-xs text-teal-600">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
<<<<<<< HEAD
        <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
=======
        <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
>>>>>>> c919ab7 (updates new)
          <Button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 rounded-xl py-4 text-lg font-semibold transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostPage;
