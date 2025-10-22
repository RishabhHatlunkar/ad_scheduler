/*********************************************************************
 * SLOT-BASED GREEDY SCHEDULER (v2)
 *********************************************************************/
function scheduleAdsSlotBased(adList, totalDays, slotsPerDay) {
  // 1. Create the schedule grid, initialized to null
  const schedule = Array.from({ length: totalDays }, () =>
    Array(slotsPerDay).fill(null)
  );

  // 2. Create a flat list of all individual ad "parts" (ad-slots)
  let allAdSlots = [];
  for (const ad of adList) {
    if (ad.duration <= 0) continue; // Skip invalid ads
    const profitPerSlot = ad.profit / ad.duration;
    for (let i = 1; i <= ad.duration; i++) {
      allAdSlots.push({
        ad: ad, // Reference to the parent ad
        part: i, // Which part of the ad this is (e.g., 1 of 3)
        profitPerSlot: profitPerSlot,
      });
    }
  }

  // 3. Sort all ad-slots by their profit density (highest first)
  allAdSlots.sort((a, b) => b.profitPerSlot - a.profitPerSlot);

  let totalProfit = 0;

  // 4. Iterate through every high-profit ad-slot and try to place it
  for (const adSlotToPlace of allAdSlots) {
    const ad = adSlotToPlace.ad;
    let placed = false;

    // Try to place it before its deadline
    for (let d = 0; d < ad.deadline && d < totalDays; d++) {
      for (let s = 0; s < slotsPerDay; s++) {
        // --- VALIDATION 1: Is the slot empty? ---
        if (schedule[d][s] !== null) {
          continue; // Slot is already taken
        }

        // --- VALIDATION 2: Check constraints against the *previous* slot ---
        const prevSlotData =
          s > 0
            ? schedule[d][s - 1]
            : d > 0
            ? schedule[d - 1][slotsPerDay - 1]
            : null;

        if (prevSlotData) {
          if (prevSlotData.ad.name === ad.name) {
            continue;
          }
          if (prevSlotData.ad.category === ad.category) {
            continue;
          }
        }

        // --- PLACEMENT ---
        schedule[d][s] = adSlotToPlace;
        totalProfit += adSlotToPlace.profitPerSlot;
        placed = true;
        break;
      }
      if (placed) {
        break;
      }
    }
  }

  return {
    schedule: schedule, // The 2D grid
    totalProfit: totalProfit.toFixed(2),
  };
}

/*********************************************************************
 * UI Handling (with LocalStorage + CRUD)
 *********************************************************************/
const adForm = document.getElementById("adForm");
const adTableBody = document.querySelector("#adTable tbody");
const runButton = document.getElementById("runScheduler");
const clearAdsButton = document.getElementById("clearAdsButton");
const outputDiv = document.getElementById("scheduleOutput");
const profitOutput = document.getElementById("profitOutput");
const summaryOutput = document.getElementById("summaryOutput");

// --- NEW: Edit/Delete UI Elements ---
const submitAdBtn = document.getElementById("submitAdBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const STORAGE_KEY = "adSchedulerAds";
let ads = [];
let currentEditId = null; // --- NEW: State to track editing ---

// --- NEW: Function to save ads to localStorage ---
function saveAdsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
}

// --- UPDATED: Load ads and ensure they have IDs ---
function loadAdsFromStorage() {
  const adsJSON = localStorage.getItem(STORAGE_KEY);
  if (adsJSON) {
    ads = JSON.parse(adsJSON);
    // Add unique IDs to ads loaded from storage if they don't have one
    ads.forEach((ad, index) => {
      if (!ad.id) {
        ad.id = Date.now() + index; // Simple unique ID
      }
    });
    updateAdTable();
  }
}

// --- UPDATED: Form listener now handles ADD and EDIT ---
adForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const adData = {
    id: currentEditId || Date.now(), // Use existing ID or create new one
    name: document.getElementById("adName").value.trim(),
    category: document.getElementById("adCategory").value.trim(),
    duration: parseInt(document.getElementById("adDuration").value),
    profit: parseInt(document.getElementById("adProfit").value),
    deadline: parseInt(document.getElementById("adDeadline").value),
  };

  if (!adData.category) {
    alert("Please select a category.");
    return;
  }
  if (!adData.name || !adData.duration || !adData.profit || !adData.deadline) {
    alert("Please fill all fields.");
    return;
  }

  if (currentEditId === null) {
    // --- ADD MODE ---
    ads.push(adData);
  } else {
    // --- EDIT MODE ---
    const index = ads.findIndex((ad) => ad.id === currentEditId);
    ads[index] = adData;
  }

  saveAdsToStorage();
  updateAdTable();
  resetFormMode(); // Reset form after add or edit
});

// --- NEW: Cancel Edit button listener ---
cancelEditBtn.addEventListener("click", resetFormMode);

// --- NEW: Resets the form to "Add" mode ---
function resetFormMode() {
  adForm.reset();
  document.getElementById("adCategory").value = ""; // Reset select
  submitAdBtn.textContent = "➕ Add Ad";
  cancelEditBtn.classList.add("hidden");
  currentEditId = null;
}

