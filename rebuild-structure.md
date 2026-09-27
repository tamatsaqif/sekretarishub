# Website Rebuild Structure

## Objective

Rebuild the existing class website using the structure defined in this document.

The existing database and existing data must be preserved and reused.

The goal is to reorganize the website into a simpler, cleaner, more intuitive class-information experience without unnecessarily rebuilding or destroying the existing backend.

---

# 1. Critical Database Rule

## DO NOT destroy existing data

Before making changes:

1. Inspect the existing project structure.
2. Inspect the existing database schema.
3. Inspect existing tables, relationships, queries, and data.
4. Identify which existing data can be reused for the new structure.
5. Preserve existing records whenever possible.
6. Do not reset, drop, truncate, or recreate the database just to fit the new UI.

### Important

The existing database is the source of truth.

Adapt the frontend and application architecture around the existing data where practical.

Only modify the database schema when it is genuinely necessary.

Never delete existing production data without explicit instruction.

---

# 2. Main Website Structure

The entire website should follow this structure:

```text
🏠 Home
├── 📅 Daily Info
│   ├── Mata Pelajaran
│   ├── Jadwal Hari Ini
│   └── Catatan Hari Ini
│
├── 📚 Tugas
│   ├── Belum Dikumpulkan
│   ├── Sudah Dikumpulkan
│   └── Deadline
│
├── 🧹 Piket
│   ├── Piket Hari Ini
│   └── Jadwal Piket
│
├── 📢 Pengumuman
│   ├── Pengumuman Terbaru
│   └── Arsip
│
├── 👥 Anggota
│   └── Daftar Siswa
│
└── 💰 Kas Kelas
    ├── Total Kas
    ├── Status Pembayaran
    └── Detail Siswa
```

This structure is the source of truth for the frontend information architecture.

Do not add unrelated sections.

---

# 3. Home

## Purpose

Home is the main landing page and summary of the class.

It should provide quick access to the most important information without becoming a complicated dashboard.

### Home should prioritize:

* Class identity
* Current date
* Today's most important information
* Quick access to Daily Info
* Quick access to Tugas
* Quick access to Piket
* Quick access to Pengumuman
* Quick access to Anggota
* Quick access to Kas Kelas

### Home should NOT become:

* Analytics dashboard
* Statistics-heavy dashboard
* Generic SaaS dashboard
* Feature showcase
* Marketing landing page

Use the existing database data wherever possible.

---

# 4. Daily Info

## Purpose

Daily Info is the primary place for information about the current school day.

```text
📅 Daily Info
├── Mata Pelajaran
├── Jadwal Hari Ini
└── Catatan Hari Ini
```

### Mata Pelajaran

Display the subjects relevant to the selected/current day.

Possible existing database fields may include:

* Subject name
* Teacher
* Time
* Additional information

Use only fields that already exist or are explicitly required.

### Jadwal Hari Ini

Display today's schedule clearly.

The user should immediately understand:

* What subject comes next
* What time it occurs
* What the current day's schedule looks like

### Catatan Hari Ini

Display important notes for the selected day.

Examples:

* Bring sports equipment
* Classroom activity
* Special instruction
* Important reminder

Do not invent notes.

---

# 5. Tugas

## Purpose

Tugas is the central assignment area.

```text
📚 Tugas
├── Belum Dikumpulkan
├── Sudah Dikumpulkan
└── Deadline
```

### Belum Dikumpulkan

Show assignments that still require action.

Prioritize:

* Assignment name
* Subject
* Deadline
* Relevant note

### Sudah Dikumpulkan

Show completed/submitted assignments.

Keep the presentation simple.

### Deadline

Make upcoming deadlines easy to scan.

The deadline should have strong visual hierarchy but remain consistent with the monochrome design system.

Do not introduce aggressive colors just to indicate urgency.

---

# 6. Piket

## Purpose

Show the class duty schedule.

```text
🧹 Piket
├── Piket Hari Ini
└── Jadwal Piket
```

### Piket Hari Ini

The first thing the user should see is who is responsible for today's duty.

### Jadwal Piket

Display the complete schedule.

The schedule should be easy to scan on mobile.

Do not add unnecessary statistics such as:

* Attendance percentage
* Duty completion percentage
* Student rankings

---

# 7. Pengumuman

## Purpose

Provide a central place for class announcements.

```text
📢 Pengumuman
├── Pengumuman Terbaru
└── Arsip
```

### Pengumuman Terbaru

Display the newest announcements first.

Prioritize:

* Title
* Date
* Content
* Relevant metadata

### Arsip

Older announcements should remain accessible without overwhelming the main page.

Keep the archive simple.

---

# 8. Anggota

## Purpose

Display the students in the class.

```text
👥 Anggota
└── Daftar Siswa
```

### Daftar Siswa

Display the students clearly.

Possible existing database fields:

* Student name
* Student number
* Additional class-related information

Only display information that is actually available and appropriate.

Do not invent student data.

Do not add unnecessary student analytics.

---

# 9. Kas Kelas

## Purpose

Display class financial information in a transparent and easy-to-understand way.

```text
💰 Kas Kelas
├── Total Kas
├── Status Pembayaran
└── Detail Siswa
```

### Total Kas

Display the current class cash total using the existing database data.

This should be easy to find but should not visually dominate the entire website.

### Status Pembayaran

Show each student's payment status.

The interface should make it easy to understand:

* Who has paid
* Who has not fully paid
* Remaining amount, when available

Reuse existing payment data from the database.

### Detail Siswa

Allow the user to view a student's payment details.

Possible information:

* Student name
* Payment history
* Paid amount
* Remaining amount
* Relevant payment period

Only use data already available in the database.

---

# 10. Data Mapping

Before implementation, map the existing database into the new information architecture.

