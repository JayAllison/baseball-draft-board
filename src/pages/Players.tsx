import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "../components/UseToast";
import { Toaster } from "../components/Toaster";
import brain from "brain";
import { AlertCircle, Trophy, Upload, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Player {
  name: string;
  birthdate: string;
}

interface UploadResponse {
  total_players: number;
  successful_uploads: number;
  failed_uploads: number;
  errors: string[];
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClearPlayers = async () => {
    try {
      const response = await brain.clear_players();
      const data = await response.json();
      await loadPlayers();
      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      console.error('Error clearing players:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear players",
      });
    }
  };

  const loadPlayers = async () => {
    try {
      const response = await brain.get_players();
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load players",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file",
      });
      return;
    }

    setIsUploading(true);
    setUploadErrors([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await brain.upload_players({ file: file });
      await loadPlayers();
      const data: UploadResponse = await response.json();

      if (data.failed_uploads > 0) {
        setUploadErrors(data.errors);
      }

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${data.successful_uploads} out of ${data.total_players} players`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading the players",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Toaster />
      
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate("/")}>
        <Trophy className="h-8 w-8 text-primary hover:text-primary/80" />
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Bebas Neue" }}>
          MANAGE PLAYERS
        </h1>
      </div>

      {/* Upload Section */}
      <Card className="max-w-2xl mx-auto p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <h2
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "Bebas Neue" }}
            >
              UPLOAD PLAYERS
            </h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <p className="text-sm text-muted-foreground">
              CSV must include 'name' and 'birthdate' columns. Birthdate should
              be in YYYY-MM-DD format.
            </p>
          </div>

          {/* Error Display */}
          {uploadErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  {uploadErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Players List */}
      <Card className="max-w-2xl mx-auto p-6 mt-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "Bebas Neue" }}
              >
                CURRENT PLAYERS
              </h2>
              {players.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Players</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all
                        {players.length} player{players.length !== 1 ? 's' : ''} from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearPlayers}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Clear Players
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {players.length} player{players.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading players...
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No players uploaded yet
            </div>
          ) : (
            <div className="divide-y">
              {players.map((player, index) => (
                <div key={index} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{player.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Born: {format(new Date(player.birthdate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
}