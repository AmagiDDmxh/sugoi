import * as React from "react"
import { useMediaQuery as useReactResponsiveMediaQuery } from "react-responsive"

export const mediaBreakpoints = {
  small: 640,
  // => @media (min-width: 640px) { ... }
  medium: 768,
  // => @media (min-width: 768px) { ... }
  large: 1024,
  // => @media (min-width: 1024px) { ... }
  xlarge: 1280,
  // => @media (min-width: 1280px) { ... }
  xxlarge: 1400,
  // => @media (min-width: 1400px) { ... }
}

export function useMediaQuery() {
  const small = useReactResponsiveMediaQuery({
    minWidth: mediaBreakpoints.small,
  })
  const medium = useReactResponsiveMediaQuery({
    minWidth: mediaBreakpoints.medium,
  })
  const large = useReactResponsiveMediaQuery({
    minWidth: mediaBreakpoints.large,
  })
  const xlarge = useReactResponsiveMediaQuery({
    minWidth: mediaBreakpoints.xlarge,
  })
  const xxlarge = useReactResponsiveMediaQuery({
    minWidth: mediaBreakpoints.xxlarge,
  })

  return React.useMemo(
    () => ({
      small,
      medium,
      large,
      xlarge,
      xxlarge,
    }),
    [large, medium, small, xlarge, xxlarge]
  )
}
