import { DevelopmentError } from './development.model.js'
import { DEVELOPMENT_BLOCK_DEFINITIONS } from './development.blocks.js'

const MAX_ZIP_ENTRIES = 5000
const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024
const MAX_SHEET_CELLS = 20000

const STATUS_MAP = [
  [/\b(done|completed|complete|finished)\b|готов|заверш|виконано/iu, 'DONE'],
  [/\b(in progress|progress)\b|у процес|в процес/iu, 'IN_PROGRESS'],
  [/\b(blocked|blocker)\b|блок/iu, 'BLOCKED'],
  [/\b(on hold|hold)\b|пауза|призупин/iu, 'ON_HOLD'],
  [/\b(backlog|not started|todo|to do)\b|не розпоч|не начат/iu, 'NOT_STARTED'],
]

const TYPE_RULES = [
  {
    type: 'success_criteria',
    patterns: [/критер.*успіш/iu, /success criteria/iu],
    width: 2,
    confidence: 0.98,
  },
  {
    type: 'responsibilities',
    patterns: [/відповідальн.*стор/iu, /responsibilit/iu],
    width: 2,
    confidence: 0.96,
  },
  {
    type: 'profile',
    patterns: [/профіль розвитку/iu, /development profile/iu],
    width: 2,
    confidence: 0.98,
  },
  {
    type: 'journal',
    patterns: [/журнал роботи/iu, /work journal/iu, /bi[- ]?weekly/iu],
    width: 8,
    confidence: 0.99,
  },
  {
    type: 'blockers',
    patterns: [/блокер.*підтрим/iu, /blockers?.*support/iu],
    width: 7,
    confidence: 0.99,
  },
  {
    type: 'self_assessment',
    patterns: [/самооцін/iu, /self assessment/iu],
    width: 3,
    confidence: 0.99,
  },
  {
    type: 'check_in',
    patterns: [/check[- ]?in/iu],
    width: 7,
    confidence: 0.98,
  },
  {
    type: 'final_review',
    patterns: [/фінальн.*звіт/iu, /final review/iu],
    width: 10,
    confidence: 0.99,
  },
  {
    type: 'metric',
    patterns: [/підтверджені результати/iu, /confirmed results/iu],
    width: 3,
    confidence: 0.96,
  },
  {
    type: 'monthly_report',
    patterns: [/щомісячн.*звіт/iu, /monthly report/iu],
    width: 1,
    confidence: 0.95,
  },
]

const HEADER_RULES = [
  {
    type: 'progress_tracker',
    required: [
      [/фокус|focus/iu, 1],
      [/план|planned|plan/iu, 1],
      [/фактич|actual/iu, 1],
      [/результ|result/iu, 1],
      [/статус|status/iu, 1],
    ],
    confidence: 0.98,
  },
  {
    type: 'roadmap_tracks',
    required: [
      [/фокус|focus/iu, 1],
      [/скіл|skill|обов.?яз/iu, 1],
      [/ціл|goal/iu, 1],
      [/результ|result/iu, 1],
      [/статус|status/iu, 1],
    ],
    confidence: 0.99,
  },
  {
    type: 'journal',
    required: [
      [/тижд|week|дата|date/iu, 1],
      [/задач|task|project/iu, 1],
      [/що.*викон|what.*done|action/iu, 1],
      [/результ|result/iu, 1],
    ],
    confidence: 0.98,
  },
  {
    type: 'blockers',
    required: [
      [/дата|date/iu, 1],
      [/блокер|problem/iu, 1],
      [/вплив|impact/iu, 1],
    ],
    confidence: 0.98,
  },
  {
    type: 'self_assessment',
    required: [
      [/напрям|competenc|skill/iu, 1],
      [/оцін|score/iu, 1],
      [/коментар|comment/iu, 1],
    ],
    confidence: 0.98,
  },
  {
    type: 'check_in',
    required: [
      [/дата|date/iu, 1],
      [/період|period/iu, 1],
      [/фідбек|feedback/iu, 1],
    ],
    confidence: 0.97,
  },
  {
    type: 'success_criteria',
    required: [
      [/критер|criterion/iu, 1],
      [/очікуван|target|expected/iu, 1],
    ],
    confidence: 0.96,
  },
  {
    type: 'responsibilities',
    required: [
      [/учасник|participant|role/iu, 1],
      [/відповідальн|responsib/iu, 1],
    ],
    confidence: 0.96,
  },
  {
    type: 'metric',
    required: [
      [/показник|metric|kpi/iu, 1],
      [/початку|before|target/iu, 1],
      [/після|after|actual/iu, 1],
    ],
    confidence: 0.95,
  },
]

