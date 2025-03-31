
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface DashboardHeaderProps {
  resetScores: () => void;
}

const DashboardHeader = ({ resetScores }: DashboardHeaderProps) => {
  const { toast } = useToast();

  const handleReset = () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les scores ?");
    if (confirmed) {
      resetScores();
      toast({
        title: "Scores réinitialisés",
        description: "Tous les scores ont été remis à zéro.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center mb-6 mt-4">
      <h1 className="text-3xl font-bold mb-2">Tableau des Scores Élémentaux</h1>
      <p className="text-muted-foreground text-center mb-4">
        Suivez les points de chaque équipe élémentale et visualisez leur performance
      </p>
      <Button variant="outline" onClick={handleReset} className="ml-auto">
        Réinitialiser les scores
      </Button>
    </div>
  );
};

export default DashboardHeader;
