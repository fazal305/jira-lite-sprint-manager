function renderDashboard() {
    const workspace = loadWorkspace();
    const activeSprint = getActiveSprint(workspace);
    const sprintItems = activeSprint ? getSprintItems(workspace, activeSprint.id) : [];
    const completedItems = sprintItems.filter((item) => item.status === "Done");

    const backlogCount = workspace.backlogItems.filter((item) => !item.sprintId).length;
    const totalPoints = calculateStoryPoints(sprintItems);
    const completedPoints = calculateStoryPoints(completedItems);
    const progress = totalPoints ? Math.round((completedPoints / totalPoints) * 100) : 0;
    const statusCounts = calculateStatusCounts(sprintItems);

    renderMetricCards(workspace, {
        backlogCount,
        sprintItems,
        totalPoints,
        completedPoints,
        progress
    });

    renderActiveSprint(activeSprint, progress, statusCounts);
    renderRecentActivity(workspace.activityLog);
}

function renderMetricCards(workspace, stats) {
    const allStatusCounts = calculateStatusCounts(workspace.backlogItems);

    const cards = [
        {
            label: "Active Sprint Items",
            value: stats.sprintItems.length,
            note: "Work items currently in scope",
            icon: "bi-lightning-charge"
        },
        {
            label: "Backlog Items",
            value: stats.backlogCount,
            note: "Items waiting outside sprints",
            icon: "bi-inboxes"
        },
        {
            label: "Total Story Points",
            value: stats.totalPoints,
            note: "Committed active sprint points",
            icon: "bi-gem"
        },
        {
            label: "Completed Points",
            value: stats.completedPoints,
            note: `${stats.progress}% of sprint scope complete`,
            icon: "bi-check2-circle"
        },
        {
            label: "To Do",
            value: allStatusCounts["To Do"],
            note: "Items not started",
            icon: "bi-circle"
        },
        {
            label: "In Progress",
            value: allStatusCounts["In Progress"],
            note: "Items actively moving",
            icon: "bi-arrow-repeat"
        },
        {
            label: "Review",
            value: allStatusCounts.Review,
            note: "Items awaiting validation",
            icon: "bi-eye"
        },
        {
            label: "Done",
            value: allStatusCounts.Done,
            note: "Completed workspace items",
            icon: "bi-trophy"
        }
    ];

    $("#metricCards").html(
        cards
            .map(
                (card) => `
          <article class="metric-card">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <p class="metric-label">${escapeHtml(card.label)}</p>
                <p class="metric-value">${card.value}</p>
              </div>
              <i class="bi ${card.icon} fs-4 text-info"></i>
            </div>
            <p class="metric-note">${escapeHtml(card.note)}</p>
          </article>
        `
            )
            .join("")
    );
}

function renderActiveSprint(activeSprint, progress, statusCounts) {
    if (!activeSprint) {
        $("#activeSprintDates").text("No active sprint selected.");
        $("#activeSprintStatus").text("None");
        $("#sprintProgressLabel").text("0%");
        $("#sprintProgressBar").css("width", "0%");
        $("#statusBreakdown").html(renderEmptyState("Activate a sprint to see sprint progress."));
        return;
    }

    $("#activeSprintDates").text(
        `${activeSprint.name} · ${formatDate(activeSprint.startDate)} to ${formatDate(activeSprint.endDate)}`
    );
    $("#activeSprintStatus").text(activeSprint.status);
    $("#sprintProgressLabel").text(`${progress}%`);
    $("#sprintProgressBar").css("width", `${progress}%`);

    const statusCards = Object.entries(statusCounts).map(([status, count]) => {
        return `
      <div class="col-sm-6 col-xl-3">
        <div class="activity-item h-100">
          <p class="metric-label">${escapeHtml(status)}</p>
          <p class="metric-value fs-3">${count}</p>
        </div>
      </div>
    `;
    });

    $("#statusBreakdown").html(statusCards.join(""));
}

function renderRecentActivity(activityLog) {
    if (!activityLog.length) {
        $("#activityList").html(renderEmptyState("No activity yet."));
        return;
    }

    $("#activityList").html(
        activityLog
            .slice(0, 8)
            .map(
                (activity) => `
          <li class="activity-item">
            <div>${escapeHtml(activity.message)}</div>
            <div class="activity-time">${new Date(activity.createdAt).toLocaleString()}</div>
          </li>
        `
            )
            .join("")
    );
}

$(document).ready(function () {
    $("#sidebarMount").html(renderSidebar("dashboard"));
    setActiveNav();
    renderDashboard();
});