const FIELD_ALIASES = {
  roadmap_tracks: {
    focus: [/фокус|focus/iu],
    skills: [/скіл|skill|обов.?яз|responsib/iu],
    goals: [/ціл|goal/iu],
    result: [/результ|result|expected/iu],
    status: [/статус|status/iu],
  },
  journal: {
    date: [/тижд|дата|week|date/iu],
    task: [/задач|проєкт|task|project/iu],
    actions: [/що.*викон|action|what.*done/iu],
    result: [/отриман.*результ|result/iu],
    learned: [/нового.*дізнав|learned|learn/iu],
    tools: [/інструмент|tools|ai/iu],
    evidence: [/посилан|evidence|link/iu],
    blocker: [/блокер|blocker/iu],
  },
  blockers: {
    date: [/дата|date/iu],
    blocker: [/блокер|проблем|problem/iu],
    impact: [/вплив|impact/iu],
    attempts: [/спроб|tried|attempt/iu],
    owner: [/відповідальн|owner/iu],
    status: [/статус|status/iu],
  },
  self_assessment: {
    label: [/напрям|competenc|skill/iu],
    score: [/оцін|score/iu],
    comment: [/коментар|comment/iu],
  },
  check_in: {
    date: [/дата|date/iu],
    period: [/період|period/iu],
    successes: [/вдалося|success|went well/iu],
    improvements: [/покращ|improv/iu],
    feedback: [/фідбек|feedback/iu],
    nextActions: [/наступн|next action|agreed/iu],
    dueDate: [/дедлайн|due/iu],
  },
  success_criteria: {
    text: [/критер|criterion/iu],
    target: [/очікуван|target|expected/iu],
    status: [/статус|status/iu],
  },
  responsibilities: {
    role: [/учасник|participant|role/iu],
    responsibility: [/відповідальн|responsib/iu],
  },
  goals: {
    text: [/ціл|goal/iu],
    status: [/статус|status/iu],
    dueDate: [/дедлайн|due/iu],
  },
  timeline: {
    title: [/етап|item|milestone|фокус/iu],
    startDate: [/почат|start/iu],
    endDate: [/заверш|end/iu],
    status: [/статус|status/iu],
  },
  progress_tracker: {
    label: [/фокус|metric|показник/iu],
    target: [/план|target|planned/iu],
    actual: [/фактич|result|actual|результ/iu],
    status: [/статус|status/iu],
  },
  metric: {
    label: [/показник|metric|kpi/iu],
    target: [/початку|target|before/iu],
    actual: [/після|actual|after/iu],
    unit: [/unit|одиниц/iu],
  },
  checklist: {
    text: [/item|пункт|задач|task/iu],
    done: [/done|готов|викон/iu],
  },
}

const FIELD_KEY_ALIASES = {
  profile: {
    employee: [/спеціаліст|employee|name/iu],
    role: [/поточна роль|role/iu],
    manager: [/відповідальн|manager|lead/iu],
    startDate: [/start date|дата початку/iu],
    endDate: [/end date|дата заверш/iu],
  },
  monthly_report: {
    period: [/місяць|period/iu],
    planned: [/заплан|planned/iu],
    completed: [/фактично викон|completed/iu],
    results: [/основні результ|results/iu],
    bestResult: [/найкращий результат|best result/iu],
    learned: [/навчив|learned/iu],
    aiUsage: [/використовував ai|used ai|ai usage/iu],
    difficulties: [/труднощ|difficult/iu],
    support: [/допомог|support/iu],
    nextFocus: [/наступн.*місяц|next focus/iu],
  },
  final_review: {
    initialState: [/початковий стан|initial state/iu],
    achievedResult: [/досягнут.*результ|achieved result/iu],
    indicators: [/показник|indicator|before.*after/iu],
    achievements: [/досягнен|achievement/iu],
    nextSteps: [/наступн|next step/iu],
  },
}

function requireValue(condition, message) {
  if (!condition) throw new DevelopmentError('XLSX_PARSE', message)
}

