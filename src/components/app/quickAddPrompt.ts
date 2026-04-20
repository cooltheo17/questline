export const bulkImportPlaceholder = `{
  "categories": [
    {
      "id": "home-reset",
      "name": "Home Reset",
      "colorKey": "sage"
    }
  ],
  "quests": [
    {
      "title": "Reset the apartment",
      "rewardXp": 120,
      "rewardCoins": 24,
      "tasks": [
        {
          "title": "Clear the kitchen counters",
          "categoryIds": ["home-reset"],
          "subtasks": ["Throw out expired food", "Wipe surfaces"]
        },
        {
          "title": "Refill prescriptions",
          "categoryIds": ["health"]
        }
      ]
    }
  ],
  "tasks": []
}`

export function buildQuickAddPrompt(categoryList: string, questList: string) {
  return [
    'Generate a task breakdown payload for a task and quest planner.',
    'Break the user goal into small, concrete, practical steps.',
    'Return JSON only. Do not include markdown or commentary.',
    '',
    'App structure:',
    '- categories = reusable task tags',
    '- quests = larger multi-step goals with rewards',
    '- tasks = actionable items that can stand alone or belong to a quest',
    '- subtasks = smaller checklist steps inside a task',
    '',
    'Top-level JSON shape:',
    '{',
    '  "categories": [{ "id": "string", "name": "string", "colorKey": "slate|brass|sage|blush|plum|mist" }],',
    '  "quests": [{ "title": "string", "description": "string?", "imageUrl": "string?", "rewardXp": number?, "rewardCoins": number?, "tasks": Task[]? }],',
    '  "tasks": [Task]',
    '}',
    '',
    'Task shape:',
    '{',
    '  "title": "string",',
    '  "notes": "string?",',
    '  "categoryIds": ["string"],',
    '  "questTitle": "string?",',
    '  "dueDate": "YYYY-MM-DD?",',
    '  "cadence": "none|daily|weekly|monthly?",',
    '  "difficulty": "tiny|small|medium|large?",',
    '  "rewardOverride": { "xp": number?, "coins": number? }?,',
    '  "subtasks": ["string"]?',
    '}',
    '',
    'Rules:',
    '- Prefer many small tasks over a few large tasks.',
    '- If a task still feels cognitively heavy, break it into subtasks.',
    '- Make task titles short, direct, and action-first.',
    '- Reuse existing category IDs when they fit. Do not redefine them in "categories".',
    '- Only add entries to "categories" for genuinely new categories, then reference those ids in tasks.',
    '- Pick category colorKey to match the theme of the work.',
    '- You decide whether something belongs inside the quest or as a standalone task unless the user explicitly asks for a specific split.',
    '- Use questTitle only for standalone tasks that should link to an existing or newly-created quest.',
    '- Default behavior: put goal-critical actions inside the quest, and put generic maintenance habits like hydration, protein, sleep, stretching, or reminders into standalone support tasks unless they are essential to quest completion.',
    '- Use dueDate only when there is a meaningful suggested date.',
    '- Use cadence only for repeating tasks.',
    '- Default rewards can be omitted. Only use rewardOverride when the effort clearly deserves a higher or lower reward.',
    '- Difficulty should reflect effort and friction, not importance.',
    '',
    'Reward guidance:',
    '- tiny = very fast / almost no friction',
    '- small = normal quick task',
    '- medium = meaningful effort',
    '- large = difficult or multi-stage task',
    '',
    `Current category IDs: ${categoryList}.`,
    `Existing quest titles: ${questList}.`,
  ].join('\n')
}
