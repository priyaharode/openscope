import { TopicResearchResult, Investigation, UserSettings } from '../types';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  userName: 'Dr. Evelyn Vance',
  userRole: 'Senior Research Fellow',
  organization: 'Open Intelligence Lab',
  themeDensity: 'comfortable',
  openAlexEmail: 'researcher@openscope.org',
  defaultDataSource: 'all',
  autoExtractEntities: true,
  enableAiSummary: true,
  exportFormat: 'markdown'
};

export const TRENDING_TOPICS = [
  {
    topic: 'Quantum Error Correction',
    category: 'Physics & Quantum Info',
    papersCount: '1,420',
    velocity: '+28% this month',
    tag: 'Breakthrough',
    description: 'Surface codes, topological qubits, and logical quantum processor scaling.'
  },
  {
    topic: 'CRISPR Epigenome Editing',
    category: 'Biotechnology & Genomics',
    papersCount: '2,890',
    velocity: '+19% this month',
    tag: 'Clinical Trials',
    description: 'Targeted transcriptional modulation without creating double-strand DNA breaks.'
  },
  {
    topic: 'Solid-State Electrolytes',
    category: 'Materials Science & Energy',
    papersCount: '3,110',
    velocity: '+34% this month',
    tag: 'Commercialization',
    description: 'Sulfide and garnet-type solid electrolytes for high-density automotive batteries.'
  },
  {
    topic: 'Mechanistic Interpretability',
    category: 'Artificial Intelligence',
    papersCount: '4,650',
    velocity: '+45% this month',
    tag: 'High Velocity',
    description: 'Reverse engineering feature circuits and induction heads in large neural models.'
  },
  {
    topic: 'Neuromorphic Synaptic Devices',
    category: 'Hardware & Neurocomputing',
    papersCount: '980',
    velocity: '+14% this month',
    tag: 'Emerging',
    description: 'Memristive arrays and event-based spike processing for edge intelligence.'
  },
  {
    topic: 'Atmospheric Carbon Mineralization',
    category: 'Climate & Geosciences',
    papersCount: '1,240',
    velocity: '+22% this month',
    tag: 'Policy Focus',
    description: 'Accelerated olivine dissolution and basalt sequestration kinetics.'
  }
];

