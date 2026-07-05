let burndownChart = null;

function renderBurndownChart() {
    const workspace = loadWorkspace();
    const sprintId = $("#sprintSelector").val() || workspace.activeSprintId;
    const sprint = workspace.sprints.find((entry) => entry.id === sprintId);

    if (!sprint) {
        $("#chartCaption").text("No sprint available.");
        $("#chartTotalPoints").text("0 pts");
        renderBurndownStats();
        return;
    }

    const items = getSprintItems(workspace, sprint.id);
    const totalPoints = calculateStoryPoints(items);
    const ideal = calculateIdealBurndown(sprint, totalPoints);
    const actual = calculateActualBurndown(sprint, items);
    const labels = ideal.map((point) => point.label);

    $("#chartCaption").text(`${sprint.name} · ${formatDate(sprint.startDate)} to ${formatDate(sprint.endDate)}`);
    $("#chartTotalPoints").text(`${totalPoints} pts`);

    const canvas = document.getElementById("burndownCanvas");

    if (burndownChart) {
        burndownChart.destroy();
    }

    burndownChart = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Ideal Remaining",
                    data: ideal.map((point) => point.remaining),
                    borderColor: "#22d3ee",
                    backgroundColor: "rgba(34, 211, 238, 0.14)",
                    borderWidth: 3,
                    pointRadius: 3,
                    tension: 0.24
                },
                {
                    label: "Actual Remaining",
                    data: actual.map((point) => point.remaining),
                    borderColor: "#a855f7",
                    backgroundColor: "rgba(168, 85, 247, 0.18)",
                    borderWidth: 3,
                    pointRadius: 4,
                    tension: 0.24
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text")
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y} pts`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue("--muted")
                    },
                    grid: {
                        color: "rgba(154, 171, 199, 0.12)"
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue("--muted")
                    },
                    grid: {
                        color: "rgba(154, 171, 199, 0.12)"
                    }
                }
            }
        }
    });

    renderBurndownStats();
}

function calculateIdealBurndown(sprint, totalPoints) {
    const start = new Date(`${sprint.startDate}T00:00:00`);
    const end = new Date(`${sprint.endDate}T00:00:00`);
    const days = Math.max(1, Math.round((end - start) / 86400000));
    const pointsPerDay = totalPoints / days;
    const data = [];

    for (let day = 0; day <= days; day += 1) {
        const current = new Date(start);
        current.setDate(start.getDate() + day);

        data.push({
            label: current.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            remaining: Math.max(0, Math.round(totalPoints - pointsPerDay * day))
        });
    }

    return data;
}

function calculateActualBurndown(sprint, items) {
    const start = new Date(`${sprint.startDate}T00:00:00`);
    const end = new Date(`${sprint.endDate}T00:00:00`);
    const today = new Date(`${getTodayDate()}T00:00:00`);
    const days = Math.max(1, Math.round((end - start) / 86400000));
    const totalPoints = calculateStoryPoints(items);
    const doneItems = items.filter((item) => item.status === "Done");
    const donePoints = calculateStoryPoints(doneItems);
    const data = [];

    for (let day = 0; day <= days; day += 1) {
        const current = new Date(start);
        current.setDate(start.getDate() + day);

        let remaining = totalPoints;

        if (current <= today) {
            const elapsedRatio = Math.min(1, Math.max(0, day / days));
            const simulatedCompleted = Math.round(donePoints * elapsedRatio);
            remaining = Math.max(0, totalPoints - simulatedCompleted);
        } else {
            remaining = null;
        }

        if (day === days && sprint.status === "closed") {
            remaining = Math.max(0, totalPoints - donePoints);
        }

        data.push({
            label: current.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            remaining
        });
    }

    return data;
}

function renderBurndownStats() {
    const workspace = loadWorkspace();
    const sprintId = $("#sprintSelector").val() || workspace.activeSprintId;
    const sprint = workspace.sprints.find((entry) => entry.id === sprintId);
    const items = sprint ? getSprintItems(workspace, sprint.id) : [];
    const totalPoints = calculateStoryPoints(items);
    const completedPoints = calculateStoryPoints(items.filter((item) => item.status === "Done"));
    const remainingPoints = Math.max(0, totalPoints - completedPoints);
    const progress = totalPoints ? Math.round((completedPoints / totalPoints) * 100) : 0;

    const stats = [
        {
            label: "Completed",
            value: completedPoints,
            note: "Done story points"
        },
        {
            label: "Remaining",
            value: remainingPoints,
            note: "Open story points"
        },
        {
            label: "Progress",
            value: `${progress}%`,
            note: "Sprint completion"
        },
        {
            label: "Items",
            value: items.length,
            note: "Sprint work items"
        }
    ];

    $("#burndownStats").html(
        stats
            .map(
                (stat) => `
          <article class="metric-card">
            <p class="metric-label">${escapeHtml(stat.label)}</p>
            <p class="metric-value fs-4">${escapeHtml(stat.value)}</p>
            <p class="metric-note">${escapeHtml(stat.note)}</p>
          </article>
        `
            )
            .join("")
    );
}

function loadSprintSelector() {
    const workspace = loadWorkspace();

    if (!workspace.sprints.length) {
        $("#sprintSelector").html('<option value="">No sprints available</option>');
        return;
    }

    $("#sprintSelector").html(
        workspace.sprints
            .map((sprint) => `<option value="${sprint.id}">${escapeHtml(sprint.name)} (${escapeHtml(sprint.status)})</option>`)
            .join("")
    );

    if (workspace.activeSprintId) {
        $("#sprintSelector").val(workspace.activeSprintId);
    }
}

$(document).ready(function () {
    $("#sidebarMount").html(renderSidebar("burndown"));
    setActiveNav();
    loadSprintSelector();
    renderBurndownChart();

    $("#sprintSelector").on("change", renderBurndownChart);
});