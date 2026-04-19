import { categoryColorOptions } from '../../domain/categories'
import styles from '../Page.module.css'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className={styles.colorPicker}>
      {categoryColorOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={[styles.colorOption, value === option.value ? styles.colorOptionActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={() => onChange(option.value)}
          aria-label={`Use ${option.label}`}
        >
          <span className={[styles.colorSwatch, styles[`colorSwatch${option.label}`]].join(' ')} />
        </button>
      ))}
    </div>
  )
}
