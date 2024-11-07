# Baseball Draft Board

A web application for managing baseball league drafts and player rosters.

## Project Structure
```

baseball-draft-board/
├── src/
│   ├── apis/
│   │   ├── leagues.py
│   │   └── players.py
│   ├── pages/
│   │   ├── App.tsx
│   │   ├── CreateLeague.tsx
│   │   └── Players.tsx
│   └── components/
│       ├── Calendar.tsx
│       ├── Toast.tsx
│       ├── Toaster.tsx
│       ├── UseToast.tsx
│       └── Util.tsx
└── README.md

```

## Features

- Create and manage leagues with multiple age groups
- Upload and manage player rosters via CSV
- Automatic player age validation
- Modern, responsive UI with dark mode support
- Clear and intuitive player management interface

## Tech Stack

- Frontend:
  - React with TypeScript
  - shadcn/ui components
  - Tailwind CSS for styling
  - react-hook-form for form handling
  - date-fns for date manipulation
  - Recharts for data visualization

- Backend:
  - FastAPI for API endpoints
  - Pydantic for data validation
  - Pandas for CSV processing
  - Databutton for storage and deployment

## Getting Started

1. Clone this repository
2. Install dependencies
3. Set up your environment variables
4. Run the development server

## API Endpoints

### Leagues API
- `POST /create-league`: Create a new league with age groups

### Players API
- `POST /upload-players`: Upload players from CSV file
- `GET /players`: Get all players
- `POST /players/clear`: Clear all players from the database
