import clsx from 'clsx'
import { ComponentProps } from 'react'
import {
  FieldError,
  FieldPathValue,
  Path,
  UseFormRegister,
  Validate,
} from 'react-hook-form'

interface SelectInputProps<FieldValues, FieldName extends Path<FieldValues>>
  extends ComponentProps<'select'> {
  label: FieldName
  register: UseFormRegister<FieldValues>
  validation?: Validate<FieldPathValue<FieldValues, FieldName>>[]
  error?: FieldError
}

export const SelectInput = <FieldValues, FieldName extends Path<FieldValues>>({
  label,
  register,
  error,
  validation,
  children,
  ...props
}: SelectInputProps<FieldValues, FieldName>) => {
  const validate = validation?.reduce(
    (a, v) => ({ ...a, [v.toString()]: v }),
    {}
  )

  return (
    <select
      className={clsx(
        'py-2 px-3 bg-transparent rounded-lg border border-default focus:outline-none focus:ring-1 ring-brand ring-offset-0 transition',
        { 'ring-1 ring-error': error }
      )}
      {...props}
      {...register(label, { validate })}
    >
      {children}
    </select>
  )
}
