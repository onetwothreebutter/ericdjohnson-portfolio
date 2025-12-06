# Eric Johnson Portfolio

Welcome to the repository for Eric Johnson's personal portfolio website. This project showcases my work, skills, and experience, built with a modern web development stack.

## 🚀 Tech Stack

This project is a monorepo containing both the frontend application and the backend content management system.

### Frontend (`/next-frontend`)
*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **UI Library**: [React 19](https://react.dev/)
*   **Animations**: [GSAP](https://gsap.com/)
*   **Icons**: React Icons

### Backend (`/backend`)
*   **CMS**: [Sanity.io](https://www.sanity.io/)
*   **Language**: TypeScript

## 📂 Project Structure

```
.
├── backend/          # Sanity Studio configuration and schemas
└── next-frontend/    # Next.js frontend application
```

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ericdjohnson/ericdjohnson-portfolio.git
    cd ericdjohnson-portfolio
    ```

2.  **Install dependencies for the Frontend:**

    ```bash
    cd next-frontend
    npm install
    # or
    yarn install
    ```

3.  **Install dependencies for the Backend:**

    ```bash
    cd ../backend
    npm install
    # or
    yarn install
    ```

### Environment Variables

Create a `.env.local` file in the `next-frontend` directory with the following variables (you will need to get these from your Sanity project dashboard):

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### Running Locally

**Frontend:**

```bash
cd next-frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Backend (Sanity Studio):**

```bash
cd backend
npm run dev
```
Open [http://localhost:3333](http://localhost:3333) to access the Sanity Studio.

## 🚀 Deployment

*   **Frontend**: Deployed on [Netlify](https://www.netlify.com/).
*   **Backend**: Sanity Studio is hosted by Sanity or can be deployed to any static host.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
