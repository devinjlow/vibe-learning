import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                index + 1 === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index + 1 < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-2 text-center">{step}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  )
} 