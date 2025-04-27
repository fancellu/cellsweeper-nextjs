"use client";

import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

const N = 10; // Grid size and number of mines

type CellState = "hidden" | "revealed" | "flagged";

interface Cell {
  isMine: boolean;
  state: CellState;
  neighborMines: number;
}

export default function Home() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [minesLeft, setMinesLeft] = useState(N);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [numberOfMines, setNumberOfMines] = useState(N); // Keep track of actual mines placed
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    // 1. Create empty grid immutably
    const initialGrid: Cell[][] = Array(N).fill(null).map(() =>
        Array(N).fill(null).map(() => ({
          isMine: false,
          state: "hidden" as CellState, // Explicitly type state here
          neighborMines: 0,
        }))
    );

    // 2. Place mines randomly
    let minesPlaced = 0;
    let tempGrid = initialGrid; // Work on a temporary copy
    while (minesPlaced < N) {
      const row = Math.floor(Math.random() * N);
      const col = Math.floor(Math.random() * N);
      if (!tempGrid[row][col].isMine) {
        // Create a new grid with the mine placed immutably
        tempGrid = tempGrid.map((currentRow, rIndex) =>
            rIndex !== row ? currentRow : currentRow.map((currentCell, cIndex) =>
                cIndex !== col ? currentCell : { ...currentCell, isMine: true }
            )
        );
        minesPlaced++;
      }
    }

    // 3. Calculate neighbor mines for each cell using the final mined grid
    const finalGrid = tempGrid.map((rowArr, row) =>
        rowArr.map((cell, col) => {
          if (cell.isMine) return cell; // No need to count neighbors for mines

          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i === 0 && j === 0) continue;
              const neighborRow = row + i;
              const neighborCol = col + j;
              if (
                  neighborRow >= 0 &&
                  neighborRow < N &&
                  neighborCol >= 0 &&
                  neighborCol < N &&
                  tempGrid[neighborRow][neighborCol].isMine // Check the grid with mines
              ) {
                count++;
              }
            }
          }
          return { ...cell, neighborMines: count }; // Return new cell object with count
        })
    );

    setNumberOfMines(minesPlaced); // Store the actual number placed
    setGrid(finalGrid);
    setMinesLeft(N); // Reset mines left counter based on target N
    setScore(0);
    setGameState("playing");
  };

  // Helper to update a single cell immutably
  const updateGridCell = (
      currentGrid: Cell[][],
      r: number,
      c: number,
      updates: Partial<Cell> // Allow updating parts of the cell
  ): Cell[][] => {
    return currentGrid.map((currentRow, rIndex) =>
        rIndex !== r ? currentRow : currentRow.map((currentCell, cIndex) =>
            cIndex !== c ? currentCell : { ...currentCell, ...updates }
        )
    );
  };


  const revealCell = (row: number, col: number) => {
    // --- Guard Clauses ---
    if (gameState !== "playing") return;
    const originalCell = grid[row]?.[col]; // Use optional chaining for safety
    if (!originalCell || originalCell.state !== "hidden") return;

    // --- Handle Mine Hit ---
    if (originalCell.isMine) {
      setGrid((prevGrid) =>
          prevGrid.map((gridRow) =>
              gridRow.map((cell) =>
                  // Create new objects for revealed cells
                  cell.state === "revealed" ? cell : { ...cell, state: "revealed" }
              )
          )
      );
      setGameState("lost");
      toast({
        title: "Game Over!",
        description: "You hit a mine.",
        variant: "destructive",
      });
      return;
    }

    // --- Handle Safe Cell Reveal ---
    let currentGrid = grid; // Start with the current state grid
    let cellsToReveal: { r: number, c: number }[] = []; // Collect cells needing state change
    let scoreIncrement = 0;

    if (originalCell.neighborMines === 0) {
      // --- Flood Fill for Zero Neighbors ---
      const visited = new Set<string>();
      const queue: { r: number, c: number }[] = [{ r: row, c: col }];
      visited.add(`${row}-${col}`);

      while (queue.length > 0) {
        const { r, c } = queue.shift()!; // Get next cell from queue
        const cellToProcess = currentGrid[r][c];

        // Only add to reveal list if it's currently hidden
        if (cellToProcess.state === 'hidden') {
          cellsToReveal.push({ r, c });
        }

        // If this cell also has 0 neighbors, explore its neighbors
        if (cellToProcess.neighborMines === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i === 0 && j === 0) continue;
              const nr = r + i;
              const nc = c + j;
              const neighborId = `${nr}-${nc}`;

              // Check bounds, not visited, and not already revealed in current state
              if (
                  nr >= 0 && nr < N && nc >= 0 && nc < N &&
                  !visited.has(neighborId) &&
                  currentGrid[nr][nc].state !== 'revealed' && // Check current grid state
                  !currentGrid[nr][nc].isMine // Don't reveal mines
              ) {
                visited.add(neighborId);
                queue.push({ r: nr, c: nc });
              }
            }
          }
        }
      }
    } else {
      // --- Single Cell Reveal ---
      cellsToReveal.push({ r: row, c: col });
    }

    // --- Apply Batch Updates ---
    if (cellsToReveal.length > 0) {
      let tempGrid = currentGrid;
      cellsToReveal.forEach(({ r, c }) => {
        // Check state *before* update to correctly increment score
        if (tempGrid[r][c].state === 'hidden') {
          scoreIncrement++;
        }
        // Update the grid immutably for each cell to reveal
        tempGrid = updateGridCell(tempGrid, r, c, { state: "revealed" });
      });
      currentGrid = tempGrid; // Update the main grid variable
      setGrid(currentGrid); // Set state once after all updates
    }

    // --- Update Score ---
    const newScore = score + scoreIncrement;
    setScore(newScore);

    // --- Check for Win Condition ---
    // Count revealed non-mine cells in the *updated* grid
    let revealedCount = 0;
    currentGrid.forEach(gridRow => {
      gridRow.forEach(cell => {
        if (cell.state === 'revealed' && !cell.isMine) {
          revealedCount++;
        }
      });
    });

    if (revealedCount === N * N - numberOfMines) {
      setGameState("won");
      // Optionally reveal/flag remaining mines on win
      setGrid((prevGrid) =>
          prevGrid.map((gridRow) =>
              gridRow.map((cell) =>
                  cell.isMine && cell.state !== 'flagged'
                      ? { ...cell, state: "flagged" } // Flag unflagged mines
                      : cell.state === 'hidden' // Reveal any remaining hidden safe cells (shouldn't happen if logic is correct)
                          ? { ...cell, state: "revealed" }
                          : cell // Keep revealed/flagged as is
              )
          )
      );
      toast({
        title: "You Won!",
        description: "Congratulations!",
      });
      // No return needed here, score already set
    }
  };


  const flagCell = (row: number, col: number) => {
    // --- Guard Clauses ---
    if (gameState !== "playing") return;
    const originalCell = grid[row]?.[col];
    if (!originalCell || originalCell.state === "revealed") return;

    // --- Determine New State and Mines Left ---
    let newMinesLeft = minesLeft;
    let newState: CellState;

    if (originalCell.state === "hidden") {
      newState = "flagged";
      newMinesLeft--;
    } else { // Must be "flagged"
      newState = "hidden";
      newMinesLeft++;
    }

    // --- Update Grid Immutably ---
    const updatedGrid = updateGridCell(grid, row, col, { state: newState });

    // --- Set State ---
    setGrid(updatedGrid); // No type assertion needed!
    setMinesLeft(newMinesLeft);
  };

  const handleCellClick = (row: number, col: number) => {
    revealCell(row, col);
  };

  const handleCellContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault(); // Prevent default context menu
    flagCell(row, col);
  };

  // --- Render Logic (Mostly Unchanged) ---
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground"> {/* Added text-foreground */}
        <Toaster />
        <h1 className="text-3xl font-bold mb-4">CellSweeper</h1>
        <div className="flex items-center space-x-4 mb-4">
          <div>Mines Left: {minesLeft}</div>
          <div>Score: {score}</div>
          <Button variant="outline" onClick={initializeGrid}>Restart</Button>
        </div>
        {gameState === "won" && (
            <div className="text-2xl font-bold text-green-500 mb-4">You Won!</div>
        )}
        {gameState === "lost" && (
            <div className="text-2xl font-bold text-red-500 mb-4">You Lost!</div>
        )}
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}> {/* Use gridTemplateColumns */}
          {grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                  <CellComponent
                      key={`${rowIndex}-${colIndex}`}
                      cell={cell}
                      // row={rowIndex} // No longer needed by CellComponent
                      // col={colIndex} // No longer needed by CellComponent
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onContextMenu={(e) => handleCellContextMenu(e, rowIndex, colIndex)}
                      resolvedTheme={resolvedTheme}
                  />
              ))
          ))}
        </div>
      </div>
  );
}

