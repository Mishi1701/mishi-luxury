import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CollectionPage from "./pages/CollectionPage.tsx";
import DastaanPage from "./pages/DastaanPage.tsx";
import PoliciesPage from "./pages/PoliciesPage.tsx";
import CustomOrdersPage from "./pages/CustomOrdersPage.tsx";
import CartPage from "./pages/CartPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/dastaan" element={<DastaanPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/custom-orders" element={<CustomOrdersPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
