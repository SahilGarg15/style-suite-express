import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Order } from "@/types/product";

const Checkout = () => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (Object.values(formData).some((value) => !value)) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user) {
      toast.error("Please login to place an order");
      navigate("/auth");
      return;
    }

    // Create local order first (for immediate feedback)
    const localOrder: Order = {
      id: `ORD-${Date.now()}`,
      items,
      total: getTotal() + (getTotal() > 500 ? 0 : 40),
      status: "processing",
      date: new Date().toISOString(),
      shippingAddress: formData,
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };

    // Save to localStorage immediately
    const userOrdersKey = `orders_${user.id}`;
    const existingOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
    localStorage.setItem(userOrdersKey, JSON.stringify([...existingOrders, localOrder]));

    // Try to save to API in background (don't block user if it fails)
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        const orderData = {
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          shippingAddress: {
            name: formData.name,
            phone: formData.phone,
            addressLine1: formData.address,
            addressLine2: "",
            city: formData.city,
            state: formData.state,
            pincode: formData.zipCode,
            country: "India"
          },
          paymentMethod: "COD",
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone
        };

        const response = await fetch('/api/orders/index?action=create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        if (response.ok) {
          const apiOrder = await response.json();
          console.log('Order saved to database:', apiOrder.orderNumber);
          
          // Update localStorage with database order number
          const updatedOrders = existingOrders.map((o: Order) => 
            o.id === localOrder.id ? { ...o, id: apiOrder.orderNumber, trackingNumber: apiOrder.orderNumber } : o
          );
          updatedOrders.push({ ...localOrder, id: apiOrder.orderNumber, trackingNumber: apiOrder.orderNumber });
          localStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));
        } else {
          const errorData = await response.json();
          console.error('Failed to save order to database:', response.status, errorData);
        }
      }
    } catch (error) {
      // Silently fail - order is already saved locally
      console.error('Failed to sync order to database:', error);
    }

    toast.success("Order placed successfully!");
    clearCart();
    navigate(`/order-confirmation/${localOrder.id}`);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Place Order
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="border rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.selectedSize}
                      </p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{item.product.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">
                    {getTotal() > 500 ? "FREE" : "₹50"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{(getTotal() + (getTotal() > 500 ? 0 : 50)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
