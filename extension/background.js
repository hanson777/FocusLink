const BASE_URL = "http://localhost:5173"; 

document.getElementById("connect").addEventListener("click", () => {
  chrome.tabs.create({
    url: `${BASE_URL}/extension-connect`,
  });
});
