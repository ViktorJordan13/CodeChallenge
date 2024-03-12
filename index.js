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
    const possibleDirections = Object.keys(directions);
    const oppositeDirection = getOppositeDirection(prevDirection);

    // Randomize the order of possible directions
    const shuffledDirections = possibleDirections.sort(() => Math.random() - 0.5);

    for (const direction of shuffledDirections) {
        if (direction !== oppositeDirection) {
            const [dr, dc] = getDirectionVector(direction);
            const newRow = r + dr;
            const newCol = c + dc;
            if (isValidPosition(map, newRow, newCol) && map[newRow][newCol] !== ' ') {
                return [newRow, newCol, direction];
            }
        }
    }

    throw new Error("Stuck at position with no valid moves.");
}

function navigateMap(mapArray) {
    const map = mapArray.map(row => row.split(''));
    let [row, col] = findStartPosition(map);
    let path = '@';
    let letters = '';

    let direction = 'right';
    let lastLetterPos = null;

    while (map[row][col] !== 'x') {
        const cell = map[row][col];
        if (/[A-Z]/.test(cell) && `${row},${col}` !== lastLetterPos) {
            letters += cell;
            lastLetterPos = `${row},${col}`;
        }
        let [newR, newC, newDirection] = findNextDirection(map, [row, col], direction);
        direction = newDirection;
        path += map[newR][newC];
        [row, col] = [newR, newC];
    }

    return { letters, path };
}

function getOppositeDirection(direction) {
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    return opposites[direction];
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
    "  @          ",
    "  | +-C--+   ",
    "  A |    |   ",
    "  +---B--+   ",
    "    |      x ",
    "    |      | ",
    "    +---D--+ "
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

// // Invalid Map: Missing start character
// const invalidMap1 = [
//     "     -A---+",
//     "          |",
//     "  x-B-+   C",
//     "      |   |",
//     "      +---+"
// ];

// try {
//     navigateMap(invalidMap1);
// } catch (error) {
//     console.log("Invalid Map 1 - Missing start character:", error.message);
// }

// // Invalid Map: Missing end character
// const invalidMap2 = [
//     "   @--A---+",
//     "          |",
//     "    B-+   C",
//     "      |   |",
//     "      +---+"
// ];

// try {
//     navigateMap(invalidMap2);
// } catch (error) {
//     console.log("Invalid Map 2 - Missing end character:", error.message);
// }

// // Invalid Map: Multiple starts
// const invalidMap3 = [
//     "   @--A-@-+",
//     "          |",
//     "  x-B-+   C",
//     "      |   |",
//     "      +---+",
//     "   @--A---+",
//     "          |",
//     "          C",
//     "          x",
//     "      @-B-+",
//     "   @--A--x",
//     "  x-B-+",
//     "      |",
//     "      @"
// ];

// try {
//     navigateMap(invalidMap3);
// } catch (error) {
//     console.log("Invalid Map 3 - Multiple starts:", error.message);
// }

// // Invalid Map: Fork in path
// const invalidMap4 = [
//     "        x-B",
//     "          |",
//     "   @--A---+",
//     "          |",
//     "     x+   C",
//     "      |   |",
//     "      +---+"
// ];

// try {
//     navigateMap(invalidMap4);
// } catch (error) {
//     console.log("Invalid Map 4 - Fork in path:", error.message);
// }

// // Invalid Map: Broken path
// const invalidMap5 = [
//     "   @--A-+",
//     "        |",
//     "        B-x"
// ];

// try {
//     navigateMap(invalidMap5);
// } catch (error) {
//     console.log("Invalid Map 5 - Broken path:", error.message);
// }

// // Invalid Map: Multiple starting paths
// const invalidMap6 = [
//     "  x-B-@-A-x"
// ];

// try {
//     navigateMap(invalidMap6);
// } catch (error) {
//     console.log("Invalid Map 6 - Multiple starting paths:", error.message);
// }

// // Invalid Map: Fake turn
// const invalidMap7 = [
//     "  @-A-+-B-x"
// ];

// try {
//     navigateMap(invalidMap7);
// } catch (error) {
//     console.log("Invalid Map 7 - Fake turn:", error.message);
// }