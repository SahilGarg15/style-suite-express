import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AdminDashboard - Auth State:', { user, authLoading });
    
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    // If not authenticated, redirect to auth page
    if (!user) {
      console.log('AdminDashboard - No user, redirecting to /auth');
      navigate('/auth');
      return;
    }
    
    // If not admin, redirect to home
    if (user.role !== 'ADMIN') {
      console.log('AdminDashboard - User is not admin, redirecting to home');
      navigate('/');
      return;
    }

    console.log('AdminDashboard - User is admin, fetching stats');
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminApi.stats.get();
        console.log('AdminDashboard - Stats fetched:', data);
        setStats(data);
      } catch (error: any) {
        console.error('AdminDashboard - Failed to fetch stats:', error);
        setError(error.message || 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please login to access the admin dashboard</p>
            <Link to="/auth">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You don't have permission to access this page</p>
            <Link to="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your e-commerce store</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/products">
            <Button variant="outline" className="w-full h-16 text-lg">
              <Package className="mr-2 h-6 w-6" />
              Manage Products
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="outline" className="w-full h-16 text-lg">
              <ShoppingCart className="mr-2 h-6 w-6" />
              Manage Orders
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="outline" className="w-full h-16 text-lg">
              <Users className="mr-2 h-6 w-6" />
              Manage Users
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" className="w-full h-16 text-lg">
              View Store
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days: {formatCurrency(stats?.recentRevenue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingOrders || 0} pending orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.lowStockProducts || 0} low stock items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {stats?.lowStockProducts > 0 && (
          <Card className="mb-8 border-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{stats.lowStockProducts} products have stock below 10 units.</p>
              <Link to="/admin/products?filter=lowstock">
                <Button variant="outline" className="mt-4">
                  View Low Stock Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} items
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'DELIVERED' ? 'default' :
                          order.status === 'PENDING' ? 'secondary' :
                          'outline'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">No recent orders</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
