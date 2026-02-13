import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-blue-100 text-blue-800': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  )
}

export function RiskBadge({ riskKlass }: { riskKlass: 1 | 2 | 3 | 4 | 5 }) {
  const config = {
    1: { label: 'Låg risk', variant: 'success' as const, color: 'bg-risk-1' },
    2: { label: 'Låg-medel risk', variant: 'success' as const, color: 'bg-risk-2' },
    3: { label: 'Medel risk', variant: 'warning' as const, color: 'bg-risk-3' },
    4: { label: 'Hög risk', variant: 'warning' as const, color: 'bg-risk-4' },
    5: { label: 'Mycket hög risk', variant: 'danger' as const, color: 'bg-risk-5' },
  }

  const { label, variant } = config[riskKlass]

  return (
    <Badge variant={variant}>
      Risk {riskKlass}/5 - {label}
    </Badge>
  )
}
