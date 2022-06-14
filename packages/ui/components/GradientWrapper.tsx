import { ReactNode, FC, useEffect } from 'react'

import { Theme, useThemeContext } from '../theme'
import { LogoNoBorder } from './Logo'

export interface GradientWrapperProps {
  children: ReactNode
}

export const GradientWrapper: FC<GradientWrapperProps> = ({ children }) => {
  const themeContext = useThemeContext()

  // Homepage should always render in dark mode.
  useEffect(() => {
    themeContext.updateTheme(Theme.Dark)
  }, [themeContext])

  const bg = 'url(/gradients/BG-Gradient-Dark@2x.png)'

  return (
    <div className="dark flex overflow-x-hidden relative flex-col items-center">
      {typeof CSS.supports !== 'undefined' &&
        CSS.supports('backdrop-filter', 'blur(5px)') && (
          <div
            className="absolute top-0 left-1/2 -z-20 mt-[60px] -ml-[250px] text-[#06090B]"
            style={{ transform: 'rotate(270)' }}
          >
            <LogoNoBorder height={500} width={500} />
          </div>
        )}
      <div
        className="absolute -z-30 w-screen h-full bg-no-repeat bg-contain"
        style={{
          backgroundImage: `${bg}`,
        }}
      ></div>
      <div className="fixed -z-10 w-screen h-screen bg-clip-padding backdrop-blur-3xl backdrop-filter"></div>
      {children}
    </div>
  )
}
