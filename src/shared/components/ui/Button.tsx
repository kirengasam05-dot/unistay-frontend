import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'black'|'white'|'green'|'red'; children: ReactNode };
export default function Button({ variant='black', className, children, ...props }: Props) {
  const styles = { black:'btn-black', white:'btn-white', green:'btn-green', red:'btn-red' }[variant];
  return <button className={clsx(styles, className)} {...props}>{children}</button>;
}
