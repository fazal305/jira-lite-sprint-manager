function renderReportCards() {
    const workspace = loadWorkspace();
    const allPoints = calculateStoryPoints(workspace.backlogItems);
    const completedPoints = calculateStoryPoints(workspace.backlogItems.filter((item) => item.status === "Done"));
    const activeSprint = getActiveSprint(workspace);
    const velocity = calculateVelocity();

    const cards = [
        {
            label: "Workspace Items",
            value: workspace.backlogItems.length,
            note: "Total backlog and sprint work",
            icon: "bi-list-task"
        },
        {
            label: "Total Points",
            value: allPoints,
            note: "Estimated workspace effort",
            icon: "bi-gem"
        },
        {
            label: "Completed Points",
            value: completedPoints,
            note: "Points marked Done",
            icon: "bi-check2-circle"
        },
        {
            label: "Velocity Estimate",
            value: velocity,
            note: "Average completed points per closed sprint",
            icon: "bi-speedometer"
        },
        {
            label: "Sprints",
            value: workspace.sprints.length,
            note: "Planned, active, and closed",
            icon: "bi-calendar2-week"
        },
        {
            label: "Active Sprint",
            value: activeSprint ? activeSprint.name : "None",
            note: activeSprint ? `${formatDate(activeSprint.startDate)} to ${formatDate(activeSprint.endDate)}` : "No sprint active",
            icon: "bi-lightning-charge"
        },
        {
            label: "Team Members",
            value: workspace.teamMembers.length,
            note: "People in workspace",
            icon: "bi-people"
        },
        {
            label: "Completion",
            value: allPoints ? `${Math.round((completedPoints / allPoints) * 100)}%` : "0%",
            note: "Completed points ratio",
            icon: "bi-pie-chart"
        }
    ];

    $("#reportCards").html(
        cards
            .map(
                (card) => `
          <article class="metric-card">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <p class="metric-label">${escapeHtml(card.label)}</p>
                <p class="metric-value ${String(card.value).length > 8 ? "fs-5 mt-3" : ""}">${escapeHtml(card.value)}</p>
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

function renderStatusReport() {
    const workspace = loadWorkspace();
    const counts = calculateStatusCounts(workspace.backlogItems);
    const total = workspace.backlogItems.length || 1;

    $("#statusReport").html(
        Object.entries(counts)
            .map(([status, count]) => {
                const percent = Math.round((count / total) * 100);

                return `
          <div class="activity-item mb-2">
            <div class="d-flex justify-content-between mb-2">
              <strong>${escapeHtml(status)}</strong>
              <span class="mono">${count} items · ${percent}%</span>
            </div>
            <div class="progress">
              <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
          </div>
        `;
            })
            .join("")
    );
}

function renderPriorityReport() {
    const workspace = loadWorkspace();
    const priorities = ["Critical", "High", "Medium", "Low"];
    const total = workspace.backlogItems.length || 1;

    $("#priorityReport").html(
        priorities
            .map((priority) => {
                const items = workspace.backlogItems.filter((item) => item.priority === priority);
                const percent = Math.round((items.length / total) * 100);

                return `
          <div class="activity-item mb-2">
            <div class="d-flex justify-content-between mb-2">
              <span class="badge-priority priority-${escapeHtml(priority)}">${escapeHtml(priority)}</span>
              <span class="mono">${items.length} items · ${calculateStoryPoints(items)} pts</span>
            </div>
            <div class="progress">
              <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
          </div>
        `;
            })
            .join("")
    );
}

function renderAssigneeReport() {
    const workspace = loadWorkspace();
    const rows = [
        ...workspace.teamMembers.map((member) => ({
            id: member.id,
            name: member.name,
            role: member.role
        })),
        {
            id: "",
            name: "Unassigned",
            role: "No owner"
        }
    ];

    $("#assigneeReport").html(`
    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead>
          <tr>
            <th>Assignee</th>
            <th>Role</th>
            <th>Tasks</th>
            <th>Done</th>
            <th>Story Points</th>
            <th>Completed Points</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => {
                const items = workspace.backlogItems.filter((item) => item.assigneeId === row.id);
                const done = items.filter((item) => item.status === "Done");

                return `
                <tr>
                  <td>${escapeHtml(row.name)}</td>
                  <td>${escapeHtml(row.role)}</td>
                  <td>${items.length}</td>
                  <td>${done.length}</td>
                  <td>${calculateStoryPoints(items)}</td>
                  <td>${calculateStoryPoints(done)}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `);
}

function calculateVelocity() {
    const workspace = loadWorkspace();
    const closedSprints = workspace.sprints.filter((sprint) => sprint.status === "closed");

    if (!closedSprints.length) return 0;

    const completedPoints = closedSprints.reduce((total, sprint) => {
        const sprintItems = getSprintItems(workspace, sprint.id);
        return total + calculateStoryPoints(sprintItems.filter((item) => item.status === "Done"));
    }, 0);

    return Math.round(completedPoints / closedSprints.length);
}

function exportProjectReport() {
    const workspace = loadWorkspace();
    const report = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalItems: workspace.backlogItems.length,
            totalStoryPoints: calculateStoryPoints(workspace.backlogItems),
            completedStoryPoints: calculateStoryPoints(workspace.backlogItems.filter((item) => item.status === "Done")),
            velocityEstimate: calculateVelocity(),
            teamMembers: workspace.teamMembers.length,
            sprints: workspace.sprints.length
        },
        statusCounts: calculateStatusCounts(workspace.backlogItems),
        sprints: workspace.sprints.map((sprint) => {
            const items = getSprintItems(workspace, sprint.id);

            return {
                ...sprint,
                itemCount: items.length,
                storyPoints: calculateStoryPoints(items),
                completedStoryPoints: calculateStoryPoints(items.filter((item) => item.status === "Done"))
            };
        }),
        backlogItems: workspace.backlogItems,
        teamMembers: workspace.teamMembers
    };

    downloadJson("jira-lite-project-report.json", report);
    addActivity("Exported project report JSON.");
    showStatus("Project report exported.");
}

$(document).ready(function () {
    $("#sidebarMount").html(renderSidebar("reports"));
    setActiveNav();

    renderReportCards();
    renderStatusReport();
    renderPriorityReport();
    renderAssigneeReport();

    $("#exportReportBtn").on("click", exportProjectReport);
});