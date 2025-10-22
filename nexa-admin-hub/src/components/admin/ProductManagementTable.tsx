import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { productAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { ProductDialog } from "./ProductDialog";
import { DeleteDialog } from "./DeleteDialog";

export const ProductManagementTable = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
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

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await productAPI.deleteProduct(selectedProduct.productCode);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedProduct) {
        await productAPI.updateProduct(selectedProduct.productCode, data);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await productAPI.createProduct(data);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      setDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => {
            setSelectedProduct(null);
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No products found</div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.productCode} className="rounded-lg border bg-card p-4 hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{product.productName}</h3>
                      <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Code: {product.productCode} | Type: {product.productType}
                    </p>
                    <p className="text-sm">{product.productDescription}</p>
                    <div className="mt-3 flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Currency: {product.currency}
                      </span>
                      <span className="text-muted-foreground">
                        Interest: {product.interestType}
                      </span>
                      {product.compoundingFrequency && (
                        <span className="text-muted-foreground">
                          Compounding: {product.compoundingFrequency}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProduct(product);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProduct(product);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  );
};