function decodeXml(value = '') {
  return String(value)
    .replace(/&#x([0-9a-f]+);/giu, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/gu, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&apos;/gu, "'")
    .replace(/&amp;/gu, '&')
}

function parseAttributes(source = '') {
  const attributes = {}
  const regex = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gu
  let match
  while ((match = regex.exec(source))) {
    attributes[match[1]] = decodeXml(match[2] ?? match[3] ?? '')
  }
  return attributes
}

function normalizePath(path) {
  const parts = []
  for (const part of String(path).replaceAll('\\', '/').split('/')) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return parts.join('/')
}

function joinPath(base, target) {
  const root = base.includes('/') ? base.slice(0, base.lastIndexOf('/') + 1) : ''
  return normalizePath(`${root}${target}`)
}

function findEndOfCentralDirectory(view) {
  const minimum = Math.max(0, view.byteLength - 65557)
  for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset
  }
  return -1
}

function createZipReader(arrayBuffer) {
  const view = new DataView(arrayBuffer)
  const eocd = findEndOfCentralDirectory(view)
  requireValue(eocd >= 0, 'The XLSX file is not a valid ZIP workbook.')

  const entryCount = view.getUint16(eocd + 10, true)
  const centralOffset = view.getUint32(eocd + 16, true)
  requireValue(entryCount <= MAX_ZIP_ENTRIES, 'The XLSX archive contains too many files.')

  const decoder = new TextDecoder('utf-8')
  const entries = new Map()
  let totalUncompressed = 0
  let offset = centralOffset

  for (let index = 0; index < entryCount; index += 1) {
    requireValue(view.getUint32(offset, true) === 0x02014b50, 'Invalid XLSX ZIP directory.')
    const flags = view.getUint16(offset + 8, true)
    const method = view.getUint16(offset + 10, true)
    const compressedSize = view.getUint32(offset + 20, true)
    const uncompressedSize = view.getUint32(offset + 24, true)
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const localOffset = view.getUint32(offset + 42, true)
    const nameBytes = new Uint8Array(arrayBuffer, offset + 46, nameLength)
    const name = normalizePath(decoder.decode(nameBytes))

    requireValue((flags & 0x1) === 0, 'Encrypted XLSX files are not supported.')
    requireValue(method === 0 || method === 8, 'Unsupported compression method in XLSX file.')

    totalUncompressed += uncompressedSize
    requireValue(
      totalUncompressed <= MAX_UNCOMPRESSED_BYTES,
      'The XLSX file expands to too much data for local import.',
    )

    entries.set(name, { name, method, compressedSize, uncompressedSize, localOffset })
    offset += 46 + nameLength + extraLength + commentLength
  }

  async function readBytes(name) {
    const entry = entries.get(normalizePath(name))
    if (!entry) return null

    const localOffset = entry.localOffset
    requireValue(view.getUint32(localOffset, true) === 0x04034b50, 'Invalid XLSX ZIP entry.')
    const fileNameLength = view.getUint16(localOffset + 26, true)
    const extraLength = view.getUint16(localOffset + 28, true)
    const dataOffset = localOffset + 30 + fileNameLength + extraLength
    const compressed = new Uint8Array(arrayBuffer, dataOffset, entry.compressedSize)

    if (entry.method === 0) return new Uint8Array(compressed)

    requireValue(
      typeof DecompressionStream !== 'undefined',
      'This browser cannot unpack XLSX files locally. Use a recent Chrome, Edge or Safari.',
    )

    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    const result = new Uint8Array(await new Response(stream).arrayBuffer())
    requireValue(
      !entry.uncompressedSize || result.byteLength === entry.uncompressedSize,
      'An XLSX ZIP entry could not be unpacked correctly.',
    )
    return result
  }

  async function readText(name) {
    const bytes = await readBytes(name)
    return bytes ? decoder.decode(bytes) : null
  }

  return { entries, readBytes, readText }
}

function parseSharedStrings(xml) {
  if (!xml) return []
  const result = []
  const itemRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/giu
  let itemMatch
  while ((itemMatch = itemRegex.exec(xml))) {
    const parts = []
    const textRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/giu
    let textMatch
    while ((textMatch = textRegex.exec(itemMatch[1]))) parts.push(decodeXml(textMatch[1]))
    result.push(parts.join(''))
  }
  return result
}

function parseWorkbookSheets(xml) {
  const sheets = []
  const regex = /<sheet\b([^>]*?)(?:\/>|>)/giu
  let match
  while ((match = regex.exec(xml || ''))) {
    const attrs = parseAttributes(match[1])
    if (attrs.name && attrs['r:id']) sheets.push({ name: attrs.name, relId: attrs['r:id'] })
  }
  return sheets
}

