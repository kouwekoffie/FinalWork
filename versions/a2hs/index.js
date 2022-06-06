if ("serviceWorker" in navigator) {
  // if service-worker is supported in this browser
  navigator.serviceWorker.register("./service-worker.js").then(() => {
    console.log("Service Worker Registered");
  });
}
let deferredPrompt;

window.onload = () => {
  const addBtn = document.getElementById("add");
  // addBtn.style.display = "none";

  // Initialize deferredPrompt for use later to show browser install prompt.
  addBtn.addEventListener("click", async () => {
    // Hide the app provided install promotion
    // hideInstallPromotion();
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
  });
};

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallpromt");
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  // showInstallPromotion();
  // Optionally, send analytics event that PWA install promo was shown.
  console.log(`'beforeinstallprompt' event was fired.`);
});
