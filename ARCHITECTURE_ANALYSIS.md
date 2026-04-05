# CampusVibe Platform Architecture & Logic Analysis

Based on the exploration of your codebase, here is the detailed analysis of the content, the proposed relational database schema, and the file execution/logic flow path.

## 1. Content Analysis

**CampusVibe** is a College Event Management web application that uses a mock data layer built on top of the browser's `localStorage` (`data.js`). The application supports three primary user roles:
- **Admin:** Has overarching control. Creates events, publishes notices, manages users, and approves/rejects new teacher registrations.
- **Teacher:** Can manage the events assigned to them, update event instructions, and appoint student coordinators.
- **Student:** Can browse upcoming and completed events, mark events as favorites, read notices, and view the photo gallery.

**Key Concepts Managed:**
- **Users:** Admin, Teachers, and Students.
- **Events:** Detailed entries containing date, time, venue, description, assigned teachers, and student coordinators.
- **Notices:** Global broadcasts shown across dashboards.
- **Favorites:** Per-user event bookmarks.
- **Pending Teachers:** A queue of teacher sign-ups waiting for admin approval.

---

## 2. Relational Database Schema Design
*Should you decide to migrate away from `localStorage` to a SQL Database (e.g., PostgreSQL, MySQL, Supabase, or AWS RDS), this is how the structure would look.*

### `users`
**Primary entity holding all roles.**
- `id` (UUID) - Primary Key
- `name` (VARCHAR)
- `email` (VARCHAR) - Unique
- `password_hash` (VARCHAR) 
- `role` (ENUM: 'admin', 'teacher', 'student')
- `avatar` (VARCHAR) - Nullable
- `phone` (VARCHAR) - Nullable
- `department` (VARCHAR) - Nullable
- `employee_id` (VARCHAR) - Nullable
- `created_at` (TIMESTAMP)

### `pending_teachers`
**Temporary registrations pending admin approval.**
- `id` (UUID) - Primary Key
- `name` (VARCHAR)
- `email` (VARCHAR) - Unique
- `password_hash` (VARCHAR)
- `phone` (VARCHAR) - Nullable
- `department` (VARCHAR) - Nullable
- `employee_id` (VARCHAR) - Nullable
- `status` (ENUM: 'pending', 'rejected') 
- `created_at` (TIMESTAMP)

### `venues`
**Preset locations on campus.**
- `id` (UUID) - Primary Key
- `name` (VARCHAR)
- `building` (VARCHAR)
- `capacity` (INT)
- `icon` (VARCHAR)

### `events`
**The core entity of the platform.**
- `id` (UUID) - Primary Key
- `title` (VARCHAR)
- `description` (TEXT)
- `venue_id` (UUID) - Foreign Key -> `venues.id`
- `floor` (VARCHAR) - Nullable
- `date` (DATE)
- `time` (VARCHAR)
- `image` (VARCHAR)
- `student_sheet_link` (VARCHAR) - Nullable
- `event_registration_link` (VARCHAR) - Nullable
- `instructions` (TEXT) - Nullable
- `featured` (BOOLEAN) - Default: false
- `created_at` (TIMESTAMP)

### `event_teachers`
**Many-to-Many Relationship joining Events with assigned Teachers.**
- `event_id` (UUID) - Foreign Key -> `events.id`
- `teacher_id` (UUID) - Foreign Key -> `users.id` (where role is 'teacher')
- *Composite Primary Key (event_id, teacher_id)*

### `event_coordinators`
**Student coordinators assigned to events by teachers.**
- `id` (UUID) - Primary Key
- `event_id` (UUID) - Foreign Key -> `events.id`
- `name` (VARCHAR)
- `phone` (VARCHAR)

### `favorites`
**User's bookmarked events.**
- `user_id` (UUID) - Foreign Key -> `users.id`
- `event_id` (UUID) - Foreign Key -> `events.id`
- *Composite Primary Key (user_id, event_id)*

### `notices`
**Global platform announcements.**
- `id` (UUID) - Primary Key
- `title` (VARCHAR)
- `message` (TEXT)
- `date` (TIMESTAMP)
- `created_by` (UUID) - Foreign Key -> `users.id` (Admin)

---

## 3. Data Flow & Logic Map (Sequence Path)

The application flow heavily depends on Role-Based Access Control (RBAC) initialized during the authentication sequence. Here is the exact lifecycle map:

### 1. Initialization and Authentication
* **Data Seeding:** `data.js` automatically populates default Events, Users, Venues, etc. into `localStorage` if not found.
* **Accessing `login.html`:** The `login.js` script handles UI interactivity (checking fields, setting theme visually).
* **Execution:** Once "Log In" is submitted:
  1. `login.js` calls `login(email, password)` imported from `auth.js`.
  2. `auth.js` checks against `getPendingTeachers()` to assert whether a teacher is stuck in pending/rejected.
  3. If not pending, it proceeds to check the `getUsers()` array.
  4. Upon success, a token (`cem_session`) is written to `localStorage`.
  5. The `redirectToDashboard(user.role)` logic delegates traffic to `admin.html`, `teacher.html`, or `student.html`.

### 2. Administrator Access Path (`admin.js`)
* **Security Check:** Fires `requireAuth(['admin'])` to assert the identity session token holds `role === 'admin'`.
* **State Build:** The `render()` function initiates by fetching `getEvents()`, `getUsers()`, `getPendingTeachers()`, and `getNotices()`.
* **Sub-Flows:**
  * **Event Management:** Admin uses `openCreateEvent()` which appends a new block to `localStorage.cem_events` after aggregating teachers via `getSelectedTeachers()`.
  * **Teacher Registration Handling:** `approveTeacher(id)` pushes pending records to `cem_users`. `rejectTeacher(id)` updates the record in `cem_pending_teachers`.
  * **Notices:** Notice forms push to `cem_notices`, instantly forcing a DOM re-render across the global UI.

### 3. Teacher Access Path (`teacher.js`)
* **Security Check:** Fires `requireAuth(['teacher'])`.
* **State Load:** Only loads the events matching `isTeacherAssigned(ev, user.email)`.
* **Sub-Flows:**
  * **Event Specific Tools:** The UI displays actions specific to the teacher. They cannot delete events or change names, but `openEditEventTeacher(id)` allows defining `.instructions` and modifying `.description`. 
  * **Coordinators Generation:** Teachers use `openManageCoordinators(id)` to map an array of objects `{name, phone}` directly into the `ev.coordinators` property of target events. Re-saved via `saveEvents()`.

### 4. Student Access Path (`student.js`)
* **Security Check:** Fires `requireAuth(['student'])`.
* **DOM Rendering (SPA Handling):** Handled dynamically. Bottom nav pushes user context across `#sec-home`, `#sec-favorites`, etc.
* **Sub-Flows:**
  * **Event Interaction:** Opening the modal checks the status logic (`getEventStatus()`) based on date, then pulls `coordinators` and matching `assignedTeachers` back over via email references to construct the full modal element payload.
  * **Favorites:** `toggleFavorite(user.id, eventId)` maintains an object mapping within `cem_favorites`, keying it directly by the Student's `id`.

### 5. Cross-Dashboard Shared Utilities (`dashboard-nav.js`)
* **Visual Components:** Modal overlays (`showModal()`, `showEventDetailModal()`), UI Toasts (`showToast()`).
* **Visual Modes:** Theme management writes toggle state to `cem_theme` and re-applies the CSS variable map.
* **Shared Interactions:** The horizontal scroll sliders and the gallery component rely on global references available universally via this script.
