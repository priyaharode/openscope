# OpenScope 🌿

> **Open-Source Research Intelligence Dashboard**  
> Explore scientific literature, entities, sentiment, timelines, and interactive knowledge graphs in one unified, publication-grade interface.

---

## 🔬 Overview

**OpenScope** is a modern, open-source research intelligence dashboard engineered for researchers, scientists, and analysts. Rather than navigating fragmented academic portals and paywalled indices, OpenScope connects open scientific repositories (**OpenAlex**, **Wikipedia REST API**, and local open-source NLP pipelines) to synthesize:

- **Entity & Concept Extraction:** People, institutions, methods, and topics mapped automatically from literature abstracts.
- **Interactive Knowledge Graphs:** Real-time relationship networks rendered with Cytoscape.js, with physics layout simulation and node filtering.
- **Sentiment & Discourse Analysis:** Quantifies optimistic vs. cautious academic sentiment and subjectivity scores across papers.
- **Chronological Breakthrough Timelines:** Traces theoretical origins to modern experimental milestones.
- **Source & Manuscript Analyzer:** Extracts reading ease (Flesch-Kincaid), entities, and takeaways from any public URL or manuscript text.
- **Investigation Workspaces:** Multi-project research workspace with Markdown notes, structured hypotheses logger, and BibTeX/Markdown export.

---

## 🎨 Visual Identity & Design System

OpenScope uses an **editorial sage-green aesthetic** inspired by Linear and Notion, designed for deep focus during literature reviews:

- **Sage Green (`#42643A` / `#354E2F`):** Anchors primary actions and focus states.
- **Soft Mint (`#E6EDE4` / `#D0DEC9`):** Subtle accents, chips, and active tabs.
- **Off-White Parchment (`#FBFBF9` / `#F9FAF7`):** Eye-safe neutral backdrop replacing stark white or dark cyberpunk palettes.
- **Muted Forest (`#1C241D` / `#2C3E28`):** High-contrast typography exceeding WCAG AA standards.
- **Typography:** Display serif accents paired with Plus Jakarta Sans and JetBrains Mono for metadata and citations.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│               OpenScope React / Next UI               │
│  (Tailwind CSS, Cytoscape.js, Framer Motion, Lucide)   │
└───────────────────────────┬────────────────────────────┘
                            │ /api/*
┌───────────────────────────▼────────────────────────────┐
│              OpenScope Node / Express Engine           │
│  - Query Federation & Rate Limiting                     │
│  - Flesch-Kincaid & Reading Ease Calculator            │
│  - TF-IDF Stop-Word Filter & Entity Heuristics         │
│  - Co-Occurrence Matrix to Cytoscape Graph             │
└──────────────┬─────────────────────────┬───────────────┘
               │                         │
┌──────────────▼──────────┐   ┌──────────▼───────────────┐
│      OpenAlex API       │   │    Wikipedia REST API    │
│  (250M+ Works & Papers) │   │   (Summaries & Concepts) │
└─────────────────────────┘   └──────────────────────────┘
```

---

## 🚀 Quickstart

### Prerequisites

- **Node.js:** v18+ or v20+
- **npm:** v9+

### 1. Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/openscope/openscope.git
cd openscope
npm install
```

Configure your environment:

```bash
cp .env.example .env
```

Start the development server with live reload:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🐳 Docker Deployment

OpenScope includes a multi-stage Dockerfile and Docker Compose configuration.

To run the complete stack (OpenScope Dashboard + PostgreSQL database + Chroma vector storage):

```bash
docker compose up -d --build
```

The application will be accessible at `http://localhost:3000`.

To stop the containers:

```bash
docker compose down
```

---

## 📡 API Reference

### 1. Topic Intelligence Search
```http
GET /api/search?q={topic}
```
**Parameters:**
- `q` (string, required): The scientific topic, paper title, or author name.

**Response:**
Returns `TopicResearchResult` containing overview text, bullet takeaways, TF-IDF keywords, extracted entities, literature list with citations and DOIs, timeline milestones, and Cytoscape graph nodes and edges.

---

### 2. Source & URL Analyzer
```http
POST /api/analyze-source
Content-Type: application/json

{
  "url": "https://nature.com/articles/...",
  "rawText": "Optional direct manuscript text"
}
```
**Response:**
Returns `SourceAnalysisResult` with Flesch-Kincaid grade level, reading ease score, reading duration, sentiment tone, extracted entities, and synthesized executive summary.

---

### 3. Investigations Workspace CRUD
- `GET /api/investigations` — List all active research investigations.
- `POST /api/investigations` — Create a new investigation project.
- `PUT /api/investigations/:id` — Update notes, tags, or findings.
- `DELETE /api/investigations/:id` — Delete an investigation.
- `POST /api/investigations/:id/sources` — Pin a research paper to an investigation.

---

## 📦 Production Build

To build the self-contained production bundle:

```bash
npm run build
```

This compiles:
1. The optimized React client assets into `dist/`
2. The TypeScript backend into a bundled CommonJS artifact (`dist/server.cjs`)

To launch in production:

```bash
npm run start
```

---

## 📄 License & Attribution

- Built with open-source data from [OpenAlex](https://openalex.org) and [Wikipedia](https://en.wikipedia.org).
- Interactive graph visualizations powered by [Cytoscape.js](https://js.cytoscape.org/).
- Distributed under the [MIT License](LICENSE).
