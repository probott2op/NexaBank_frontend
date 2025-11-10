import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { productAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Search, Eye } from "lucide-react";
import { ProductDialog } from "./ProductDialog";
import { DeleteDialog } from "./DeleteDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ProductManagementTable = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      
      // Handle both paginated and non-paginated responses
      const productList = response.content || response.data || response || [];
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleViewProduct = (product: any) => {
    navigate(`/admin/products/${product.productCode}`);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await productAPI.deleteProduct(productToDelete.productCode);
      toast({
        title: "Success",
        description: `Product ${productToDelete.productCode} has been deleted`,
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (selectedProduct) {
        // Update existing product
        await productAPI.updateProduct(selectedProduct.productCode, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        await productAPI.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      fetchProducts();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesType = typeFilter === "all" || product.productType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      PENDING: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getProductTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      SAVINGS: "bg-green-100 text-green-800",
      CURRENT: "bg-blue-100 text-blue-800",
      LOAN: "bg-orange-100 text-orange-800",
      FIXED_DEPOSIT: "bg-purple-100 text-purple-800",
      RECURRING_DEPOSIT: "bg-pink-100 text-pink-800",
      CREDIT_CARD: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[type] || "bg-gray-100 text-gray-800"}`}>
        {type}
      </span>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage financial products and their configurations (INSERT-ONLY system with audit trail)
              </CardDescription>
            </div>
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by code, name, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SAVINGS">Savings Account</SelectItem>
                <SelectItem value="CURRENT">Current Account</SelectItem>
                <SelectItem value="LOAN">Loan</SelectItem>
                <SelectItem value="FIXED_DEPOSIT">Fixed Deposit</SelectItem>
                <SelectItem value="RECURRING_DEPOSIT">Recurring Deposit</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No products match your search criteria"
                : "No products found. Create your first product to get started."}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interest Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.productId || product.productCode}>
                      <TableCell className="font-medium">{product.productCode}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.productName}</div>
                          {product.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getProductTypeBadge(product.productType)}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {product.interestType}
                          {product.compoundingFrequency && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({product.compoundingFrequency})
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{product.currency}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.createdAt 
                          ? new Date(product.createdAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProduct(product)}
                            title="View product details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete product "${productToDelete?.productCode}"? This action cannot be undone and will remove all related configurations (interest rates, charges, rules, etc.).`}
      />
    </>
  );
};
