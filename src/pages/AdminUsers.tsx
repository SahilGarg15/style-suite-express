import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "sonner";

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) {
      return; // Wait for user to load
    }
    
    if (user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [user, navigate, page, searchQuery]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = { page, limit: 20 };
      if (searchQuery) params.search = searchQuery;

      const response = await adminApi.users.getAll(params);
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setError(error.message || 'Failed to fetch users');
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await adminApi.users.updateRole(userId, newRole);
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user role');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Users</h1>
          <p className="text-muted-foreground">View and manage user accounts</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={fetchUsers}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((usr) => (
                    <TableRow key={usr.id}>
                      <TableCell className="font-medium">{usr.name}</TableCell>
                      <TableCell>{usr.email}</TableCell>
                      <TableCell>
                        <Badge variant={usr.role === 'ADMIN' ? 'default' : 'outline'}>
                          {usr.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{usr._count?.orders || 0}</TableCell>
                      <TableCell>
                        {usr.isVerified ? (
                          <Badge variant="outline" className="bg-green-50">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={usr.role}
                          onValueChange={(value) => handleRoleUpdate(usr.id, value)}
                          disabled={usr.id === user?.id}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
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
      </div>

      <Footer />
    </div>
  );
};

export default AdminUsers;
