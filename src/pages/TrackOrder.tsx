import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { Order } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";

const TrackOrder = () => {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First try to fetch from API - support both orderNumber and orderId
      const response = await fetch(`/api/orders/index?action=track&orderNumber=${orderId}&orderId=${orderId}`);
      
      if (response.ok) {
        const fetchedOrder = await response.json();
        
        // Parse shipping address if it's a string
        let shippingAddress = fetchedOrder.shippingAddress;
        if (typeof shippingAddress === 'string') {
          shippingAddress = JSON.parse(shippingAddress);
        }
        
        // Convert API order format to local Order type
        const order: Order = {
          id: fetchedOrder.orderNumber,
          items: fetchedOrder.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            selectedSize: "M", // Default since API doesn't store this
          })),
          total: fetchedOrder.total,
          status: fetchedOrder.status.toLowerCase(),
          date: fetchedOrder.createdAt,
          shippingAddress: {
            name: shippingAddress.name || fetchedOrder.customerName,
            address: shippingAddress.addressLine1,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.pincode,
            phone: shippingAddress.phone || fetchedOrder.customerPhone
          },
          trackingNumber: fetchedOrder.orderNumber
        };
        
        setOrder(order);
        setNotFound(false);
        return;
      }
    } catch (error) {
      console.error('Error fetching order from API:', error);
    }
    
    // Fallback to localStorage if API fails
    const getUserOrders = () => {
      if (!user) return [];
      const userOrdersKey = `orders_${user.id}`;
      return JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
    };
    
    const orders: Order[] = getUserOrders();
    const foundOrder = orders.find((o) => o.id === orderId);

    if (foundOrder) {
      setOrder(foundOrder);
      setNotFound(false);
    } else {
      setOrder(null);
      setNotFound(true);
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return <Package className="h-8 w-8 text-accent" />;
      case "shipped":
        return <Truck className="h-8 w-8 text-accent" />;
      case "delivered":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-8 w-8 text-destructive" />;
    }
  };

  const getStatusSteps = (currentStatus: Order["status"]) => {
    const steps = [
      { status: "processing", label: "Order Processing", active: true },
      {
        status: "shipped",
        label: "Shipped",
        active: ["shipped", "delivered"].includes(currentStatus),
      },
      { status: "delivered", label: "Delivered", active: currentStatus === "delivered" },
    ];
    return steps;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Track Your Order</h1>

          <form onSubmit={handleTrack} className="mb-12">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="orderId">Order ID or Order Number</Label>
                <Input
                  id="orderId"
                  placeholder="Enter order ID (123) or order number (ORD-xxx)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="mt-6">
                Track Order
              </Button>
            </div>
          </form>

          {notFound && (
            <div className="text-center p-8 border rounded-lg bg-destructive/10">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground">
                We couldn't find an order with that ID. Please check and try again.
              </p>
            </div>
          )}

          {order && (
            <div className="space-y-8">
              {/* Order Status */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  {getStatusIcon(order.status)}
                  <div>
                    <h2 className="text-2xl font-bold capitalize">{order.status}</h2>
                    <p className="text-muted-foreground">Order ID: {order.id}</p>
                    {order.trackingNumber && (
                      <p className="text-sm text-muted-foreground">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                {order.status !== "cancelled" && (
                  <div className="relative">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-border" />
                    <div className="relative flex justify-between">
                      {getStatusSteps(order.status).map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.active
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {step.active ? "✓" : idx + 1}
                          </div>
                          <span className="text-sm mt-2 text-center">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Shipping Address</h3>
                <div className="text-muted-foreground">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.selectedSize}
                        </p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{item.product.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackOrder;
