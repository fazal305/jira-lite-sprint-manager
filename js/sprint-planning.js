function renderSprints() {
    const workspace = loadWorkspace();

    if (!workspace.sprints.length) {
        $("#sprintList").html(renderEmptyState("No sprints created yet."));
        $("#selectedSprint").html('<option value="">No sprints available</option>');
        renderSprintItems("");
        renderSprintStats();
        return;
    }

    $("#sprintList").html(
        workspace.sprints
            .map((sprint) => {
                const items = getSprintItems(workspace, sprint.id);
                const points = calculateStoryPoints(items);
                const donePoints = calculateStoryPoints(items.filter((item) => item.status === "Done"));
                const progress = points ? Math.round((donePoints / points) * 100) : 0;
                const isActive = sprint.id === workspace.activeSprintId;

                return `
          <article class="task-card mb-3">
            <div class="d-flex justify-content-between gap-3 flex-wrap">
              <div>
                <h3 class="task-title">${escapeHtml(sprint.name)}</h3>
                <p class="task-description mb-2">
                  ${formatDate(sprint.startDate)} to ${formatDate(sprint.endDate)}
                </p>
                <div class="task-meta">
                  <span class="status-pill">${escapeHtml(sprint.status)}</span>
                  ${isActive ? '<span class="story-pill">Active</span>' : ""}
                  <span class="story-pill">${points} pts</span>
                  <span class="status-pill">${items.length} items</span>
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap align-items-start">
                <button class="btn btn-sm btn-soft" onclick="renderSprintItems('${sprint.id}')">
                  <i class="bi bi-eye me-1"></i>View
                </button>
                <button class="btn btn-sm btn-cyber" onclick="activateSprint('${sprint.id}')" ${sprint.status === "closed" ? "disabled" : ""}>
                  <i class="bi bi-lightning-charge me-1"></i>Activate
                </button>
                <button class="btn btn-sm btn-danger-soft" onclick="closeSprint('${sprint.id}')">
                  <i class="bi bi-lock me-1"></i>Close
                </button>
              </div>
            </div>

            <div class="mt-3">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted-custom">Completed points</span>
                <span class="mono">${progress}%</span>
              </div>
              <div class="progress">
                <div class="progress-bar" style="width: ${progress}%"></div>
              </div>
            </div>
          </article>
        `;
            })
            .join("")
    );

    $("#selectedSprint").html(
        workspace.sprints
            .map((sprint) => `<option value="${sprint.id}">${escapeHtml(sprint.name)} (${escapeHtml(sprint.status)})</option>`)
            .join("")
    );

    const selectedValue = $("#selectedSprint").val() || workspace.activeSprintId || workspace.sprints[0].id;
    $("#selectedSprint").val(selectedValue);
    loadBacklogPicker(selectedValue);
}

function createSprint() {
    const workspace = loadWorkspace();
    const name = $("#sprintName").val().trim();
    const startDate = $("#startDate").val();
    const endDate = $("#endDate").val();

    if (!name || !startDate || !endDate) {
        showStatus("Sprint name, start date, and end date are required.", "warning");
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        showStatus("Sprint end date must be after the start date.", "warning");
        return;
    }

    workspace.sprints.push({
        id: generateId("sprint"),
        name,
        startDate,
        endDate,
        status: "planned",
        createdAt: new Date().toISOString()
    });

    saveWorkspace(workspace);
    addActivity(`Created sprint: ${name}.`);
    $("#sprintForm")[0].reset();
    setDefaultDates();
    renderSprints();
    renderSprintStats();
    showStatus("Sprint created.");
}

function activateSprint(id) {
    const workspace = loadWorkspace();
    const sprint = workspace.sprints.find((entry) => entry.id === id);

    if (!sprint || sprint.status === "closed") return;

    workspace.sprints.forEach((entry) => {
        if (entry.status === "active") {
            entry.status = "planned";
        }
    });

    sprint.status = "active";
    workspace.activeSprintId = id;

    saveWorkspace(workspace);
    addActivity(`Activated sprint: ${sprint.name}.`);
    renderSprints();
    renderSprintStats();
    renderSprintItems(id);
    showStatus("Sprint activated.");
}

function closeSprint(id) {
    const workspace = loadWorkspace();
    const sprint = workspace.sprints.find((entry) => entry.id === id);

    if (!sprint) return;

    sprint.status = "closed";

    if (workspace.activeSprintId === id) {
        workspace.activeSprintId = null;
    }

    saveWorkspace(workspace);
    addActivity(`Closed sprint: ${sprint.name}.`);
    renderSprints();
    renderSprintStats();
    renderSprintItems(id);
    showStatus("Sprint closed.");
}

function addItemToSprint(itemId, sprintId) {
    if (!itemId || !sprintId) {
        showStatus("Choose a backlog item and sprint first.", "warning");
        return;
    }

    const workspace = loadWorkspace();
    const item = workspace.backlogItems.find((entry) => entry.id === itemId);
    const sprint = workspace.sprints.find((entry) => entry.id === sprintId);

    if (!item || !sprint) return;

    item.sprintId = sprintId;
    item.updatedAt = new Date().toISOString();

    saveWorkspace(workspace);
    addActivity(`Added ${item.title} to ${sprint.name}.`);
    renderSprints();
    renderSprintItems(sprintId);
    renderSprintStats();
    showStatus("Item added to sprint.");
}

