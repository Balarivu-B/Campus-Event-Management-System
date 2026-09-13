# Campus Event Management System (CEMS)

A complete, full-stack campus event management and registration web application designed for colleges and universities.

CEMS streamlines the entire lifecycle of campus events:
1. **Organizers** create event proposals (which start with `PENDING` status).
2. **Faculty Coordinators** review pending proposals and **Approve** or **Reject** them with formal feedback.
3. **Students** discover approved events, search/filter by category/date, reserve seats with duplicate prevention and capacity enforcement, and track schedules.
4. **Administrators** audit the system, manage user roles, and activate/deactivate accounts.

---

## Technology Stack

- **Frontend**: React.js (Vite), JavaScript (ES6+), React Router v6, Vanilla CSS3 (Custom Design System), Lucide Icons
- **Backend**: Node.js, Express.js, REST API Architecture
- **Database**: MySQL, `mysql2` driver (parameterized queries, relational foreign keys, transactions)
- **Security & Authentication**: JSON Web Tokens (JWT), `bcryptjs` password hashing, Helmet, CORS

---

## User Roles & Permissions

| Role | Permissions & Capabilities |
| :--- | :--- |
| **STUDENT** | Discover approved events, search/filter/sort, register for events, cancel registration, view dashboard and unread notifications. |
| **ORGANIZER** | Create event proposals (`PENDING`), edit/delete own events, view approval statuses, inspect attendee rosters and participant turnouts. |
| **FACULTY** | Review pending proposals, approve events (`PENDING` → `APPROVED`), reject events with mandatory rejection reasons (`PENDING` → `REJECTED`), view event statistics. |
| **ADMIN** | Full administrative oversight: Manage all users (edit, activate/deactivate, delete with last-admin safeguards), view system statistics, monitor all campus events. |

---

## Institutional Scoping & Access Control

CEMS features **Institutional Scoping** across schools and colleges:
- **Same-Institution Faculty Approvals**: Faculty coordinators can **only** review, approve, or reject event proposals submitted by organizers registered within their **same school or college**.
- Cross-institution approval attempts are strictly blocked at both the API and database levels (returning HTTP `403 Forbidden`).
- System Administrators have campus-wide visibility across all institutions and departments.

---

## Default Login Credentials

> **Note**: For realistic authentication security, demo credentials are intentionally **NOT** pre-filled or clickable in the login UI. Use the credentials below to test each role:

All pre-configured accounts use the password: `password123`

| Role | School / College | Email | Password | Scope & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty Coordinator** | College of Engineering | `faculty@example.com` | `password123` | Approves Engineering events only |
| **Faculty Coordinator** | College of Arts & Sciences | `faculty_arts@example.com` | `password123` | Approves Arts & Sciences events only |
| **Event Organizer** | College of Engineering | `organizer@example.com` | `password123` | Creates Engineering event proposals |
| **Event Organizer** | College of Arts & Sciences | `organizer_arts@example.com` | `password123` | Creates Arts event proposals |
| **Student** | College of Engineering | `student@example.com` | `password123` | Registers for events |
| **Student 2** | College of Engineering | `student2@example.com` | `password123` | Registers for events |
| **System Admin** | Campus Administration | `admin@example.com` | `password123` | Full administrative control |

---

## Dark Mode Support

CEMS includes a **Full Dark Mode** feature:
- Click the Sun/Moon toggle icon in the top navigation bar to switch between Light and Dark themes.
- Preferences are automatically saved in `localStorage` and persist across browser sessions and reloads.
- Built with custom CSS custom properties (tokens) ensuring high visual contrast, sleek slate backgrounds, and accessible typography.

## Project Structure

```text
campus-event-management/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── style.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── EventCard.jsx
│       │   ├── EventForm.jsx
│       │   ├── SearchBar.jsx
│       │   ├── FilterBar.jsx
│       │   ├── Notification.jsx
│       │   ├── Loading.jsx
│       │   └── ConfirmModal.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Events.jsx
│           ├── EventDetails.jsx
│           ├── Profile.jsx
│           ├── StudentDashboard.jsx
│           ├── MyRegistrations.jsx
│           ├── OrganizerDashboard.jsx
│           ├── CreateEvent.jsx
│           ├── ManageEvents.jsx
│           ├── Participants.jsx
│           ├── FacultyDashboard.jsx
│           ├── PendingEvents.jsx
│           ├── AdminDashboard.jsx
│           └── ManageUsers.jsx
│
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── db.js
│   ├── .env
│   ├── .env.example
│   ├── scripts/
│   │   └── setupDb.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── users.js
│   │   ├── notifications.js
│   │   └── stats.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   ├── userController.js
│   │   └── notificationController.js
│   └── middleware/
│       ├── auth.js
│       └── errorHandler.js
│
├── database/
│   ├── schema.sql
│   └── sample-data.sql
│
├── README.md
└── .gitignore
```