export const SAMPLE_RESEARCH_RESULTS: Record<string, TopicResearchResult> = {
  'Quantum Error Correction': {
    query: 'Quantum Error Correction',
    title: 'Quantum Error Correction & Fault-Tolerant Architectures',
    overview: 'Quantum error correction (QEC) is essential for achieving fault-tolerant quantum computing by protecting quantum information from decoherence and environmental noise. Rather than isolating individual qubits, QEC redundantly encodes logical qubits across topological lattices of physical qubits, such as surface codes, cat codes, and color codes.',
    summaryBulletPoints: [
      'Threshold theorems prove that if physical error rates fall below ~1%, arbitrary-depth quantum circuits can execute faithfully.',
      'Surface code architectures are leading current experimental efforts due to nearest-neighbor 2D coupler layouts.',
      'Syndrome extraction latency and real-time classical decoding hardware remain the primary operational bottlenecks.',
      'Recent breakthroughs demonstrate physical error suppression scaling exponentially with lattice code distance.'
    ],
    keywords: [
      { word: 'Surface Code', weight: 1.0 },
      { word: 'Logical Qubit', weight: 0.94 },
      { word: 'Decoherence', weight: 0.88 },
      { word: 'Syndrome Measurement', weight: 0.82 },
      { word: 'Fault-Tolerance', weight: 0.79 },
      { word: 'Transmon', weight: 0.72 },
      { word: 'Threshold Theorem', weight: 0.68 },
      { word: 'Cat Codes', weight: 0.61 },
      { word: 'Topological Code', weight: 0.58 },
      { word: 'Decoding Latency', weight: 0.52 }
    ],
    relatedTopics: [
      'Topological Quantum Computing',
      'Neutral Atom Quantum Simulators',
      'Quantum Annealing',
      'Superconducting Circuit QED',
      'Bosonic Qubit Stabilization'
    ],
    entities: [
      { id: 'ent-1', name: 'John Preskill', type: 'PERSON', frequency: 14, confidence: 0.98, wikipediaUrl: 'https://en.wikipedia.org/wiki/John_Preskill' },
      { id: 'ent-2', name: 'Peter Shor', type: 'PERSON', frequency: 18, confidence: 0.99, wikipediaUrl: 'https://en.wikipedia.org/wiki/Peter_Shor' },
      { id: 'ent-3', name: 'Google Quantum AI', type: 'ORGANIZATION', frequency: 22, confidence: 0.96, wikipediaUrl: 'https://en.wikipedia.org/wiki/Google_Quantum_AI' },
      { id: 'ent-4', name: 'IBM Quantum', type: 'ORGANIZATION', frequency: 19, confidence: 0.95, wikipediaUrl: 'https://en.wikipedia.org/wiki/IBM_Quantum_Platform' },
      { id: 'ent-5', name: 'Surface Code', type: 'METHOD', frequency: 26, confidence: 0.94, wikipediaUrl: 'https://en.wikipedia.org/wiki/Toric_code' },
      { id: 'ent-6', name: 'Cat Qubit', type: 'CONCEPT', frequency: 11, confidence: 0.89, wikipediaUrl: 'https://en.wikipedia.org/wiki/Cat_state' },
      { id: 'ent-7', name: 'Harvard University', type: 'ORGANIZATION', frequency: 13, confidence: 0.91, wikipediaUrl: 'https://en.wikipedia.org/wiki/Harvard_University' },
      { id: 'ent-8', name: 'Mikhail Lukin', type: 'PERSON', frequency: 9, confidence: 0.92, wikipediaUrl: 'https://en.wikipedia.org/wiki/Mikhail_Lukin' }
    ],
    sources: [
      {
        id: 'src-101',
        title: 'Suppressing quantum errors by scaling a quantum error-correcting code',
        authors: ['Google Quantum AI Consortium', 'R. Barends', 'J. Kelly'],
        publishedDate: '2023-02-22',
        year: 2023,
        url: 'https://www.nature.com/articles/s41586-022-05434-1',
        doi: '10.1038/s41586-022-05434-1',
        source: 'OpenAlex',
        venue: 'Nature 614, 676–681',
        citations: 824,
        abstract: 'Scaling a quantum processor to larger surface code distances demonstrates for the first time that increasing system size reduces logical error rate below physical thresholds.',
        type: 'journal',
        relevanceScore: 0.98,
        sentimentScore: 0.65,
        entities: ['Google Quantum AI', 'Surface Code', 'Threshold Theorem'],
        isOpenAccess: true
      },
      {
        id: 'src-102',
        title: 'Logical quantum processor with neutral atom arrays',
        authors: ['D. Bluvstein', 'S. J. Evered', 'M. D. Lukin'],
        publishedDate: '2023-12-06',
        year: 2023,
        url: 'https://www.nature.com/articles/s41586-023-06927-3',
        doi: '10.1038/s41586-023-06927-3',
        source: 'OpenAlex',
        venue: 'Nature 626, 58–65',
        citations: 412,
        abstract: 'Demonstration of fault-tolerant quantum algorithms using dynamically reconfigurable neutral atoms with coherent shuttling and 48 logical qubits.',
        type: 'journal',
        relevanceScore: 0.95,
        sentimentScore: 0.72,
        entities: ['Mikhail Lukin', 'Harvard University', 'Neutral Atom Arrays'],
        isOpenAccess: true
      },
      {
        id: 'src-103',
        title: 'Fault-tolerant quantum computation with surface codes',
        authors: ['Austin G. Fowler', 'Mariya Vyalyi', 'John M. Martinis'],
        publishedDate: '2012-10-01',
        year: 2012,
        url: 'https://journals.aps.org/pra/abstract/10.1103/PhysRevA.86.032324',
        doi: '10.1103/PhysRevA.86.032324',
        source: 'OpenAlex',
        venue: 'Physical Review A 86 (3)',
        citations: 2190,
        abstract: 'Foundational comprehensive guide outlining 2D surface code topology, lattice surgery, defect braiding, and realistic fault-tolerant threshold requirements.',
        type: 'journal',
        relevanceScore: 0.91,
        sentimentScore: 0.35,
        entities: ['Austin Fowler', 'Surface Code'],
        isOpenAccess: true
      },
      {
        id: 'src-104',
        title: 'Quantum Error Correction: Wikipedia Overview',
        authors: ['Wikipedia Academic Editors'],
        publishedDate: '2024-01-15',
        year: 2024,
        url: 'https://en.wikipedia.org/wiki/Quantum_error_correction',
        source: 'Wikipedia',
        venue: 'Wikipedia Commons',
        citations: 150,
        abstract: 'Comprehensive encyclopedic summary of quantum bit-flip, phase-flip, stabilizer formalisms, and fault-tolerant threshold theorems.',
        type: 'encyclopedia',
        relevanceScore: 0.88,
        sentimentScore: 0.1,
        entities: ['Peter Shor', 'Stabilizer Codes'],
        isOpenAccess: true
      }
    ],
    timeline: [
      { id: 't-1', year: 1995, title: 'Shor 9-Qubit Code Formulated', description: 'Peter Shor demonstrates that quantum states can be protected from both bit and phase flip errors.', category: 'Breakthrough', significance: 'high' },
      { id: 't-2', year: 1996, title: 'Steane 7-Qubit Code & Stabilizers', description: 'Andrew Steane and Daniel Gottesman develop stabilizer formalisms mapping QEC to classical codes.', category: 'Methodology', significance: 'high' },
      { id: 't-3', year: 2002, title: 'Surface Code Topology Proposed', description: 'Alexei Kitaev and Bravyi define toric and planar surface codes requiring only planar 2D coupling.', category: 'Publication', significance: 'high' },
      { id: 't-4', year: 2021, title: 'Real-time Repetition Code Synergies', description: 'Quantum computing labs demonstrate sub-threshold physical error suppression in 1D chains.', category: 'Methodology', significance: 'medium' },
      { id: 't-5', year: 2023, title: 'Below-Threshold Distance Scaling', description: 'Google and Harvard verify that increasing distance from d=3 to d=5 suppresses logical error rates.', category: 'Breakthrough', significance: 'high' },
      { id: 't-6', year: 2024, title: 'Logical Entanglement with Neutral Atoms', description: 'High-fidelity two-qubit transversal gates executed across dozens of entangled logical qubits.', category: 'Publication', significance: 'high' }
    ],
    graph: {
      nodes: [
        { id: 'n-qec', label: 'Quantum Error Correction', type: 'topic', size: 36, metadata: { category: 'Core Field' } },
        { id: 'n-sc', label: 'Surface Codes', type: 'concept', size: 28, metadata: { category: 'Architecture' } },
        { id: 'n-google', label: 'Google Quantum AI', type: 'organization', size: 24, metadata: { category: 'Industry' } },
        { id: 'n-harvard', label: 'Harvard University', type: 'organization', size: 24, metadata: { category: 'Academia' } },
        { id: 'n-lukin', label: 'Mikhail Lukin', type: 'person', size: 22, metadata: { category: 'PI' } },
        { id: 'n-shor', label: 'Peter Shor', type: 'person', size: 22, metadata: { category: 'Founder' } },
        { id: 'n-transmon', label: 'Superconducting Transmons', type: 'concept', size: 20, metadata: { category: 'Qubit Modality' } },
        { id: 'n-neutral', label: 'Neutral Atom Arrays', type: 'concept', size: 22, metadata: { category: 'Qubit Modality' } },
        { id: 'n-paper1', label: 'Nature 2023 Code Scaling', type: 'paper', size: 18, metadata: { year: 2023 } },
        { id: 'n-paper2', label: 'Harvard 2023 Logical Arrays', type: 'paper', size: 18, metadata: { year: 2023 } }
      ],
      edges: [
        { id: 'e-1', source: 'n-qec', target: 'n-sc', label: 'primary strategy', weight: 4 },
        { id: 'e-2', source: 'n-sc', target: 'n-google', label: 'implemented on transmons', weight: 3 },
        { id: 'e-3', source: 'n-qec', target: 'n-shor', label: 'originated by', weight: 3 },
        { id: 'e-4', source: 'n-harvard', target: 'n-lukin', label: 'affiliated with', weight: 4 },
        { id: 'e-5', source: 'n-harvard', target: 'n-neutral', label: 'developed', weight: 4 },
        { id: 'e-6', source: 'n-google', target: 'n-paper1', label: 'published', weight: 3 },
        { id: 'e-7', source: 'n-lukin', target: 'n-paper2', label: 'authored', weight: 3 },
        { id: 'e-8', source: 'n-neutral', target: 'n-qec', label: 'experimental platform', weight: 2 },
        { id: 'e-9', source: 'n-transmon', target: 'n-google', label: 'hardware platform', weight: 2 }
      ]
    },
    sentiment: {
      score: 0.62,
      label: 'positive',
      subjectivity: 0.35,
      tone: 'Highly Optimistic / Rapid Empirical Validation'
    },
    metrics: {
      totalPapersFound: 1420,
      averageCitations: 184,
      topYear: 2023,
      openAccessPercentage: 86
    }
  }
};

