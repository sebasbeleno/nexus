"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { QuestionType } from "@workspace/types";
import { 
  AlignLeft, 
  Hash, 
  ListChecks, 
  CheckSquare, 
  Circle, 
  CheckCircle, 
  Calendar,
  Clock
} from "lucide-react";

interface QuestionTypeCardProps {
  onSelect: (type: QuestionType) => void;
}

export function QuestionTypeCard({ onSelect }: QuestionTypeCardProps) {
  const questionTypes: { type: QuestionType; icon: React.ReactNode; label: string }[] = [
    { type: 'text', icon: <AlignLeft className="h-4 w-4" />, label: 'Texto' },
    { type: 'number', icon: <Hash className="h-4 w-4" />, label: 'Número' },
    { type: 'select', icon: <ListChecks className="h-4 w-4" />, label: 'Selector' },
    { type: 'multiselect', icon: <CheckSquare className="h-4 w-4" />, label: 'Selección Múltiple' },
    { type: 'radio', icon: <Circle className="h-4 w-4" />, label: 'Opción Única' },
    { type: 'checkbox', icon: <CheckCircle className="h-4 w-4" />, label: 'Casilla de Verificación' },
    { type: 'date', icon: <Calendar className="h-4 w-4" />, label: 'Fecha' },
    { type: 'time', icon: <Clock className="h-4 w-4" />, label: 'Hora' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tipos de Preguntas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {questionTypes.map((item) => (
            <Button
              key={item.type}
              variant="outline"
              className="flex flex-col items-center justify-center h-20 text-xs"
              onClick={() => onSelect(item.type)}
            >
              <div className="mb-1">{item.icon}</div>
              {item.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
