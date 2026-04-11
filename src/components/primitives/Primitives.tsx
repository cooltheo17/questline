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
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'md' | 'sm'
}) {
  return (
    <button
      data-slot="button"
      data-size={size}
      data-variant={variant}
      className={cx(
        styles.button,
        variant === 'primary'
          ? styles.buttonPrimary
          : variant === 'danger'
            ? styles.buttonDanger
            : styles.buttonSecondary,
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
    <div data-slot="card" className={cx(styles.card, className)}>
      <div data-slot="card-body" className={styles.cardBody}>{children}</div>
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

  return <span data-slot="badge" data-tone={tone ?? 'default'} className={cx(styles.badge, toneClass)}>{children}</span>
}

export function Field({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className={styles.field}>
      <span data-slot="field-label" className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

export const TextField = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  function TextField({ className, ...props }, ref) {
    return <input ref={ref} data-slot="input" className={cx(styles.input, className)} {...props} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<'textarea'>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} data-slot="textarea" className={cx(styles.textarea, className)} {...props} />
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
    <label data-slot="checkbox-row" className={styles.checkboxRow}>
      <CheckboxPrimitive.Root
        data-slot="checkbox"
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className={styles.checkbox}
      >
        <CheckboxPrimitive.Indicator>✓</CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span data-slot="checkbox-label" className={styles.checkboxLabel}>{label}</span>
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
      <SelectPrimitive.Trigger data-slot="select-trigger" className={styles.selectTrigger} aria-label={placeholder}>
        <SelectPrimitive.Value placeholder={placeholder} />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content data-slot="select-content" className={styles.selectContent} position="popper">
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item data-slot="select-item" key={option.value} value={option.value} className={styles.selectItem}>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export function ProgressBar({
  value,
  max,
  tone = 'primary',
}: {
  value: number
  max: number
  tone?: 'primary' | 'daily'
}) {
  const width = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div data-slot="progress-rail" data-tone={tone} className={styles.progressRail}>
      <div
        data-slot="progress-fill"
        className={[styles.progressFill, tone === 'daily' ? styles.progressFillDaily : ''].filter(Boolean).join(' ')}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  contentClassName,
  children,
}: PropsWithChildren<{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  contentClassName?: string
}>) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-slot="dialog-overlay" className={styles.dialogOverlay} />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cx(styles.dialogContent, contentClassName)}
        >
          <div data-slot="dialog-header" className={styles.dialogHeader}>
            <DialogPrimitive.Title data-slot="dialog-title" className={styles.dialogTitle}>{title}</DialogPrimitive.Title>
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
        <DialogPrimitive.Overlay data-slot="drawer-overlay" className={styles.drawerOverlay} />
        <DialogPrimitive.Content data-slot="drawer-content" className={styles.drawerContent}>
          <div data-slot="dialog-header" className={styles.dialogHeader}>
            <DialogPrimitive.Title data-slot="dialog-title" className={styles.dialogTitle}>{title}</DialogPrimitive.Title>
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
    <TabsPrimitive.Root data-slot="tabs-root" className={styles.tabsRoot} value={value} onValueChange={onValueChange}>
      <TabsPrimitive.List data-slot="tabs-list" className={styles.tabsList}>
        {items.map((item) => (
          <TabsPrimitive.Trigger data-slot="tabs-trigger" key={item.value} value={item.value} className={styles.tabsTrigger}>
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
  return (
    <TabsPrimitive.Content data-slot="tabs-content" value={value} forceMount className={styles.tabsContent}>
      {children}
    </TabsPrimitive.Content>
  )
}

export function ToastViewport({ children }: PropsWithChildren) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport data-slot="toast-viewport" className={styles.toastViewport} />
    </ToastPrimitive.Provider>
  )
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  onAction,
  duration = 2200,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  actionLabel?: string
  onAction?: () => void
  duration?: number
}) {
  return (
    <ToastPrimitive.Root
      data-slot="toast-root"
      open={open}
      onOpenChange={onOpenChange}
      duration={duration}
      className={styles.toastRoot}
    >
      <ToastPrimitive.Title data-slot="toast-title" className={styles.toastTitle}>{title}</ToastPrimitive.Title>
      <div className={styles.toastBody}>
        <ToastPrimitive.Description data-slot="toast-description" className={styles.toastDescription}>
          {description}
        </ToastPrimitive.Description>
        {actionLabel && onAction ? (
          <button
            type="button"
            className={styles.toastAction}
            onClick={() => {
              onAction()
              onOpenChange(false)
            }}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </ToastPrimitive.Root>
  )
}
