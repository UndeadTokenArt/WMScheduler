function openTab(event, tabName) {
  // Hide all tab contents
  const tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = "none";
  }

  // Remove the active class from all tab links
  const tabLinks = document.getElementsByClassName("tab-link");
  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = tabLinks[i].className.replace(" active", "");
  }

  // Show the current tab and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}

function addTab() {
  tabCount++;
  const tabId = `Tab${tabCount}`;

  // Create new tab button
  const newTabButton = document.createElement("button");
  newTabButton.className = "tab-link";
  newTabButton.textContent = `Tab ${tabCount}`;
  newTabButton.onclick = (event) => openTab(event, tabId);

  // Insert new tab button before the add-tab button
  const addTabBtn = document.querySelector(".add-tab-btn");
  addTabBtn.parentNode.insertBefore(newTabButton, addTabBtn);

  // Create new tab content
  const newTabContent = document.createElement("div");
  newTabContent.id = tabId;
  newTabContent.className = "tab-content";
  newTabContent.innerHTML = `<h3>Tab ${tabCount}</h3><p>Content for Tab ${tabCount}...</p>`;

  // Append new tab content to the main content area
  document.querySelector(".main-content").appendChild(newTabContent);
}