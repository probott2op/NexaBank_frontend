import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Receipt, Shield } from "lucide-react";

export const ProductsShowcase = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { productAPI } = await import("@/services/api");
        const response = await productAPI.getAllProducts();
        console.log("ProductsShowcase API response:", response);
        // The API returns { data: [...], totalPages, totalElements, etc }
        const productsData = response?.data || response || [];
        console.log("ProductsShowcase products data:", productsData);
        setProducts(Array.isArray(productsData) ? productsData : []);
        
        // Fetch details for each product
        if (productsData.length > 0) {
          const firstProduct = productsData[0];
          const details = await productAPI.getProductByCode(firstProduct.productCode);
          console.log("First product details:", details);
          setSelectedProduct(details);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductSelect = async (productCode: string) => {
    try {
      const { productAPI } = await import("@/services/api");
      const details = await productAPI.getProductByCode(productCode);
      setSelectedProduct(details);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Selection Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card
            key={product.productCode}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProduct?.productCode === product.productCode
                ? "border-primary shadow-md"
                : ""
            }`}
            onClick={() => handleProductSelect(product.productCode)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.productName}</CardTitle>
                <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                  {product.status}
                </Badge>
              </div>
              <CardDescription>
                {product.productType} • {product.currency}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Interest: {product.interestType}</p>
                {product.compoundingFrequency && (
                  <p>Compounding: {product.compoundingFrequency}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Details */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedProduct.productName} - Details</CardTitle>
            <CardDescription>
              Explore the rules, charges, and benefits for this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rules" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rules">
                  <Shield className="h-4 w-4 mr-2" />
                  Rules & Benefits
                </TabsTrigger>
                <TabsTrigger value="charges">
                  <Receipt className="h-4 w-4 mr-2" />
                  Charges & Fees
                </TabsTrigger>
                <TabsTrigger value="rates">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Interest Rates
                </TabsTrigger>
              </TabsList>

              {/* Rules Tab */}
              <TabsContent value="rules" className="space-y-4">
                {selectedProduct.productRules && selectedProduct.productRules.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rule Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.productRules.map((rule: any) => (
                          <TableRow key={rule.ruleId}>
                            <TableCell className="font-medium">{rule.ruleName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{rule.ruleType}</Badge>
                            </TableCell>
                            <TableCell>{rule.dataType}</TableCell>
                            <TableCell className="font-semibold">
                              {rule.dataType === "PERCENTAGE" ? `${rule.ruleValue}%` : rule.ruleValue}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No rules configured for this product
                  </p>
                )}
              </TabsContent>

              {/* Charges Tab */}
              <TabsContent value="charges" className="space-y-4">
                {selectedProduct.productCharges && selectedProduct.productCharges.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Charge Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Calculation</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Debit/Credit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.productCharges.map((charge: any) => (
                          <TableRow key={charge.chargeId}>
                            <TableCell className="font-medium">{charge.chargeName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{charge.chargeType}</Badge>
                            </TableCell>
                            <TableCell>{charge.calculationType}</TableCell>
                            <TableCell className="font-semibold">
                              {charge.calculationType === "PERCENTAGE"
                                ? `${charge.amount}%`
                                : `₹${charge.amount}`}
                            </TableCell>
                            <TableCell>{charge.frequency}</TableCell>
                            <TableCell>
                              <Badge variant={charge.debitCredit === "DEBIT" ? "destructive" : "default"}>
                                {charge.debitCredit}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No charges configured for this product
                  </p>
                )}
              </TabsContent>

              {/* Interest Rates Tab */}
              <TabsContent value="rates" className="space-y-4">
                {selectedProduct.productInterests && selectedProduct.productInterests.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tenure (Months)</TableHead>
                          <TableHead>Cumulative</TableHead>
                          <TableHead>Monthly</TableHead>
                          <TableHead>Quarterly</TableHead>
                          <TableHead>Yearly</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.productInterests.map((rate: any) => (
                          <TableRow key={rate.rateId}>
                            <TableCell className="font-medium">{rate.termInMonths} months</TableCell>
                            <TableCell className="font-semibold text-primary">
                              {rate.rateCumulative}%
                            </TableCell>
                            <TableCell>{rate.rateNonCumulativeMonthly}%</TableCell>
                            <TableCell>{rate.rateNonCumulativeQuarterly}%</TableCell>
                            <TableCell>{rate.rateNonCumulativeYearly}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No interest rates configured for this product
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
