# ResuMatch Frontend

A modern, responsive React frontend for **ResuMatch** — an AI-powered resume-to-job-description matching platform.

🔗 **Live:** [resumatch-frontend-two.vercel.app](https://resumatch-frontend-two.vercel.app)

Part of the ResuMatch platform (see [resumatch-backend](https://github.com/NilakshiGupta/resumatch-backend) for the Spring Boot API).

## What it does

ResuMatch Frontend gives users an end-to-end interface to:

1. **Upload a resume** (PDF) and get real-time parsing feedback
2. **Paste a job description** and trigger AI-powered match scoring
3. **View visual analytics** — match percentage, keyword gaps, and score breakdowns via interactive charts
4. **Export results** — download a tailored resume or match report as a formatted PDF or Word document
5. **Track history** — revisit past match results across sessions

The UI walks users through a clear flow: **upload → analysis → results → history**, backed by JWT-secured calls to the ResuMatch backend.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 (Vite) |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Data Visualization | Recharts |
| Document Export | docx (Word), jsPDF (PDF), file-saver |
| Linting | ESLint |
| Deployment | Vercel |

## Key Features

- 📤 Resume upload interface with real-time parsing feedback
- 🎯 Job description input with AI-powered match scoring dashboard
- 📊 Visual analytics (charts/graphs) for match percentage and keyword gaps via Recharts
- 📥 Downloadable, formatted output — export as PDF (jsPDF) or Word (docx)
- 📱 Responsive, utility-first UI built with Tailwind CSS
- 🧭 Client-side routing for a multi-page flow (upload → analysis → results → history)
- 🔐 Axios-based integration with the Spring Boot backend, using JWT-secured API calls

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- [ResuMatch backend](https://github.com/NilakshiGupta/resumatch-backend) running locally or deployed

### Installation

```bash
# Clone the repository
git clone https://github.com/NilakshiGupta/resumatch-frontend.git
cd resumatch-frontend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file with your backend API URL, e.g.:
# VITE_API_BASE_URL=http://localhost:8080

# Run the development server
npm run dev
```

### Build for production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
resumatch-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/           # Route-level pages (Upload, Analysis, Results, History)
│   ├── services/         # Axios API integration
│   ├── hooks/            # Custom React hooks
│   └── App.jsx
├── public/
├── vite.config.js
└── package.json
```

> Update this structure to match your actual folder layout if it differs.

## Related Repositories

- [resumatch-backend](https://github.com/NilakshiGupta/resumatch-backend) — Spring Boot API powering resume parsing and AI matching

## Author

**Nilakshi Gupta** — [GitHub](https://github.com/NilakshiGupta)
