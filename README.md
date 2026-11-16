# Fishpond Guardian

Fishpond Guardian is an open-source smart aquaculture and water-quality telemetry
dashboard built with React, TypeScript, Vite, and Supabase. It helps fish farmers,
IoT makers, and students monitor pond conditions through an Indonesian-language
interface with metric cards, status indicators, and historical charts.

The dashboard displays temperature, pH, and water level, with live updates from
Supabase Realtime. The database schema also supports dissolved oxygen, salinity,
turbidity, and ammonia. ESP32/Arduino ingestion and MQTT bridges are integration
work for contributors; device firmware is not included in this repository.

## Local setup

Requirements: Node.js 24 LTS, npm, and a Supabase project.

```sh
git clone https://github.com/dennisrdty/fishpond-guardian.git
cd fishpond-guardian
npm install
```

Copy `.env.example` to `.env` using your editor, or run:

```sh
# macOS / Linux
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

Fill in all three placeholders with your Supabase project settings:

- `VITE_SUPABASE_PROJECT_ID`: your project reference ID.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: your project's publishable (or legacy anon) key.
- `VITE_SUPABASE_URL`: your project's API URL.

Vite exposes `VITE_*` values to the browser. Use a public client key here; never
use a Supabase service-role key. Local `.env` files are ignored by Git.

For a new Supabase project, apply the SQL files in [`supabase/migrations`](supabase/migrations)
in filename order through the Supabase SQL Editor. They create `public.sensor_data`
and enable Realtime updates. The included policies allow public reads and inserts;
review those permissions for your deployment. Connect your sensor ingestion
service to this table to populate the dashboard.

```sh
npm run dev
```

Open `http://localhost:8080`. Restart the development server after changing `.env`.

## Development checks

```sh
npm test             # Run unit tests once
npm run test:watch   # Run tests while editing
npm run lint        # Check code style
npm run build       # Build the production app
```

Component tests use Vitest, React Testing Library, and jsdom. They run locally
without Supabase credentials or a network connection to the database.

## Contributing

Maintained by [Dennis Raditya](https://github.com/dennisrdty).
Bug reports, tests, documentation, and hardware integration examples are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow.

## MIT License

Copyright (c) 2026 Dennis Raditya. Distributed under the [MIT License](LICENSE).
