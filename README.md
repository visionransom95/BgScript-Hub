# BG Script Hub

A modern, community-driven platform for developers to upload, share, and discover code snippets across various programming languages.

## Features

- **Google Authentication**: Secure sign-in using your Google account via Firebase.
- **Snippet Management**: Upload code snippets with titles and language selection. You can also upload directly from local files.
- **Syntax Highlighting**: Beautifully formatted code preview using `react-syntax-highlighter`.
- **Search & Filter**: Instantly search for snippets by title, language, or author name.
- **Advanced Sorting**: Sort community snippets by creation date, title, or language in both ascending and descending orders.
- **Secure Data Management**: Backend protected by robust Firestore security rules, ensuring users can only delete their own snippets while keeping the community hub openly readable.
- **Responsive UI**: A fully responsive, modern design built with Tailwind CSS, ensuring a great experience on both desktop and mobile.

## Tech Stack

- **Frontend**: React (v19), TypeScript, Vite, React Router DOM
- **Styling**: Tailwind CSS (v4)
- **Backend/Database**: Firebase (Auth & Firestore)
- **Icons**: Lucide React
- **Utilities**: `date-fns` for relative time formatting

## Getting Started

In Google AI Studio, this application is automatically configured to run in the provided Cloud Run environment. If developing locally:

1. Clone or download the repository.
2. Ensure you have the `firebase-applet-config.json` set up pointing to your activated Firebase project.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Community

Join our ongoing discussion and suggest features in our discord community channel (linked in the Contact page).
