const contactForm = document.getElementById("contactForm");
const contactResult = document.getElementById("contactResult");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = Object.fromEntries(new FormData(contactForm).entries());

  contactResult.innerHTML = "<p class=\"eyebrow\">Support flow</p><h2>Sending your message...</h2><p>Please wait a moment.</p>";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    contactResult.innerHTML = `
      <p class="eyebrow">Support flow</p>
      <h2 class="status-success">${data.status}</h2>
      <p>${data.message}</p>
    `;
    contactForm.reset();
  } catch (error) {
    contactResult.innerHTML = `
      <p class="eyebrow">Support flow</p>
      <h2 class="status-error">Message not sent</h2>
      <p>Please try again after the server is running.</p>
    `;
  }
});
