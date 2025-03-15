"use client"

import * as React from "react"
import { cn } from "#/lib/utils"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Heart, HeartCrack } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "./tooltip"

export type Mark = {
  style?: React.CSSProperties
  label?: React.ReactNode
}

type InternalMark = Mark & {
  value: number
}

type ISliderContext = {
  value?: number[]
}

const SliderContext = React.createContext<ISliderContext>({})
const useSlider = () => React.useContext(SliderContext)

export type SliderProps = React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> & {
  marks?: Record<string | number, string | Mark>
}

const TOOLTIP_CLOSE_DELAY = 1520
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, marks, onValueChange, onValueCommit, ...props }, ref) => {
  const markList = React.useMemo<InternalMark[]>(() => {
    if (!marks) {
      return []
    }

    return Object.keys(marks)
      .map((key) => {
        const mark = marks[key]
        const markObj: InternalMark = {
          value: Number(key),
        }

        if (
          typeof mark === "object" &&
          !React.isValidElement(mark) &&
          ("label" in mark || "style" in mark)
        ) {
          markObj.style = mark.style
          markObj.label = mark.label
        } else {
          markObj.label = mark as string
        }

        return markObj
      })
      .filter(({ label }) => label || typeof label === "number")
      .sort((a, b) => a.value - b.value)
  }, [marks])

  const [value, setValue] = React.useState<number[]>(
    props.defaultValue ?? props.value ?? [0]
  )
  const [tooltipOpening, setTooltipOpen] = React.useState(false)
  const isOpening = React.useDeferredValue(tooltipOpening)
  const openTimeoutRef = React.useRef<NodeJS.Timeout>()
  const handleChange = (value: number | number[]) => {
    setTooltipOpen(true)
    clearTimeout(openTimeoutRef.current)
    openTimeoutRef.current = setTimeout(() => {
      setTooltipOpen(false)
    }, TOOLTIP_CLOSE_DELAY)
    const newValue = Array.isArray(value) ? value : [value]
    onValueChange?.(newValue)
    return setValue(newValue)
  }
  const currentValue = value?.[0]

  return (
    <SliderContext.Provider value={{ value }}>
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center transition-all",
          className
        )}
        {...props}
        value={value}
        onValueChange={handleChange}
        onValueCommit={onValueCommit}
      >
        <SliderPrimitive.Track className="bg-primary/20 hover:bg-primary/30 relative h-1 w-full grow cursor-pointer overflow-hidden rounded-full transition-colors duration-200">
          <SliderPrimitive.Range className="bg-primary data-[disabled]:bg-primary/20 absolute h-full cursor-pointer" />
        </SliderPrimitive.Track>

        <Marks
          marks={markList}
          onClick={handleChange}
          disabled={props.disabled}
        />

        <Tooltip open={isOpening}>
          <TooltipTrigger asChild>
            <Thumb currentValue={currentValue} />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              <p>{currentValue}</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </SliderPrimitive.Root>
    </SliderContext.Provider>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

type MarkProps = {
  marks?: InternalMark[]
  onClick?: (value: number) => void
  disabled?: boolean
}

const Marks = (props: MarkProps) => {
  const { marks, onClick, disabled } = props
  const { value: sharedValues } = useSlider()

  if (!marks?.length) {
    return null
  }

  return (
    <>
      {marks.map(({ value }) => {
        const offset = getThumbInBoundsOffset(4, value, value >= 50 ? -1 : 0.2)
        return (
          <span
            key={`mark dot ${value}`}
            style={{
              left: `calc(${value}% + ${offset}px)`,
            }}
            className={cn(
              "bg-background focus-visible:ring-ring absolute z-0 block h-1.5 w-1.5 cursor-pointer rounded-full border border-slate-300 text-center focus-visible:outline-none focus-visible:ring-1",
              (sharedValues?.[0] ?? 0) >= value &&
                !disabled &&
                "border-primary",
              disabled && "border-primary/50"
            )}
          />
        )
      })}

      <div className="absolute top-6 w-full">
        {marks.map(({ value, style, label }) => {
          const offset = getThumbInBoundsOffset(4, value, value >= 50 ? -1 : 2)
          return (
            <span
              key={`mark label ${value}`}
              className={cn(
                "hover:text-primary absolute flex -translate-x-1/2 cursor-pointer justify-center text-xs transition-colors duration-200",
                (sharedValues?.[0] ?? 0) >= value
                  ? "text-primary"
                  : "text-primary/40",
                disabled && "pointer-events-none"
              )}
              style={{
                ...style,
                left: `calc(${value}% + ${offset}px)`,
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
                onClick?.(value)
              }}
              defaultValue={value}
            >
              {label}
            </span>
          )
        })}
      </div>
    </>
  )
}

const Thumb = ({
  currentValue,
}: {
  currentValue: number
} & SliderPrimitive.SliderThumbProps &
  React.RefAttributes<HTMLSpanElement>) => {
  const ThumbIcon = currentValue < 50 ? HeartCrack : Heart

  return (
    <SliderPrimitive.Thumb
      className={cn(
        "ring-primary bg-background data-[disabled]:bg-accent focus-visible:ring-primary hover:text-primary group z-10 flex cursor-pointer items-center justify-center rounded-full border p-1 text-center transition-all duration-150 hover:ring-1 focus-visible:outline-none focus-visible:ring-1 data-[disabled]:pointer-events-none",
        currentValue >= 50 && "border-primary",
        currentValue >= 80 && "ring-1"
      )}
    >
      <ThumbIcon
        className={cn(
          "h-3 w-3 stroke-1 group-hover:stroke-2 dark:stroke-white",
          currentValue === 100 && "fill-primary"
        )}
      />
    </SliderPrimitive.Thumb>
  )
}

/**
 * Offsets the thumb centre point while sliding to ensure it remains
 * within the bounds of the slider when reaching the edges
 */
function getThumbInBoundsOffset(width: number, left: number, direction = 1) {
  const halfWidth = width / 2
  const halfPercent = 50
  const offset = linearScale([0, halfPercent], [0, halfWidth])
  return (halfWidth - offset(left) * direction) * direction
}

function linearScale(
  input: readonly [number, number],
  output: readonly [number, number]
) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0]
    const ratio = (output[1] - output[0]) / (input[1] - input[0])
    return output[0] + ratio * (value - input[0])
  }
}

export { Slider }
