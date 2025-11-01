import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Order } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  
  const getUserOrders = () => {
    if (!user) return [];
    const userOrdersKey = `orders_${user.id}`;
    return JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
  };
  
  const orders: Order[] = getUserOrders();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Order Not Found</h1>
            <Link to="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <div className="bg-secondary/30 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Total</p>
                <p className="font-semibold">₹{order.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-semibold">{order.trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                <p className="font-semibold">3-5 business days</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/track-order?id=${order.id}`}>
              <Button size="lg">Track Order</Button>
            </Link>
            <Link to="/shop">
              <Button size="lg" variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            A confirmation email has been sent to {order.shippingAddress.name}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
