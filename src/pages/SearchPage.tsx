
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import PostCard from "@/components/PostCard";
import { SEOHead } from "@/components/SEOHead";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PostType = "ALL" | "SELL" | "WANT";

interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  images: string[];
  created_at: string;
  user_id: string;
  state: string;
}

const indianStates = [
  { name: "All States", code: "ALL" },
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  { name: "Assam", code: "AS" },
  { name: "Bihar", code: "BR" },
  { name: "Chhattisgarh", code: "CG" },
  { name: "Goa", code: "GA" },
  { name: "Gujarat", code: "GJ" },
  { name: "Haryana", code: "HR" },
  { name: "Himachal Pradesh", code: "HP" },
  { name: "Jharkhand", code: "JH" },
  { name: "Karnataka", code: "KA" },
  { name: "Kerala", code: "KL" },
  { name: "Madhya Pradesh", code: "MP" },
  { name: "Maharashtra", code: "MH" },
  { name: "Manipur", code: "MN" },
  { name: "Meghalaya", code: "ML" },
  { name: "Mizoram", code: "MZ" },
  { name: "Nagaland", code: "NL" },
  { name: "Odisha", code: "OD" },
  { name: "Punjab", code: "PB" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Sikkim", code: "SK" },
  { name: "Tamil Nadu", code: "TN" },
  { name: "Telangana", code: "TG" },
  { name: "Tripura", code: "TR" },
  { name: "Uttar Pradesh", code: "UP" },
  { name: "Uttarakhand", code: "UK" },
  { name: "West Bengal", code: "WB" },
];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "items" | "people">("all");
  const [typeFilter, setTypeFilter] = useState<PostType>("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["search-posts", searchQuery, searchType, typeFilter, stateFilter, minPrice, maxPrice],
    queryFn: async (): Promise<Post[]> => {
      if (searchType === "people") return [];
      
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply search query - improved keyword matching and username search
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim().toLowerCase();
        
        // Check if it's a username search (starts with @)
        if (searchTerm.startsWith('@')) {
          const username = searchTerm.substring(1);
          
          // First, find user IDs by username
          const { data: userProfiles } = await supabase
            .from("profiles")
            .select("id")
            .ilike("username", `%${username}%`);
          
          if (userProfiles && userProfiles.length > 0) {
            const userIds = userProfiles.map(profile => profile.id);
            query = query.in("user_id", userIds);
          } else {
            // No users found with that username, return empty results
            return [];
          }
        } else {
          // Regular search in title and description
          const searchTerms = searchTerm.split(' ');
          const searchConditions = searchTerms.map(term => 
            `title.ilike.%${term}%,description.ilike.%${term}%`
          ).join(',');
          query = query.or(searchConditions);
        }
      }

      // Apply type filter
      if (typeFilter !== "ALL") {
        query = query.eq("type", typeFilter);
      }

      // Apply state filter
      if (stateFilter !== "ALL") {
        const selectedState = indianStates.find(s => s.code === stateFilter);
        if (selectedState) {
          query = query.eq("state", selectedState.name);
        }
      }

      // Apply price range filters
      if (minPrice) {
        query = query.gte("price", parseInt(minPrice));
      }
      if (maxPrice) {
        query = query.lte("price", parseInt(maxPrice));
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error searching posts:", error);
        return [];
      }
      return data || [];
    },
  });

  // Set up realtime subscription for posts
  useEffect(() => {
    const channel = supabase
      .channel('search-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Query for people search
  const { data: people, isLoading: peopleLoading } = useQuery({
    queryKey: ["search-people", searchQuery, stateFilter],
    queryFn: async () => {
      if (searchType !== "people" && searchType !== "all") return [];
      if (!searchQuery.trim()) return [];
      
      const searchTerm = searchQuery.trim().toLowerCase();
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Search in username and full_name
      query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);

      // Apply state filter for people too
      if (stateFilter !== "ALL") {
        const selectedState = indianStates.find(s => s.code === stateFilter);
        if (selectedState) {
          query = query.eq("state", selectedState.name);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error searching people:", error);
        return [];
      }
      return data || [];
    },
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSearchType("all");
    setTypeFilter("ALL");
    setStateFilter("ALL");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters = searchType !== "all" || typeFilter !== "ALL" || stateFilter !== "ALL" || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead 
        title="Search Marketplace"
        description="Search for products and services in India's leading local marketplace. Find what you need or discover something new near you"
        keywords={['search marketplace', 'find products', 'local search', 'buy near me', 'discover deals']}
      />
      {/* Header */}
      <div className="bg-card shadow-sm sticky top-0 z-40 border-b border-border">
        <div className="px-4 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search for items, people, or everything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full border-border focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* Search Type Toggle */}
          <div className="flex bg-muted rounded-lg p-1 mb-4">
            <button
              onClick={() => setSearchType("all")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                searchType === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSearchType("items")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                searchType === "items"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setSearchType("people")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                searchType === "people"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              People
            </button>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter size={16} />
              <span>Filters</span>
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center space-x-2 text-teal-600"
              >
                <X size={16} />
                <span>Clear</span>
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-muted rounded-lg p-4 space-y-4 animate-slide-down">
              <div className="grid grid-cols-2 gap-4">
                {searchType !== "people" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                    <Select value={typeFilter} onValueChange={(value: PostType) => setTypeFilter(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="SELL">Sell</SelectItem>
                        <SelectItem value="WANT">Want</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className={searchType === "people" ? "col-span-2" : ""}>
                  <label className="block text-sm font-medium text-foreground mb-2">State</label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {indianStates.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                         {state.code} – {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {searchType !== "people" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Min Price (₹)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Max Price (₹)</label>
                    <Input
                      type="number"
                      placeholder="Any"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {(isLoading || peopleLoading) ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* People Results */}
            {(searchType === "people" || searchType === "all") && people && people.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">People</h3>
                  <p className="text-gray-600 text-sm">
                    {people.length} result{people.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-3">
                  {people.map((person, index) => (
                    <div
                      key={person.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow animate-fade-in cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate(`/user/${person.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-200 to-teal-300 rounded-full flex items-center justify-center">
                          {person.profile_img ? (
                            <img 
                              src={person.profile_img} 
                              alt="Profile" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-700">
                              {person.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{person.full_name || 'Unknown User'}</h4>
                          <p className="text-gray-500 text-sm">@{person.username}</p>
                          <p className="text-gray-400 text-xs">{person.state}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Results */}
            {(searchType === "items" || searchType === "all") && posts && posts.length > 0 && (
              <div className="space-y-4">
                {(searchType === "all" && people && people.length > 0) && (
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                    <p className="text-gray-600 text-sm">
                      {posts.length} result{posts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {searchType === "items" && (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm">
                      Found {posts.length} result{posts.length !== 1 ? 's' : ''}
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="text-teal-600"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <div
                      key={post.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <PostCard post={post} onDelete={refetch} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {((searchType === "people" && (!people || people.length === 0)) ||
              (searchType === "items" && (!posts || posts.length === 0)) ||
              (searchType === "all" && (!posts || posts.length === 0) && (!people || people.length === 0))) && (
              <div className="text-center py-12 animate-fade-in">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchQuery ? `No results found for "${searchQuery}"` : "No results found"}
                </p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
