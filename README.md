# CellSweeper

CellSweeper is a classic Minesweeper-like game implemented using Next.js and TypeScript. It also uses the beautiful components provided by the `shadcn/ui` library.

## Features

*   **Classic Minesweeper Gameplay:** Enjoy the familiar gameplay of revealing cells and avoiding mines.
*   **Random Mine Placement:** Each game generates a new grid with mines placed in random locations.
*   **Dynamic Difficulty:** The difficulty is determined by the grid size (default is 10x10) and the number of mines.
*   **Dark Mode Support:** The app supports dark mode, automatically adjusting the color scheme based on your system preferences.
*   **Responsive Design:** The game adapts to different screen sizes, providing a consistent experience across devices.
*   **Clear Visual Feedback:** Cells clearly indicate whether they are hidden, revealed, or flagged.
*   **Win/Lose States:** The game clearly shows if you won or lose the game.
*   **Restart Button:** Easily restart the game to play again.
*   **Mines Left Counter:** You can easily see how many mines are left.
*   **Score Counter:** You can see the current score of the game.

## Technologies Used

*   **Next.js:** A React framework for building fast and scalable web applications.
*   **TypeScript:** A statically typed superset of JavaScript that enhances code quality and maintainability.
*   **shadcn/ui:** A beautiful library of reusable UI components that follow modern design principles.
*   **lucide-react:** A simple icon library.
*   **next-themes:** A library to easily implement the dark mode in the project.

## Getting Started

1.  **Clone this repository:**

2.  **Install dependencies:**

```npm install```

3.  **Start the development server:**

```npm run dev```

4.  **Open your browser and go to `http://localhost:9002` to play the game.**

## How to Play

*   **Left-click:** Click on a cell to reveal it. If it's a mine, you lose! If it's empty, it will reveal the number of adjacent mines, or if it is empty, it will reveal the adjacent cells until it finds cells with mines around them.
*   **Right-click:** Right-click on a cell to flag it as a potential mine.
*   **Win Condition:** If you reveal all the cells that do not have a mine, then you will win the game.
*   **Lose Condition:** If you reveal a cell that has a mine, you will lose the game.

Enjoy playing CellSweeper!
