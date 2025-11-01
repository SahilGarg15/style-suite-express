import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@/types/product";
import { Package, User, Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import ProductCard from "@/components/ProductCard";

const Account = () => {
  const [isLoggedIn] = useState(false); // This would be managed by auth context in real app
  const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]");
  const { items: wishlistItems } = useWishlist();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <User className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-4xl font-bold mb-4">My Account</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to view your account details and order history
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link to="/track-order">
                <Button size="lg" variant="outline">
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
        <h1 className="text-4xl font-bold mb-8">My Account</h1>

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
                        <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
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
                              Qty: {item.quantity} | {item.selectedSize} | {item.selectedColor}
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
          <TabsContent value="profile">
            <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
            <div className="max-w-2xl border rounded-lg p-6">
              <p className="text-muted-foreground">Profile management coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
