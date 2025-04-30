import { HTMLAttributes } from "react"
import { cn } from "@workspace/ui/lib/utils"

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  heading: string
  text?: string
}

export function PageHeader({
  heading,
  text,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  )
}
