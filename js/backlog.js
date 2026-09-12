function renderBacklogItems() {
    const workspace = loadWorkspace();
    const items = filterBacklogItems(workspace);
    const sprintOptions = workspace.sprints
        .filter((sprint) => sprint.status !== "closed")
        .map((sprint) => `<option value="${sprint.id}">${escapeHtml(sprint.name)}</option>`)
        .join("");

    $("#backlogPointTotal").text(`${calculateStoryPoints(items)} pts`);

    if (!items.length) {
        $("#backlogList").html(renderEmptyState("No backlog items match the current filters."));
        return;
    }

    const rows = items
        .map((item) => {
            const sprint = workspace.sprints.find((entry) => entry.id === item.sprintId);
            const sprintName = sprint ? sprint.name : "Backlog";

            return `
        <article class="task-card mb-3">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h3 class="task-title">${escapeHtml(item.title)}</h3>
              <p class="task-description">${escapeHtml(item.description)}</p>
              <div class="task-meta">
                <span class="badge-type type-${escapeHtml(item.type)}">${escapeHtml(item.type)}</span>
                <span class="badge-priority priority-${escapeHtml(item.priority)}">${escapeHtml(item.priority)}</span>
                <span class="status-pill">${escapeHtml(item.status)}</span>
                <span class="story-pill">${Number(item.storyPoints)} pts</span>
                <span class="status-pill"><i class="bi bi-person me-1"></i>${escapeHtml(getTeamMemberName(workspace, item.assigneeId))}</span>
                <span class="status-pill"><i class="bi bi-calendar2-week me-1"></i>${escapeHtml(sprintName)}</span>
              </div>
            </div>

            <div class="d-flex gap-2 flex-wrap justify-content-end">
              <select class="form-select form-select-sm sprint-move-select" data-id="${item.id}">
                <option value="">Move to sprint...</option>
                ${sprintOptions}
              </select>
              <button class="btn btn-sm btn-soft" onclick="editBacklogItem('${item.id}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger-soft" onclick="deleteBacklogItem('${item.id}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </article>
      `;
        })
        .join("");

    $("#backlogList").html(rows);
}

function createBacklogItem() {
    if (!validateRequiredFields("#backlogForm")) {
        showStatus("Please fill in the required fields.", "warning");
        return;
    }

    const workspace = loadWorkspace();
    const id = $("#itemId").val();
    const now = new Date().toISOString();

    const itemData = {
        title: $("#itemTitle").val().trim(),
        description: $("#itemDescription").val().trim(),
        type: $("#itemType").val(),
        priority: $("#itemPriority").val(),
        status: $("#itemStatus").val(),
        storyPoints: Number($("#itemStoryPoints").val()),
        assigneeId: $("#itemAssignee").val(),
        updatedAt: now
    };

    if (!itemData.title) {
        showStatus("Backlog item title is required.", "warning");
        return;
    }

    if (id) {
        const item = workspace.backlogItems.find((entry) => entry.id === id);
        Object.assign(item, itemData);
        addActivity(`Updated backlog item: ${itemData.title}.`);
    } else {
        workspace.backlogItems.unshift({
            id: generateId("task"),
            ...itemData,
            sprintId: "",
            createdAt: now
        });
        addActivity(`Created backlog item: ${itemData.title}.`);
    }

    saveWorkspace(workspace);
    resetBacklogForm();
    renderBacklogItems();
    showStatus("Backlog item saved.");
}

function editBacklogItem(id) {
    const workspace = loadWorkspace();
    const item = workspace.backlogItems.find((entry) => entry.id === id);

    if (!item) return;

    $("#itemId").val(item.id);
    $("#itemTitle").val(item.title);
    $("#itemDescription").val(item.description);
    $("#itemType").val(item.type);
    $("#itemPriority").val(item.priority);
    $("#itemStatus").val(item.status);
    $("#itemStoryPoints").val(String(item.storyPoints));
    $("#itemAssignee").val(item.assigneeId);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteBacklogItem(id) {
    const workspace = loadWorkspace();
    const item = workspace.backlogItems.find((entry) => entry.id === id);

    if (!item) return;

    const confirmed = confirm(`Delete "${item.title}" from the backlog?`);
    if (!confirmed) return;

    workspace.backlogItems = workspace.backlogItems.filter((entry) => entry.id !== id);
    saveWorkspace(workspace);
    addActivity(`Deleted backlog item: ${item.title}.`);
    renderBacklogItems();
    showStatus("Backlog item deleted.");
}

function moveItemToSprint(id, sprintId) {
    if (!sprintId) return;

    const workspace = loadWorkspace();
    const item = workspace.backlogItems.find((entry) => entry.id === id);
    const sprint = workspace.sprints.find((entry) => entry.id === sprintId);

    if (!item || !sprint) return;

    item.sprintId = sprintId;
    item.updatedAt = new Date().toISOString();

    saveWorkspace(workspace);
    addActivity(`Moved ${item.title} to ${sprint.name}.`);
    renderBacklogItems();
    showStatus("Item moved to sprint.");
}

function filterBacklogItems(workspace = loadWorkspace()) {
    const search = $("#searchInput").val()?.toLowerCase() || "";
    const type = $("#typeFilter").val();
    const priority = $("#priorityFilter").val();
    const assignee = $("#assigneeFilter").val();
    const status = $("#statusFilter").val();

    return workspace.backlogItems.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search);

        return (
            matchesSearch &&
            (!type || item.type === type) &&
            (!priority || item.priority === priority) &&
            (!assignee || item.assigneeId === assignee) &&
            (!status || item.status === status)
        );
    });
}

function loadBacklogFormOptions() {
    const workspace = loadWorkspace();

    const memberOptions = [
        '<option value="">Unassigned</option>',
        ...workspace.teamMembers.map(
            (member) => `<option value="${member.id}">${escapeHtml(member.name)}</option>`
        )
    ].join("");

    const assigneeFilterOptions = [
        '<option value="">All assignees</option>',
        ...workspace.teamMembers.map(
            (member) => `<option value="${member.id}">${escapeHtml(member.name)}</option>`
        )
    ].join("");

    $("#itemAssignee").html(memberOptions);
    $("#assigneeFilter").html(assigneeFilterOptions);
}

function resetBacklogForm() {
    $("#backlogForm")[0].reset();
    $("#itemId").val("");
    $("#itemPriority").val("Medium");
    $("#itemStoryPoints").val("3");
    $("#itemStatus").val("To Do");
}

$(document).ready(function () {
    $("#sidebarMount").html(renderSidebar("backlog"));
    setActiveNav();
    loadBacklogFormOptions();
    renderBacklogItems();

    $("#backlogForm").on("submit", function (event) {
        event.preventDefault();
        createBacklogItem();
    });

    $("#cancelEditBtn").on("click", resetBacklogForm);

    $("#searchInput, #typeFilter, #priorityFilter, #assigneeFilter, #statusFilter").on("input change", function () {
        renderBacklogItems();
    });

    $(document).on("change", ".sprint-move-select", function () {
        moveItemToSprint($(this).data("id"), $(this).val());
    });
});