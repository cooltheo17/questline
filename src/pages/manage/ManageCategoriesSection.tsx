import { ArchiveIcon } from '@phosphor-icons/react/dist/csr/Archive'
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { TagIcon } from '@phosphor-icons/react/dist/csr/Tag'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Field,
  TextField,
} from '../../components/primitives/Primitives'
import { createCategory, deleteCategory, updateCategory } from '../../data/repository'
import type { Category } from '../../domain/types'
import sharedStyles from '../../components/app/Shared.module.css'
import { SectionHeading } from '../../components/app/SectionHeading'
import styles from '../Page.module.css'
import { ColorPicker } from './ColorPicker'
import { ManageMetricList, ManageRailCard, ManageTabLayout } from './ManageTabLayout'

interface ManageCategoriesSectionProps {
  categories: Category[]
}

function ManageCategoryRow({ category }: { category: Category }) {
  const [draftName, setDraftName] = useState(category.name)
  const [draftColor, setDraftColor] = useState(category.colorKey)
  const isDirty = draftName !== category.name || draftColor !== category.colorKey
  const isSaveDisabled = !draftName.trim() || !isDirty

  async function handleSave() {
    if (isSaveDisabled) {
      return
    }

    await updateCategory({
      ...category,
      name: draftName.trim(),
      colorKey: draftColor,
    })
  }

  return (
    <div data-slot="category-item" className={styles.smallGrid}>
      <div className={styles.row}>
        <Badge tone={draftColor}>{draftName.trim() || 'Untitled category'}</Badge>
        {category.archived ? (
          <span data-slot="muted-text" className={sharedStyles.muted}>
            Archived
          </span>
        ) : null}
      </div>
      <TextField
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
      />
      <ColorPicker value={draftColor} onChange={setDraftColor} />
      <div data-slot="action-group" className={sharedStyles.actions}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void handleSave()}
          disabled={isSaveDisabled}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void updateCategory({ ...category, archived: !category.archived })}
        >
          <span className={sharedStyles.inlineLabel}>
            {category.archived ? (
              <ArrowCounterClockwiseIcon aria-hidden="true" size={15} weight="bold" />
            ) : (
              <ArchiveIcon aria-hidden="true" size={15} weight="duotone" />
            )}
            <span>{category.archived ? 'Restore' : 'Archive'}</span>
          </span>
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            if (
              window.confirm(
                `Delete "${category.name}"? Tasks using only this category will become uncategorized. This cannot be undone.`,
              )
            ) {
              void deleteCategory(category.id)
            }
          }}
        >
          <span className={sharedStyles.inlineLabel}>
            <TrashIcon aria-hidden="true" size={15} weight="bold" />
            <span>Delete</span>
          </span>
        </Button>
      </div>
    </div>
  )
}

export function ManageCategoriesSection({ categories }: ManageCategoriesSectionProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('slate')
  const activeCategoryCount = categories.filter((category) => !category.archived).length
  const isCreateDisabled = !newCategoryName.trim()

  return (
    <ManageTabLayout
      rail={
        <>
          <Card>
            <form
              data-slot="section-panel"
              className={sharedStyles.panel}
              onSubmit={(event) => {
                event.preventDefault()
                void createCategory({
                  name: newCategoryName,
                  colorKey: newCategoryColor,
                }).then(() => {
                  setNewCategoryName('')
                  setNewCategoryColor('slate')
                })
              }}
            >
              <SectionHeading
                icon={<TagIcon aria-hidden="true" size={20} weight="duotone" />}
                title="Create category"
              />
              <Field label="New category">
                <TextField
                  placeholder="Learning"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                />
              </Field>
              <Field label="Color">
                <div className={styles.smallGrid}>
                  <div className={styles.categoryPreview}>
                    <Badge tone={newCategoryColor}>{newCategoryName.trim() || 'New category'}</Badge>
                  </div>
                  <ColorPicker value={newCategoryColor} onChange={setNewCategoryColor} />
                </div>
              </Field>
              <Button type="submit" disabled={isCreateDisabled}>
                <span className={sharedStyles.inlineLabel}>
                  <PlusIcon aria-hidden="true" size={16} weight="bold" />
                  <span>Create category</span>
                </span>
              </Button>
            </form>
          </Card>

          <ManageRailCard
            title="Overview"
            description="This rail stays in place across Manage tabs, so the editor frame no longer jumps when a secondary column appears or disappears."
          >
            <ManageMetricList
              items={[
                { label: 'Total categories', value: categories.length },
                { label: 'Active', value: activeCategoryCount },
                { label: 'Archived', value: categories.length - activeCategoryCount },
              ]}
            />
          </ManageRailCard>
        </>
      }
    >
      <Card>
        <div data-slot="section-panel" className={sharedStyles.panel}>
          <SectionHeading
            icon={<TagIcon aria-hidden="true" size={20} weight="duotone" />}
            title="Category library"
          />
          <div data-slot="category-list" className={sharedStyles.list}>
            {categories.length ? (
              categories.map((category) => (
                <ManageCategoryRow key={`${category.id}:${category.name}:${category.colorKey}`} category={category} />
              ))
            ) : (
              <p data-slot="muted-text" className={sharedStyles.muted}>No categories yet.</p>
            )}
          </div>
        </div>
      </Card>
    </ManageTabLayout>
  )
}