function removeItemFromSprint(itemId) {
    const workspace = loadWorkspace();
    const item = workspace.backlogItems.find((entry) => entry.id === itemId);
    const previousSprint = workspace.sprints.find((sprint) => sprint.id === item?.sprintId);

    if (!item) return;

    item.sprintId = "";
    item.updatedAt = new Date().toISOString();

    saveWorkspace(workspace);
    addActivity(`Removed ${item.title} from ${previousSprint ? previousSprint.name : "sprint"}.`);
    renderSprints();
    renderSprintItems($("#selectedSprint").val());
    renderSprintStats();
    showStatus("Item removed from sprint.");
}

function renderSprintItems(sprintId) {
    const workspace = loadWorkspace();
    const currentSprintId = sprintId || $("#selectedSprint").val() || workspace.activeSprintId || "";
    $("#selectedSprint").val(currentSprintId);

    loadBacklogPicker(currentSprintId);

    if (!currentSprintId) {
        $("#sprintItems").html(renderEmptyState("Select a sprint to view its items."));
        return;
    }

    const items = getSprintItems(workspace, currentSprintId);
    const sprint = workspace.sprints.find((entry) => entry.id === currentSprintId);

    if (!items.length) {
        $("#sprintItems").html(renderEmptyState("This sprint has no items yet."));
        return;
    }

    $("#sprintItems").html(`
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="status-pill">${escapeHtml(sprint.name)}</span>
      <span class="story-pill">${calculateStoryPoints(items)} pts</span>
    </div>
    ${items
            .map(
                (item) => `
          <article class="activity-item mb-2">
            <div class="d-flex justify-content-between gap-2 align-items-start">
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <div class="task-meta mt-2">
                  <span class="badge-type type-${escapeHtml(item.type)}">${escapeHtml(item.type)}</span>
                  <span class="badge-priority priority-${escapeHtml(item.priority)}">${escapeHtml(item.priority)}</span>
                  <span class="status-pill">${escapeHtml(item.status)}</span>
                  <span class="story-pill">${Number(item.storyPoints)} pts</span>
                </div>
              </div>
              <button class="btn btn-sm btn-danger-soft" onclick="removeItemFromSprint('${item.id}')">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </article>
        `
            )
            .join("")}
  `);
}

function renderSprintStats() {
    const workspace = loadWorkspace();
    const activeSprint = getActiveSprint(workspace);
    const sprintItems = activeSprint ? getSprintItems(workspace, activeSprint.id) : [];
    const totalSprintPoints = calculateStoryPoints(sprintItems);
    const completedPoints = calculateStoryPoints(sprintItems.filter((item) => item.status === "Done"));

    const stats = [
        {
            label: "Total Sprints",
            value: workspace.sprints.length,
            note: "Created sprint windows",
            icon: "bi-calendar2-week"
        },
        {
            label: "Active Sprint",
            value: activeSprint ? activeSprint.name : "None",
            note: activeSprint ? `${formatDate(activeSprint.startDate)} to ${formatDate(activeSprint.endDate)}` : "Activate a sprint",
            icon: "bi-lightning-charge"
        },
        {
            label: "Sprint Points",
            value: totalSprintPoints,
            note: "Committed active sprint points",
            icon: "bi-gem"
        },
        {
            label: "Completed Points",
            value: completedPoints,
            note: "Done in active sprint",
            icon: "bi-check2-circle"
        }
    ];

    $("#sprintStats").html(
        stats
            .map(
                (stat) => `
          <article class="metric-card">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <p class="metric-label">${escapeHtml(stat.label)}</p>
                <p class="metric-value ${String(stat.value).length > 8 ? "fs-5 mt-3" : ""}">${escapeHtml(stat.value)}</p>
              </div>
              <i class="bi ${stat.icon} fs-4 text-info"></i>
            </div>
            <p class="metric-note">${escapeHtml(stat.note)}</p>
          </article>
        `
            )
            .join("")
    );
}

function loadBacklogPicker(sprintId) {
    const workspace = loadWorkspace();
    const sprint = workspace.sprints.find((entry) => entry.id === sprintId);
    const availableItems = workspace.backlogItems.filter((item) => !item.sprintId);

    if (!sprintId || !sprint) {
        $("#backlogPicker").html('<option value="">Select a sprint first</option>');
        return;
    }

    if (sprint.status === "closed") {
        $("#backlogPicker").html('<option value="">Closed sprint</option>');
        return;
    }

    if (!availableItems.length) {
        $("#backlogPicker").html('<option value="">No backlog items available</option>');
        return;
    }

    $("#backlogPicker").html(
        [
            '<option value="">Choose backlog item...</option>',
            ...availableItems.map(
                (item) => `<option value="${item.id}">${escapeHtml(item.title)} (${Number(item.storyPoints)} pts)</option>`
            )
        ].join("")
    );
}

function setDefaultDates() {
    const today = getTodayDate();
    const end = new Date(`${today}T00:00:00`);
    end.setDate(end.getDate() + 14);

    $("#startDate").val(today);
    $("#endDate").val(end.toISOString().slice(0, 10));
}

$(document).ready(function () {
    $("#sidebarMount").html(renderSidebar("sprint-planning"));
    setActiveNav();
    setDefaultDates();
    renderSprints();
    renderSprintStats();
    renderSprintItems(loadWorkspace().activeSprintId);

    $("#sprintForm").on("submit", function (event) {
        event.preventDefault();
        createSprint();
    });

    $("#selectedSprint").on("change", function () {
        renderSprintItems($(this).val());
    });

    $("#addToSprintBtn").on("click", function () {
        addItemToSprint($("#backlogPicker").val(), $("#selectedSprint").val());
    });
});