document.getElementById("connect").addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://yourapp.com/extension-connect"
    });
  });