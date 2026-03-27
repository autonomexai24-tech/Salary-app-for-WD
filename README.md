# Salary App

A modern salary management application built with **Next.js 16**, **React 19**, **TailwindCSS 4**, and **shadcn/ui** components.

## Features

- **Employee Management** — Register, view, and manage employees
- **Department Management** — Organize departments
- **Salary Management** — Track and manage salary records

## Tech Stack

| Technology | Version |
|---|---|
| Next.js | 16.2 |
| React | 19.2 |
| TailwindCSS | 4.2 |
| TypeScript | 5.7 |
| shadcn/ui | New York style |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Root redirect to /employee
│   ├── employee/           # Employee management page
│   ├── department/         # Department management page
│   ├── salary/             # Salary management page
│   └── home/               # Home/dashboard page
├── components/
│   ├── ui/                 # shadcn/ui components (57 components)
│   ├── layout/             # Layout components (Sidebar, PageContainer)
│   └── employee/           # Employee-specific components & forms
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
└── public/                 # Static assets
```

## License

Private
