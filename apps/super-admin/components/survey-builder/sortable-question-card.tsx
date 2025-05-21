"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QuestionCard } from "./question-card";
import type { Question } from "@workspace/types";

interface SortableQuestionCardProps {
  question: Question;
  sectionId: string;
}

export function SortableQuestionCard({ question, sectionId }: SortableQuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionCard
        question={question}
        sectionId={sectionId}
      />
    </div>
  );
}
