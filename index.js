const directions = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1]
};

function isValidChar(c) {
    return /[A-Z@x+-| ]/.test(c);
}

function findStartPosition(map) {
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === '@') return [r, c];
        }
    }
    throw new Error("Start position (@) not found.");
}

function getDirectionVector(direction) {
    return directions[direction];
}

function isValidPosition(map, r, c) {
    return r >= 0 && c >= 0 && r < map.length && c < map[r].length && isValidChar(map[r][c]);
}

function findNextDirection(map, pos, prevDirection) {
    const [r, c] = pos;
    let possibleDirections = Object.entries(directions);

    // If at an intersection, prioritize continuing in the same direction if possible
    if (map[r][c] === '+') {
        possibleDirections = possibleDirections.sort(([dir1], [dir2]) => {
            if (dir1 === prevDirection) return -1;
            if (dir2 === prevDirection) return 1;
            return 0;
        });
    }

    for (let [direction, [dr, dc]] of possibleDirections) {
        const newRow = r + dr, newCol = c + dc;
        if (isValidPosition(map, newRow, newCol) && map[newRow][newCol] !== ' ' && direction !== prevDirection) {
            // Special handling for junctions: do not change direction unless necessary
            if (map[newRow][newCol] === '+' || /[A-Z]/.test(map[newRow][newCol]) || map[r][c] === '+') {
                if (prevDirection && direction !== prevDirection && map[newRow][newCol] !== 'x') {
                    // If there's a previous direction and it's changing, ensure it's a valid turn
                    continue;
                }
            }
            return [newRow, newCol, direction];
        }
    }

    throw new Error("No valid next direction found.");
}


function navigateMap(mapArray) {
    const map = mapArray.map(row => row.split(''));
    let [row, col] = findStartPosition(map);
    let path = '@';
    let letters = '';
    let direction = null; // Start without a predetermined direction
    let moves = 0;

    while (true) {
        moves++;
        if (moves > 10000) throw new Error("Infinite loop detected."); // Safety check

        const cell = map[row][col];
        if (cell === 'x' && direction) { // Found the end after starting
            path += 'x';
            break;
        }

        if (!isValidChar(cell)) throw new Error("Invalid character encountered.");
        if (/[A-Z]/.test(cell) && cell !== '@' && !letters.includes(cell)) letters += cell;

        let [newRow, newCol, newDirection] = findNextMove(map, row, col, direction);
        if (!newDirection) throw new Error("Path is broken or ends unexpectedly.");

        // Append to path if moving or turning
        if (newDirection !== direction) {
            if (cell === '+') path += '+'; // Explicitly add junctions if changing direction
        } else {
            path += cell;
        }

        row = newRow;
        col = newCol;
        direction = newDirection;
    }

    return { letters, path };
}

function findNextMove(map, row, col, prevDirection) {
    if (map[row][col] === '+' || prevDirection === null) {
        // Check all directions if on a junction or if no previous direction
        for (const [direction, [dr, dc]] of Object.entries(directions)) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (isValidPosition(map, newRow, newCol) && map[newRow][newCol] !== ' ' && direction !== getOppositeDirection(prevDirection)) {
                return [newRow, newCol, direction];
            }
        }
    } else {
        // Continue in the same direction if not at a junction
        const [dr, dc] = getDirectionVector(prevDirection);
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidPosition(map, newRow, newCol) && map[newRow][newCol] !== ' ') {
            return [newRow, newCol, prevDirection];
        }
    }
    return [null, null, null];
}

function getOppositeDirection(direction) {
    switch (direction) {
        case 'up': return 'down';
        case 'down': return 'up';
        case 'left': return 'right';
        case 'right': return 'left';
        default: return '';
    }
}

