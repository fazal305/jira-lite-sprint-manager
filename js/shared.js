const STORAGE_KEY = "jiraLiteWorkspace";

const defaultWorkspace = {
    settings: {
        darkMode: true
    },
    teamMembers: [],
    backlogItems: [],
    sprints: [],
    activeSprintId: null,
    activityLog: []
};

function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function formatDate(dateString) {
    if (!dateString) return "Not set";
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

function loadWorkspace() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return seedDemoData();
    }

    try {
        return {
            ...structuredClone(defaultWorkspace),
            ...JSON.parse(saved)
        };
    } catch (error) {
        console.error("Workspace could not be parsed.", error);
        return seedDemoData();
    }
}

function saveWorkspace(workspace) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    applyDarkMode();
}

function resetWorkspace() {
    localStorage.removeItem(STORAGE_KEY);
    return seedDemoData();
}

function seedDemoData() {
    const now = new Date().toISOString();

    const teamMembers = [
        {
            id: "member-fazal",
            name: "Fazal Abbas",
            role: "Frontend Developer",
            avatarInitials: "FA",
            createdAt: now
        },
        {
            id: "member-sara",
            name: "Sara Khan",
            role: "Scrum Master",
            avatarInitials: "SK",
            createdAt: now
        },
        {
            id: "member-ali",
            name: "Ali Raza",
            role: "QA Engineer",
            avatarInitials: "AR",
            createdAt: now
        },
        {
            id: "member-zoya",
            name: "Zoya Malik",
            role: "Product Designer",
            avatarInitials: "ZM",
            createdAt: now
        }
    ];

    const sprints = [
        {
            id: "sprint-1",
            name: "Sprint 1",
            startDate: "2026-07-05",
            endDate: "2026-07-19",
            status: "active",
            createdAt: now
        },
        {
            id: "sprint-2",
            name: "Sprint 2",
            startDate: "2026-07-20",
            endDate: "2026-08-03",
            status: "planned",
            createdAt: now
        }
    ];

    const backlogItems = [
        {
            id: "task-login",
            title: "Build login page",
            description: "Create a responsive login screen with validation states.",
            type: "Story",
            priority: "High",
            status: "Done",
            storyPoints: 5,
            assigneeId: "member-fazal",
            sprintId: "sprint-1",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-dashboard",
            title: "Create dashboard cards",
            description: "Show sprint health, story points, and current workload.",
            type: "Story",
            priority: "High",
            status: "In Progress",
            storyPoints: 8,
            assigneeId: "member-fazal",
            sprintId: "sprint-1",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-sidebar-bug",
            title: "Fix mobile sidebar bug",
            description: "Ensure navigation is usable on small screens.",
            type: "Bug",
            priority: "Critical",
            status: "Review",
            storyPoints: 3,
            assigneeId: "member-ali",
            sprintId: "sprint-1",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-burndown",
            title: "Add sprint burndown chart",
            description: "Render ideal and actual remaining story points.",
            type: "Story",
            priority: "Medium",
            status: "To Do",
            storyPoints: 13,
            assigneeId: "member-sara",
            sprintId: "sprint-1",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-errors",
            title: "Improve API error handling",
            description: "Create clear client-side messaging for failed requests.",
            type: "Task",
            priority: "Medium",
            status: "To Do",
            storyPoints: 5,
            assigneeId: "member-ali",
            sprintId: "sprint-1",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-kanban-ui",
            title: "Design Kanban card UI",
            description: "Create compact cards with priority, assignee, and points.",
            type: "Task",
            priority: "High",
            status: "In Progress",
            storyPoints: 8,
            assigneeId: "member-zoya",
            sprintId: "sprint-1",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-filters",
            title: "Add search filters",
            description: "Filter work by type, priority, status, and assignee.",
            type: "Story",
            priority: "Medium",
            status: "To Do",
            storyPoints: 3,
            assigneeId: "member-fazal",
            sprintId: "",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-readme",
            title: "Write README documentation",
            description: "Document architecture, setup, workflows, and features.",
            type: "Task",
            priority: "Low",
            status: "To Do",
            storyPoints: 2,
            assigneeId: "member-sara",
            sprintId: "",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-dark-mode",
            title: "Add dark mode toggle",
            description: "Allow users to switch between dark and light themes.",
            type: "Story",
            priority: "Low",
            status: "To Do",
            storyPoints: 1,
            assigneeId: "member-zoya",
            sprintId: "",
            createdAt: now,
            updatedAt: now
        },
        {
            id: "task-export",
            title: "Export sprint report",
            description: "Download sprint and workspace data as JSON.",
            type: "Epic",
            priority: "Medium",
            status: "To Do",
            storyPoints: 13,
            assigneeId: "member-sara",
            sprintId: "sprint-2",
            createdAt: now,
            updatedAt: now
        }
    ];

    const workspace = {
        settings: {
            darkMode: true
        },
        teamMembers,
        backlogItems,
        sprints,
        activeSprintId: "sprint-1",
        activityLog: [
            {
                id: generateId("activity"),
                message: "Demo workspace seeded with backlog, sprint, and team data.",
                createdAt: now
            },
            {
                id: generateId("activity"),
                message: "Sprint 1 marked as active.",
                createdAt: now
            }
        ]
    };

    saveWorkspace(workspace);
    return workspace;
}

