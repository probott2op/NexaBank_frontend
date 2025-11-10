import { FDCalculator } from "@/components/FDCalculator";
import { ProductsShowcase } from "@/components/ProductsShowcase";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Shield, TrendingUp, Users, Zap } from "lucide-react";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptMCAwYzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="container relative z-10 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              {t('home.heroTitle')}
              <br />
              <span className="text-white/90">{t('home.heroSubtitle')}</span>
            </h1>
            <p className="mb-8 text-xl text-white/90 sm:text-2xl">
              {t('home.heroDescription')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="gap-2 shadow-elevated">
                  {t('home.openAccount')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('home.viewProducts')}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('home.calculateReturns')}
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
              <h3 className="mb-2 text-lg font-semibold">{t('home.secureTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.secureDesc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{t('home.highReturnsTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.highReturnsDesc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{t('home.instantTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.instantDesc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{t('home.supportTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.supportDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-4xl font-bold">
                {t('home.productsHeading')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('home.productsSubheading')}
              </p>
            </div>
            <ProductsShowcase />
          </div>
        </div>
      </section>

      {/* FD Calculator Section */}
      <section id="calculator" className="py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-4xl font-bold">
                {t('home.calculatorHeading')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('home.calculatorSubheading')}
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
            {t('home.heroTitle')}
          </h2>
          <p className="mb-8 text-lg text-white/90">
            {t('home.heroDescription')}
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2 shadow-elevated">
              {t('home.openAccount')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
