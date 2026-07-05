# Jira Lite / Sprint Manager

A browser-based Agile project management application for managing backlog
items, sprint planning, Kanban boards, story points, team members,
burndown charts, reports, and local workspace persistence.

## Live Links

- GitHub Repository: [fazal305/jira-lite-sprint-manager](https://github.com/fazal305/jira-lite-sprint-manager)
- Live Demo: [https://fazal305.github.io/jira-lite-sprint-manager/](https://fazal305.github.io/jira-lite-sprint-manager/)

## Overview

Jira Lite / Sprint Manager is a lightweight Jira-style Agile workspace built with plain browser technologies. It provides a multi-page sprint planning workflow with shared state, localStorage persistence, drag-and-drop Kanban movement, team management, reports, and a Chart.js burndown view.

The project is designed as a professional frontend portfolio build that demonstrates structured JavaScript, reusable utilities, Bootstrap UI composition, and no-build browser architecture.

## Pages

- Dashboard: project overview, sprint progress, metrics, quick actions, and recent activity
- Backlog: create, edit, delete, search, filter, estimate, assign, and move backlog items
- Sprint Planning: create sprints, activate sprints, close sprints, and manage sprint scope
- Kanban Board: drag active sprint items across workflow columns
- Burndown: compare ideal and actual remaining story points
- Team Members: manage team roster and inspect assignment statistics
- Reports: view status, priority, assignee, velocity, and sprint summaries
- Settings: manage theme, demo reset, workspace import, workspace export, and localStorage clearing

## Features

- Multi-page browser application
- Shared sidebar and consistent navigation
- Active page highlighting
- Demo data seeding from localStorage
- Backlog item CRUD
- Sprint creation, activation, closing, and scope management
- Drag-and-drop Kanban board
- Story point totals and completion calculations
- Burndown chart with ideal and actual lines
- Team member CRUD and workload statistics
- Search and filters across backlog and board views
- Project reports and JSON export
- Full workspace JSON export and import
- Dark mode and light mode toggle
- Responsive Bootstrap layout
- No build tools or frontend frameworks

## Technologies Used

- HTML5
- CSS3
- Bootstrap 5
- jQuery
- Vanilla JavaScript
- Chart.js
- Drag and Drop API
- LocalStorage
- Blob API
- Clipboard API

## Learning Outcomes

- Build a multi-page frontend application without React or a build step
- Share state across pages using localStorage
- Structure reusable JavaScript utilities in a shared module
- Implement CRUD workflows with browser-native persistence
- Build drag-and-drop interactions with the Drag and Drop API
- Render analytical charts using Chart.js
- Calculate Agile metrics such as story points, sprint completion, and velocity
- Create responsive SaaS-style dashboards with Bootstrap and custom CSS
- Export and import structured JSON workspace data
- Design a polished portfolio project with realistic product workflows

## Architecture Notes

The application uses a multi-page frontend architecture. Each major product area has its own HTML file and its own JavaScript file, while shared behavior lives in `js/shared.js`.

`localStorage` is the source of truth for the workspace. The shared workspace model stores settings, team members, backlog items, sprints, the active sprint ID, and recent activity. If no saved workspace exists, demo data is seeded automatically.

The Kanban board uses the browser Drag and Drop API. When a card is dropped into a new column, the matching backlog item status is updated and saved back to localStorage so the change persists across refreshes and pages.

The burndown page uses Chart.js from a CDN. It calculates an ideal remaining-points line from the sprint date range and total sprint points, then compares it with an actual remaining-points line based on completed story points.

The project intentionally uses a no-build browser architecture. Bootstrap, Bootstrap Icons, jQuery, and Chart.js are loaded through CDNs, and the app can run locally by opening `index.html`.

## Folder Structure

```text
jira-lite-sprint-manager/
  index.html
  backlog.html
  sprint-planning.html
  kanban-board.html
  burndown.html
  team.html
  reports.html
  settings.html

  styles.css

  js/
    shared.js
    dashboard.js
    backlog.js
    sprint-planning.js
    kanban-board.js
    burndown.js
    team.js
    reports.js
    settings.js

  README.md
  LICENSE
  .gitignore
```

How To Run Locally
git clone https://github.com/fazal305/jira-lite-sprint-manager.git
cd jira-lite-sprint-manager
Open index.html directly in your browser.
No package installation, build command, or development server is required.
How To Use
Open index.html to view the dashboard.
Go to Team Members and add or edit the project team.
Go to Backlog and create work items with type, priority, story points, status, and assignee.
Go to Sprint Planning and create a sprint with start and end dates.
Add backlog items to the sprint.
Activate the sprint.
Go to Kanban Board and drag cards across To Do, In Progress, Review, and Done.
Go to Burndown to inspect ideal versus actual remaining story points.
Go to Reports to review workspace metrics and export a project report.
Go to Settings to export, import, reset, clear, or change the workspace theme.
Sample Workflow
Add team members such as a frontend developer, QA engineer, designer, and Scrum Master.
Create backlog items like login page, dashboard cards, mobile sidebar bug, and burndown chart.
Estimate each item with story points and assign priorities.
Create a sprint with a two-week date range.
Move ready backlog items into the sprint.
Activate the sprint.
Drag tasks across the Kanban board as work progresses.
Mark completed work as Done.
View the burndown chart to compare ideal progress with actual completion.
Export the report JSON for portfolio documentation or review.