Conceptually:

```text
Existing Database
        ↓
Data Mapping Layer
        ↓
New Website Structure
        ↓
New UI
```

Do not duplicate data unnecessarily.

Example:

```text
Existing assignments table
        ↓
        ├── Home preview
        └── Tugas page
```

The same source data should be reused across different pages.

---

# 11. Existing Functionality

When rebuilding:

* Preserve working functionality.
* Preserve existing authentication where applicable.
* Preserve existing database access.
* Preserve existing permissions.
* Preserve existing important business logic.
* Preserve existing class data.

The redesign should primarily improve:

* Information architecture
* UI
* UX
* Navigation
* Visual hierarchy
* Responsiveness
* Consistency

Do not rewrite working backend logic without a clear reason.

---

# 12. Navigation

The main navigation should reflect the new structure.

Primary destinations:

```text
Home
Daily Info
Tugas
Piket
Pengumuman
Anggota
Kas Kelas
```

Keep navigation simple.

On mobile, use an appropriate compact navigation pattern.

Do not add unrelated navigation items.

---

# 13. Page Relationships

The sections should feel like one connected website rather than separate mini-apps.

Example:

```text
Home
 ├── → Daily Info
 ├── → Tugas
 ├── → Piket
 ├── → Pengumuman
 ├── → Anggota
 └── → Kas Kelas
```

Each section should link naturally back to Home and to relevant related content when necessary.

Do not create unnecessary nested navigation.

---

# 14. Shared Design System

All pages must use the rules defined in:

`design-direction.md`

This includes:

* Monochrome white/gray color system
* SF Pro / system fallback typography
* Rounded visual language
* Consistent spacing
* Subtle glassmorphism for buttons
* Restrained shadows
* Smooth animations
* Clear hierarchy
* Consistent components
* Anti-AI-slop rules

Do not create a separate visual style for individual pages.

---

# 15. Shared Components

Create reusable components where appropriate.

Examples:

```text
Navbar
PageHeader
SectionHeader
DateSelector
SubjectItem
AssignmentItem
DutyItem
AnnouncementItem
StudentItem
PaymentItem
GlassButton
EmptyState
LoadingState
```

Reuse the same component for the same purpose.

Do not create visually different versions of the same component without a clear reason.

---

# 16. Responsive Behavior

The website must be mobile-first.

Assume students primarily access the site through their phones.

### Mobile requirements

* No horizontal overflow
* Comfortable touch targets
* Clear typography
* Easy navigation
* Fast scanning
* Consistent spacing
* No cramped tables
* Important information visible without excessive interaction

Desktop should scale naturally from the mobile-first structure.

---

# 17. Empty Data

When a section has no data:

Do not invent content.

Use a minimal neutral state.

Example:

```text
Belum ada tugas.
```

or:

```text
Tidak ada pengumuman.
```

The empty state should not introduce unnecessary illustrations or decoration.

---

# 18. Loading and Error States

Loading states should be subtle and consistent.

Error states should be clear and useful.

Do not create elaborate loading screens.

Do not hide errors behind silent failures.

---

# 19. Performance

The rebuilt website should remain lightweight.

Prioritize:

* Fast initial load
* Efficient database queries
* Reused components
* Minimal unnecessary JavaScript
* Optimized images
* No unnecessary dependencies

Do not add a library just because it looks useful.

Use existing project dependencies where possible.

---

# 20. Implementation Process

Before changing code:

### Step 1 — Audit

Inspect:

```text
Project structure
Routes
Components
Database schema
Database queries
Authentication
Existing functionality
Existing styles
Environment configuration
```

### Step 2 — Map

Create a clear mapping:

```text
Existing data
      ↓
Required feature
      ↓
Required page
      ↓
Reusable component
```

### Step 3 — Rebuild

Refactor the frontend around the new structure.

### Step 4 — Verify

Check:

* Existing data still appears correctly
* Database operations still work
* No data was lost
* Existing authentication still works
* Every requested section works
* Mobile layout works
* Existing functionality has not been accidentally removed

### Step 5 — Polish

Apply `design-direction.md` consistently across every page.

---

# 21. Strict Scope Rule

The requested structure is:

```text
🏠 Home
├── 📅 Daily Info
│   ├── Mata Pelajaran
│   ├── Jadwal Hari Ini
│   └── Catatan Hari Ini
│
├── 📚 Tugas
│   ├── Belum Dikumpulkan
│   ├── Sudah Dikumpulkan
│   └── Deadline
│
├── 🧹 Piket
│   ├── Piket Hari Ini
│   └── Jadwal Piket
│
├── 📢 Pengumuman
│   ├── Pengumuman Terbaru
│   └── Arsip
│
├── 👥 Anggota
│   └── Daftar Siswa
│
└── 💰 Kas Kelas
    ├── Total Kas
    ├── Status Pembayaran
    └── Detail Siswa
```

Do not add:

* Chat
* AI assistant
* Social feed
* Leaderboards
* Analytics
* Extra dashboards
* Extra pages
* Extra navigation
* Unrequested settings
* Unrequested features

Do not remove any existing functionality that is required by the current system unless explicitly instructed.

---

# 22. Final Instruction

Rebuild the existing website around this structure while preserving the existing database and functional behavior.

The redesign should feel like **one coherent class website**, not a collection of unrelated pages.

Priorities:

1. Preserve existing data.
2. Preserve working functionality.
3. Follow the exact information architecture.
4. Reuse existing backend/data whenever possible.
5. Reuse components.
6. Apply `design-direction.md`.
7. Do not invent features.
8. Do not add unnecessary UI.
9. Keep the experience simple.
10. Make the final result feel polished, intentional, and human-designed.

When uncertain, **preserve existing functionality and choose the simpler implementation.**
