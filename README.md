# Peyechi (পেয়েছি) — Bangladesh's Community Lost & Found Platform

Peyechi is a modern, bilingual (English & বাংলা) platform designed to reconnect citizens across all 64 districts in Bangladesh with lost national identity cards (NID), gadgets, wallets, documents, and valuable belongings.

Built with **React, TypeScript, Vite, Tailwind CSS, Firebase Authentication, Cloud Firestore, Firebase Storage**, and ready for 1-click deployment on **Netlify**.

---

## Architecture & Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS.
- **Hosting**: Netlify (Static SPA with automatic route redirects).
- **Authentication**: Firebase Authentication (Email/Password, Session management, Role verification).
- **Database**: Cloud Firestore (NoSQL Document Store with real-time listeners and role-based security rules).
- **Storage**: Firebase Storage (Secure image uploads with <= 2MB size enforcement).
- **Backend / Serverless**: Pure client-side SPA communicating directly with Firebase SDK (Zero persistent Express server required in production, 100% free-tier compatible).

---

## Step-by-Step Setup Guide (Beginner Friendly)

### 1. How to Create a Firebase Project
1. Open your browser and navigate to the **[Firebase Console](https://console.firebase.google.com/)**.
2. Sign in with your Google Account.
3. Click **Add project** (or **Create a project**).
4. Enter a project name, e.g., `peyechi-bangladesh`.
5. You can disable Google Analytics to keep things simple and within free quotas, then click **Create project**.
6. Wait for the setup to finish, then click **Continue**.

---

### 2. How to Enable Firebase Authentication
1. In the left navigation menu of the Firebase Console, click **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Enable the first toggle (**Email/Password**) and click **Save**.
5. *(Optional)* Under the **Users** tab, you can manually click **Add user** to create your initial administrator email and password (e.g., `admin@peyechi.bd`).

---

### 3. How to Create the Firestore Database
1. In the left menu under **Build**, click **Firestore Database**.
2. Click **Create database**.
3. Choose your database location:
   - For Bangladesh users, `asia-southeast1` (Singapore) or `asia-south1` (Mumbai) offers low latency.
4. Select **Start in production mode** (our `firestore.rules` will secure it) and click **Create**.

---

### 4. How to Configure Firebase Storage
1. In the left menu under **Build**, click **Storage**.
2. Click **Get Started**.
3. Choose **Start in production mode** and select the same regional location as your Firestore database.
4. Click **Done**.

---

### 5. How to Deploy Security Rules

This project includes production-hardened `firestore.rules` and `storage.rules`:

#### Applying Firestore Rules:
1. In the Firebase Console, navigate to **Firestore Database** > **Rules** tab.
2. Open the file `firestore.rules` from this repository.
3. Copy the entire contents and paste it into the Firebase rules editor.
4. Click **Publish**.

#### Applying Storage Rules:
1. In the Firebase Console, navigate to **Storage** > **Rules** tab.
2. Open the file `storage.rules` from this repository.
3. Copy the entire contents and paste it into the Storage rules editor.
4. Click **Publish**.

---

### 6. How to Initialize the First Administrator Safely

To ensure security, the platform prevents unauthorized users from promoting themselves to Admin:

1. In the `.env` file (or Netlify Environment Variables), set:
   ```env
   VITE_INITIAL_ADMIN_EMAIL="admin@peyechi.bd"
   ```
2. When the user registers or logs in with this email, they will automatically be recognized and granted the `ADMIN` role in the `users` collection.
3. Alternatively, in the Firebase Console:
   - Go to **Firestore Database** > **Data**.
   - Navigate to the `users` collection.
   - Click on your user document (matching your Auth UID) and set the `role` field to `ADMIN` (uppercase).
4. Once logged in as Admin, you can promote other users to `MODERATOR` or `ADMIN` directly from the **Admin Dashboard > Users** tab.

---

### 7. How to Connect the Repository to Netlify
1. Log in to your **[Netlify Dashboard](https://app.netlify.com/)**.
2. Click **Add new site** > **Import an existing project**.
3. Connect your GitHub account and select your `peyechi` repository.
4. Netlify will automatically detect the settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. The included `netlify.toml` automatically configures single-page application URL rewrites so refreshing pages like `/explore` or `/admin` will not return a 404.

---

### 8. Which Environment Variables to Configure

In your Firebase Console:
1. Click the gear icon ⚙️ next to **Project Overview** in the top left > **Project settings**.
2. Under the **General** tab, scroll down to **Your apps**.
3. Click the Web icon `</>` to register a web app (name it `Peyechi Web`).
4. Firebase will display your `firebaseConfig` keys.

In your **Netlify Dashboard**:
1. Go to **Site configuration** > **Environment variables** > **Add variable**.
2. Add the following keys (copying the exact values from Firebase):

| Environment Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Your Firebase Web API Key (`AIza...`) |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project-id.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project-id.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your numeric Sender ID |
| `VITE_FIREBASE_APP_ID` | Your Web App ID (`1:...:web:...`) |
| `VITE_INITIAL_ADMIN_EMAIL` | `admin@peyechi.bd` (or your personal admin email) |

---

### 9. How to Deploy the Website
1. After setting the environment variables in Netlify, click **Deploys** > **Trigger deploy** > **Deploy site**.
2. Netlify will execute `npm run build` and publish your site in approximately 1 minute.
3. Your site will be live at `https://your-site-name.netlify.app`.

---

### 10. How to Log In to the Admin Panel
1. Click **Sign In** in the top navigation bar.
2. Enter your administrator email (e.g., `admin@peyechi.bd`) and password.
3. Once authenticated, click your profile avatar in the navigation bar and select **Admin Console** (or navigate directly to the Admin tab).
4. You now have access to all 9 management sections:
   - **Overview**: Real-time KPIs, pending approvals, and activity feed.
   - **Posts**: Search, filter, approve, reject with reason, edit, and bulk delete.
   - **Users**: Search users, suspend/reactivate accounts, and assign roles.
   - **Claims**: Inspect ownership verification proofs and approve/reject claims.
   - **Reports**: Review flagged scam/fraud posts and take action.
   - **Site Settings**: Toggle post approval requirements, maintenance mode, and upload limits.
   - **Audit Log**: Immutable audit trail of every moderation operation.
   - **Database & Purge Tools**: JSON export backups and whole-database purge tools.

---

### 11. How to Export Backups and Safely Delete Content

#### Creating a Complete Backup:
1. Navigate to **Admin Console** > **Database & Purge Tools**.
2. Click **Export Complete Database Backup (.JSON)**.
3. A formatted `.json` file containing all posts, users, claims, reports, and settings will download immediately.

#### Deleting Individual Posts:
1. Go to **Posts**, find the item, and click the red trash icon.

#### Bulk Deleting Selected Posts:
1. Select the checkboxes next to the posts you want to remove.
2. Click **Delete Selected Posts**.
3. Type the exact phrase: `DELETE SELECTED POSTS` and confirm.

#### Whole-Database Purge (Danger Zone):
1. In **Database & Purge Tools**, click **Purge All Posts from Database**.
2. Type the exact phrase: `DELETE ALL POSTS` and confirm.

---

### 12. How to Verify That Posts Persist After Redeployment
1. Report a new test item (e.g., "Lost Wallet in Dhanmondi") and submit it.
2. In Netlify, trigger a new manual deploy or push a commit.
3. When the new build completes, refresh the website.
4. Because the data resides permanently in Cloud Firestore (not in local files or server memory), your listings and claims will persist indefinitely.

---

### 13. Troubleshooting Common Problems

- **Problem: "Missing or insufficient permissions" when writing to Firestore.**
  - *Cause*: Your user is not logged in, or your Firestore security rules have not been published.
  - *Fix*: Ensure `firestore.rules` is published in your Firebase Console under **Firestore Database** > **Rules**.
- **Problem: Image upload fails or says "Storage upload failed".**
  - *Cause*: Firebase Storage is not created or `storage.rules` is blocking the upload.
  - *Fix*: Go to Firebase Console > **Storage**, verify the bucket is created, and paste `storage.rules`.
- **Problem: 404 Not Found when reloading an inner page on Netlify.**
  - *Cause*: Missing redirect rule.
  - *Fix*: The repository includes `netlify.toml` with `[[redirects]] from = "/*" to = "/index.html" status = 200`. Verify this file is present in your repository root.

---

### 14. Usage Limits & Quotas (100% Free Tier)

This platform is strictly designed to remain within the **Firebase Spark (Free)** and **Netlify Starter (Free)** plans:

- **Cloud Firestore**:
  - 50,000 document reads per day (free).
  - 20,000 document writes per day (free).
  - 1 GB stored data (free).
- **Firebase Storage**:
  - 5 GB stored assets (free).
  - 1 GB download bandwidth per day (free).
  - Images are capped at 2MB per upload to conserve quota.
- **Firebase Authentication**:
  - Unlimited email/password users.
- **Netlify**:
  - 100 GB bandwidth / month (free).
  - 300 build minutes / month (free).

No credit card or paid billing is required.

---

## License

SPDX-License-Identifier: Apache-2.0. Built for the citizens of Bangladesh.
