const STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'DONE', label: 'Done' },
  { value: 'ON_HOLD', label: 'On hold' },
]

const SCORE_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({
  value,
  label: String(value),
}))

const EVIDENCE_OPTIONS = [
  { value: 'JIRA', label: 'Jira' },
  { value: 'CONFLUENCE', label: 'Confluence' },
  { value: 'FIGMA', label: 'Figma' },
  { value: 'URL', label: 'URL' },
  { value: 'FILE', label: 'File' },
  { value: 'NOTE', label: 'Note' },
]

function textField(key, label, type = 'text', extra = {}) {
  return { key, label, type, ...extra }
}

const DEFINITIONS = [
  {
    type: 'heading',
    label: 'Heading',
    category: 'Basic',
    description: 'Section heading inside a roadmap page.',
    defaultTitle: 'Heading',
    defaultData: { text: 'New section' },
    editor: { kind: 'text', key: 'text', label: 'Heading text', rows: 2 },
  },
  {
    type: 'text',
    label: 'Text',
    category: 'Basic',
    description: 'Free-form explanatory text.',
    defaultTitle: 'Text',
    defaultData: { text: '' },
    editor: { kind: 'text', key: 'text', label: 'Text', rows: 6 },
  },
  {
    type: 'table',
    label: 'Table',
    category: 'Basic',
    description: 'Flexible table for content that does not fit another block.',
    defaultTitle: 'Table',
    defaultData: {
      columns: [
        { id: 'column_1', label: 'Column 1' },
        { id: 'column_2', label: 'Column 2' },
      ],
      rows: [],
    },
    editor: { kind: 'table' },
  },
  {
    type: 'profile',
    label: 'Development profile',
    category: 'Development',
    description: 'Employee, role, manager and roadmap period.',
    defaultTitle: 'Development profile',
    defaultData: {
      employee: '',
      role: '',
      manager: '',
      startDate: '',
      endDate: '',
    },
    editor: {
      kind: 'fields',
      fields: [
        textField('employee', 'Employee'),
        textField('role', 'Role'),
        textField('manager', 'Manager'),
        textField('startDate', 'Start date', 'date'),
        textField('endDate', 'End date', 'date'),
      ],
    },
  },
  {
    type: 'development_goal',
    label: 'Development goal',
    category: 'Development',
    description: 'Main objective for the roadmap period.',
    defaultTitle: 'Development goal',
    defaultData: { text: '' },
    editor: { kind: 'text', key: 'text', label: 'Goal', rows: 5 },
  },
  {
    type: 'success_criteria',
    label: 'Success criteria',
    category: 'Development',
    description: 'Criteria and measurable targets for successful completion.',
    defaultTitle: 'Success criteria',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add criterion',
      fields: [
        textField('text', 'Criterion', 'textarea'),
        textField('target', 'Target'),
        textField('status', 'Status', 'select', { options: STATUS_OPTIONS }),
      ],
    },
  },
  {
    type: 'responsibilities',
    label: 'Responsibilities',
    category: 'Development',
    description: 'Responsibilities of the employee, manager and other participants.',
    defaultTitle: 'Responsibilities',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add responsibility',
      fields: [
        textField('role', 'Role'),
        textField('responsibility', 'Responsibility', 'textarea'),
      ],
    },
  },
  {
    type: 'roadmap_tracks',
    label: 'Roadmap tracks',
    category: 'Development',
    description: 'Focus areas with skills, goals, expected results and status.',
    defaultTitle: 'Roadmap',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add track',
      fields: [
        textField('focus', 'Focus'),
        textField('skills', 'Skills & responsibilities', 'textarea'),
        textField('goals', 'Goals', 'textarea'),
        textField('result', 'Expected result', 'textarea'),
        textField('status', 'Status', 'select', { options: STATUS_OPTIONS }),
      ],
    },
  },
  {
    type: 'goals',
    label: 'Goals',
    category: 'Development',
    description: 'Actionable goals with status and due date.',
    defaultTitle: 'Goals',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add goal',
      fields: [
        textField('text', 'Goal', 'textarea'),
        textField('status', 'Status', 'select', { options: STATUS_OPTIONS }),
        textField('dueDate', 'Due date', 'date'),
      ],
    },
  },
  {
    type: 'timeline',
    label: 'Timeline',
    category: 'Development',
    description: 'Time-bound stages and milestones.',
    defaultTitle: 'Timeline',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add timeline item',
      fields: [
        textField('title', 'Item'),
        textField('startDate', 'Start date', 'date'),
        textField('endDate', 'End date', 'date'),
        textField('status', 'Status', 'select', { options: STATUS_OPTIONS }),
      ],
    },
  },
  {
    type: 'progress_tracker',
    label: 'Progress tracker',
    category: 'Tracking',
    description: 'Planned and actual values for development progress.',
    defaultTitle: 'Progress tracker',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add metric',
      fields: [
        textField('label', 'Metric'),
        textField('target', 'Target'),
        textField('actual', 'Actual'),
        textField('status', 'Status', 'select', { options: STATUS_OPTIONS }),
      ],
    },
  },
  {
    type: 'journal',
    label: 'Journal',
    category: 'Tracking',
    description: 'Weekly or bi-weekly development activity log.',
    defaultTitle: 'Journal',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add journal entry',
      fields: [
        textField('date', 'Date', 'date'),
        textField('task', 'Task / project'),
        textField('actions', 'What was done', 'textarea'),
        textField('result', 'Result', 'textarea'),
        textField('learned', 'What I learned', 'textarea'),
        textField('tools', 'Tools / AI'),
        textField('evidence', 'Evidence'),
        textField('blocker', 'Blocker'),
      ],
    },
  },
  {
    type: 'blockers',
    label: 'Blockers',
    category: 'Tracking',
    description: 'Current blockers, impact and support required.',
    defaultTitle: 'Blockers',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add blocker',
      fields: [
        textField('date', 'Date', 'date'),
        textField('blocker', 'Blocker', 'textarea'),
        textField('impact', 'Impact', 'textarea'),
        textField('attempts', 'What I tried', 'textarea'),
        textField('owner', 'Support owner'),
        textField('status', 'Status', 'select', { options: STATUS_OPTIONS }),
      ],
    },
  },
  {
    type: 'checklist',
    label: 'Checklist',
    category: 'Tracking',
    description: 'Repeatable or milestone checklist.',
    defaultTitle: 'Checklist',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add checklist item',
      fields: [
        textField('text', 'Item', 'textarea'),
        textField('done', 'Done', 'checkbox'),
      ],
    },
  },
  {
    type: 'monthly_report',
    label: 'Monthly report',
    category: 'Reporting',
    description: 'Monthly summary, results, learnings and next focus.',
    defaultTitle: 'Monthly report',
    defaultData: {
      period: '',
      planned: '',
      completed: '',
      results: '',
      bestResult: '',
      learned: '',
      aiUsage: '',
      difficulties: '',
      support: '',
      nextFocus: '',
    },
    editor: {
      kind: 'fields',
      fields: [
        textField('period', 'Period'),
        textField('planned', 'Planned', 'textarea'),
        textField('completed', 'Actually completed', 'textarea'),
        textField('results', 'Results', 'textarea'),
        textField('bestResult', 'Best result', 'textarea'),
        textField('learned', 'What I learned', 'textarea'),
        textField('aiUsage', 'Where I used AI', 'textarea'),
        textField('difficulties', 'Main difficulties', 'textarea'),
        textField('support', 'Support required', 'textarea'),
        textField('nextFocus', 'Next focus', 'textarea'),
      ],
    },
  },
  {
    type: 'self_assessment',
    label: 'Self assessment',
    category: 'Reporting',
    description: 'Skill or competency self-assessment.',
    defaultTitle: 'Self assessment',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add competency',
      fields: [
        textField('label', 'Competency'),
        textField('score', 'Score 1-5', 'select', { options: SCORE_OPTIONS }),
        textField('comment', 'Comment', 'textarea'),
      ],
    },
  },
  {
    type: 'check_in',
    label: 'Check-in',
    category: 'Reporting',
    description: 'Employee / Team Lead development review history.',
    defaultTitle: 'Check-ins',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add check-in',
      fields: [
        textField('date', 'Date', 'date'),
        textField('period', 'Period'),
        textField('successes', 'What went well', 'textarea'),
        textField('improvements', 'Areas to improve', 'textarea'),
        textField('feedback', 'TL feedback', 'textarea'),
        textField('nextActions', 'Next actions', 'textarea'),
        textField('dueDate', 'Due date', 'date'),
      ],
    },
  },
  {
    type: 'evidence',
    label: 'Evidence & links',
    category: 'Reporting',
    description: 'Jira, Confluence, Figma, files or supporting links.',
    defaultTitle: 'Evidence',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add evidence',
      fields: [
        textField('label', 'Label'),
        textField('type', 'Type', 'select', { options: EVIDENCE_OPTIONS }),
        textField('url', 'URL'),
        textField('note', 'Note', 'textarea'),
      ],
    },
  },
  {
    type: 'final_review',
    label: 'Final review',
    category: 'Reporting',
    description: 'Start state, achieved result and final conclusions.',
    defaultTitle: 'Final review',
    defaultData: {
      initialState: '',
      achievedResult: '',
      indicators: '',
      achievements: '',
      nextSteps: '',
    },
    editor: {
      kind: 'fields',
      fields: [
        textField('initialState', 'Initial state', 'textarea'),
        textField('achievedResult', 'Achieved result', 'textarea'),
        textField('indicators', 'Indicators before / after', 'textarea'),
        textField('achievements', 'Most important achievements', 'textarea'),
        textField('nextSteps', 'Next development steps', 'textarea'),
      ],
    },
  },
  {
    type: 'metric',
    label: 'KPI / metric',
    category: 'Metrics',
    description: 'Target and actual values for measurable outcomes.',
    defaultTitle: 'Metrics',
    defaultData: { items: [] },
    editor: {
      kind: 'list',
      key: 'items',
      addLabel: 'Add metric',
      fields: [
        textField('label', 'Metric'),
        textField('target', 'Target'),
        textField('actual', 'Actual'),
        textField('unit', 'Unit'),
      ],
    },
  },
]

