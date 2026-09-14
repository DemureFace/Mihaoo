const MAP_SCHEMA_VERSION = 1

function cloneSerializable(value) {
  return JSON.parse(
    JSON.stringify(value),
  )
}

export function createMapExport({
  title,
  description,
  type,
  status,
  nodes,
  edges,
}) {
  return {
    schemaVersion:
      MAP_SCHEMA_VERSION,

    exportedAt:
      new Date().toISOString(),

    map: {
      title:
        title || 'Untitled Map',

      description:
        description || '',

      type:
        type || 'blank',

      status:
        status || 'draft',

      nodes:
        cloneSerializable(
          nodes || [],
        ),

      edges:
        cloneSerializable(
          edges || [],
        ),
    },
  }
}

export function downloadMapExport(
  payload,
) {
  const json =
    JSON.stringify(
      payload,
      null,
      2,
    )

  const blob =
    new Blob(
      [json],
      {
        type:
          'application/json',
      },
    )

  const url =
    URL.createObjectURL(
      blob,
    )

  const safeTitle =
    payload.map.title
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-',
      )
      .replace(
        /^-|-$/g,
        '',
      ) || 'mihaoo-map'

  const link =
    document.createElement(
      'a',
    )

  link.href = url

  link.download =
    `${safeTitle}.json`

  document.body.appendChild(
    link,
  )

  link.click()

  link.remove()

  URL.revokeObjectURL(
    url,
  )
}

export async function readMapImport(
  file,
) {
  const text =
    await file.text()

  let payload

  try {
    payload =
      JSON.parse(text)
  } catch {
    throw new Error(
      'Invalid JSON file.',
    )
  }

  if (
    payload.schemaVersion &&
    payload.schemaVersion !==
      MAP_SCHEMA_VERSION
  ) {
    throw new Error(
      `Unsupported map schema version: ${payload.schemaVersion}`,
    )
  }

  const source =
    payload.map || payload

  if (
    !source ||
    typeof source !== 'object'
  ) {
    throw new Error(
      'Map data is missing.',
    )
  }

  if (
    !Array.isArray(
      source.nodes,
    )
  ) {
    throw new Error(
      'Map nodes must be an array.',
    )
  }

  if (
    !Array.isArray(
      source.edges,
    )
  ) {
    throw new Error(
      'Map edges must be an array.',
    )
  }

  return {
    title:
      source.title ||
      'Imported Map',

    description:
      source.description || '',

    type:
      source.type || 'blank',

    status:
      source.status || 'draft',

    nodes:
      cloneSerializable(
        source.nodes,
      ),

    edges:
      cloneSerializable(
        source.edges,
      ),
  }
}