// --- UPDATED: Now builds table with Edit/Delete buttons ---
function updateAdTable() {
  adTableBody.innerHTML = "";
  ads.forEach((ad) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ad.name}</td>
      <td>${ad.category}</td>
      <td>${ad.duration}</td>
      <td>$${ad.profit}</td>
      <td>${ad.deadline}</td>
    `;

    // Create Actions Cell
    const actionsCell = document.createElement("td");

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.className = "action-btn edit-btn";
    editBtn.textContent = "✏️ Edit";
    editBtn.addEventListener("click", () => handleEdit(ad.id));
    actionsCell.appendChild(editBtn);

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.addEventListener("click", () => handleDelete(ad.id));
    actionsCell.appendChild(deleteBtn);

    row.appendChild(actionsCell);
    adTableBody.appendChild(row);
  });
}

// --- NEW: Handler for Edit Button ---
function handleEdit(id) {
  const adToEdit = ads.find((ad) => ad.id === id);
  if (!adToEdit) return;

  // 1. Populate form
  document.getElementById("adName").value = adToEdit.name;
  document.getElementById("adCategory").value = adToEdit.category;
  document.getElementById("adDuration").value = adToEdit.duration;
  document.getElementById("adProfit").value = adToEdit.profit;
  document.getElementById("adDeadline").value = adToEdit.deadline;

  // 2. Set edit mode
  currentEditId = id;
  submitAdBtn.textContent = "💾 Save Changes";
  cancelEditBtn.classList.remove("hidden");

  // 3. Scroll to top for user convenience
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- NEW: Handler for Delete Button ---
function handleDelete(id) {
  if (!confirm("Are you sure you want to delete this ad?")) return;

  ads = ads.filter((ad) => ad.id !== id);
  saveAdsToStorage();
  updateAdTable();

  // If user deletes the ad they are currently editing, reset form
  if (currentEditId === id) {
    resetFormMode();
  }
}

// --- Run scheduler (Updated) ---
runButton.addEventListener("click", () => {
  const totalDays = parseInt(document.getElementById("totalDays").value);
  const slotsPerDay = parseInt(document.getElementById("slotsPerDay").value);

  if (slotsPerDay <= 0 || totalDays <= 0) {
    alert("Please set Total Days and Slots per Day to 1 or more.");
    return;
  }

  const result = scheduleAdsSlotBased(ads, totalDays, slotsPerDay);
  renderScheduleSlotBased(result, ads); // Pass original ads for summary
});

// --- Clear Ads Button (Updated) ---
clearAdsButton.addEventListener("click", () => {
  if (ads.length === 0) return;
  if (confirm("Are you sure you want to clear all added ads?")) {
    ads = [];
    saveAdsToStorage();
    updateAdTable();
    // Clear output as well
    outputDiv.innerHTML = "";
    profitOutput.innerHTML = "";
    summaryOutput.innerHTML = "";
    resetFormMode(); // Reset form if it was in edit mode
  }
});

// --- RENDER FUNCTION (Unchanged from last time) ---
function renderScheduleSlotBased(result, originalAds) {
  outputDiv.innerHTML = "";
  summaryOutput.innerHTML = "";

  // Render slot-by-slot cards
  result.schedule.forEach((daySlots, dayIndex) => {
    const card = document.createElement("div");
    card.classList.add("day-card");
    card.innerHTML = `<h3>Day ${dayIndex + 1}</h3>`;

    if (daySlots.every((slot) => slot === null)) {
      card.innerHTML += `<p>No Ads Scheduled</p>`;
    } else {
      daySlots.forEach((slotData, slotIndex) => {
        const item = document.createElement("div");
        item.classList.add("slot-item");

        let text = `<b>Slot ${slotIndex + 1}:</b> `;
        if (slotData) {
          text += `${slotData.ad.name} (${slotData.ad.category}) - (Part ${slotData.part} of ${slotData.ad.duration})`;
        } else {
          text += `<i>-- Empty --</i>`;
          item.classList.add("empty");
        }
        item.innerHTML = text;
        card.appendChild(item);
      });
    }
    outputDiv.appendChild(card);
  });

  profitOutput.innerHTML = `💰 Total Profit: ${result.totalProfit}`;

  // Render Ad Performance Summary Table
  const adSummary = new Map();
  result.schedule.forEach((day) => {
    day.forEach((slotData) => {
      if (slotData) {
        const adName = slotData.ad.name;
        if (!adSummary.has(adName)) {
          adSummary.set(adName, { scheduledSlots: 0, profit: 0 });
        }
        const current = adSummary.get(adName);
        current.scheduledSlots++;
        current.profit += slotData.profitPerSlot;
      }
    });
  });

  let tableHTML = `
    <h2>📊 Ad Performance Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Ad Name</th>
          <th>Slots Scheduled</th>
          <th>Profit Achieved</th>
        </tr>
      </thead>
      <tbody>
  `;

  originalAds.forEach((ad) => {
    const adName = ad.name;
    const totalDuration = ad.duration;
    const summaryData = adSummary.get(adName);

    const scheduledSlots = summaryData ? summaryData.scheduledSlots : 0;
    const achievedProfit = summaryData ? summaryData.profit.toFixed(2) : "0.00";

    tableHTML += `
      <tr>
        <td>${adName}</td>
        <td>${scheduledSlots} / ${totalDuration}</td>
        <td>$${achievedProfit}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;
  summaryOutput.innerHTML = tableHTML;
}

