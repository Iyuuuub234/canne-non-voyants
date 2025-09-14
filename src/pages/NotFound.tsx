import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default NotFound;