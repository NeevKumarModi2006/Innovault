# Innovault

Innovault is a secure, high-performance platform for managing innovation projects and sensitive documents.

## Project Structure

*   `innovault/frontend`: React + Vite application (User Interface)
*   `innovault/backend`: Node.js + Express application (API & Database)

## Setup Instructions

Since this project was generated without direct access to `npm` or `git`, please follow these steps to get started:

### 1. Install Dependencies

Please refer to the `dependencies.md` file in the `innovault` directory for a complete list of commands to run.

**Quick Summary:**

*   **Frontend:**
    ```bash
    cd innovault/frontend
    npm install
    # Install required packages (see dependencies.md)
    npm run dev
    ```

*   **Backend:**
    ```bash
    cd innovault/backend
    npm install
    # Install required packages (see dependencies.md)
    npm start
    ```

### 2. Environment Variables

Create `.env` files in both `frontend` and `backend` directories based on the provided `.env.example` files.

### 3. Git Initialization

To push this project to GitHub, simply run the `setup_git.bat` script located in the `innovault` directory.

```bash
cd innovault
./setup_git.bat
```

## Features

*   **Secure Authentication**: JWT-based login and registration.
*   **Project Management**: Create, view, and organize projects.
*   **Modern UI**: Dark-themed, responsive interface using Tailwind CSS.
