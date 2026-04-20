import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check'
import { PaletteIcon } from '@phosphor-icons/react/dist/csr/Palette'
import { Card } from '../../components/primitives/Primitives'
import sharedStyles from '../../components/app/Shared.module.css'
import { SectionHeading } from '../../components/app/SectionHeading'
import { useTheme } from '../../theme/themeContext'
import styles from '../Page.module.css'
import { ManageMetricList, ManageRailCard, ManageTabLayout } from './ManageTabLayout'

export function ManageAppearanceSection() {
  const { theme, themes, setThemeId } = useTheme()
  const lightThemeCount = themes.filter((candidate) => candidate.meta.colorScheme === 'light').length

  return (
    <ManageTabLayout
      rail={
        <>
          <ManageRailCard title="Current theme" description={theme.meta.description}>
            <ManageMetricList
              items={[
                { label: 'Selected', value: theme.meta.name },
                { label: 'Mode', value: theme.meta.colorScheme === 'dark' ? 'Dark' : 'Light' },
                { label: 'Available themes', value: themes.length },
              ]}
            />
            <div className={sharedStyles.badgeRow}>
              <span className={styles.themeCardMode}>{theme.meta.colorScheme === 'dark' ? 'Dark' : 'Light'}</span>
              {theme.meta.legacy ? <span className={styles.themeCardLegacy}>Legacy</span> : null}
            </div>
          </ManageRailCard>

          <ManageRailCard
            title="Library"
            description="Appearance now keeps the same shell as the other Manage tabs, so switching themes no longer changes the page structure."
          >
            <ManageMetricList
              items={[
                { label: 'Light themes', value: lightThemeCount },
                { label: 'Dark themes', value: themes.length - lightThemeCount },
              ]}
            />
          </ManageRailCard>
        </>
      }
    >
      <Card>
        <div data-slot="section-panel" className={sharedStyles.panel}>
          <SectionHeading
            icon={<PaletteIcon aria-hidden="true" size={20} weight="duotone" />}
            title="Theme gallery"
          />
          <p data-slot="muted-text" className={sharedStyles.muted}>
            Pick a theme and the shell updates immediately without the Manage frame shifting around it.
          </p>
        </div>
      </Card>

      <div className={styles.themeGallery}>
        {themes.map((candidate) => (
          <Card
            key={candidate.id}
            className={[styles.themeCardShell, theme.id === candidate.id ? styles.themeCardActive : '']
              .filter(Boolean)
              .join(' ')}
          >
            <button
              data-slot="theme-preview-card"
              type="button"
              className={styles.themeCardButton}
              aria-pressed={theme.id === candidate.id}
              onClick={() => setThemeId(candidate.id)}
            >
              <div className={styles.themePreview}>
                <div
                  className={styles.themeScene}
                  aria-hidden="true"
                  style={{ background: candidate.components.shell.pageBackground }}
                >
                  <div
                    className={styles.themeSceneFrame}
                    style={{ background: candidate.components.shell.panelBackground }}
                  >
                    <div className={styles.themeSceneToolbar}>
                      <span
                        className={styles.themeSceneDot}
                        style={{ background: candidate.semantic.danger }}
                      />
                      <span
                        className={styles.themeSceneDot}
                        style={{ background: candidate.semantic.warning }}
                      />
                      <span
                        className={styles.themeSceneDot}
                        style={{ background: candidate.semantic.success }}
                      />
                    </div>
                    <div className={styles.themeSceneBody}>
                      <div
                        className={styles.themeSceneFeature}
                        style={{ background: candidate.semantic.surfaceRaised }}
                      >
                        <span
                          className={styles.themeSceneFeatureLine}
                          style={{ background: candidate.semantic.textPrimary }}
                        />
                        <span
                          className={styles.themeSceneFeatureAccent}
                          style={{ background: candidate.components.button.primaryBg }}
                        />
                        <span
                          className={styles.themeSceneFeatureLineSoft}
                          style={{ background: candidate.semantic.textSecondary }}
                        />
                      </div>
                      <div className={styles.themeSceneRail}>
                        <span
                          className={styles.themeSceneTile}
                          style={{ background: candidate.semantic.accent }}
                        />
                        <span
                          className={styles.themeSceneTile}
                          style={{ background: candidate.semantic.warning }}
                        />
                        <span
                          className={styles.themeSceneTile}
                          style={{ background: candidate.semantic.success }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.themeSwatchRow}>
                    <span
                      className={styles.themeSwatch}
                      style={{ background: candidate.semantic.surfaceRaised }}
                    />
                    <span
                      className={styles.themeSwatch}
                      style={{ background: candidate.semantic.accent }}
                    />
                    <span
                      className={styles.themeSwatch}
                      style={{ background: candidate.semantic.warning }}
                    />
                    <span
                      className={styles.themeSwatch}
                      style={{ background: candidate.components.button.primaryBg }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.themeCardMeta}>
                <div className={styles.themeCardHeader}>
                  <div>
                    <h2 className={styles.themeCardTitle}>{candidate.meta.name}</h2>
                    <p className={styles.themeCardDescription}>{candidate.meta.description}</p>
                  </div>
                  <div className={styles.themeCardBadges}>
                    <span className={styles.themeCardMode}>
                      {candidate.meta.colorScheme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                    {candidate.meta.legacy ? <span className={styles.themeCardLegacy}>Legacy</span> : null}
                  </div>
                </div>
                {theme.id === candidate.id ? (
                  <span className={styles.themeCardSelected}>
                    <CheckIcon aria-hidden="true" size={14} weight="bold" />
                    <span>Selected</span>
                  </span>
                ) : null}
              </div>
            </button>
          </Card>
        ))}
      </div>
    </ManageTabLayout>
  )
}
