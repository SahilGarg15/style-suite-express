import { Link } from "react-router-dom";
import { ShoppingCart, Heart, User, Search, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { getItemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated, user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      name: "Men",
      path: "/shop?category=men",
      subcategories: [
        { name: "Accessories", path: "/shop?category=men&sub=accessories" },
        { name: "Attire", path: "/shop?category=men&sub=attire" },
        { name: "Footwear", path: "/shop?category=men&sub=footwear" },
      ],
    },
    {
      name: "Women",
      path: "/shop?category=women",
      subcategories: [
        { name: "Accessories", path: "/shop?category=women&sub=accessories" },
        { name: "Attire", path: "/shop?category=women&sub=attire" },
        { name: "Footwear", path: "/shop?category=women&sub=footwear" },
      ],
    },
    {
      name: "Children",
      path: "/shop?category=children",
      subcategories: [
        { name: "Accessories", path: "/shop?category=children&sub=accessories" },
        { name: "Attire", path: "/shop?category=children&sub=attire" },
        { name: "Footwear", path: "/shop?category=children&sub=footwear" },
      ],
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tight">
            LUXE<span className="text-accent">WEAR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {categories.map((category) => (
              <div key={category.name} className="group relative">
                <Link
                  to={category.path}
                  className="text-sm font-medium transition-colors hover:text-accent"
                >
                  {category.name}
                </Link>
                <div className="absolute left-0 top-full hidden w-48 bg-card shadow-lg border rounded-md p-2 group-hover:block">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      to={sub.path}
                      className="block px-4 py-2 text-sm hover:bg-secondary rounded-sm transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            </Link>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/track-order" className="cursor-pointer">
                      Track Orders
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer font-semibold text-accent">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <form onSubmit={handleSearch} className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>
                  {categories.map((category) => (
                    <div key={category.name}>
                      <Link
                        to={category.path}
                        className="font-semibold text-lg block mb-2"
                      >
                        {category.name}
                      </Link>
                      <div className="pl-4 flex flex-col gap-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
