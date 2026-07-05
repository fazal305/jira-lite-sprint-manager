const KANBAN_STATUSES = ["To Do", "In Progress", "Review", "Done"];

function renderKanbanBoard() {
    const workspace = loadWorkspace();
    const selectedSprintId = $("#boardSprintFilter").val() || workspace.activeSprintId;
    const sprint = workspace.sprints.find((entry) => entry.id === selectedSprintId);
    const items = filterKanbanCards(workspace, selectedSprintId);
    const counts = calculateStatusCounts(items);

    $("#boardSprintName").text(sprint ? sprint.name : "No sprint selected");
    $("#boardPointTotal").text(`${calculateStoryPoints(items)} pts`);

    if (!sprint) {
        $("#kanbanBoard").html(renderEmptyState("Create or activate a sprint before using the board."));
        return;
    }

    $("#kanbanBoard").html(
        KANBAN_STATUSES.map((status) => {
            const statusItems = items.filter((item) => item.status === status);

            return `
        <article class="kanban-column">
          <div class="kanban-column-header">
            <h2 class="kanban-column-title">${escapeHtml(status)}</h2>
            <span class="kanban-count">${counts[status] || 0}</span>
          </div>
          <div class="kanban-dropzone" data-status="${escapeHtml(status)}">
            ${statusItems.length ? statusItems.map(createKanbanCard).join("") : renderEmptyState("No cards")}
          </div>
        </article>
      `;
        }).join("")
    );

    enableDragAndDrop();
}

function createKanbanCard(item) {
    const workspace = loadWorkspace();

    return `
    <article class="task-card"
      draggable="true"
      data-id="${escapeHtml(item.id)}"
      data-title="${escapeHtml(item.title)}">
      <h3 class="task-title">${escapeHtml(item.title)}</h3>
      <p class="task-description">${escapeHtml(item.description)}</p>
      <div class="task-meta">
        <span class="badge-type type-${escapeHtml(item.type)}">${escapeHtml(item.type)}</span>
        <span class="badge-priority priority-${escapeHtml(item.priority)}">${escapeHtml(item.priority)}</span>
        <span class="story-pill">${Number(item.storyPoints)} pts</span>
        <span class="status-pill">
          <i class="bi bi-person me-1"></i>${escapeHtml(getTeamMemberName(workspace, item.assigneeId))}
        </span>
      </div>
    </article>
  `;
}

function enableDragAndDrop() {
    $(".task-card[draggable='true']").on("dragstart", handleDragStart);
    $(".task-card[draggable='true']").on("dragend", function () {
        $(this).removeClass("dragging");
    });

    $(".kanban-dropzone").on("dragover", handleDragOver);
    $(".kanban-dropzone").on("dragleave", function () {
        $(this).removeClass("drag-over");
    });
    $(".kanban-dropzone").on("drop", handleDrop);
}

function handleDragStart(event) {
    const id = $(event.currentTarget).data("id");
    event.originalEvent.dataTransfer.setData("text/plain", id);
    event.originalEvent.dataTransfer.effectAllowed = "move";
    $(event.currentTarget).addClass("dragging");
}

function handleDragOver(event) {
    event.preventDefault();
    event.originalEvent.dataTransfer.dropEffect = "move";
    $(event.currentTarget).addClass("drag-over");
}

function handleDrop(event) {
    event.preventDefault();

    const itemId = event.originalEvent.dataTransfer.getData("text/plain");
    const status = $(event.currentTarget).data("status");

    $(".kanban-dropzone").removeClass("drag-over");

    if (!itemId || !status) return;

    updateItemStatus(itemId, status);
}

function updateItemStatus(itemId, status) {
    const workspace = loadWorkspace();
    const item = workspace.backlogItems.find((entry) => entry.id === itemId);

    if (!item) return;

    const previousStatus = item.status;
    item.status = status;
    item.updatedAt = new Date().toISOString();

    saveWorkspace(workspace);

    if (previousStatus !== status) {
        addActivity(`Moved ${item.title} from ${previousStatus} to ${status}.`);
    }

    renderKanbanBoard();
    showStatus(`Moved to ${status}.`);
}

function filterKanbanCards(workspace = loadWorkspace(), sprintId = $("#boardSprintFilter").val()) {
    const search = $("#boardSearch").val()?.toLowerCase() || "";
    const priority = $("#boardPriorityFilter").val();
    const assignee = $("#boardAssigneeFilter").val();
    const type = $("#boardTypeFilter").val();

    return workspace.backlogItems.filter((item) => {
        const matchesSprint = item.sprintId === sprintId;
        const matchesSearch =
            item.title.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search);

        return (
            matchesSprint &&
            matchesSearch &&
            (!priority || item.priority === priority) &&
            (!assignee || item.assigneeId === assignee) &&
            (!type || item.type === type)
        );
    });
}

function loadKanbanFilters() {
    const workspace = loadWorkspace();

    $("#boardAssigneeFilter").html(
        [
            '<option value="">All assignees</option>',
            ...workspace.teamMembers.map(
                (member) => `<option value="${member.id}">${escapeHtml(member.name)}</option>`
            )
        ].join("")
    );

    $("#boardSprintFilter").html(
        workspace.sprints.length
            ? workspace.sprints
                .map((sprint) => `<option value="${sprint.id}">${escapeHtml(sprint.name)} (${escapeHtml(sprint.status)})</option>`)
                .join("")
            : '<option value="">No sprints available</option>'
    );

    if (workspace.activeSprintId) {
        $("#boardSprintFilter").val(workspace.activeSprintId);
    }
}

$(document).ready(function () {
    $("#sidebarMount").html(renderSidebar("kanban-board"));
    setActiveNav();
    loadKanbanFilters();
    renderKanbanBoard();

    $("#boardSearch, #boardPriorityFilter, #boardAssigneeFilter, #boardTypeFilter, #boardSprintFilter").on(
        "input change",
        function () {
            renderKanbanBoard();
        }
    );
});