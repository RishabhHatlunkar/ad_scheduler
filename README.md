# Advanced Ad Campaign Optimizer

An advanced, visually appealing web application for optimizing advertisement schedules to maximize profit. This tool allows users to manage a pool of ad campaigns, including multi-day campaigns, and compare the results of a fast Greedy heuristic against a mathematically optimal Dynamic Programming solution.



---
## ✨ Features

* **Stunning UI/UX**: A modern, responsive interface featuring a mesmerizing animated gradient background and glassmorphic panels.
* **Multi-Day Campaigns**: Add ad campaigns with specific start and end dates, allowing for complex, real-world scheduling scenarios.
* **Persistent Local Database**: All ad campaigns are saved in your browser's local storage using SQLite (via `sql.js`), so your data is safe between sessions.
* **Dual-Algorithm Solver**:
    * **Greedy (Heuristic) Solver**: Implements a "Highest Profit First" strategy for a quick, approximate solution.
    * **DP (Optimal) Solver**: Implements the **Weighted Interval Scheduling** algorithm using Dynamic Programming to find the guaranteed, mathematically optimal schedule for maximum profit.
* **Clear Side-by-Side Comparison**: Instantly view and compare the results (total profit and selected campaigns) from both algorithms.

---
## 🚀 Technologies Used

* **Frontend**: HTML5, CSS3, JavaScript (ES6+)
* **Database**: SQLite compiled to WebAssembly via **`sql.js`** for in-browser database management.
* **Styling**: Modern CSS features including CSS Variables, Flexbox, Grid, and `backdrop-filter` for the glassmorphism effect.
* **Fonts**: **Google Fonts** (`Poppins`) for clean and elegant typography.
* **Algorithms**:
    * Greedy Heuristic ("Highest Profit First")
    * Dynamic Programming (Weighted Interval Scheduling)

---
## 💻 How to Run Locally

This is a pure front-end application and requires no special build steps or server.

1.  **Clone the Repository (or Download the Files)**
    If you have this project in a Git repository, clone it:
    ```sh
    git clone <your-repo-url>
    ```
    Alternatively, just save the `index.html` file to your local machine.

2.  **Open the `index.html` File**
    Simply drag the `index.html` file into your web browser (like Chrome, Firefox, or Edge) or right-click and choose "Open with..." your preferred browser.

    > **Note:** Because the application uses `sql.js` which loads a `.wasm` file, running it directly from the local filesystem (`file:///...`) might cause security restrictions in some browsers. For the best experience, it's recommended to serve the file with a simple local server.

3.  **(Optional) Use a Local Server for Best Performance**
    If you have Node.js installed, you can use the `serve` package for a quick local server.
    ```sh
    # Install serve globally (if you haven't already)
    npm install -g serve

    # Navigate to the project directory and start the server
    serve .
    ```
    Then, open your browser and go to the URL provided (usually `http://localhost:3000`).

---
## 🧠 Understanding the Algorithms

This project is a practical demonstration of two fundamental computer science concepts for solving optimization problems.

### Greedy Heuristic
* **Strategy**: "Job Sequencing (Highest Profit First)".
* **Behavior**: It sorts all campaigns by profit and immediately schedules the most profitable one if it fits. It's fast and simple but **not guaranteed to be optimal**, as it might make a "short-sighted" choice that blocks a better combination of ads.

### Dynamic Programming (DP)
* **Strategy**: Weighted Interval Scheduling.
* **Behavior**: This is the **optimal** approach. It sorts campaigns by their end date and systematically calculates the maximum possible profit at each point in time, considering all valid combinations. It is more complex but guarantees the best possible result.

By comparing both, this tool effectively illustrates the trade-off between speed/simplicity (Greedy) and guaranteed optimality (DP).