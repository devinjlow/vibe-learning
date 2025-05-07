import { cn } from "@/lib/utils"

interface BackgroundPillsProps {
  options: string[]
  selected: string | null
  onSelect: (option: string) => void
}

export function BackgroundPills({ options, selected, onSelect }: BackgroundPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selected === option
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
} 