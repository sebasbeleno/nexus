export type Message =
  | { success: string }
  | { error: string }
  | { message: string };


interface FormMessageProps {
  message: string;
  type: "success" | "error" | "message";
}

export function FormMessage({ message, type }: FormMessageProps) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm mt-4">
      {type === "success" && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {message}
        </div>
      )}
      {type === "error" && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {message}
        </div>
      )}
      {type === "message" && (
        <div className="text-foreground border-l-2 px-4">{message}</div>
      )}
    </div>
  );
}
