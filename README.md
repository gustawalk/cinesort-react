# CineSort

CineSort is a full-stack web application designed for movie enthusiasts to search for films, create personalized lists, and track their watched history.

## Features

-   **User Authentication:** Secure user registration and login system using JWT.
-   **Movie Search:** Powerful search functionality to discover movies.
-   **Movie Details:** View comprehensive details for any movie.
-   **Personalized Lists:** Create, edit, and manage custom movie lists.
-   **Watched History:** Keep a record of all the movies you've watched.

## Tech Stack

**Frontend:**
-   **Framework:** React
-   **Build Tool:** Vite
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **Routing:** React Router

**Backend:**
-   **Framework:** Express.js
-   **Language:** TypeScript
-   **Database:** MySQL
-   **Caching:** Redis
-   **Authentication:** JSON Web Tokens (JWT)

## Project Structure

The project is a monorepo with two main directories:

-   `frontend/`: Contains the React frontend application.
-   `backend/`: Contains the Express.js backend API.

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or later)
-   [pnpm](https://pnpm.io/)
-   [MySQL](https://www.mysql.com/)
-   [Redis](https://redis.io/)

## Getting Started

Follow these steps to get your development environment set up and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd cinesort-react
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pnpm install

# Create the environment file from the example
cp .env-example .env
```

Next, open the newly created `.env` file and fill in the required environment variables:

```env
# MySQL Database credentials
HOST=your_db_host
PASSWORD=your_db_password
USERDB=your_db_user
DATABASE=your_db_name
PORT=your_db_port

# App and security
SESSION_KEY=your_secret_session_key
JWT_SECRET=your_super_secret_jwt_key
REDIS_PASSWORD=your_redis_password
FRONTEND_URL=http://localhost:5173 # Or your frontend port
```

### 3. Frontend Setup

```bash
# Navigate to the frontend directory from the root
cd frontend

# Install dependencies
pnpm install

# Create the environment file from the example
cp .env-example .env
```

Next, open the newly created `.env` file and specify the URL of your backend API:

```env
VITE_API_URL=http://localhost:3000 # Or your backend port
```

## Running the Application

You will need to run both the backend and frontend servers simultaneously in separate terminal windows.

**Run the Backend Server:**
```bash
# In the /backend directory
pnpm run dev
```
The backend server will start, typically on port 3000.

**Run the Frontend Server:**
```bash
# In the /frontend directory
pnpm run dev
```
The frontend development server will start, typically on port 5173. You can now access the application at `http://localhost:5173`.
