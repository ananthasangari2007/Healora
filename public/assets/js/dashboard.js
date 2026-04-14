const statsGrid = document.getElementById("statsGrid");
const reminderList = document.getElementById("reminderList");
const summaryPanel = document.getElementById("summaryPanel");

const renderStats = (summary) => {
  const cards = [
    { label: "Heart rate", value: `${summary.heartRate} bpm`, icon: "fa-solid fa-heart-pulse" },
    { label: "Water intake", value: `${summary.waterIntake} L`, icon: "fa-solid fa-droplet" },
    { label: "Steps", value: summary.steps.toLocaleString(), icon: "fa-solid fa-shoe-prints" },
    { label: "Sleep", value: `${summary.sleepHours} hrs`, icon: "fa-solid fa-moon" }
  ];

  statsGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <div class="icon-badge"><i class="${card.icon}"></i></div>
          <span>${card.label}</span>
          <strong>${card.value}</strong>
        </article>
      `
    )
    .join("");
};

const renderStack = (container, items, formatter) => {
  container.innerHTML = items.map(formatter).join("");
};

const loadDashboard = async () => {
  try {
    const [summaryResponse, remindersResponse] = await Promise.all([
      fetch("/api/summary"),
      fetch("/api/reminders")
    ]);

    const summary = await summaryResponse.json();
    const reminders = await remindersResponse.json();

    renderStats(summary);
    renderStack(
      reminderList,
      reminders,
      (item) => `
        <div class="stack-item">
          <strong><i class="fa-regular fa-bell"></i> ${item.time} - ${item.title}</strong>
          <span>${item.note}</span>
        </div>
      `
    );
    renderStack(
      summaryPanel,
      summary.highlights,
      (item) => `
        <div class="stack-item">
          <strong><i class="fa-solid fa-circle-check"></i> ${item.title}</strong>
          <span>${item.detail}</span>
        </div>
      `
    );
  } catch (error) {
    statsGrid.innerHTML = '<article class="stat-card"><strong>Unable to load dashboard</strong><span>Please try again later.</span></article>';
  }
};

loadDashboard();
