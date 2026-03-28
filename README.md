# Time Tracking App (MERN Stack)

A full-featured **Time Tracking Web Application** built using the MERN stack. This project helps teams manage projects, assign tasks, track working hours, and generate reports based on user roles.

---

## Features

* Authentication (JWT + Refresh Token)
* Email verification (OTP)
* Role-based access (Admin, Project Manager, Developer)
* Time tracking (Start/Stop timer)
* Reports with CSV export
* Billing system (based on hourly rate)
* Notifications
* Optional Google Login

---

## Tech Stack

**Frontend**

* React.js (Vite)
* Tailwind CSS
* Axios
* React Router

**Backend**

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

---

## Project Structure

```
time-tracking-app/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── tailwind.config.js
│
└── README.md
```

---

## Prerequisites

Make sure you have installed:

* Node.js (v18 or above)
* MongoDB (local or cloud)

---

## Backend Setup

```bash
cd backend
cp .env
```

Update `.env` file:

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
```

Install dependencies and seed data:

```bash
npm install
npm run seed
```

Start backend server:

```bash
npm run dev
```

Backend runs on:     http://localhost:5000

---

## Demo Accounts

| Email                 | Password    | Role            |
| --------------------- | ----------- | --------------- |
| [admin@example.com]   | Admin@123   | Admin           |
| [pm@example.com]      | Manager@123 | Project Manager |
| [ganesh@example.com]  | ganesh@123  | Developer       |

---

## Frontend Setup

```bash
cd frontend
npm install
```

(Optional) create `.env` file:

```
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start frontend:

```bash
npm run dev
```

Open:    http://localhost:5173

---

## API Connection (Development)

* Keep `VITE_API_URL` empty
* Vite automatically proxies `/api` requests to backend
* Make sure backend is running first

---

## Authentication Flow

1. User registers → receives OTP
2. Verifies email
3. Logs in → gets access & refresh token
4. Protected routes use middleware for validation

---

## Role-Based Access

* **Admin**

  * Manage users
  * View reports
  * Billing access

* **Project Manager**

  * Manage projects & modules
  * Assign tasks

* **Developer**

  * Work on tasks
  * Track time

---

## Time Tracking

* Start timer → creates log
* Stop timer → calculates duration
* Data stored for reports & billing

---

## Reports & Billing

* Generate reports using time logs
* Export reports as CSV
* Billing calculation:

```
Total Hours × Hourly Rate
```

---

## Key Concepts Used

* MVC Architecture
* REST API design
* JWT Authentication
* Role-based authorization
* React Context API
* Component-based UI

---

## Notes

* Run backend before frontend
* Ensure MongoDB is connected
* Ports should not be in use

---

## Conclusion

This project demonstrates a real-world implementation of a time tracking system with authentication, role management, reporting, and billing.

---

## Author

**Ganesh Prajapat**

---
