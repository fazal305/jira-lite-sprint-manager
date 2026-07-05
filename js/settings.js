function toggleDarkMode() {
    const workspace = loadWorkspace();
    workspace.settings.darkMode = $("#darkModeToggle").is(":checked");

    saveWorkspace(workspace);
    applyDarkMode();
    addActivity(`Switched to ${workspace.settings.darkMode ? "dark" : "light"} mode.`);
    showStatus(`${workspace.settings.darkMode ? "Dark" : "Light"} mode enabled.`);
}

function exportWorkspace() {
    const workspace = loadWorkspace();
    downloadJson("jira-lite-workspace.json", workspace);
    addActivity("Exported full workspace JSON.");
    showStatus("Workspace exported.");
}

function importWorkspace(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
        try {
            const imported = JSON.parse(loadEvent.target.result);

            if (!imported.settings || !Array.isArray(imported.backlogItems) || !Array.isArray(imported.sprints)) {
                showStatus("Invalid workspace JSON structure.", "danger");
                return;
            }

            const workspace = {
                ...structuredClone(defaultWorkspace),
                ...imported,
                settings: {
                    ...defaultWorkspace.settings,
                    ...imported.settings
                }
            };

            saveWorkspace(workspace);
            addActivity("Imported workspace JSON.");
            syncSettingsUI();
            renderWorkspaceSummary();
            showStatus("Workspace imported.");
        } catch (error) {
            showStatus("Import failed. Check that the file is valid JSON.", "danger");
        } finally {
            $("#importWorkspaceInput").val("");
        }
    };

    reader.readAsText(file);
}

function resetDemoWorkspace() {
    const confirmed = confirm("Reset the workspace to demo data?");
    if (!confirmed) return;

    resetWorkspace();
    syncSettingsUI();
    renderWorkspaceSummary();
    showStatus("Demo workspace restored.");
}

function clearWorkspace() {
    const confirmed = confirm("Clear all Jira Lite localStorage data?");
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    syncSettingsUI();
    renderWorkspaceSummary();
    showStatus("Workspace cleared. Demo data will seed on the next page load.", "warning");
}

function renderWorkspaceSummary() {
    const workspace = loadWorkspace();
    const activeSprint = getActiveSprint(workspace);
    const totalPoints = calculateStoryPoints(workspace.backlogItems);
    const completedPoints = calculateStoryPoints(workspace.backlogItems.filter((item) => item.status === "Done"));

    const summary = [
        ["Theme", workspace.settings.darkMode ? "Dark" : "Light"],
        ["Team Members", workspace.teamMembers.length],
        ["Backlog Items", workspace.backlogItems.length],
        ["Sprints", workspace.sprints.length],
        ["Active Sprint", activeSprint ? activeSprint.name : "None"],
        ["Total Story Points", totalPoints],
        ["Completed Story Points", completedPoints],
        ["Activity Entries", workspace.activityLog.length]
    ];

    $("#workspaceSummary").html(
        summary
            .map(
                ([label, value]) => `
          <li class="compact-item d-flex justify-content-between gap-3">
            <span class="text-muted-custom">${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </li>
        `
            )
            .join("")
    );
}

function syncSettingsUI() {
    const workspace = loadWorkspace();
    $("#darkModeToggle").prop("checked", workspace.settings.darkMode);
    applyDarkMode();
}

$(document).ready(function () {
    $("#sidebarMount").html(renderSidebar("settings"));
    setActiveNav();

    syncSettingsUI();
    renderWorkspaceSummary();

    $("#darkModeToggle").on("change", toggleDarkMode);
    $("#exportWorkspaceBtn").on("click", exportWorkspace);
    $("#importWorkspaceInput").on("change", importWorkspace);
    $("#resetDemoBtn").on("click", resetDemoWorkspace);
    $("#clearWorkspaceBtn").on("click", clearWorkspace);
    $("#copyStorageKeyBtn").on("click", function () {
        copyText(STORAGE_KEY, "Storage key copied.");
    });
});