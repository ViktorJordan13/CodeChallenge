const directions = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
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
    if (map[r][c] === '+') {
        // If at a junction ('+'), consider all directions except the opposite one
        const possibleDirections = Object.keys(directions).filter(d => d !== getOppositeDirection(prevDirection));
        for (const direction of possibleDirections) {
            const [dr, dc] = getDirectionVector(direction);
            if (isValidPosition(map, r + dr, c + dc) && map[r + dr][c + dc] !== ' ' && direction !== prevDirection) {
                return [r + dr, c + dc, direction];
            }
        }
    } else {
        // Prioritize continuing in the same direction if possible
        const [dr, dc] = getDirectionVector(prevDirection);
        if (isValidPosition(map, r + dr, c + dc) && map[r + dr][c + dc] !== ' ') {
            return [r + dr, c + dc, prevDirection];
        }
    }

    // If stuck and can't move forward or it's not a junction, try any valid direction
    const fallbackDirections = Object.keys(directions).filter(d => d !== prevDirection && d !== getOppositeDirection(prevDirection));
    for (const direction of fallbackDirections) {
        const [dr, dc] = getDirectionVector(direction);
        if (isValidPosition(map, r + dr, c + dc) && map[r + dr][c + dc] !== ' ') {
            return [r + dr, c + dc, direction];
        }
    }

    throw new Error("Stuck at position with no valid moves.");
}

function getOppositeDirection(direction) {
    const opposites = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
    };
    return opposites[direction];
}

function navigateMap(mapArray) {
    const map = mapArray.map(row => row.split(''));
    let [row, col] = findStartPosition(map);
    let path = '@';
    let letters = '';
    let direction = 'right';
    let lastLetterPos = null;

    while (true) {
        const cell = map[row][col];

        if (cell === 'x') break;

        if (/[A-Z]/.test(cell)) {
            if (lastLetterPos !== `${row},${col}`) {
                letters += cell;
                lastLetterPos = `${row},${col}`;
            }
        }

        let [newR, newC, newDirection] = findNextDirection(map, [row, col], direction);
        direction = newDirection;

        // Append to path if it's a letter or 'x', but not if it's the starting '@'
        if (cell !== '@') {
            path += cell;
        }

        row = newR;
        col = newC;
    }

    return { letters, path: path + 'x' };
}

function processMap(map) {
    try {
        // Check for exactly one start and one end
        const startCount = map.reduce((acc, row) => acc + (row.match(/@/g) || []).length, 0);
        const endCount = map.reduce((acc, row) => acc + (row.match(/x/g) || []).length, 0);

        if (startCount !== 1 || endCount !== 1) {
            throw new Error("Invalid map configuration.");
        }

        const { letters, path } = navigateMap(map);

        // Verify the path ended at 'x'
        if (!path.endsWith('x')) {
            throw new Error("Path does not end at the destination.");
        }

        console.log(`Letters: ${letters}, Path: ${path}`);
    } catch (error) {
        console.log("Error");
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

processMap(map1);

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

processMap(map2);


// Map 3: Letters may be found on turns
const map3 = [
    "  @---A---+",
    "          |",
    "  x-B-+   |",
    "      |   |",
    "      +---C"
];

processMap(map3);


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

processMap(map4);


// Map 5: Keep direction, even in a compact space
const map5 = [
    " +-L-+",
    " |  +A-+",
    "@B+ ++ H",
    " ++    x"
];

processMap(map5);

// Map 6: Ignore stuff after end of path
const map6 = [
    "  @-A--+", 
    "       |",
    "       +-B--x-C--D"
];

processMap(map6);

// Invalid Map: Missing start character
const invalidMap1 = [
    "     -A---+",
    "          |",
    "  x-B-+   C",
    "      |   |",
    "      +---+"
];

processMap(invalidMap1);

// Invalid Map: Missing end character
const invalidMap2 = [
    "   @--A---+",
    "          |",
    "    B-+   C",
    "      |   |",
    "      +---+"
];

processMap(invalidMap2);

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

processMap(invalidMap3);

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

processMap(invalidMap4);

// Invalid Map: Broken path
const invalidMap5 = [
    "   @--A-+",
    "        |",
    "         ",
    "        B-x"
];

processMap(invalidMap5);

// Invalid Map: Multiple starting paths
const invalidMap6 = [
    "  x-B-@-A-x"
];

processMap(invalidMap6);

// Invalid Map: Fake turn
const invalidMap7 = [
    "  @-A-+-B-x"
];

processMap(invalidMap7);