---

## Installation & Setup Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (or any cloud MySQL provider like Aiven, TiDB Cloud, Clever Cloud)

### 2. Configure Backend Environment
Navigate to the `backend` directory:
```bash
cd backend
cp .env.example .env
```
Edit `.env` with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_event_management
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Initialize Database & Seed Sample Data
Run the automated setup script to create the database, tables, and sample users with bcrypt hashes:
```bash
cd backend
npm run db:setup
```
*(Alternatively, you can manually import `database/schema.sql` followed by `database/sample-data.sql` in MySQL Workbench or phpMyAdmin).*

### 4. Install Dependencies & Start Servers

**Backend:**
```bash
cd backend
npm install
npm run dev
```
*API will run on `http://localhost:5000`*

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*Web App will run on `http://localhost:5173`*

---

## REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student account (name, email, password, department, phone).
- `POST /api/auth/login` — Authenticate and receive JWT token + user profile.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Events (`/api/events`)
- `GET /api/events` — Discover approved events (with `search`, `category`, `date`, `sort`, `page`, `limit`).
- `GET /api/events/:id` — View event details, remaining seats, and registration status.
- `POST /api/events` — Organizer creates new event proposal (status: `PENDING`).
- `PUT /api/events/:id` — Update event details (Organizer of event or Admin).
- `DELETE /api/events/:id` — Remove event and associated registrations.
- `PUT /api/events/:id/approve` — Faculty approves event (`PENDING` → `APPROVED`).
- `PUT /api/events/:id/reject` — Faculty rejects event with reason (`PENDING` → `REJECTED`).
- `PUT /api/events/:id/cancel` — Cancel event and notify all registered students.
- `GET /api/events/:id/participants` — View attendee roster for the event.

### Registrations (`/api/registrations`)
- `POST /api/registrations` — Student reserves a seat (validates role, capacity, and uniqueness).
- `GET /api/registrations/my` — Retrieve current student's registered events.
- `DELETE /api/registrations/:id` — Cancel an attendee registration.

### Users (`/api/users`)
- `GET /api/users` — Admin lists all users with role/status filters.
- `GET /api/users/:id` — View user profile.
- `PUT /api/users/:id` — Edit user name, department, phone, role, or active status.
- `DELETE /api/users/:id` — Delete user account (safeguards against deleting last admin).

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user notifications and unread badge count.
- `PUT /api/notifications/:id/read` — Mark notification as read.
- `PUT /api/notifications/read-all` — Mark all notifications as read.

### Statistics (`/api/stats`)
- `GET /api/stats/dashboard` — Aggregated role-specific metrics for Student, Organizer, Faculty, and Admin.

---

## College Viva / Project Presentation Q&A Highlights

1. **How is duplicate registration prevented?**
   - At the database level: `UNIQUE(student_id, event_id)` constraint on the `registrations` table.
   - At the application level: The backend checks if a registered record exists and returns `409 Conflict`.

2. **How is event capacity guaranteed during concurrent student signups?**
   - The registration controller uses a MySQL database transaction with `FOR UPDATE` locking and checks `COUNT(*) < capacity` before inserting. If the event is full, it rolls back and returns `400 Bad Request: Registration Full`.

3. **How does the approval workflow work?**
   - Organizers submit events which are strictly marked `PENDING`.
   - The event is not visible to students or the public while pending.
   - Faculty Coordinators view the review queue, where they can click **Approve** (transitions to `APPROVED` and notifies the organizer) or **Reject** (opens a modal requiring a rejection reason, updates status to `REJECTED`, stores the reason, and notifies the organizer).

4. **How are passwords and API tokens handled securely?**
   - Passwords are encrypted using `bcryptjs` with 10 salt rounds before insertion.
   - User sessions are authenticated using signed JSON Web Tokens (JWT) transmitted via the `Authorization: Bearer <token>` header. Passwords are never stored in JWT payloads or sent to the frontend.

---

## License
MIT License. Developed for Academic and Educational Excellence.
