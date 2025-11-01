import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const AdminProducts = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    console.log('AdminProducts - Auth State:', { user, authLoading });
    
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    // If not authenticated, redirect to auth page
    if (!user) {
      console.log('AdminProducts - No user, redirecting to /auth');
      navigate('/auth');
      return;
    }
    
    // If not admin, redirect to home
    if (user.role !== 'ADMIN') {
      console.log('AdminProducts - User is not admin, redirecting to home');
      navigate('/');
      return;
    }

    console.log('AdminProducts - User is admin, fetching products');
    fetchProducts();
  }, [user, authLoading, navigate, page, searchQuery, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = { page, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;

      console.log('AdminProducts - Fetching products with params:', params);
      const response = await adminApi.products.getAll(params);
      console.log('AdminProducts - Products fetched:', response);
      setProducts(response.products);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('AdminProducts - Failed to fetch products:', error);
      setError(error.message || 'Failed to fetch products');
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.products.update(editingProduct);
      toast.success('Product updated successfully');
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await adminApi.products.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const productData = {
        id: formData.get('id') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        basePrice: parseFloat(formData.get('basePrice') as string),
        category: formData.get('category') as string,
        image: formData.get('image') as string,
        images: JSON.stringify([formData.get('image') as string]),
        sizes: formData.get('sizes') as string,
        colors: formData.get('colors') as string,
        stock: parseInt(formData.get('stock') as string)
      };

      await adminApi.products.create(productData);
      toast.success('Product created successfully');
      setIsCreateDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to create product:', error);
      toast.error(error.message || 'Failed to create product');
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please login to access this page</p>
            <Link to="/auth">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show access denied if not admin
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Products</h1>
            <p className="text-muted-foreground">Add, edit, or delete products</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="id">Product ID *</Label>
                      <Input id="id" name="id" required placeholder="silk-kurta-1" />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="women">Women</SelectItem>
                          <SelectItem value="children">Children</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" name="name" required placeholder="Royal Blue Silk Kurta" />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" rows={3} placeholder="Product description" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input id="price" name="price" type="number" required placeholder="2999" />
                    </div>
                    <div>
                      <Label htmlFor="basePrice">Base Price (₹)</Label>
                      <Input id="basePrice" name="basePrice" type="number" placeholder="2999" />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock *</Label>
                      <Input id="stock" name="stock" type="number" required placeholder="50" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" name="image" placeholder="/product-image.png" />
                  </div>

                  <div>
                    <Label htmlFor="sizes">Sizes (JSON array)</Label>
                    <Input id="sizes" name="sizes" placeholder='["S", "M", "L", "XL"]' />
                  </div>

                  <div>
                    <Label htmlFor="colors">Colors (JSON array)</Label>
                    <Input id="colors" name="colors" placeholder='["Red", "Blue", "Green"]' />
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="children">Children</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={fetchProducts}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.stock < 10 && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={product.stock === 0 ? 'text-red-500 font-semibold' : ''}>
                            {product.stock}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <form onSubmit={handleSaveEdit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-id">Product ID</Label>
                      <Input
                        id="edit-id"
                        value={editingProduct.id}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-category">Category</Label>
                      <Select
                        value={editingProduct.category}
                        onValueChange={(value) =>
                          setEditingProduct({ ...editingProduct, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="women">Women</SelectItem>
                          <SelectItem value="children">Children</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-name">Product Name</Label>
                    <Input
                      id="edit-name"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      rows={3}
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-price">Price (₹)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-basePrice">Base Price (₹)</Label>
                      <Input
                        id="edit-basePrice"
                        type="number"
                        value={editingProduct.basePrice}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, basePrice: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-stock">Stock</Label>
                      <Input
                        id="edit-stock"
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-image">Image URL</Label>
                    <Input
                      id="edit-image"
                      value={editingProduct.image}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, image: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-sizes">Sizes (JSON array)</Label>
                    <Input
                      id="edit-sizes"
                      value={typeof editingProduct.sizes === 'string' ? editingProduct.sizes : JSON.stringify(editingProduct.sizes)}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, sizes: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-colors">Colors (JSON array)</Label>
                    <Input
                      id="edit-colors"
                      value={typeof editingProduct.colors === 'string' ? editingProduct.colors : JSON.stringify(editingProduct.colors)}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, colors: e.target.value })
                      }
                    />
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default AdminProducts;