function getActiveSprint(workspace) {
    return workspace.sprints.find((sprint) => sprint.id === workspace.activeSprintId) || null;
}

function getSprintItems(workspace, sprintId) {
    return workspace.backlogItems.filter((item) => item.sprintId === sprintId);
}

function getTeamMemberName(workspace, memberId) {
    const member = workspace.teamMembers.find((teamMember) => teamMember.id === memberId);
    return member ? member.name : "Unassigned";
}

function calculateStoryPoints(items) {
    return items.reduce((total, item) => total + Number(item.storyPoints || 0), 0);
}

function calculateStatusCounts(items) {
    return items.reduce(
        (counts, item) => {
            counts[item.status] = (counts[item.status] || 0) + 1;
            return counts;
        },
        {
            "To Do": 0,
            "In Progress": 0,
            Review: 0,
            Done: 0
        }
    );
}

function addActivity(message) {
    const workspace = loadWorkspace();

    workspace.activityLog.unshift({
        id: generateId("activity"),
        message,
        createdAt: new Date().toISOString()
    });

    workspace.activityLog = workspace.activityLog.slice(0, 30);
    saveWorkspace(workspace);
}

function renderSidebar(activePage) {
    const pages = [
        { id: "dashboard", label: "Dashboard", href: "index.html", icon: "bi-speedometer2" },
        { id: "backlog", label: "Backlog", href: "backlog.html", icon: "bi-list-task" },
        { id: "sprint-planning", label: "Sprint Planning", href: "sprint-planning.html", icon: "bi-calendar2-week" },
        { id: "kanban-board", label: "Kanban Board", href: "kanban-board.html", icon: "bi-kanban" },
        { id: "burndown", label: "Burndown", href: "burndown.html", icon: "bi-graph-down-arrow" },
        { id: "team", label: "Team", href: "team.html", icon: "bi-people" },
        { id: "reports", label: "Reports", href: "reports.html", icon: "bi-bar-chart" },
        { id: "settings", label: "Settings", href: "settings.html", icon: "bi-gear" }
    ];

    const navItems = pages
        .map((page) => {
            const activeClass = page.id === activePage ? "active" : "";

            return `
        <li>
          <a class="nav-link ${activeClass}" href="${page.href}" data-page="${page.id}">
            <i class="bi ${page.icon} nav-icon"></i>
            <span>${page.label}</span>
          </a>
        </li>
      `;
        })
        .join("");

    return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">JL</div>
        <div>
          <p class="brand-title">Jira Lite</p>
          <p class="brand-subtitle">Sprint Manager</p>
        </div>
      </div>
      <ul class="nav-list">${navItems}</ul>
    </aside>

    <div class="mobile-topbar">
      <a class="brand" href="index.html">
        <div class="brand-mark">JL</div>
        <div>
          <p class="brand-title">Jira Lite</p>
          <p class="brand-subtitle">Sprint Manager</p>
        </div>
      </a>
      <button class="btn btn-soft" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav">
        <i class="bi bi-list"></i>
      </button>
    </div>

    <div class="offcanvas offcanvas-end" tabindex="-1" id="mobileNav">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">Navigation</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="nav-list">${navItems}</ul>
      </div>
    </div>
  `;
}

function setActiveNav() {
    const currentFile = window.location.pathname.split("/").pop() || "index.html";

    $(".nav-link").each(function () {
        const href = $(this).attr("href");
        $(this).toggleClass("active", href === currentFile);
    });
}

function clearFieldError(field) {
    $(field).removeClass("is-invalid");
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.style.display = "none";
    }
}

function markFieldError(field, message) {
    let feedback = field.nextElementSibling;
    if (!feedback || !feedback.classList.contains("invalid-feedback")) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        field.insertAdjacentElement("afterend", feedback);
    }

    $(field).addClass("is-invalid");
    feedback.textContent = message;
    feedback.style.display = "block";
}

function validateRequiredFields(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return true;

    let valid = true;
    let firstInvalid = null;

    form.querySelectorAll("[required]").forEach((field) => {
        const isEmpty = !String(field.value || "").trim();
        if (isEmpty) {
            valid = false;
            firstInvalid = firstInvalid || field;
            markFieldError(field, "This field is required.");
        } else {
            clearFieldError(field);
        }
    });

    if (firstInvalid) firstInvalid.focus();
    return valid;
}

$(document).on("input change", "[required]", function () {
    if (String(this.value || "").trim()) clearFieldError(this);
});

function showStatus(message, type = "success") {
    $(".status-message").remove();

    const status = $(`
    <div class="status-message ${type}">
      ${escapeHtml(message)}
    </div>
  `);

    $("body").append(status);

    setTimeout(() => {
        status.fadeOut(200, function () {
            $(this).remove();
        });
    }, 2600);
}

function renderEmptyState(message) {
    return `
    <div class="empty-state">
      <i class="bi bi-inboxes fs-3 d-block mb-2"></i>
      <p class="mb-0">${escapeHtml(message)}</p>
    </div>
  `;
}

function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

function copyText(text, message = "Copied to clipboard.") {
    if (!navigator.clipboard) {
        showStatus("Clipboard API is not available in this browser.", "warning");
        return;
    }

    navigator.clipboard
        .writeText(text)
        .then(() => showStatus(message))
        .catch(() => showStatus("Copy failed.", "danger"));
}

function applyDarkMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    let darkMode = true;

    if (saved) {
        try {
            darkMode = JSON.parse(saved).settings.darkMode;
        } catch (error) {
            darkMode = true;
        }
    }

    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
}

function setupPageTransitions() {
    const shell = $(".app-shell");
    const loaderMarkup = `
        <div class="page-loader" id="pageLoader" aria-live="polite" aria-hidden="true">
            <div class="page-loader-card">
                <div class="page-loader-mark">JL</div>
                <div>
                    <p class="page-loader-title">Jira Lite</p>
                    <p class="page-loader-text">Loading workspace</p>
                </div>
                <div class="page-loader-spinner" aria-hidden="true"></div>
            </div>
        </div>
    `;

    if (!$("#pageLoader").length) {
        $("body").append(loaderMarkup);
    }

    const loader = $("#pageLoader");

    requestAnimationFrame(() => {
        shell.removeClass("page-leaving").addClass("page-ready");
        loader.removeClass("is-visible").attr("aria-hidden", "true");
    });

    $(document).on("click", "a[href]", function (event) {
        const href = $(this).attr("href");

        if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("javascript:") ||
            $(this).attr("target") === "_blank" ||
            $(this).attr("download") ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        const nextUrl = new URL(href, window.location.href);

        if (nextUrl.origin !== window.location.origin || nextUrl.href === window.location.href) {
            return;
        }

        event.preventDefault();
        loader.addClass("is-visible").attr("aria-hidden", "false");
        shell.removeClass("page-ready").addClass("page-leaving");

        setTimeout(() => {
            window.location.href = nextUrl.href;
        }, 220);
    });

    window.addEventListener("pageshow", function () {
        $(".app-shell").removeClass("page-leaving").addClass("page-ready");
        $("#pageLoader").removeClass("is-visible").attr("aria-hidden", "true");
    });
}

$(document).ready(function () {
    applyDarkMode();
    setupPageTransitions();
});