// Simplified CellComponent props
interface CellComponentProps {
  cell: Cell;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  resolvedTheme: string | undefined;
}

const CellComponent: React.FC<CellComponentProps> = ({ cell, onClick, onContextMenu, resolvedTheme }) => {
  let content: React.ReactNode = null; // Use ReactNode for content

  if (cell.state === "revealed") {
    content = cell.isMine ? "💣" : cell.neighborMines > 0 ? cell.neighborMines : null;
  } else if (cell.state === "flagged") {
    content = <Flag className="w-4 h-4 text-primary" />; // Adjust size if needed
  }

  // Base classes
  let className = "w-8 h-8 flex items-center justify-center border text-sm font-bold cursor-pointer select-none transition-colors duration-200";

  // State-specific background classes
  switch (cell.state) {
    case "hidden":
      className += " bg-secondary hover:bg-accent/20";
      break;
    case "revealed":
      // Use theme-aware background for revealed cells
      className += resolvedTheme === "dark" ? " bg-accent/30" : " bg-muted";
      // Add text color based on neighbor count for better readability
      if (!cell.isMine && cell.neighborMines > 0) {
        // Example: Assign colors based on number - adjust as needed
        const colors = [
          'text-blue-500', 'text-green-600', 'text-red-500',
          'text-purple-700', 'text-maroon-700', 'text-teal-500',
          'text-black', 'text-gray-500'
        ];
        className += ` ${colors[cell.neighborMines - 1] || 'text-foreground'}`;
      } else if (cell.isMine) {
        className += " bg-destructive"; // Make mines stand out more when revealed
      }
      break;
    case "flagged":
      // Use a slightly different background for flagged cells if desired
      className += " bg-secondary hover:bg-accent/20"; // Same as hidden, or choose another
      break;
  }

  return (
      <div
          className={className}
          onClick={onClick}
          onContextMenu={onContextMenu}
          // Prevent dragging behavior which can interfere with context menu
          onDragStart={(e) => e.preventDefault()}
      >
        {content}
      </div>
  );
};