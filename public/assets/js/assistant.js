const checkinForm = document.getElementById("checkinForm");
const assistantResult = document.getElementById("assistantResult");

checkinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(checkinForm);
  const payload = Object.fromEntries(formData.entries());

  assistantResult.innerHTML = "<p class=\"eyebrow\">Assistant response</p><h2>Generating your guidance...</h2><p>Please wait a moment.</p>";

  try {
    const response = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    assistantResult.innerHTML = `
      <p class="eyebrow">Assistant response</p>
      <h2>${data.greeting}</h2>
      <p>${data.message}</p>
      <ul>
        <li><strong>Focus:</strong> ${data.focus}</li>
        <li><strong>Next step:</strong> ${data.nextStep}</li>
        <li><strong>Encouragement:</strong> ${data.encouragement}</li>
      </ul>
    `;
  } catch (error) {
    assistantResult.innerHTML = `
      <p class="eyebrow">Assistant response</p>
      <h2 class="status-error">Something went wrong</h2>
      <p>We could not generate guidance right now. Please try again.</p>
    `;
  }
});
