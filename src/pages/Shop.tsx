import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { productsApi } from "@/lib/api";
import { Category, SubCategory } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<SubCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const categoryParam = searchParams.get("category");
        const searchQuery = searchParams.get("search");

        const params: any = {};
        
        if (categoryParam) {
          params.category = categoryParam;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (selectedCategories.length > 0) {
          params.category = selectedCategories[0]; // Backend supports single category
        }
        if (priceRange[0] > 0) {
          params.minPrice = priceRange[0];
        }
        if (priceRange[1] < 10000) {
          params.maxPrice = priceRange[1];
        }
        if (sortBy && sortBy !== 'featured') {
          params.sort = sortBy;
        }

        const response = await productsApi.getAll(params);
        
        // Backend already parses JSON strings, so just ensure data consistency
        const productsWithParsedData = response.products.map((p: any) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []),
          sizes: Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : []),
          colors: Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' ? JSON.parse(p.colors) : []),
          image: (Array.isArray(p.images) ? p.images[0] : (typeof p.images === 'string' ? JSON.parse(p.images)[0] : '/placeholder.svg')) || '/placeholder.svg',
          inStock: p.stock > 0,
          originalPrice: p.basePrice,
        }));

        setFilteredProducts(productsWithParsedData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, selectedCategories, priceRange, sortBy]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {(["men", "women", "children"] as Category[]).map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox
                id={cat}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, cat]);
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                  }
                }}
              />
              <Label htmlFor={cat} className="capitalize cursor-pointer">
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sub Categories */}
      <div>
        <h3 className="font-semibold mb-3">Type</h3>
        <div className="space-y-2">
          {(["accessories", "attire", "footwear"] as SubCategory[]).map((sub) => (
            <div key={sub} className="flex items-center space-x-2">
              <Checkbox
                id={sub}
                checked={selectedSubCategories.includes(sub)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSubCategories([...selectedSubCategories, sub]);
                  } else {
                    setSelectedSubCategories(selectedSubCategories.filter((s) => s !== sub));
                  }
                }}
              />
              <Label htmlFor={sub} className="capitalize cursor-pointer">
                {sub}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          {[
            { label: "Under ₹50", range: [0, 50] as [number, number] },
            { label: "₹50 - ₹100", range: [50, 100] as [number, number] },
            { label: "₹100 - ₹200", range: [100, 200] as [number, number] },
            { label: "Over ₹200", range: [200, 500] as [number, number] },
          ].map((option) => (
            <div key={option.label} className="flex items-center space-x-2">
              <Checkbox
                id={option.label}
                checked={
                  priceRange[0] === option.range[0] && priceRange[1] === option.range[1]
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    setPriceRange(option.range);
                  }
                }}
              />
              <Label htmlFor={option.label} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setSelectedSubCategories([]);
          setPriceRange([0, 500]);
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Shop</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} products found
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Filters</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedSubCategories([]);
                    setPriceRange([0, 10000]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
