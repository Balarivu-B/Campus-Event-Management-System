# 🎪 Campus Event Management System

A full-stack web application for organizing, managing, and participating in college campus events. Built with **Vanilla HTML/CSS/JavaScript** on the frontend, **Node.js + Express** on the backend, and **MySQL** for the relational database.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Authentication & User Roles](#-authentication--user-roles)
  - [Regular Users (Student, Faculty, Organizer)](#1-regular-users-first-register-then-login)
  - [Administrator Access](#2-administrator-access-hidden-backend-credentials)
- [Technology Stack](#-technology-stack)
- [Database Schema (MySQL Workbench)](#-database-schema-mysql-workbench)
- [Installation & Setup](#-installation--setup)
  - [1. Database Setup](#1-database-setup-mysql-workbench)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Security Features](#-security-features)

---

## 🏛️ System Architecture

```
Campus Event Management/
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool configuration
│   │   └── initAdmin.js       # Admin account auto-seeder (bcrypt hashed)
│   ├── controllers/
│   │   ├── authController.js  # Registration & JWT login logic
│   │   ├── studentController.js
│   │   ├── facultyController.js
│   │   ├── organizerController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification & role-based guards
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── facultyRoutes.js
│   │   ├── organizerRoutes.js
│   │   └── adminRoutes.js
│   ├── .env                   # Environment variables (DB & Admin config)
│   ├── package.json
│   └── server.js              # Express app entry point
└── frontend/
    ├── css/                   # Responsive stylesheets
    ├── js/
    │   ├── login.js           # Live backend API login integration
    │   ├── register.js        # Multi-role dynamic registration form
    │   ├── student.js
    │   ├── faculty.js
    │   ├── organizer.js
    │   └── admin.js
    ├── admin/                 # Administrator portal pages
    ├── faculty/               # Faculty approval portal pages
    ├── organizer/             # Event organizer portal pages
    ├── student/               # Student registration & event portal pages
    ├── index.html             # Public landing page
    ├── login.html             # Clean manual credential sign-in form
    └── register.html          # New account registration form
```

---

## 🔐 Authentication & User Roles

All demo accounts and autofill buttons have been completely removed from frontend forms and code. Authentication is strictly handled through the live backend API and MySQL database.

### 1. Seeded Accounts in Database (Ready for Testing)

The MySQL database contains one active verified user for each campus role and two approved events. All forms start blank and credentials must be typed manually:

| Role | Name | Email | Password | Role-Specific Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Campus Administrator | `admin@gmail.com` | `admin123` | System Super Administrator |
| **Student** | Aarav Sharma | `student@campus.edu` | `student123` | Reg No: `2026CSE001`, Dept: Computer Science, Year: 3 |
| **Faculty** | Dr. S. Venkatesh | `faculty@campus.edu` | `faculty123` | Dept: Computer Science and Engineering, Main Campus |
| **Organizer** | Campus Tech Club Lead | `organizer@campus.edu` | `organizer123` | Club: Computer Science Club, Main Campus |

#### Seeded Events in Database:
1. **Full-Stack Web Development Bootcamp**
   - **Category**: Workshop
   - **Capacity**: 60 seats
   - **Venue**: Seminar Hall A
   - **Timing**: 09:30 AM – 04:30 PM (15 Oct 2026)
   - **Organizer**: Computer Science Club
   - **Status**: `APPROVED`
2. **AI & Cloud Innovation Summit 2026**
   - **Category**: Seminar
   - **Capacity**: 120 seats
   - **Venue**: Main Auditorium
   - **Timing**: 10:00 AM – 02:00 PM (25 Oct 2026)
   - **Organizer**: Computer Science Club
   - **Status**: `APPROVED`

---

### 2. Regular Users: Register New Accounts Anytime

Students, Faculty members, and Event Organizers can also register new accounts at any time through `register.html`:

1. Open `frontend/register.html`.
2. Fill in:
   - **Full Name**
   - **Email Address** (must be unique)
   - **Password** (minimum 5 characters)
   - **Confirm Password**
   - **Account Type** (`Student`, `Faculty`, or `Event Organizer`)
3. Fill role-specific details:
   - **Student**: Register Number (unique), Department, Year (1st, 2nd, 3rd, 4th)
   - **Faculty**: Department, Institution
   - **Organizer**: Organization/Club Name, Institution
4. Click **Create Account**. The backend securely hashes the password with `bcrypt` (10 rounds) and inserts records into `users` and the corresponding role profile table.
5. You will be redirected to `login.html`.
6. Enter your registered email and password to log in. You are automatically routed to your role dashboard:
   - **Student** ➔ `student/dashboard.html`
   - **Faculty** ➔ `faculty/dashboard.html`
   - **Organizer** ➔ `organizer/dashboard.html`

---

### 3. Administrator Access (Hidden Backend Credentials)

- **No Public Registration**: Admin accounts **cannot** register through the registration form (blocked by backend security validation with HTTP 403).
- **No Form Hints**: Admin credentials are **never displayed, hinted at, or autofilled** in the frontend UI.
- **Backend Configuration**: Default administrator credentials are stored securely in `backend/.env` and automatically initialized/verified in the MySQL database upon backend launch.

#### Default Admin Credentials:
| Parameter | Value |
| :--- | :--- |
| **Email** | `admin@gmail.com` |
| **Password** | `admin123` |
| **Role** | `ADMIN` |
| **Dashboard** | `admin/dashboard.html` |

> 💡 **Customizing Admin Credentials**: You can modify `ADMIN_EMAIL` and `ADMIN_PASSWORD` anytime in [backend/.env](file:///c:/Users/balar/OneDrive/ドキュメント/Campus%20Event%20Management/backend/.env).

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom design system), Vanilla JavaScript (ES6+ `fetch` API)
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0 (Managed via MySQL Workbench)
- **Database Driver**: `mysql2` with connection pooling
- **Security & Tokens**: `bcryptjs` (password hashing), `jsonwebtoken` (JWT bearer tokens)
- **CORS**: Enabled for cross-origin browser communication

---

## 🗄️ Database Schema (MySQL Workbench)

Database Name: `campus_event_management`

### Tables & Relationships

1. **`users`**
   - `user_id` (INT, Primary Key, Auto Increment)
   - `name` (VARCHAR(100), NOT NULL)
   - `email` (VARCHAR(100), UNIQUE, NOT NULL)
   - `password` (VARCHAR(255), NOT NULL) — *Bcrypt Hash*
   - `role` (ENUM('STUDENT', 'FACULTY', 'ORGANIZER', 'ADMIN'), NOT NULL)
   - `status` (ENUM('ACTIVE', 'INACTIVE'), DEFAULT 'ACTIVE')
   - `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

2. **`students`**
   - `student_id` (INT, Primary Key, Auto Increment)
   - `user_id` (INT, UNIQUE, Foreign Key ➔ `users.user_id`)
   - `register_number` (VARCHAR(50), UNIQUE, NOT NULL)
   - `department` (VARCHAR(100))
   - `year` (INT)

3. **`faculty`**
   - `faculty_id` (INT, Primary Key, Auto Increment)
   - `user_id` (INT, UNIQUE, Foreign Key ➔ `users.user_id`)
   - `department` (VARCHAR(100))
   - `institution` (VARCHAR(150))

4. **`organizers`**
   - `organizer_id` (INT, Primary Key, Auto Increment)
   - `user_id` (INT, UNIQUE, Foreign Key ➔ `users.user_id`)
   - `organization_name` (VARCHAR(150))
   - `institution` (VARCHAR(150))

5. **`events`**
   - `event_id` (INT, Primary Key, Auto Increment)
   - `organizer_id` (INT, Foreign Key ➔ `organizers.organizer_id`)
   - `event_name` (VARCHAR(150), NOT NULL)
   - `category` (VARCHAR(100))
   - `event_date` (DATE, NOT NULL)
   - `start_time` (TIME)
   - `end_time` (TIME)
   - `venue` (VARCHAR(150))
   - `capacity` (INT)
   - `description` (TEXT)
   - `status` (ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'), DEFAULT 'PENDING')
   - `approved_by` (INT, Foreign Key ➔ `users.user_id`)
   - `rejection_reason` (TEXT)
   - `created_at` (TIMESTAMP)

6. **`registrations`**
   - `registration_id` (INT, Primary Key, Auto Increment)
   - `event_id` (INT, Foreign Key ➔ `events.event_id`)
   - `student_id` (INT, Foreign Key ➔ `students.student_id`)
   - `status` (ENUM('REGISTERED', 'CANCELLED'), DEFAULT 'REGISTERED')
   - `registered_at` (TIMESTAMP)

7. **`notifications`**
   - `notification_id` (INT, Primary Key, Auto Increment)
   - `user_id` (INT, Foreign Key ➔ `users.user_id`)
   - `title` (VARCHAR(150), NOT NULL)
   - `message` (TEXT, NOT NULL)
   - `is_read` (BOOLEAN, DEFAULT FALSE)
   - `created_at` (TIMESTAMP)

8. **`feedback`**
   - `feedback_id` (INT, Primary Key, Auto Increment)
   - `event_id` (INT, Foreign Key ➔ `events.event_id`)
   - `student_id` (INT, Foreign Key ➔ `students.student_id`)
   - `rating` (INT, 1 to 5, NOT NULL)
   - `comment` (TEXT)
   - `created_at` (TIMESTAMP)

---

## 🚀 Installation & Setup

### 1. Database Setup (MySQL Workbench)
1. Launch **MySQL Workbench** and connect to your local MySQL instance (`localhost:3306`).
2. Make sure the database `campus_event_management` exists. If not created:
   ```sql
   CREATE DATABASE IF NOT EXISTS campus_event_management;
   USE campus_event_management;
   ```
3. Verify your tables match the schema above.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```powershell
   cd "c:\Users\balar\OneDrive\ドキュメント\Campus Event Management\backend"
   ```
2. Verify or update [backend/.env](file:///c:/Users/balar/OneDrive/ドキュメント/Campus%20Event%20Management/backend/.env):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=campus_event_management
   JWT_SECRET=campus_event_secret_123

   # Default Admin Credentials
   ADMIN_NAME=Campus Administrator
   ADMIN_EMAIL=admin@gmail.com
   ADMIN_PASSWORD=admin123
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the backend server:
   ```powershell
   npm run dev
   ```
   *The server runs at `http://localhost:5000` and automatically connects to MySQL and initializes the Admin account.*

### 3. Frontend Setup
1. Navigate to `frontend/`:
   ```powershell
   cd "..\frontend"
   ```
2. Open `index.html` or `login.html` in your web browser (or use VS Code Live Server).
3. To test the flow:
   - Click **Create Account** on `login.html` (or open `register.html`).
   - Register a new Student, Faculty, or Organizer account.
   - You will be redirected to `login.html`.
   - Manually type your credentials to sign in.
   - For Admin, manually enter `admin@gmail.com` and `admin123`.

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new Student, Faculty, or Organizer | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/test-db` | Verify live database connectivity | Public |

### Student Portal (`/api/student`) — *Requires Bearer Token (STUDENT)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/student/profile` | Retrieve student profile details |
| `GET` | `/api/student/events` | List all approved upcoming events |
| `POST` | `/api/student/events/:eventId/register` | Register for an event |
| `GET` | `/api/student/my-events` | View registered events |
| `POST` | `/api/student/events/:eventId/feedback` | Submit event rating & comment |
| `GET` | `/api/student/notifications` | View announcements |
| `PUT` | `/api/student/notifications/:id/read` | Mark notification as read |

### Faculty Portal (`/api/faculty`) — *Requires Bearer Token (FACULTY)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/faculty/profile` | Retrieve faculty profile details |
| `GET` | `/api/faculty/event-requests` | View pending event requests |
| `PUT` | `/api/faculty/events/:eventId/approve` | Approve an event |
| `PUT` | `/api/faculty/events/:eventId/reject` | Reject an event with reason |
| `GET` | `/api/faculty/approved-events` | View approved campus events |
| `GET` | `/api/faculty/notifications` | View notifications |

### Organizer Portal (`/api/organizer`) — *Requires Bearer Token (ORGANIZER)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/organizer/profile` | Retrieve organizer profile |
| `POST` | `/api/organizer/events` | Create a new event for faculty approval |
| `GET` | `/api/organizer/events` | List events managed by organizer |
| `PUT` | `/api/organizer/events/:eventId` | Update event details |
| `DELETE` | `/api/organizer/events/:eventId` | Cancel/delete event |
| `GET` | `/api/organizer/events/:eventId/registrations` | View attendee list |

### Admin Portal (`/api/admin`) — *Requires Bearer Token (ADMIN)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Aggregated user and event statistics |
| `GET` | `/api/admin/students` | List all registered students |
| `GET` | `/api/admin/faculty` | List all faculty members |
| `GET` | `/api/admin/organizers` | List all event organizers |
| `GET` | `/api/admin/events` | Comprehensive event audit list |
| `PUT` | `/api/admin/events/:eventId/cancel` | Terminate/cancel an event |
| `GET` | `/api/admin/reports` | Detailed event analytics & ratings |

---

## 🔒 Security Features

1. **Password Hashing**: `bcryptjs` one-way salted hashing (10 salt rounds) ensures passwords are never stored in plaintext.
2. **Stateless JWT Authorization**: Requests to protected endpoints require an `Authorization: Bearer <token>` header verified by `authMiddleware.js`.
3. **Role-Based Access Control (RBAC)**: Endpoints use the `allowRole(...)` middleware to restrict actions by role (`STUDENT`, `FACULTY`, `ORGANIZER`, `ADMIN`).
4. **Duplicate Prevention**: The backend verifies email uniqueness across `users` and `register_number` uniqueness across `students` prior to user creation.
5. **Orphaned User Rollback**: If a role profile insertion fails, the created `users` record is automatically deleted to maintain database integrity.
6. **No Client-Side Credential Exposure**: Form inputs are blank and passwords are typed manually by users.
