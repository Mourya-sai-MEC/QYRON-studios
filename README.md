# QYRON STUDIO

Next.js 14 · TypeScript · Tailwind · GSAP + ScrollTrigger · Framer Motion · Firebase (Auth, Firestore, Storage)

## Run locally
    npm install
    cp .env.local.example .env.local   # then fill in values
    npm run dev                        # http://localhost:3000  (admin: /admin)

Without Firebase values the public site shows sample projects and /admin shows a setup notice.

## Firebase setup (one time)
1. console.firebase.google.com > Add project.
2. Project settings > Your apps > Web app (</>). Copy the config values into `.env.local`.
3. Build > Authentication > Get started > enable **Email/Password**. Then Users > Add user:
   email = the address you put in `NEXT_PUBLIC_ADMIN_EMAIL`, password = your **admin passcode**
   (use 12+ characters; Firebase requires at least 6). Optionally disable sign-ups in Authentication > Settings > User actions.
4. Build > Firestore Database > Create (production mode). Open Rules, paste `firestore.rules`, Publish.
5. Build > Storage > Get started. Open Rules, paste `storage.rules`, Publish.
6. In BOTH rules files replace `admin@qyron.studio` with your admin email exactly as in step 3.
7. Authentication > Settings > Authorized domains: add your production domain.
8. Storage CORS is not needed for displaying images.

## How it works
- /admin shows only a passcode field. The passcode is checked by Firebase Auth against the single admin account; nothing secret is in the code.
- Public site reads only `status == "published"` projects. Publish/unpublish, feature, reorder (arrows), edit, delete and image changes in /admin appear on the site after refresh, on any device.
- Contact form saves to Firestore `messages` (read in /admin > Inbox). Rules restrict size and shape.
- Firebase web config values are public by design; security comes from the rules above.

## Deploy
Vercel: import the repo, add the same env vars, deploy.

## Edit content
Socials, contact email, services and process steps: `src/lib/data.ts`.
