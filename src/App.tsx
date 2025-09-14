import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

// Configuration du client React Query avec des paramètres par défaut
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Composant NotFound intégré
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-logo-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-white">
            404 - Page Non Trouvée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-white/80">
            La page que vous recherchez n'existe pas.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Toaster pour les notifications toast */}
      <Toaster />

      {/* Sonner pour les notifications sonores */}
      <Sonner />

      {/* Configuration du router */}
      <BrowserRouter>
        <Routes>
          {/* Route principale */}
          <Route path="/" element={<Index />} />

          {/* Route catch-all pour les pages non trouvées - DOIT ÊTRE LA DERNIÈRE ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;