function parseRelationships(xml, basePath) {
  const relationships = new Map()
  const regex = /<Relationship\b([^>]*?)(?:\/>|>)/giu
  let match
  while ((match = regex.exec(xml || ''))) {
    const attrs = parseAttributes(match[1])
    if (attrs.Id && attrs.Target) relationships.set(attrs.Id, joinPath(basePath, attrs.Target))
  }
  return relationships
}

function columnIndexFromRef(ref) {
  const letters = String(ref).match(/^[A-Z]+/iu)?.[0]?.toUpperCase() || ''
  let result = 0
  for (const char of letters) result = result * 26 + char.charCodeAt(0) - 64
  return result - 1
}

function rowIndexFromRef(ref) {
  const digits = String(ref).match(/\d+/u)?.[0]
  return digits ? Number(digits) - 1 : -1
}

function columnLetters(index) {
  let value = index + 1
  let result = ''
  while (value > 0) {
    value -= 1
    result = String.fromCharCode(65 + (value % 26)) + result
    value = Math.floor(value / 26)
  }
  return result
}

function cellRef(row, col) {
  return `${columnLetters(col)}${row + 1}`
}

function extractTagText(xml, tag) {
  const match = String(xml).match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'iu'))
  return match ? decodeXml(match[1]) : ''
}

function parseInlineString(xml) {
  const parts = []
  const regex = /<t\b[^>]*>([\s\S]*?)<\/t>/giu
  let match
  while ((match = regex.exec(xml))) parts.push(decodeXml(match[1]))
  return parts.join('')
}

