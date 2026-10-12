# CIVIC26 - Frontend (Client)

This is the frontend client for the **CIVIC26** Computer-Based Test (CBT) platform. It is built to be fast, responsive, and cheat-resistant, providing an excellent experience for both test participants and administrators.

## Technologies Used
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Excel Export:** SheetJS (xlsx)

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

## Setup Instructions

1. **Install Dependencies**
   Navigate to the `client` directory and install the required packages:
   ```bash
   cd client
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the `client` directory. You will need to define your API endpoint.
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. **Run the Development Server**
   Start the Vite development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## Build for Production
To create a production-ready build, run:
```bash
npm run build
```
This will compile TypeScript and bundle the application into the `dist` folder.

For full instructions on serving the built application with NGINX, reverse proxying the backend API, and configuring SSL/HTTPS, see [NGINX_SETUP.md](./NGINX_SETUP.md).

## Key Features
- **Admin Dashboard:** Manage quizzes, questions, accounts, and view detailed participant analytics (with Excel export).
- **Participant Flow:** Secure login, pre-test tutorials, timed test sessions with anti-cheat measures (e.g., tracking tab-switching), and dynamic question/option shuffling.
- **Cheatsheet Integration:** Built-in support for displaying reference materials directly within the test session.
