# Advanced Slot-Based Ad Scheduler

A visually appealing, single-page web application for scheduling advertisements to maximize profit based on complex, real-world constraints. This tool allows users to add, edit, and delete ads, which are saved persistently in the browser.

The scheduler implements an advanced greedy algorithm to fill time slots, ensuring that no ad is run consecutively with an ad of the same **name** or **category**.

---

## ✨ Features

* **Stunning UI/UX**: A modern, responsive interface featuring a mesmerizing animated gradient background and "glassmorphic" panels.
* **Ad Management (CRUD)**: Full **Create, Read, Update, and Delete** functionality for your ad list.
* **Persistent Browser Storage**: All ads are saved in your browser's **`localStorage`**, so your data is safe between sessions.
* **Advanced Greedy Solver**: Implements a slot-by-slot greedy algorithm that sorts all ad "parts" by profit density to maximize returns.
* **Complex Constraints**: The scheduler intelligently enforces two key rules:
    1.  An ad cannot be placed in a slot if the *previous* slot ran an ad with the same **name**.
    2.  An ad cannot be placed in a slot if the *previous* slot ran an ad from the same **category**.
* **Detailed Reporting**:
    * View a clean, slot-by-slot breakdown of the schedule for each day.
    * See a final **"Ad Performance Summary"** table showing how many slots each ad won and the total profit it generated.

---

## 🚀 Technologies Used

* **Frontend**: HTML5, CSS3, JavaScript (ES6+)
* **Storage**: Browser **`localStorage`** API for data persistence.
* **Styling**: Modern CSS features including CSS Variables, Flexbox, Grid, Animations, and `backdrop-filter` for the glassmorphism effect.
* **Algorithm**: Slot-Based Greedy (Profit Density) with Consecutive Constraint Checking.

---

## 💻 How to Run Locally

This is a pure front-end application and requires **no server, build steps, or dependencies**.

1.  **Save the Files**
    * `index.html`
    * `style.css`
    * `script.js`

2.  **Open the `index.html` File**
    * Simply drag the `index.html` file into your web browser (like Chrome, Firefox, or Edge) or right-click and choose "Open with..." your preferred browser.

That's it! The application will run locally and save all your ad data in your browser's storage.

---

## 🧠 Understanding the Algorithm

This project uses a custom, slot-based greedy algorithm to solve this complex scheduling problem.

* **Strategy**: "Highest Profit-Density-Per-Slot First"
* **Behavior**:
    1.  **Deconstruction**: The scheduler first breaks all ads down into their individual ad "parts" (e.g., a 3-duration ad becomes three 1-slot parts). Each part is assigned a "profit-per-slot" value (profit/duration).
    2.  **Sorting**: It creates one large list of *all* ad parts from *all* ads and sorts it by profit-per-slot, from highest to lowest.
    3.  **Placement**: It iterates through the schedule one slot at a time (Day 1 Slot 1, Day 1 Slot 2, etc.) and tries to place the most profitable ad part available from its sorted list that also satisfies the deadline.
    4.  **Constraint Checking**: Before placing an ad part, it checks the **immediately preceding slot**:
        * If the previous slot has the same **ad name**, it's **blocked**.
        * If the previous slot has the same **ad category**, it's **blocked**.
    5.  **Iteration**: If the most profitable ad is blocked, it tries the *next* most profitable ad for that same slot, and so on, until it finds one that is valid. If no valid ads are left, the slot correctly remains empty.