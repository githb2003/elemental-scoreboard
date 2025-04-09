
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PasswordProtection = ({ children }: PasswordProtectionProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  // Simple hardcoded password - in a real app, you'd use a more secure method
  const ADMIN_PASSWORD = "elements123";
  const MAX_ATTEMPTS = 5;

  const handleAuthenticate = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
      toast({
        title: "Authentification réussie",
        description: "Bienvenue dans l'interface d'administration",
      });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword("");
      
      if (newAttempts >= MAX_ATTEMPTS) {
        toast({
          title: "Trop de tentatives",
          description: `Vous avez dépassé le nombre maximum de tentatives (${MAX_ATTEMPTS})`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Mot de passe incorrect",
          description: `Tentative ${newAttempts}/${MAX_ATTEMPTS}`,
          variant: "destructive",
        });
      }
    }
  };

  // Check if user was previously authenticated
  useEffect(() => {
    const storedAuth = localStorage.getItem("admin_authenticated");
    if (storedAuth === "true") {
      setAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
    toast({
      title: "Déconnexion",
      description: "Vous êtes maintenant déconnecté",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAuthenticate();
    }
  };

  if (authenticated) {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Accès Administrateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Veuillez entrer le mot de passe pour accéder à l'interface d'administration
            </p>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={attempts >= MAX_ATTEMPTS}
              className="text-center"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleAuthenticate}
            disabled={attempts >= MAX_ATTEMPTS}
          >
            Accéder
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordProtection;
