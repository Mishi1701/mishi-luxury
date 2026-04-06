import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";

const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const DastaanPage = lazy(() => import("./pages/DastaanPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
const CustomOrdersPage = lazy(() => import("./pages/CustomOrdersPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const MemberDashboardPage = lazy(() => import("./pages/MemberDashboardPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center animate-fade-up">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Loading the Empire...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/collections/:slug" element={<CollectionPage />} />
            <Route path="/dastaan" element={<DastaanPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/custom-orders" element={<CustomOrdersPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<MemberDashboardPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