// --- Load ads when the script first runs ---
loadAdsFromStorage();


(function() {
  const heavyTestData = [
    // --- 1. High-Profit Fillers (Unique Categories) ---
    { name: "Quantum Laptop", category: "Technology", duration: 3, profit: 1200, deadline: 1 }, // 400/slot
    { name: "Mars Vacation", category: "Travel & Hospitality", duration: 2, profit: 700, deadline: 1 }, // 350/slot
    { name: "EcoBoost Car", category: "Automotive", duration: 4, profit: 1200, deadline: 1 }, // 300/slot
    { name: "Gourmet Burger", category: "Food & Beverage", duration: 1, profit: 290, deadline: 1 }, // 290/slot
    { name: "Blockbuster Movie", category: "Entertainment", duration: 2, profit: 560, deadline: 1 }, // 280/slot
    { name: "Nike Air Max 100", category: "Fashion & Apparel", duration: 1, profit: 270, deadline: 1 }, // 270/slot
    { name: "Gen-Z Soda", category: "Food & Beverage", duration: 1, profit: 265, deadline: 1 }, // 265/slot
    
    // --- 2. Multi-part (Name Congestion) ---
    { name: "Global Insurance", category: "Finance", duration: 15, profit: 3000, deadline: 1 }, // 200/slot
    { name: "CyberCore CPU", category: "Electronics", duration: 10, profit: 2500, deadline: 1 }, // 250/slot
    { name: "Epic Quest MMO", category: "Gaming", duration: 12, profit: 2400, deadline: 1 }, // 200/slot

    // --- 3. Category Congestion (Electronics) ---
    { name: "Alpha Phone", category: "Electronics", duration: 5, profit: 1200, deadline: 1 }, // 240/slot
    { name: "Omega TV", category: "Electronics", duration: 3, profit: 700, deadline: 1 }, // 233/slot
    { name: "Zeta Headphones", category: "Electronics", duration: 2, profit: 450, deadline: 1 }, // 225/slot
    { name: "Delta Drone", category: "Electronics", duration: 1, profit: 220, deadline: 1 }, // 220/slot
    
    // --- 4. Category Congestion (Finance) ---
    { name: "MyBank Card", category: "Finance", duration: 4, profit: 760, deadline: 1 }, // 190/slot
    { name: "StockTrader App", category: "Finance", duration: 2, profit: 360, deadline: 1 }, // 180/slot
    { name: "EasyLoan", category: "Finance", duration: 1, profit: 170, deadline: 1 }, // 170/slot

    // --- 5. Category Congestion (Fashion & Apparel) ---
    { name: "Luxury Watch", category: "Fashion & Apparel", duration: 3, profit: 780, deadline: 1 }, // 260/slot
    { name: "Designer Jeans", category: "Fashion & Apparel", duration: 2, profit: 500, deadline: 1 }, // 250/slot
    { name: "Silk Scarf", category: "Fashion & Apparel", duration: 1, profit: 245, deadline: 1 }, // 245/slot

    // --- 6. More Fillers (Diverse Categories) ---
    { name: "Home Gym", category: "Sports & Fitness", duration: 5, profit: 1000, deadline: 1 }, // 200/slot
    { name: "Vita Pills", category: "Health & Wellness", duration: 3, profit: 570, deadline: 1 }, // 190/slot
    { name: "Dream Villa", category: "Real Estate", duration: 2, profit: 360, deadline: 1 }, // 180/slot
    { name: "Online MBA", category: "Education", duration: 4, profit: 700, deadline: 1 }, // 175/slot
    { name: "Pro Skincare", category: "Beauty & Personal Care", duration: 2, profit: 340, deadline: 1 }, // 170/slot
    { name: "Galaxy SIM", category: "Telecommunications", duration: 3, profit: 500, deadline: 1 }, // 167/slot
    { name: "Pet Food Plus", category: "Retail", duration: 2, profit: 320, deadline: 1 }, // 160/slot
    { name: "Robo-Vacuum", category: "Home & Garden", duration: 1, profit: 150, deadline: 1 }, // 150/slot
    { name: "Kids Toy", category: "Retail", duration: 1, profit: 140, deadline: 1 } // 140/slot
  ];

  localStorage.setItem('adSchedulerAds', JSON.stringify(heavyTestData));
  
  console.log('✅ Heavy 100-slot, 1-day dataset has been loaded.');
  console.log('🔄 Please REFRESH the page to see the data.');
})();