export const INITIAL_INVESTIGATIONS: Investigation[] = [
  {
    id: 'inv-1',
    title: 'Fault-Tolerant Quantum Computing Milestones (2020-2026)',
    description: 'Systematic mapping of logical qubit scaling, transversal gate fidelity, and cryogenic decoding requirements.',
    topic: 'Quantum Error Correction',
    tags: ['Quantum Computing', 'Physics', 'QEC', 'Hardware'],
    status: 'active',
    createdAt: '2026-08-14T09:30:00Z',
    updatedAt: '2026-09-01T15:20:00Z',
    notes: `### Executive Summary
Recent experimental results confirm the theoretical threshold theorem across both superconducting transmons (Google Sycamore) and neutral atom shuttling arrays (Harvard / QuEra).

#### Key Observations
1. **Distance 5 vs Distance 3**: Error suppression per round matches topological predictions ($P_L \\propto (P_{phys}/P_{th})^{(d+1)/2}$).
2. **Decoding Bottleneck**: Real-time minimum-weight perfect matching (MWPM) decoders must complete within the ~1µs transmon coherence window. FPGA and ASIC implementations are showing promise.
3. **Open Access Prevalence**: Over 85% of foundational literature is accessible on arXiv and open repositories.`,
    savedSources: [
      SAMPLE_RESEARCH_RESULTS['Quantum Error Correction'].sources[0],
      SAMPLE_RESEARCH_RESULTS['Quantum Error Correction'].sources[1]
    ],
    savedFindings: [
      {
        id: 'fnd-1',
        title: 'Logical Qubit Error Rate Inversion Confirmed',
        content: 'Increasing surface code size from distance-3 to distance-5 reduced logical error rates for the first time in superconducting circuits.',
        type: 'insight',
        sourceTitle: 'Suppressing quantum errors by scaling a quantum error-correcting code',
        createdAt: '2026-08-20T11:15:00Z'
      },
      {
        id: 'fnd-2',
        title: 'Decoder Latency Trade-off in Cryogenic Stages',
        content: 'Is syndrome data streaming via optical fiber or co-located cryo-CMOS better for reducing thermal heat loads while preserving 200ns decoding budgets?',
        type: 'question',
        createdAt: '2026-08-22T14:40:00Z'
      }
    ],
    timelineItems: SAMPLE_RESEARCH_RESULTS['Quantum Error Correction'].timeline
  },
  {
    id: 'inv-2',
    title: 'Solid-State Battery Electrolyte Interface Stability',
    description: 'Investigating lithium dendrite prevention across sulfide and polymer-ceramic composite separators.',
    topic: 'Solid-State Electrolytes',
    tags: ['Materials Science', 'Energy Storage', 'Electrochemistry'],
    status: 'active',
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-08-30T16:45:00Z',
    notes: `Focusing on interfacial impedance at the Li-metal anode and chemical mechanical stress during high C-rate cycling.`,
    savedSources: [],
    savedFindings: [
      {
        id: 'fnd-3',
        title: 'Critical Current Density Ceiling',
        content: 'Void formation during high-rate stripping triggers localized current hot-spots, accelerating dendrite short-circuits.',
        type: 'fact',
        createdAt: '2026-08-29T09:20:00Z'
      }
    ],
    timelineItems: []
  }
];