function parseWorksheet(xml, sharedStrings, sheetName) {
  const cells = []
  const cellRegex = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/giu
  let match

  while ((match = cellRegex.exec(xml || ''))) {
    if (cells.length >= MAX_SHEET_CELLS) {
      throw new DevelopmentError(
        'XLSX_PARSE',
        `Sheet "${sheetName}" contains too many populated cells for local import.`,
      )
    }

    const attrs = parseAttributes(match[1])
    const ref = attrs.r
    if (!ref) continue
    const row = rowIndexFromRef(ref)
    const col = columnIndexFromRef(ref)
    if (row < 0 || col < 0) continue

    const body = match[2] || ''
    const type = attrs.t || ''
    let value = ''

    if (type === 'inlineStr') value = parseInlineString(body)
    else {
      const raw = extractTagText(body, 'v')
      if (type === 's') value = sharedStrings[Number(raw)] ?? ''
      else if (type === 'b') value = raw === '1'
      else if (type === 'str') value = raw
      else if (raw !== '' && Number.isFinite(Number(raw))) value = Number(raw)
      else value = raw
    }

    if (value === '' || value == null) continue
    cells.push({ row, col, ref, value })
  }

  return { name: sheetName, cells }
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/[’ʼ`]/gu, "'")
    .replace(/\s+/gu, ' ')
    .trim()
    .toLowerCase()
}

function isMeaningful(value) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

function getCell(sheet, row, col) {
  return sheet.map.get(`${row}:${col}`)?.value ?? ''
}

function sheetWithMap(sheet) {
  return {
    ...sheet,
    map: new Map(sheet.cells.map((cell) => [`${cell.row}:${cell.col}`, cell])),
  }
}

function findNextAnchorRow(anchors, anchor) {
  const startCol = anchor.col
  const endCol = anchor.col + anchor.width - 1
  const rows = anchors
    .filter((item) => item.row > anchor.row)
    .filter((item) => {
      const otherEnd = item.col + item.width - 1
      return Math.max(startCol, item.col) <= Math.min(endCol, otherEnd)
    })
    .map((item) => item.row)
  return rows.length ? Math.min(...rows) : null
}

function lastPopulatedRow(sheet, startRow, startCol, endCol, capRow) {
  let last = startRow
  let emptyRun = 0
  for (let row = startRow; row <= capRow; row += 1) {
    let hasValue = false
    for (let col = startCol; col <= endCol; col += 1) {
      if (isMeaningful(getCell(sheet, row, col))) {
        hasValue = true
        break
      }
    }
    if (hasValue) {
      last = row
      emptyRun = 0
    } else {
      emptyRun += 1
      if (emptyRun >= 2 && row > startRow + 1) break
    }
  }
  return last
}

function matrixForRange(sheet, startRow, endRow, startCol, endCol) {
  const rows = []
  for (let row = startRow; row <= endRow; row += 1) {
    const values = []
    for (let col = startCol; col <= endCol; col += 1) values.push(getCell(sheet, row, col))
    if (values.some(isMeaningful)) rows.push(values)
  }
  return rows
}

function matrixForCells(cells, startRow, endRow, startCol, endCol) {
  const map = new Map(cells.map((cell) => [`${cell.row}:${cell.col}`, cell.value]))
  const rows = []
  for (let row = startRow; row <= endRow; row += 1) {
    const values = []
    for (let col = startCol; col <= endCol; col += 1) values.push(map.get(`${row}:${col}`) ?? '')
    if (values.some(isMeaningful)) rows.push(values)
  }
  return rows
}

function nextCoveredRow(covered, afterRow, startCol, endCol, maxRow) {
  for (let row = afterRow + 1; row <= maxRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      if (covered.has(`${row}:${col}`)) return row
    }
  }
  return null
}

function trimEmptyColumns(rows) {
  if (!rows.length) return rows
  const width = Math.max(...rows.map((row) => row.length))
  const keep = []
  for (let col = 0; col < width; col += 1) {
    if (rows.some((row) => isMeaningful(row[col]))) keep.push(col)
  }
  return rows.map((row) => keep.map((col) => row[col] ?? ''))
}

function tableData(rows) {
  const trimmed = trimEmptyColumns(rows)
  if (!trimmed.length) return { columns: [], rows: [] }
  const header = trimmed[0]
  const columns = header.map((value, index) => ({
    id: `column_${index + 1}`,
    label: isMeaningful(value) ? String(value) : `Column ${index + 1}`,
  }))
  const dataRows = trimmed.slice(1).map((row, index) => ({
    id: `row_${index + 1}`,
    cells: Object.fromEntries(columns.map((column, col) => [column.id, row[col] ?? ''])),
  }))
  return { columns, rows: dataRows }
}

function matchHeaderRule(values, rule) {
  const normalized = values.map(normalizeText)
  if (!normalized.some(Boolean)) return null

  const matched = []
  for (const [pattern] of rule.required) {
    const index = normalized.findIndex((value) => value && pattern.test(value))
    if (index < 0) return null
    matched.push(index)
  }

  let startIndex = Math.min(...matched)
  let endIndex = Math.max(...matched)
  if (startIndex > 0 && /місяць|month|період|period/iu.test(normalized[startIndex - 1])) startIndex -= 1

  return {
    type: rule.type,
    confidence: rule.confidence,
    startIndex,
    endIndex,
  }
}

function detectHeaderType(values) {
  for (const rule of HEADER_RULES) {
    const match = matchHeaderRule(values, rule)
    if (match) return match
  }
  return null
}

function detectAnchorType(value) {
  const text = normalizeText(value)
  if (!text || text.length > 180) return null
  for (const rule of TYPE_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) return rule
  }
  return null
}

function normalizeStatus(value) {
  const text = normalizeText(value)
  if (!text) return 'NOT_STARTED'
  for (const [pattern, status] of STATUS_MAP) {
    if (pattern.test(text)) return status
  }
  return 'NOT_STARTED'
}

function normalizeFieldValue(fieldKey, value) {
  if (fieldKey === 'status') return normalizeStatus(value)
  if (fieldKey === 'score') {
    const score = Number(value)
    return Number.isInteger(score) && score >= 1 && score <= 5 ? score : ''
  }
  if (fieldKey === 'done') {
    if (typeof value === 'boolean') return value
    return /^(1|true|yes|done|готов|викон)/iu.test(normalizeText(value))
  }
  return value == null ? '' : String(value)
}

function findHeaderColumn(headers, aliases, fallbackIndex) {
  const index = headers.findIndex((header) => aliases?.some((pattern) => pattern.test(normalizeText(header))))
  return index >= 0 ? index : fallbackIndex
}

function listData(type, rows) {
  const definition = DEVELOPMENT_BLOCK_DEFINITIONS.find((item) => item.type === type)
  const editor = definition?.editor
  if (editor?.kind !== 'list') return { items: [] }

  const trimmed = trimEmptyColumns(rows)
  if (!trimmed.length) return { [editor.key]: [] }

  const headers = trimmed[0]
  const aliases = FIELD_ALIASES[type] || {}
  const indices = Object.fromEntries(
    editor.fields.map((field, index) => [
      field.key,
      findHeaderColumn(headers, aliases[field.key], Math.min(index, headers.length - 1)),
    ]),
  )

  const items = trimmed.slice(1)
    .filter((row) => row.some(isMeaningful))
    .map((row, index) => ({
      id: `import_${index + 1}`,
      ...Object.fromEntries(
        editor.fields.map((field) => [
          field.key,
          normalizeFieldValue(field.key, row[indices[field.key]] ?? ''),
        ]),
      ),
    }))

  return { [editor.key]: items }
}

function fieldsData(type, rows, fallbackText = '') {
  const definition = DEVELOPMENT_BLOCK_DEFINITIONS.find((item) => item.type === type)
  const editor = definition?.editor
  if (editor?.kind !== 'fields') return {}

  const result = Object.fromEntries(editor.fields.map((field) => [field.key, '']))
  const aliases = FIELD_KEY_ALIASES[type] || {}
  let matched = 0

  for (const row of rows) {
    const label = normalizeText(row[0])
    const value = row.slice(1).find(isMeaningful)
    if (!label || value == null) continue

    for (const field of editor.fields) {
      if (aliases[field.key]?.some((pattern) => pattern.test(label))) {
        result[field.key] = String(value)
        matched += 1
        break
      }
    }
  }

  if (!matched && fallbackText) {
    const preferred = editor.fields.find((field) => field.type === 'textarea') || editor.fields[0]
    if (preferred) result[preferred.key] = fallbackText
  }

  return result
}

function textData(rows) {
  return {
    text: rows
      .flat()
      .filter(isMeaningful)
      .map((value) => String(value))
      .join('\n'),
  }
}

function candidateData(type, rows, fallbackText = '') {
  const definition = DEVELOPMENT_BLOCK_DEFINITIONS.find((item) => item.type === type)
  if (!definition) return tableData(rows)
  if (definition.editor?.kind === 'list') return listData(type, rows)
  if (definition.editor?.kind === 'fields') return fieldsData(type, rows, fallbackText)
  if (definition.editor?.kind === 'text') return textData(rows)
  if (definition.editor?.kind === 'table') return tableData(rows)
  return tableData(rows)
}

function makeCandidate({ type, title, sourceSheet, startRow, endRow, startCol, endCol, rows, confidence }) {
  return {
    id: `detected_${crypto.randomUUID().replaceAll('-', '_')}`,
    title: String(title || 'Imported block').slice(0, 160),
    sourceSheet,
    sourceRange: `${cellRef(startRow, startCol)}:${cellRef(endRow, endCol)}`,
    detectedType: type,
    targetType: type,
    confidence,
    include: true,
    data: candidateData(type, rows, rows.flat().filter(isMeaningful).join('\n')),
    rawRows: rows.map((row) => row.map((value) => value ?? '')),
    bounds: { startRow, endRow, startCol, endCol },
  }
}

function overlap(a, b) {
  return !(
    a.endRow < b.startRow ||
    b.endRow < a.startRow ||
    a.endCol < b.startCol ||
    b.endCol < a.startCol
  )
}

function markCoverage(covered, bounds) {
  for (let row = bounds.startRow; row <= bounds.endRow; row += 1) {
    for (let col = bounds.startCol; col <= bounds.endCol; col += 1) covered.add(`${row}:${col}`)
  }
}

function detectAnchors(sheet) {
  const anchors = []
  for (const cell of sheet.cells) {
    const rule = detectAnchorType(cell.value)
    if (!rule) continue
    anchors.push({ row: cell.row, col: cell.col, width: rule.width, type: rule.type, title: String(cell.value), confidence: rule.confidence })
  }
  return anchors
}

function detectHeaderCandidates(sheet, covered) {
  const byRow = new Map()
  for (const cell of sheet.cells) {
    if (covered.has(`${cell.row}:${cell.col}`)) continue
    if (!byRow.has(cell.row)) byRow.set(cell.row, [])
    byRow.get(cell.row).push(cell)
  }

  const candidates = []
  for (const [rowIndex, rowCells] of [...byRow.entries()].sort((a, b) => a[0] - b[0])) {
    const sorted = [...rowCells].sort((a, b) => a.col - b.col)
    let segment = []

    const flush = () => {
      if (segment.length < 2) {
        segment = []
        return
      }
      const segmentStartCol = segment[0].col
      const segmentEndCol = segment[segment.length - 1].col
      const values = []
      for (let col = segmentStartCol; col <= segmentEndCol; col += 1) values.push(getCell(sheet, rowIndex, col))
      const detected = detectHeaderType(values)
      if (!detected) {
        segment = []
        return
      }
      const startCol = segmentStartCol + detected.startIndex
      const endCol = segmentStartCol + detected.endIndex
      const nextCovered = nextCoveredRow(covered, rowIndex, startCol, endCol, sheet.maxRow)
      const capRow = Math.min(
        rowIndex + 200,
        sheet.maxRow,
        nextCovered == null ? sheet.maxRow : Math.max(rowIndex, nextCovered - 1),
      )
      const endRow = lastPopulatedRow(sheet, rowIndex + 1, startCol, endCol, capRow)
      const rows = matrixForRange(sheet, rowIndex, endRow, startCol, endCol)
      const title = detected.type === 'roadmap_tracks' ? 'Roadmap' : DEVELOPMENT_BLOCK_DEFINITIONS.find((item) => item.type === detected.type)?.defaultTitle
      const candidate = makeCandidate({
        type: detected.type,
        title,
        sourceSheet: sheet.name,
        startRow: rowIndex,
        endRow,
        startCol,
        endCol,
        rows,
        confidence: detected.confidence,
      })
      if (!candidates.some((item) => overlap(item.bounds, candidate.bounds))) candidates.push(candidate)
      segment = []
    }

    for (const cell of sorted) {
      if (!segment.length || cell.col <= segment[segment.length - 1].col + 1) segment.push(cell)
      else {
        flush()
        segment = [cell]
      }
    }
    flush()
  }

  for (const candidate of candidates) markCoverage(covered, candidate.bounds)
  return candidates
}

function detectAnchorCandidates(sheet, anchors, covered) {
  const candidates = []
  for (const anchor of anchors) {
    const startCol = anchor.col
    const endCol = Math.min(sheet.maxCol, anchor.col + anchor.width - 1)
    const nextAnchorRow = findNextAnchorRow(anchors, anchor)
    const capRow = Math.min(sheet.maxRow, nextAnchorRow == null ? anchor.row + 120 : nextAnchorRow - 1)
    const dataStart = anchor.row + 1
    const endRow = Math.max(anchor.row, lastPopulatedRow(sheet, dataStart, startCol, endCol, capRow))
    let rows = matrixForRange(sheet, dataStart, endRow, startCol, endCol)

    if (!rows.length && anchor.type !== 'monthly_report') continue

    if (anchor.type === 'monthly_report') {
      const longCells = sheet.cells
        .filter((cell) => cell.row > anchor.row && cell.row <= Math.min(sheet.maxRow, anchor.row + 15))
        .filter((cell) => typeof cell.value === 'string' && cell.value.length > 120)
      if (longCells.length) {
        for (const cell of longCells) {
          const singleRows = [[cell.value]]
          const candidate = makeCandidate({
            type: 'monthly_report',
            title: String(cell.value).split('\n')[0].slice(0, 160) || 'Monthly report',
            sourceSheet: sheet.name,
            startRow: cell.row,
            endRow: cell.row,
            startCol: cell.col,
            endCol: cell.col,
            rows: singleRows,
            confidence: 0.97,
          })
          candidates.push(candidate)
          markCoverage(covered, candidate.bounds)
        }
        markCoverage(covered, { startRow: anchor.row, endRow: anchor.row, startCol: anchor.col, endCol: anchor.col })
        continue
      }
    }

    const candidate = makeCandidate({
      type: anchor.type,
      title: anchor.title,
      sourceSheet: sheet.name,
      startRow: anchor.row,
      endRow,
      startCol,
      endCol,
      rows,
      confidence: anchor.confidence,
    })
    candidates.push(candidate)
    markCoverage(covered, candidate.bounds)
  }
  return candidates
}

function detectLongTextCandidates(sheet, covered) {
  const candidates = []
  for (const cell of sheet.cells) {
    if (covered.has(`${cell.row}:${cell.col}`)) continue
    if (typeof cell.value !== 'string' || cell.value.trim().length < 180) continue

    const text = cell.value.trim()
    let type = 'text'
    let confidence = 0.72
    if (/^місяць\s*\d+|monthly report/iu.test(text)) {
      type = 'monthly_report'
      confidence = 0.94
    } else if (/початковий стан|досягнутий результат|final review/iu.test(text)) {
      type = 'final_review'
      confidence = 0.9
    }

    const title = text.split('\n')[0].slice(0, 160) || 'Imported text'
    const candidate = makeCandidate({
      type,
      title,
      sourceSheet: sheet.name,
      startRow: cell.row,
      endRow: cell.row,
      startCol: cell.col,
      endCol: cell.col,
      rows: [[text]],
      confidence,
    })
    candidates.push(candidate)
    markCoverage(covered, candidate.bounds)
  }
  return candidates
}

function detectFallbackCandidate(sheet, covered) {
  const remaining = sheet.cells.filter((cell) => !covered.has(`${cell.row}:${cell.col}`))
  if (!remaining.length) return []

  const startRow = Math.min(...remaining.map((cell) => cell.row))
  const endRow = Math.max(...remaining.map((cell) => cell.row))
  const startCol = Math.min(...remaining.map((cell) => cell.col))
  const endCol = Math.max(...remaining.map((cell) => cell.col))
  const rows = matrixForCells(remaining, startRow, endRow, startCol, endCol)

  return [
    makeCandidate({
      type: 'table',
      title: `${sheet.name} · Imported table`,
      sourceSheet: sheet.name,
      startRow,
      endRow,
      startCol,
      endCol,
      rows,
      confidence: 0.55,
    }),
  ]
}

function buildPreviewForSheet(rawSheet) {
  const sheet = sheetWithMap(rawSheet)
  sheet.maxRow = sheet.cells.length ? Math.max(...sheet.cells.map((cell) => cell.row)) : 0
  sheet.maxCol = sheet.cells.length ? Math.max(...sheet.cells.map((cell) => cell.col)) : 0

  const covered = new Set()
  const anchors = detectAnchors(sheet)
  const candidates = [
    ...detectAnchorCandidates(sheet, anchors, covered),
    ...detectHeaderCandidates(sheet, covered),
    ...detectLongTextCandidates(sheet, covered),
    ...detectFallbackCandidate(sheet, covered),
  ]

  candidates.sort((a, b) => a.bounds.startRow - b.bounds.startRow || a.bounds.startCol - b.bounds.startCol)

  return {
    id: `page_${crypto.randomUUID().replaceAll('-', '_')}`,
    title: sheet.name,
    sourceSheet: sheet.name,
    sections: [
      {
        id: `section_${crypto.randomUUID().replaceAll('-', '_')}`,
        title: 'Imported content',
        blocks: candidates.map(({ bounds, ...candidate }) => candidate),
      },
    ],
  }
}

export async function parseXlsxArrayBuffer(arrayBuffer, fileName = 'roadmap.xlsx') {
  requireValue(arrayBuffer instanceof ArrayBuffer, 'Unable to read the XLSX file.')
  const bytes = new Uint8Array(arrayBuffer)
  requireValue(bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b, 'The selected file is not a valid XLSX workbook.')

  const zip = createZipReader(arrayBuffer)
  const workbookXml = await zip.readText('xl/workbook.xml')
  requireValue(workbookXml, 'The XLSX workbook metadata is missing.')
  const relsXml = await zip.readText('xl/_rels/workbook.xml.rels')
  requireValue(relsXml, 'The XLSX workbook relationships are missing.')
  const sharedStrings = parseSharedStrings(await zip.readText('xl/sharedStrings.xml'))
  const sheets = parseWorkbookSheets(workbookXml)
  const relationships = parseRelationships(relsXml, 'xl/workbook.xml')
  requireValue(sheets.length > 0, 'The XLSX workbook has no worksheets.')

  const parsedSheets = []
  for (const sheet of sheets) {
    const target = relationships.get(sheet.relId)
    if (!target) continue
    const xml = await zip.readText(target)
    if (!xml) continue
    parsedSheets.push(parseWorksheet(xml, sharedStrings, sheet.name))
  }
  requireValue(parsedSheets.length > 0, 'No readable worksheets were found in the XLSX file.')

  const pages = parsedSheets.map(buildPreviewForSheet)
  const detectedCount = pages.reduce(
    (total, page) => total + page.sections.reduce((sum, section) => sum + section.blocks.length, 0),
    0,
  )

  return {
    fileName,
    warnings: [
      'Local import reads workbook values only. Formulas are not executed; cached values are used when available.',
      'Formatting and exact Excel layout are intentionally converted into Mihaoo-native blocks.',
    ],
    preview: { pages },
    detectedCount,
  }
}

export async function parseLocalRoadmapSpreadsheet(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new DevelopmentError('VALIDATION', 'Choose an XLSX file.')
  }
  return parseXlsxArrayBuffer(await file.arrayBuffer(), file.name || 'roadmap.xlsx')
}
