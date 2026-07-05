function renderTeamMembers() {
    const workspace = loadWorkspace();

    if (!workspace.teamMembers.length) {
        $("#teamMembers").html(`<div class="col-12">${renderEmptyState("No team members yet.")}</div>`);
        renderTeamStats();
        return;
    }

    $("#teamMembers").html(
        workspace.teamMembers
            .map((member) => {
                const assignedItems = workspace.backlogItems.filter((item) => item.assigneeId === member.id);
                const completedItems = assignedItems.filter((item) => item.status === "Done");
                const assignedPoints = calculateStoryPoints(assignedItems);
                const completedPoints = calculateStoryPoints(completedItems);

                return `
          <div class="col-md-6 col-xl-3">
            <article class="team-card h-100">
              <div class="team-card-top">
                <div class="avatar">${escapeHtml(member.avatarInitials)}</div>
                <div>
                  <h3 class="team-name">${escapeHtml(member.name)}</h3>
                  <p class="team-role">${escapeHtml(member.role)}</p>
                </div>
              </div>

              <div class="divider"></div>

              <div class="row g-2">
                <div class="col-6">
                  <div class="activity-item">
                    <p class="metric-label">Tasks</p>
                    <p class="metric-value fs-4">${assignedItems.length}</p>
                  </div>
                </div>
                <div class="col-6">
                  <div class="activity-item">
                    <p class="metric-label">Done</p>
                    <p class="metric-value fs-4">${completedItems.length}</p>
                  </div>
                </div>
                <div class="col-6">
                  <div class="activity-item">
                    <p class="metric-label">Assigned</p>
                    <p class="metric-value fs-4">${assignedPoints}</p>
                  </div>
                </div>
                <div class="col-6">
                  <div class="activity-item">
                    <p class="metric-label">Complete</p>
                    <p class="metric-value fs-4">${completedPoints}</p>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap mt-2">
                <button class="btn btn-sm btn-soft" onclick="editTeamMember('${member.id}')">
                  <i class="bi bi-pencil me-1"></i>Edit
                </button>
                <button class="btn btn-sm btn-danger-soft" onclick="deleteTeamMember('${member.id}')">
                  <i class="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            </article>
          </div>
        `;
            })
            .join("")
    );

    renderTeamStats();
}

function createTeamMember() {
    const workspace = loadWorkspace();
    const id = $("#memberId").val();
    const name = $("#memberName").val().trim();
    const role = $("#memberRole").val().trim();
    const initials = ($("#memberInitials").val().trim() || getInitials(name)).toUpperCase();

    if (!name || !role) {
        showStatus("Name and role are required.", "warning");
        return;
    }

    if (id) {
        const member = workspace.teamMembers.find((entry) => entry.id === id);
        Object.assign(member, {
            name,
            role,
            avatarInitials: initials
        });
        saveWorkspace(workspace);
        addActivity(`Updated team member: ${name}.`);
    } else {
        workspace.teamMembers.push({
            id: generateId("member"),
            name,
            role,
            avatarInitials: initials,
            createdAt: new Date().toISOString()
        });
        saveWorkspace(workspace);
        addActivity(`Added team member: ${name}.`);
    }

    resetTeamForm();
    renderTeamMembers();
    showStatus("Team member saved.");
}

function editTeamMember(id) {
    const workspace = loadWorkspace();
    const member = workspace.teamMembers.find((entry) => entry.id === id);

    if (!member) return;

    $("#memberId").val(member.id);
    $("#memberName").val(member.name);
    $("#memberRole").val(member.role);
    $("#memberInitials").val(member.avatarInitials);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteTeamMember(id) {
    const workspace = loadWorkspace();
    const member = workspace.teamMembers.find((entry) => entry.id === id);

    if (!member) return;

    const confirmed = confirm(`Delete "${member.name}"? Assigned items will become unassigned.`);
    if (!confirmed) return;

    workspace.teamMembers = workspace.teamMembers.filter((entry) => entry.id !== id);
    workspace.backlogItems.forEach((item) => {
        if (item.assigneeId === id) {
            item.assigneeId = "";
            item.updatedAt = new Date().toISOString();
        }
    });

    saveWorkspace(workspace);
    addActivity(`Deleted team member: ${member.name}.`);
    renderTeamMembers();
    showStatus("Team member deleted.");
}

function renderTeamStats() {
    const workspace = loadWorkspace();
    const assignedItems = workspace.backlogItems.filter((item) => item.assigneeId);
    const completedItems = assignedItems.filter((item) => item.status === "Done");
    const assignedPoints = calculateStoryPoints(assignedItems);
    const completedPoints = calculateStoryPoints(completedItems);

    const stats = [
        {
            label: "Team Members",
            value: workspace.teamMembers.length,
            note: "People in workspace",
            icon: "bi-people"
        },
        {
            label: "Assigned Tasks",
            value: assignedItems.length,
            note: "Tasks owned by the team",
            icon: "bi-person-check"
        },
        {
            label: "Assigned Points",
            value: assignedPoints,
            note: "Total assigned effort",
            icon: "bi-gem"
        },
        {
            label: "Completed Points",
            value: completedPoints,
            note: "Assigned work marked Done",
            icon: "bi-check2-circle"
        }
    ];

    $("#teamStats").html(
        stats
            .map(
                (stat) => `
          <article class="metric-card">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <p class="metric-label">${escapeHtml(stat.label)}</p>
                <p class="metric-value">${escapeHtml(stat.value)}</p>
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

function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 3);
}

function resetTeamForm() {
    $("#teamForm")[0].reset();
    $("#memberId").val("");
}

$(document).ready(function () {
    $("#sidebarMount").html(renderSidebar("team"));
    setActiveNav();
    renderTeamMembers();

    $("#teamForm").on("submit", function (event) {
        event.preventDefault();
        createTeamMember();
    });

    $("#cancelMemberEditBtn").on("click", resetTeamForm);
});