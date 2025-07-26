const fs = require('fs');
const path = require('path');

// --- Configuration ---
const TUBE_CAPACITY = 4;

/**
 * Creates a deep copy of the tubes array to avoid modifying the original state.
 * @param {Array} tubes The current state of the tubes.
 * @returns {Array} A new array with a deep copy of the tubes.
 */
function deepCopy(tubes) {
  return JSON.parse(JSON.stringify(tubes));
}

/**
 * Checks if the current board state is solved.
 * A state is solved if every tube is either empty or contains items of only one color.
 * @param {Array} tubes The current state of the tubes.
 * @returns {boolean} True if the state is solved, false otherwise.
 */
function isSolved(tubes) {
  for (const tube of tubes) {
    if (tube.length === 0) {
      continue; // Empty tubes are fine.
    }
    const firstColor = tube[0].color;
    // Check if all items in this tube are the same color.
    for (let i = 1; i < tube.length; i++) {
      if (tube[i].color !== firstColor) {
        return false; // Tube has mixed colors, so it's not solved.
      }
    }
  }
  return true; // All tubes are either empty or monochromatic.
}

/**
 * Creates a unique string key for a given board state to track visited states.
 * @param {Array} tubes The current state of the tubes.
 * @returns {string} A unique string representation of the state.
 */
function getStateKey(tubes) {
  // Sort the tubes representation to handle same states with different tube orders
  const sortedTubes = tubes.map(tube => JSON.stringify(tube)).sort().join('|');
  return sortedTubes;
}

/**
 * The main recursive solver function using Depth-First Search (DFS).
 * @param {Array} currentTubes The current configuration of the tubes.
 * @param {Set<string>} visitedStates A set of visited state keys to avoid cycles.
 * @returns {boolean} True if a solution is found, otherwise false.
 */
function solve(currentTubes, visitedStates) {
  const stateKey = getStateKey(currentTubes);
  if (visitedStates.has(stateKey)) {
    return false; // We've been in this exact state before, backtrack.
  }
  visitedStates.add(stateKey);

  if (isSolved(currentTubes)) {
    return true;
  }

  // Find all possible next moves
  for (let i = 0; i < currentTubes.length; i++) {
    const sourceTube = currentTubes[i];
    if (sourceTube.length === 0) continue; // Can't move from an empty tube.

    // OPTIMIZATION: Check if the source tube is already "solved" (monochromatic).
    // If so, we should only move from it if it's not full, to consolidate.
    // But we definitely shouldn't break up a full, solved tube.
    let isSourceMonochromatic = true;
    const sourceTopColor = sourceTube[0].color;
    for (let k = 1; k < sourceTube.length; k++) {
        if (sourceTube[k].color !== sourceTopColor) {
            isSourceMonochromatic = false;
            break;
        }
    }
    // If the tube is full AND monochromatic, it's a completed tube. Don't touch it.
    if (isSourceMonochromatic && sourceTube.length === TUBE_CAPACITY) {
        continue;
    }


    const topColorItem = sourceTube[sourceTube.length - 1];
    
    // Determine the block of same-colored items at the top
    let moveBlockSize = 0;
    for (let k = sourceTube.length - 1; k >= 0; k--) {
        if(sourceTube[k].color === topColorItem.color) {
            moveBlockSize++;
        } else {
            break;
        }
    }
    
    for (let j = 0; j < currentTubes.length; j++) {
      if (i === j) continue; // Can't move to the same tube.

      const destTube = currentTubes[j];

      const canMove =
        destTube.length === 0 || // Can move to an empty tube
        (destTube.length + moveBlockSize <= TUBE_CAPACITY && destTube[destTube.length - 1].color === topColorItem.color); // Or to a tube with the same color on top and enough space

      if (canMove) {
        const newTubes = deepCopy(currentTubes);
        // FIX: Correctly splice items from the new state and push them.
        const movedItems = newTubes[i].splice(newTubes[i].length - moveBlockSize);
        newTubes[j].push(...movedItems);
        
        if (solve(newTubes, visitedStates)) {
          return true; // Solution found down this path.
        }
      }
    }
  }

  return false; // No solution found from this state.
}

/**
 * Main function to run the solver.
 */
function main() {
  // FIX: Updated filename to 'game-levels.json'
  const levelsFilePath = path.join(__dirname, 'game-levels.json');
  if (!fs.existsSync(levelsFilePath)) {
    console.error("❌ Error: 'game-levels.json' not found in the same directory.");
    return;
  }

  const levelsData = JSON.parse(fs.readFileSync(levelsFilePath, 'utf-8'));
  const levels = levelsData.levels;

  for (const levelId in levels) {
    const initialTubes = levels[levelId].tubes;
    const isSolvable = solve(initialTubes, new Set());

    if (isSolvable) {
      console.log(`Level ${levelId} - Passed`);
    } else {
      console.log(`Level ${levelId} - Failed`);
    }
  }
}

main();
