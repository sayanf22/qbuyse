import { 
  Car, 
  Home, 
  Smartphone, 
  Briefcase, 
  Shirt, 
  Bike, 
  Laptop, 
  Truck, 
  Sofa, 
  PawPrint,
  Baby,
  Music,
  Dumbbell,
  Book,
  Wrench,
  Package
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: any;
}

export const categories: Category[] = [
  { id: "Cars", name: "Cars", icon: Car },
  { id: "Properties", name: "Properties", icon: Home },
  { id: "Mobiles", name: "Mobiles", icon: Smartphone },
  { id: "Jobs", name: "Jobs", icon: Briefcase },
  { id: "Fashion", name: "Fashion", icon: Shirt },
  { id: "Bikes", name: "Bikes", icon: Bike },
  { id: "Electronics", name: "Electronics & Appliances", icon: Laptop },
  { id: "Commercial", name: "Commercial Vehicles", icon: Truck },
  { id: "Furniture", name: "Furniture", icon: Sofa },
  { id: "Pets", name: "Pets", icon: PawPrint },
  { id: "Kids", name: "Kids", icon: Baby },
  { id: "Music", name: "Music & Instruments", icon: Music },
  { id: "Sports", name: "Sports & Fitness", icon: Dumbbell },
  { id: "Books", name: "Books", icon: Book },
  { id: "Services", name: "Services", icon: Wrench },
  { id: "Others", name: "Others", icon: Package },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};