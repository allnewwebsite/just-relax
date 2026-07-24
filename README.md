# Just Relax

Production-oriented retail invoice management built with React 19, Express, Firebase Authentication, and Firestore.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and add the Firebase web and Admin SDK credentials.
3. In Firebase Authentication, enable Email/Password and create the permitted users.
4. Create a Firestore database. The included `firestore.rules` documents the intended owner-only access model.
5. Start both applications with `npm run dev`.

The client runs at `http://localhost:5173` and the API at `http://localhost:4000`.

## Deployment

- Build the Vite frontend with `npm run build` and deploy `dist` to Vercel.
- Deploy the repository to Render with `npm start`, adding the server Firebase variables and `CLIENT_URL`.
- Set `VITE_API_URL` to the Render API URL before the Vercel build.

No data is prefilled. Firebase users must be provisioned by an administrator.
