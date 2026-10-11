import { computed, ref } from 'vue'
import {
  createDevelopmentBlock,
  createDevelopmentPage,
  createDevelopmentSection,
  moveOrderedItem,
  normalizeOrderedItems,
  structuredCloneSafe,
} from '@/modules/development/development.blocks.js'

export function useDevelopmentBuilder() {
  const draft = ref(null)
  const dirty = ref(false)
  const selectedPageId = ref('')
  const selectedSectionId = ref('')
  const selectedBlockId = ref('')

  const selectedPage = computed(() => {
    const pages = draft.value?.pages || []
    return pages.find((page) => page.id === selectedPageId.value) || pages[0] || null
  })

  const selectedSection = computed(() => {
    const sections = selectedPage.value?.sections || []
    return (
      sections.find((section) => section.id === selectedSectionId.value) || sections[0] || null
    )
  })

  const selectedBlock = computed(() => {
    if (!selectedBlockId.value) return null

    for (const page of draft.value?.pages || []) {
      for (const section of page.sections || []) {
        const block = section.blocks?.find((item) => item.id === selectedBlockId.value)
        if (block) return block
      }
    }

    return null
  })

  function clear() {
    draft.value = null
    dirty.value = false
    selectedPageId.value = ''
    selectedSectionId.value = ''
    selectedBlockId.value = ''
  }

  function load(roadmap) {
    draft.value = structuredCloneSafe(roadmap)
    dirty.value = false
    selectedPageId.value = roadmap.pages?.[0]?.id || ''
    selectedSectionId.value = roadmap.pages?.[0]?.sections?.[0]?.id || ''
    selectedBlockId.value = ''
  }

  function touch() {
    dirty.value = true
  }

  function selectPage(id) {
    selectedPageId.value = id
    selectedSectionId.value = selectedPage.value?.sections?.[0]?.id || ''
    selectedBlockId.value = ''
  }

  function selectSection(id) {
    selectedSectionId.value = id
    selectedBlockId.value = ''
  }

  function selectBlock(id) {
    selectedBlockId.value = id
  }

  function addPage() {
    if (!draft.value) return null
    const page = createDevelopmentPage(`Page ${draft.value.pages.length + 1}`, draft.value.pages.length)
    draft.value.pages = [...draft.value.pages, page]
    touch()
    selectPage(page.id)
    return page
  }

  function updatePageTitle(value) {
    if (!selectedPage.value) return
    selectedPage.value.title = String(value).slice(0, 160)
    touch()
  }

  function deletePage() {
    if (!draft.value || !selectedPage.value || draft.value.pages.length <= 1) return false
    const index = draft.value.pages.findIndex((page) => page.id === selectedPage.value.id)
    draft.value.pages.splice(index, 1)
    draft.value.pages = normalizeOrderedItems(draft.value.pages)
    touch()
    selectPage(draft.value.pages[Math.max(0, index - 1)]?.id || draft.value.pages[0]?.id || '')
    return true
  }

  function movePage(offset) {
    if (!draft.value || !selectedPage.value) return
    const index = draft.value.pages.findIndex((page) => page.id === selectedPage.value.id)
    const target = index + offset
    if (target < 0 || target >= draft.value.pages.length) return
    draft.value.pages = moveOrderedItem(draft.value.pages, index, target)
    touch()
  }

  function addSection() {
    if (!selectedPage.value) return null
    const section = createDevelopmentSection(
      `Section ${selectedPage.value.sections.length + 1}`,
      selectedPage.value.sections.length,
    )
    selectedPage.value.sections.push(section)
    touch()
    selectSection(section.id)
    return section
  }

  function updateSectionTitle(value) {
    if (!selectedSection.value) return
    selectedSection.value.title = String(value).slice(0, 160)
    touch()
  }

  function deleteSection() {
    if (!selectedPage.value || !selectedSection.value) return false
    if (selectedPage.value.sections.length <= 1) return false
    const index = selectedPage.value.sections.findIndex(
      (section) => section.id === selectedSection.value.id,
    )
    selectedPage.value.sections.splice(index, 1)
    selectedPage.value.sections = normalizeOrderedItems(selectedPage.value.sections)
    touch()
    selectSection(
      selectedPage.value.sections[Math.max(0, index - 1)]?.id ||
        selectedPage.value.sections[0]?.id ||
        '',
    )
    return true
  }

  function moveSection(offset) {
    if (!selectedPage.value || !selectedSection.value) return
    const index = selectedPage.value.sections.findIndex(
      (section) => section.id === selectedSection.value.id,
    )
    const target = index + offset
    if (target < 0 || target >= selectedPage.value.sections.length) return
    selectedPage.value.sections = moveOrderedItem(selectedPage.value.sections, index, target)
    touch()
  }

  function addBlock(type) {
    if (!selectedSection.value) return null
    const block = createDevelopmentBlock(type, { order: selectedSection.value.blocks.length })
    selectedSection.value.blocks.push(block)
    touch()
    selectBlock(block.id)
    return block
  }

  function updateBlock(partial) {
    if (!selectedBlock.value) return
    Object.assign(selectedBlock.value, structuredCloneSafe(partial))
    touch()
  }

  function duplicateBlock(blockId) {
    if (!selectedSection.value) return null
    const index = selectedSection.value.blocks.findIndex((block) => block.id === blockId)
    if (index === -1) return null

    const copy = structuredCloneSafe(selectedSection.value.blocks[index])
    copy.id = `tmp_${crypto.randomUUID().replaceAll('-', '_')}`
    copy.title = `${copy.title} Copy`.slice(0, 160)
    selectedSection.value.blocks.splice(index + 1, 0, copy)
    selectedSection.value.blocks = normalizeOrderedItems(selectedSection.value.blocks)
    touch()
    selectBlock(copy.id)
    return copy
  }

  function deleteBlock(blockId) {
    if (!selectedSection.value) return false
    const index = selectedSection.value.blocks.findIndex((block) => block.id === blockId)
    if (index === -1) return false
    selectedSection.value.blocks.splice(index, 1)
    selectedSection.value.blocks = normalizeOrderedItems(selectedSection.value.blocks)
    if (selectedBlockId.value === blockId) selectedBlockId.value = ''
    touch()
    return true
  }

  function moveBlock(blockId, offset) {
    if (!selectedSection.value) return
    const index = selectedSection.value.blocks.findIndex((block) => block.id === blockId)
    const target = index + offset
    if (index === -1 || target < 0 || target >= selectedSection.value.blocks.length) return
    selectedSection.value.blocks = moveOrderedItem(selectedSection.value.blocks, index, target)
    touch()
  }

  function markSaved(roadmap) {
    load(roadmap)
  }

  return {
    draft,
    dirty,
    selectedPageId,
    selectedSectionId,
    selectedBlockId,
    selectedPage,
    selectedSection,
    selectedBlock,
    load,
    clear,
    markSaved,
    selectPage,
    selectSection,
    selectBlock,
    addPage,
    updatePageTitle,
    deletePage,
    movePage,
    addSection,
    updateSectionTitle,
    deleteSection,
    moveSection,
    addBlock,
    updateBlock,
    duplicateBlock,
    deleteBlock,
    moveBlock,
  }
}
