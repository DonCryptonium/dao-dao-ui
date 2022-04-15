import React, { ComponentPropsWithoutRef } from 'react'

import { Button as UIButton } from 'ui'

import { Logo } from './Logo'

export const Button = React.forwardRef(function Button(
  props: ComponentPropsWithoutRef<typeof UIButton>,
  ref
) {
  return (
    <UIButton
      loader={<Logo height={20} invert width={20} />}
      {...props}
      ref={ref}
    />
  )
})
