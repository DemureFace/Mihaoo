export const MAP_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Map',
    description:
      'Start with an empty canvas.',
    category: 'General',
  },

  {
    id: 'pilot-readiness',
    name: 'Pilot Readiness',
    description:
      'Mihaoo release readiness flow with QA, Go/No-Go and production pilot.',
    category: 'Release',
  },

  {
    id: 'release-roadmap',
    name: 'Release Roadmap',
    description:
      'Visual release roadmap with milestones.',
    category: 'Planning',
  },

  {
    id: 'architecture',
    name: 'Architecture Map',
    description:
      'Services, databases and dependencies.',
    category: 'Technical',
  },
]

export function buildMapFromTemplate(
  templateId,
) {
  switch (templateId) {
    case 'pilot-readiness':
      return buildPilotReadiness()

    case 'release-roadmap':
      return buildReleaseRoadmap()

    case 'architecture':
      return buildArchitecture()

    default:
      return buildBlank()
  }
}

function createNode(
  id,
  x,
  y,
  data,
) {
  return {
    id,

    type: 'mihaoo',

    position: {
      x,
      y,
    },

    data: {
      type: 'step',
      title: 'Untitled',
      description: '',
      status: 'draft',
      owner: '',
      dueDate: '',
      url: '',

      ...data,
    },
  }
}

function createEdge(
  source,
  target,
  label = '',
) {
  return {
    id: crypto.randomUUID(),

    source,
    target,

    type: 'smoothstep',

    label,
  }
}

function buildBlank() {
  return {
    title: 'Untitled Map',

    description: '',

    type: 'blank',

    nodes: [],
    edges: [],
  }
}

function buildPilotReadiness() {
  const ids = {
    development:
      crypto.randomUUID(),

    regression:
      crypto.randomUUID(),

    e2e:
      crypto.randomUUID(),

    production:
      crypto.randomUUID(),

    goNoGo:
      crypto.randomUUID(),

    pilot:
      crypto.randomUUID(),

    release:
      crypto.randomUUID(),
  }

  const nodes = [
    createNode(
      ids.development,
      80,
      80,
      {
        type: 'step',

        title:
          'P0 Features Complete',

        description:
          'All P0 release functionality is completed, available on staging and passed QA.',

        status: 'active',

        owner:
          'Mykhailo B',

        dueDate:
          '2026-09-20',
      },
    ),

    createNode(
      ids.regression,
      380,
      80,
      {
        type: 'step',

        title:
          'Regression & RBAC',

        description:
          'Blocker and Critical bugs = 0. Approved High exceptions only. Auth, permissions and Platform Scope verified.',

        status: 'draft',

        owner:
          'QA',

        dueDate:
          '2026-09-27',
      },
    ),

    createNode(
      ids.e2e,
      680,
      80,
      {
        type: 'step',

        title:
          'E2E Scenarios',

        description:
          'Admin, Content Lead and Content Specialist critical user flows are successfully completed.',

        status: 'draft',
      },
    ),

    createNode(
      ids.production,
      980,
      80,
      {
        type: 'milestone',

        title:
          'Production Ready',

        description:
          'Production configuration, pilot accounts, documentation, monitoring, backup and rollback are ready.',

        status: 'draft',

        dueDate:
          '2026-09-30',
      },
    ),

    createNode(
      ids.goNoGo,
      980,
      360,
      {
        type: 'decision',

        title:
          'Go / No-Go',

        description:
          'Final GO requires approval from Mykhailo B, Vladyslav Ko and Hryhorii S.',

        status: 'draft',

        owner:
          'Mykhailo B + Vladyslav Ko + Hryhorii S',

        dueDate:
          '2026-09-30',
      },
    ),

    createNode(
      ids.pilot,
      680,
      360,
      {
        type: 'milestone',

        title:
          'Production Pilot',

        description:
          'Pilot on production with 3 users. Issues and bugs are reported in Jira.',

        status: 'draft',

        owner:
          'Mykhailo B',

        dueDate:
          '2026-10-01',
      },
    ),

    createNode(
      ids.release,
      380,
      360,
      {
        type: 'milestone',

        title:
          'Full Release',

        description:
          'Release to the full Content Team after successful pilot completion.',

        status: 'draft',

        dueDate:
          '2026-10-08',
      },
    ),
  ]

  const edges = [
    createEdge(
      ids.development,
      ids.regression,
    ),

    createEdge(
      ids.regression,
      ids.e2e,
    ),

    createEdge(
      ids.e2e,
      ids.production,
    ),

    createEdge(
      ids.production,
      ids.goNoGo,
    ),

    createEdge(
      ids.goNoGo,
      ids.pilot,
      'GO',
    ),

    createEdge(
      ids.pilot,
      ids.release,
    ),
  ]

  return {
    title:
      'Mihaoo Pilot Readiness',

    description:
      'REL-05 Pilot Readiness flow.',

    type:
      'pilot-readiness',

    nodes,
    edges,
  }
}

function buildReleaseRoadmap() {
  const sprint =
    crypto.randomUUID()

  const freeze =
    crypto.randomUUID()

  const pilot =
    crypto.randomUUID()

  const release =
    crypto.randomUUID()

  return {
    title:
      'Mihaoo Release Roadmap',

    description:
      'Release milestones and rollout.',

    type:
      'release-roadmap',

    nodes: [
      createNode(
        sprint,
        100,
        180,
        {
          type: 'step',
          title:
            'Development',
        },
      ),

      createNode(
        freeze,
        400,
        180,
        {
          type: 'milestone',
          title:
            'Feature Freeze',
        },
      ),

      createNode(
        pilot,
        700,
        180,
        {
          type: 'milestone',
          title:
            'Pilot',
        },
      ),

      createNode(
        release,
        1000,
        180,
        {
          type: 'milestone',
          title:
            'Full Release',
        },
      ),
    ],

    edges: [
      createEdge(
        sprint,
        freeze,
      ),

      createEdge(
        freeze,
        pilot,
      ),

      createEdge(
        pilot,
        release,
      ),
    ],
  }
}

function buildArchitecture() {
  const frontend =
    crypto.randomUUID()

  const gateway =
    crypto.randomUUID()

  const service =
    crypto.randomUUID()

  const database =
    crypto.randomUUID()

  return {
    title:
      'Mihaoo Architecture',

    description:
      'Base microservice architecture map.',

    type:
      'architecture',

    nodes: [
      createNode(
        frontend,
        100,
        180,
        {
          type: 'service',
          title:
            'Mihaoo Frontend',
        },
      ),

      createNode(
        gateway,
        400,
        180,
        {
          type: 'service',
          title:
            'API Gateway',
        },
      ),

      createNode(
        service,
        700,
        180,
        {
          type: 'service',
          title:
            'Microservice',
        },
      ),

      createNode(
        database,
        1000,
        180,
        {
          type: 'service',
          title:
            'PostgreSQL',
        },
      ),
    ],

    edges: [
      createEdge(
        frontend,
        gateway,
      ),

      createEdge(
        gateway,
        service,
      ),

      createEdge(
        service,
        database,
      ),
    ],
  }
}
