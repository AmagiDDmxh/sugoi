"use client"

import * as React from "react"
import { useSize } from "#/hooks/useSize"
import { cn } from "#/lib/utils"
import * as SliderPrimitive from "@radix-ui/react-slider"

import {
  Tooltip,
  TooltipArrow,
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
  // onChange?: (value: number) => void
}

let openTimeout: NodeJS.Timeout
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, marks, onValueChange, onValueCommit, ...props }, ref) => {
  const markList = React.useMemo<InternalMark[]>(() => {
    if (!marks) {
      return []
    }

    const keys = Object.keys(marks)

    return keys
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

  const thumb = React.useRef<HTMLSpanElement | null>(null)
  const thumbSize = useSize(thumb.current)

  const [value, setValue] = React.useState<number[]>()
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const handleChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setValue(value)
      onValueChange?.(value)
    } else {
      setValue([value])
      onValueChange?.([value])
    }
  }
  const handleOnCommit = (value: number[]) => {
    setTooltipOpen(true)
    if (openTimeout) {
      clearTimeout(openTimeout)
    }
    openTimeout = setTimeout(() => setTooltipOpen(false), 800)
    onValueCommit?.(value)
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
        onValueChange={handleChange}
        onValueCommit={handleOnCommit}
        value={value}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-primary/20 hover:bg-primary/30 transition-colors duration-200 cursor-pointer">
          <SliderPrimitive.Range className="absolute h-full bg-primary cursor-pointer" />
        </SliderPrimitive.Track>

        <Marks marks={markList} onClick={handleChange} thumbSize={thumbSize} />
        <Tooltip open={tooltipOpen}>
          <TooltipTrigger asChild>
            <SliderPrimitive.Thumb
              ref={thumb}
              className="block z-10 text-center h-4 w-4 rounded-full border border-primary/80 hover:border-primary shadow hover:ring-1 ring-primary bg-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
            />
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
  thumbSize: ReturnType<typeof useSize>
}

const Marks = (props: MarkProps) => {
  const { marks, onClick, thumbSize } = props
  const { value: sharedValues } = useSlider()

  if (!marks?.length) {
    return null
  }

  return (
    <>
      {marks.map(({ value }) => {
        const offset = thumbSize
          ? getThumbInBoundsOffset(thumbSize.width, value)
          : 0
        return (
          <span
            style={{
              left: `calc(${value}% + ${offset * 0.4}px)`,
              transform: "translateX(-50%)",
            }}
            className={cn(
              "absolute z-0 cursor-pointer block text-center h-1.5 w-1.5 rounded-full border border-slate-300 bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              (sharedValues?.[0] ?? 0) >= value && "border-primary"
            )}
          />
        )
      })}

      <div className="w-full absolute top-5">
        {marks.map(({ value, style, label }) => {
          const offset = thumbSize
            ? getThumbInBoundsOffset(thumbSize.width, 50)
            : 0
          return (
            <span
              key={value}
              className={cn(
                "flex justify-center text-xs absolute -translate-x-1/2 transition-colors duration-200 cursor-pointer hover:text-primary",
                (sharedValues?.[0] ?? 0) >= value
                  ? "text-primary"
                  : "text-primary/40"
              )}
              style={{
                ...style,
                left: `calc(${value}% + ${offset * 0.4}px)`,
                transform: "translateX(-50%)",
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