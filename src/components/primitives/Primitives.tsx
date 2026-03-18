import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as SelectPrimitive from '@radix-ui/react-select'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { forwardRef, type ButtonHTMLAttributes, type ComponentPropsWithoutRef, type PropsWithChildren, type ReactNode } from 'react'
import styles from './Primitives.module.css'

function cx(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm'
}) {
  return (
    <button
      className={cx(
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        size === 'sm' ? styles.buttonSm : undefined,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function IconButton(props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return <Button variant="secondary" className={cx(styles.iconButton, props.className)} {...props} />
}

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cx(styles.card, className)}>
      <div className={styles.cardBody}>{children}</div>
    </div>
  )
}

export function Badge({
  children,
  tone,
}: PropsWithChildren<{ tone?: string }>) {
  const toneClass =
    tone === 'slate'
      ? styles.badgeSlate
      : tone === 'brass'
        ? styles.badgeBrass
        : tone === 'sage'
          ? styles.badgeSage
          : tone === 'blush'
            ? styles.badgeBlush
            : tone === 'plum'
              ? styles.badgePlum
              : tone === 'mist'
                ? styles.badgeMist
                : undefined

  return <span className={cx(styles.badge, toneClass)}>{children}</span>
}

export function Field({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

export const TextField = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  function TextField({ className, ...props }, ref) {
    return <input ref={ref} className={cx(styles.input, className)} {...props} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<'textarea'>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cx(styles.textarea, className)} {...props} />
  },
)

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <label className={styles.checkboxRow}>
      <CheckboxPrimitive.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className={styles.checkbox}
      >
        <CheckboxPrimitive.Indicator>✓</CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  )
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
}: {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  placeholder?: string
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger className={styles.selectTrigger} aria-label={placeholder}>
        <SelectPrimitive.Value placeholder={placeholder} />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className={styles.selectContent} position="popper">
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value} className={styles.selectItem}>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const width = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className={styles.progressRail}>
      <div className={styles.progressFill} style={{ width: `${width}%` }} />
    </div>
  )
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: PropsWithChildren<{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
}>) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.dialogOverlay} />
        <DialogPrimitive.Content className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <DialogPrimitive.Title className={styles.dialogTitle}>{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className={styles.dialogDescription}>
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: PropsWithChildren<{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
}>) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.drawerOverlay} />
        <DialogPrimitive.Content className={styles.drawerContent}>
          <div className={styles.dialogHeader}>
            <DialogPrimitive.Title className={styles.dialogTitle}>{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className={styles.dialogDescription}>
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function Tabs({
  value,
  onValueChange,
  items,
  children,
}: PropsWithChildren<{
  value: string
  onValueChange: (value: string) => void
  items: Array<{ label: string; value: string }>
}>) {
  return (
    <TabsPrimitive.Root className={styles.tabsRoot} value={value} onValueChange={onValueChange}>
      <TabsPrimitive.List className={styles.tabsList}>
        {items.map((item) => (
          <TabsPrimitive.Trigger key={item.value} value={item.value} className={styles.tabsTrigger}>
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  )
}

export function TabPanel({
  value,
  children,
}: PropsWithChildren<{ value: string }>) {
  return <TabsPrimitive.Content value={value}>{children}</TabsPrimitive.Content>
}

export function ToastViewport({ children }: PropsWithChildren) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className={styles.toastViewport} />
    </ToastPrimitive.Provider>
  )
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
}) {
  return (
    <ToastPrimitive.Root open={open} onOpenChange={onOpenChange} className={styles.toastRoot}>
      <ToastPrimitive.Title className={styles.toastTitle}>{title}</ToastPrimitive.Title>
      <ToastPrimitive.Description className={styles.toastDescription}>{description}</ToastPrimitive.Description>
    </ToastPrimitive.Root>
  )
}