export const DEVELOPMENT_BLOCK_DEFINITIONS = Object.freeze(
  DEFINITIONS.map((item) => Object.freeze(item)),
)

export const DEVELOPMENT_BLOCK_CATEGORIES = Object.freeze([
  'Basic',
  'Development',
  'Tracking',
  'Reporting',
  'Metrics',
])

export const DEVELOPMENT_BLOCK_SPANS = Object.freeze([
  { value: 12, label: 'Full width' },
  { value: 8, label: '2/3 width' },
  { value: 6, label: '1/2 width' },
  { value: 4, label: '1/3 width' },
  { value: 3, label: '1/4 width' },
])

export function getDevelopmentBlockDefinition(type) {
  return DEVELOPMENT_BLOCK_DEFINITIONS.find((item) => item.type === type) || null
}

export function createDevelopmentBlock(type, { order = 0 } = {}) {
  const definition = getDevelopmentBlockDefinition(type)

  if (!definition) {
    throw new Error(`Unsupported Development block type: ${type}`)
  }

  return {
    id: `tmp_${crypto.randomUUID().replaceAll('-', '_')}`,
    type: definition.type,
    title: definition.defaultTitle,
    order,
    schemaVersion: 1,
    layout: { span: 12 },
    config: {},
    data: structuredCloneSafe(definition.defaultData),
  }
}

export function createDevelopmentPage(title = 'New page', order = 0) {
  return {
    id: `tmp_${crypto.randomUUID().replaceAll('-', '_')}`,
    title,
    order,
    sections: [createDevelopmentSection('Main', 0)],
  }
}

export function createDevelopmentSection(title = 'Section', order = 0) {
  return {
    id: `tmp_${crypto.randomUUID().replaceAll('-', '_')}`,
    title,
    order,
    blocks: [],
  }
}

export function structuredCloneSafe(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value))
}

export function normalizeOrderedItems(items) {
  return items.map((item, index) => ({ ...item, order: index }))
}

export function moveOrderedItem(items, fromIndex, toIndex) {
  if (
    !Array.isArray(items) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return normalizeOrderedItems(Array.isArray(items) ? items : [])
  }

  const next = [...items]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)

  return normalizeOrderedItems(next)
}

export function sanitizeDevelopmentUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''

  try {
    const url = new URL(value.trim())
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}
