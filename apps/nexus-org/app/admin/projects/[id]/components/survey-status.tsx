'use client';

import { CalendarIcon } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Tables } from '@workspace/db/src/types';

type SurveyRow = Tables<'surveys'>;

interface SurveyStatusProps {
  survey: SurveyRow;
}

export function SurveyStatus({ survey }: SurveyStatusProps) {
  // Helper function to format dates
  function formatDate(dateString: string | null) {
    if (!dateString) return "No establecido";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Helper function for deadline status and badge
  function getDeadlineStatus(deadline: string | null) {
    if (!deadline) return { label: 'Sin fecha', variant: 'secondary' as const };
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const differenceInDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (differenceInDays < 0) return { label: 'Vencido', variant: 'destructive' as const };
    if (differenceInDays <= 7) return { label: `${differenceInDays} días`, variant: 'warning' as const };
    return { label: `${differenceInDays} días`, variant: 'default' as const };
  }
  
  const deadlineStatus = getDeadlineStatus(survey.deadline);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={deadlineStatus.variant}>
        {deadlineStatus.label}
      </Badge>
      <span className="flex items-center text-sm text-muted-foreground">
        <CalendarIcon className="h-4 w-4 mr-1" />
        {formatDate(survey.deadline)}
      </span>
    </div>
  );
}
