import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@/types/product";
import { Package, User, Heart, LogOut, Mail, MapPin, Phone, Calendar } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

const Account = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get user-specific orders
  const getUserOrders = () => {
    if (!user) return [];
    const userOrdersKey = `orders_${user.id}`;
    return JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
  };
  
  const [orders, setOrders] = useState<Order[]>([]);
  const { items: wishlistItems } = useWishlist();

  // Profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });

  // Load saved profile data on mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            // Fetch orders from API
            const response = await fetch('/api/orders/index?action=my-orders', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const apiOrders = await response.json();
              
              // Convert API orders to local Order format
              const formattedOrders: Order[] = apiOrders.map((apiOrder: any) => {
                let shippingAddress = apiOrder.shippingAddress;
                if (typeof shippingAddress === 'string') {
                  shippingAddress = JSON.parse(shippingAddress);
                }
                
                return {
                  id: apiOrder.orderNumber,
                  items: apiOrder.items.map((item: any) => ({
                    product: item.product,
                    quantity: item.quantity,
                    selectedSize: "M",
                    selectedColor: "Default"
                  })),
                  total: apiOrder.total,
                  status: apiOrder.status.toLowerCase(),
                  date: apiOrder.createdAt,
                  shippingAddress: {
                    name: shippingAddress.name || apiOrder.customerName,
                    address: shippingAddress.addressLine1,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    zipCode: shippingAddress.pincode,
                    phone: shippingAddress.phone || apiOrder.customerPhone
                  },
                  trackingNumber: apiOrder.orderNumber
                };
              });
              
              setOrders(formattedOrders);
              
              // Also sync to localStorage
              const userOrdersKey = `orders_${user.id}`;
              localStorage.setItem(userOrdersKey, JSON.stringify(formattedOrders));
              
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching orders from API:', error);
        }
        
        // Fallback to localStorage
        setOrders(getUserOrders());
      }
    };
    
    if (user) {
      fetchOrders();
      
      // Load user-specific profile
      const userProfileKey = `userProfile_${user.id}`;
      const savedProfile = localStorage.getItem(userProfileKey);
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      } else {
        setProfileData((prev) => ({
          ...prev,
          name: user.name,
          email: user.email,
        }));
      }
    }
  }, [user]);

  const handleSignOut = () => {
    signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!user) return;
    
    // Save profile to localStorage with user-specific key
    const userProfileKey = `userProfile_${user.id}`;
    localStorage.setItem(userProfileKey, JSON.stringify(profileData));
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancelEdit = () => {
    if (!user) return;
    
    // Reset to saved data
    const userProfileKey = `userProfile_${user.id}`;
    const savedProfile = localStorage.getItem(userProfileKey);
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        country: "",
      });
    }
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md px-4">
            <User className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-4xl font-bold mb-4">My Account</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to view your account details and order history
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">Sign In</Button>
              </Link>
              <Link to="/track-order">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Track Order as Guest
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">My Account</h1>
            <p className="text-muted-foreground mt-2">Welcome back, {user?.name}!</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-semibold">Order History</h2>
            {orders.length === 0 ? (
              <div className="text-center py-16 border rounded-lg">
                <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start shopping to see your orders here
                </p>
                <Link to="/shop">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-lg">Order {order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-muted-foreground">
                              Qty: {item.quantity} | {item.selectedSize}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                    <Link to={`/track-order?id=${order.id}`}>
                      <Button variant="outline" className="w-full">
                        Track Order
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <h2 className="text-2xl font-semibold mb-6">My Wishlist</h2>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16 border rounded-lg">
                <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">No Items in Wishlist</h3>
                <p className="text-muted-foreground mb-6">
                  Save your favorite items to wishlist
                </p>
                <Link to="/shop">
                  <Button>Browse Products</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Profile Information</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-6 max-w-3xl">
              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Manage your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange("name", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                      disabled={!isEditing}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription>
                    Default shipping address for your orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleProfileChange("address", e.target.value)}
                      disabled={!isEditing}
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => handleProfileChange("city", e.target.value)}
                        disabled={!isEditing}
                        placeholder="New York"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={profileData.zipCode}
                        onChange={(e) => handleProfileChange("zipCode", e.target.value)}
                        disabled={!isEditing}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) => handleProfileChange("country", e.target.value)}
                      disabled={!isEditing}
                      placeholder="United States"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your account details and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span className="font-medium">{orders.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Wishlist Items</span>
                    <span className="font-medium">{wishlistItems.length}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Account Status</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
