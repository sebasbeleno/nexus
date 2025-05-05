"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";

interface ErrorStateProps {
  message: string;
  isNotFound?: boolean;
}

export function ErrorState({ message, isNotFound = false }: ErrorStateProps) {
  return (
    <div className="container mx-auto py-6">
      <Alert variant={isNotFound ? "default" : "destructive"}>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>{isNotFound ? "No Encontrado" : "Error"}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
