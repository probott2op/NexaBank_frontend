import { FDCalculator } from "@/components/FDCalculator";
import { ProductsShowcase } from "@/components/ProductsShowcase";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, TrendingUp, Users, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptMCAwYzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="container relative z-10 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Banking Made Simple,
              <br />
              <span className="text-white/90">Returns Made Better</span>
            </h1>
            <p className="mb-8 text-xl text-white/90 sm:text-2xl">
              Secure your future with NexaBank's competitive Fixed Deposit rates
              and exceptional customer service
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="gap-2 shadow-elevated">
                  Open Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Secure & Trusted</h3>
              <p className="text-sm text-muted-foreground">
                Bank-grade security with encrypted transactions
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">High Returns</h3>
              <p className="text-sm text-muted-foreground">
                Competitive interest rates up to 7.75% p.a.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Instant Processing</h3>
              <p className="text-sm text-muted-foreground">
                Quick account opening and FD booking
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated customer service team
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-4xl font-bold">
                Our Fixed Deposit Products
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore our FD products with their rates, charges, and benefits
              </p>
            </div>
            <ProductsShowcase />
          </div>
        </div>
      </section>

      {/* FD Calculator Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-4xl font-bold">
                Calculate Your Returns
              </h2>
              <p className="text-lg text-muted-foreground">
                Use our FD calculator to see how much you can earn
              </p>
            </div>
            <FDCalculator />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-16 text-white">
        <div className="container px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Join thousands of satisfied customers who trust NexaBank
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2 shadow-elevated">
              Get Started Today
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