function processMap(map) {
    try {
        const { letters, path } = navigateMap(map);
        console.log(`Letters: ${letters}, Path: ${path}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}


//Console logs for code testing

// Valid Maps Processing

// Map 1: A basic example
const map1 = [
    "  @---A---+",
    "          |",
    "  x-B-+   C",
    "      |   |",
    "      +---+"
];

try {
    const result = navigateMap(map1);
    console.log(`Letters: ${result.letters}, Path: ${result.path}`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}

// Map 2: Go straight through intersections
const map2 = [
    "  @",
    "  | +-C--+",
    "  A |    |",
    "  +---B--+",
    "    |      x",
    "    |      |",
    "    +---D--+"
];

try {
    const result = navigateMap(map2);
    console.log(`Letters: ${result.letters}, Path: ${result.path}`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}

// Map 3: Letters may be found on turns
const map3 = [
    "  @---A---+",
    "          |",
    "  x-B-+   |",
    "      |   |",
    "      +---C"
];

try {
    const result = navigateMap(map3);
    console.log(`Letters: ${result.letters}, Path: ${result.path}`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}

// Map 4: Do not collect a letter from the same location twice
const map4 = [
    "     +-O-N-+",
    "     |     |",
    "     |   +-I-+",
    " @-G-O-+ | | |",
    "     | | +-+ E",
    "     +-+     S",
    "             |",
    "             x"
];

try {
    const result = navigateMap(map4);
    console.log(`Letters: ${result.letters}, Path: ${result.path}`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}

// Map 5: Keep direction, even in a compact space
const map5 = [
    " +-L-+",
    " |  +A-+",
    "@B+ ++ H",
    " ++    x"
];

try {
    const result = navigateMap(map5);
    console.log(`Letters: ${result.letters}, Path: ${result.path}`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}

// Map 6: Ignore stuff after end of path
const map6 = [
    "  @-A--+", 
    "       |",
    "       +-B--x-C--D"
];

try {
    const result = navigateMap(map6);
    console.log(`Letters: ${result.letters}, Path: ${result.path}`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}

// Invalid Map: Missing start character
const invalidMap1 = [
    "     -A---+",
    "          |",
    "  x-B-+   C",
    "      |   |",
    "      +---+"
];

try {
    navigateMap(invalidMap1);
} catch (error) {
    console.log("Invalid Map 1 - Missing start character:", error.message);
}

// Invalid Map: Missing end character
const invalidMap2 = [
    "   @--A---+",
    "          |",
    "    B-+   C",
    "      |   |",
    "      +---+"
];

try {
    navigateMap(invalidMap2);
} catch (error) {
    console.log("Invalid Map 2 - Missing end character:", error.message);
}

// Invalid Map: Multiple starts
const invalidMap3 = [
    "   @--A-@-+",
    "          |",
    "  x-B-+   C",
    "      |   |",
    "      +---+",
    "   @--A---+",
    "          |",
    "          C",
    "          x",
    "      @-B-+",
    "   @--A--x",
    "  x-B-+",
    "      |",
    "      @"
];

try {
    navigateMap(invalidMap3);
} catch (error) {
    console.log("Invalid Map 3 - Multiple starts:", error.message);
}

// Invalid Map: Fork in path
const invalidMap4 = [
    "        x-B",
    "          |",
    "   @--A---+",
    "          |",
    "     x+   C",
    "      |   |",
    "      +---+"
];

try {
    navigateMap(invalidMap4);
} catch (error) {
    console.log("Invalid Map 4 - Fork in path:", error.message);
}

// Invalid Map: Broken path
const invalidMap5 = [
    "   @--A-+",
    "        |",
    "        B-x"
];

try {
    navigateMap(invalidMap5);
} catch (error) {
    console.log("Invalid Map 5 - Broken path:", error.message);
}

// Invalid Map: Multiple starting paths
const invalidMap6 = [
    "  x-B-@-A-x"
];

try {
    navigateMap(invalidMap6);
} catch (error) {
    console.log("Invalid Map 6 - Multiple starting paths:", error.message);
}

// Invalid Map: Fake turn
const invalidMap7 = [
    "  @-A-+-B-x"
];

try {
    navigateMap(invalidMap7);
} catch (error) {
    console.log("Invalid Map 7 - Fake turn:", error.message);
}
