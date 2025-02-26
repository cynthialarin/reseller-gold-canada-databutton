import React from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster } from 'sonner';
import { Layout } from "../components/Layout";
import { useAuthStore, initializeAuthListener } from "../utils/auth-store";

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Set up auth listener on mount
  React.useEffect(() => {
    const cleanup = initializeAuthListener();
    return () => cleanup();
  }, []);

  return (
    <>
      <Toaster position="top-right" theme="dark" />
      <Layout>
        <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <header className="relative overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20">
              <div className="relative z-10 mx-auto max-w-2xl lg:col-span-7 lg:max-w-none lg:pt-6">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  Reseller Gold Canada
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Transform your Canadian reselling business with AI-powered insights. List faster, price smarter, and sell more on Facebook Marketplace and other platforms.
                </p>
                <div className="mt-8 flex gap-x-6">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-gray-200"
                    onClick={() => navigate(user ? '/Inventory' : '/register')}
                  >
                    {user ? 'Go to Inventory' : 'Get Started'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black"
                    onClick={() => navigate(user ? '/dashboard' : '/login')}
                  >
                    {user ? 'View Dashboard' : 'Sign In'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you need to scale your reselling business
              </h2>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {/* AI Listing Creation */}
                <Card className="bg-gray-900 border-gray-800">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white">AI-Powered Listings</h3>
                    <p className="mt-4 text-sm text-gray-400">
                      Create professional listings in seconds with AI-generated titles, descriptions, and optimal pricing suggestions.
                    </p>
                  </div>
                </Card>
                {/* Multi-Platform Management */}
                <Card className="bg-gray-900 border-gray-800">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white">Multi-Platform Management</h3>
                    <p className="mt-4 text-sm text-gray-400">
                      Manage your Facebook Marketplace and other platform listings from a single dashboard with real-time synchronization.
                    </p>
                  </div>
                </Card>
                {/* Analytics & Insights */}
                <Card className="bg-gray-900 border-gray-800">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white">Smart Analytics</h3>
                    <p className="mt-4 text-sm text-gray-400">
                      Make data-driven decisions with comprehensive analytics and Canadian market trend insights.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative isolate py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to transform your reselling business?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                Join successful Canadian resellers who are already using Reseller Gold to boost their profits.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
                >
                  {user ? 'Go to Dashboard' : 'Start Free Trial'}
                </Button>
              </div>
            </div>
          </div>
        </section>
        </div>
      </Layout>
    </>
  );
}
