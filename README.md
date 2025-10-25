# Cherch

Cherch is a Vite + React + TypeScript web application scaffolded for a church/community site. It includes pages for events, trips, donations, confession bookings, admin dashboard components, and integration services (Firebase, Cloudinary, payments, etc.).

## Key features

- Vite + React + TypeScript front-end
- Tailwind CSS for styling
- Firebase integration (auth, firestore) (service file: `src/services/firebase.ts`)
- Image uploads via Cloudinary (`src/services/cloudinaryService.ts` / `src/services/imageUploadService.ts`)
- Admin dashboard components and protected routes
- Multiple pages: Events, Donations, Trips, Meetings, Read Bible, Confessions, Contact

## Tech stack

- TypeScript
- React (functional components + hooks)
- Vite
- Tailwind CSS
- Firebase (Auth / Firestore)
- Cloudinary (images)

## Project structure (important files)

- `src/` — application source
	- `components/` — reusable UI components and admin components
	- `pages/` — top-level routes/pages
	- `services/` — API/service wrappers (firebase, trips, donations, uploads, etc.)
	- `contexts/` — React contexts (Auth, Theme, Language)
- `public/` — static assets
- `vite.config.ts`, `tsconfig.json`, `package.json` — workspace config

## Local setup

Requirements: Node.js 16+ (or the version used in the project), npm or pnpm.

1. Install dependencies

```powershell
npm install
```

2. Add environment variables

This project uses Vite env variables. Create a `.env.local` (or `.env`) in the repo root and add any provider keys required by your services. Common variables used by projects like this (adapt names to the app/service files):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

Do not commit secrets. Add `.env.local` to `.gitignore`.

3. Run dev server

```powershell
npm run dev
```

4. Build for production

```powershell
npm run build
npm run preview
```

## Deployment

This repository includes a `vercel.json` and is ready to deploy to Vercel. Link the Git repository in Vercel, provide the environment variables in Vercel settings, and deploy.

## Notes and assumptions

- The codebase contains Firebase service wrappers — configure Firebase credentials in env vars before using auth/firestore features.
- Cloudinary and payment provider keys must be configured separately.

## Contributing

1. Fork and branch from `main`.
2. Open a PR with a clear description and add relevant reviewers.

## Next steps / improvements

- Add badges (build, coverage, license).
- Add a CONTRIBUTING.md with local lint/test instructions.
- Add unit/integration tests and a CI pipeline (GitHub Actions / Vercel).

