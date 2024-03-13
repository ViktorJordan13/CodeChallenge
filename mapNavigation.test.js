const {
    isValidChar,
    findStartPosition,
    getDirectionVector,
    isValidPosition,
    findNextDirection,
    getOppositeDirection,
    navigateMap,
    processMap
} = require('./mapNavigation');

describe('Unit Tests', () => {
    test('isValidChar recognizes valid characters', () => {
        expect(isValidChar('A')).toBe(true);
        expect(isValidChar('@')).toBe(true);
        expect(isValidChar('x')).toBe(true);
        expect(isValidChar('+')).toBe(true);
        expect(isValidChar('|')).toBe(true);
        expect(isValidChar(' ')).toBe(true);
        expect(isValidChar('1')).toBe(false);
    });

    test('findStartPosition finds the correct start position', () => {
        const map = [" @-A", "B-+ ", "  x "];
        expect(findStartPosition(map)).toEqual([0, 1]);
    });

    test('getDirectionVector returns correct vector for directions', () => {
        expect(getDirectionVector('up')).toEqual([-1, 0]);
        expect(getDirectionVector('down')).toEqual([1, 0]);
        expect(getDirectionVector('left')).toEqual([0, -1]);
        expect(getDirectionVector('right')).toEqual([0, 1]);
    });

    test('isValidPosition validates map positions correctly', () => {
        const map = [" @-A", "B-+ ", "  x "].map(row => row.split(''));
        expect(isValidPosition(map, 0, 1)).toBe(true);
        expect(isValidPosition(map, 2, 2)).toBe(true);
        expect(isValidPosition(map, -1, 0)).toBe(false);
        expect(isValidPosition(map, 0, 4)).toBe(false);
    });

    describe('findNextDirection Tests', () => {
        const map = [
            "  @--A---+",
            "       |  ",
            "  x----+  "
        ].map(row => row.split(''));

        test('Continues straight on a horizontal path', () => {
            const position = [0, 4];
            const direction = 'right';
            const [newR, newC, newDirection] = findNextDirection(map, position, direction);
            expect([newR, newC]).toEqual([0, 5]);
            expect(newDirection).toEqual('right');
        });

        test('Turns at a corner', () => {
            const position = [0, 7];
            const direction = 'right';
            const [newR, newC, newDirection] = findNextDirection(map, position, direction);
            expect([newR, newC]).toEqual([0, 8]);
            expect(newDirection).toEqual('right');
        });
    });

    test('getOppositeDirection returns the opposite direction', () => {
        expect(getOppositeDirection('up')).toEqual('down');
        expect(getOppositeDirection('down')).toEqual('up');
        expect(getOppositeDirection('left')).toEqual('right');
        expect(getOppositeDirection('right')).toEqual('left');
    });

    describe('navigateMap Tests', () => {
        test('Navigates a simple map correctly', () => {
            const simpleMap = [
                "@-A-x"
            ];
            const result = navigateMap(simpleMap);
            expect(result.letters).toEqual('A');
            expect(result.path).toEqual('@-A-x');
        });

        test('Navigates a map with a turn correctly', () => {
            const turningMap = [
                "@",
                "|",
                "+-A-+",
                "    |",
                "    x"
            ];
            const result = navigateMap(turningMap);
            expect(result.letters).toEqual('A');
            expect(result.path).toEqual('@|+-A-+|x');
        });
    });
});

//valid map tests
describe('High-Level Tests', () => {
    test('Basic example map navigates correctly', () => {
        
        const map1 = [
            "  @---A---+",
            "          |",
            "  x-B-+   C",
            "      |   |",
            "      +---+"
        ];
        const result = processMap(map1);
        expect(result).toEqual({ letters: "ACB", path: "@---A---+|C|+---+|+-B-x" });
    });

    test('Go straight through intersections', () => {
        const map2 = [
            "  @          ",
            "  | +-C--+   ",
            "  A |    |   ",
            "  +---B--+   ",
            "    |      x ",
            "    |      | ",
            "    +---D--+ "
        ];
        const result = processMap(map2);
        expect(result).toEqual({ letters: "ABCD", path: "@|A+---B--+|+--C-+|-||+---D--+|x" });
    });

    test('Map with letters on turns collects letters correctly', () => {
        const map3 = [
            "  @---A---+",
            "          |",
            "  x-B-+   |",
            "      |   |",
            "      +---C"
        ];
        const result = processMap(map3);
        expect(result).toEqual({ letters: "ACB", path: "@---A---+|||C---+|+-B-x" });
    });

    test('Do not collect a letter from the same location twice', () => {
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
        const result = processMap(map4);
        expect(result).toEqual({ letters: "GOONIES", path: "@-G-O-+|+-+|O||+-O-N-+|I|+-+|+-I-+|ES|x" });
    });

    test('Keep direction, even in a compact space', () => {
        const map5 = [
            " +-L-+",
            " |  +A-+",
            "@B+ ++ H",
            " ++    x"
        ];
        const result = processMap(map5);
        expect(result).toEqual({ letters: "BLAH", path: "@B+++B|+-L-+A+++A-+Hx" });
    });

    test('Ignore stuff after end of path', () => {
        const map6 = [
            "  @-A--+", 
            "       |",
            "       +-B--x-C--D"
        ];
        const result = processMap(map6);
        expect(result).toEqual({ letters: "AB", path: "@-A--+|+-B--x" });
    });
});

//invalid map tests
describe('Invalid map configurations', () => {
    let consoleOutput = [];
    const mockedLog = output => consoleOutput.push(output);
    beforeEach(() => {
        consoleOutput = [];
        console.log = mockedLog; 
    });

    test.each([
        ['Missing start character', [
            "     -A---+",
            "          |",
            "  x-B-+   C",
            "      |   |",
            "      +---+"
        ]],
        ['Missing end character', [
            "   @--A---+",
            "          |",
            "    B-+   C",
            "      |   |",
            "      +---+"
        ]],
        ['Multiple starts', [
            "   @--A-@-+",
            "          |",
            "  x-B-+   C",
            "      |   |",
            "      +---+"
        ]],
        ['Fork in path', [
            "        x-B",
            "          |",
            "   @--A---+",
            "          |",
            "     x+   C",
            "      |   |",
            "      +---+"
        ]],
        ['Broken path', [
            "   @--A-+",
            "        |",
            "         ",
            "        B-x"
        ]],
        ['Multiple starting paths', [
            "  x-B-@-A-x"
        ]],
        ['Fake turn', [
            "  @-A-+-B-x"
        ]]
    ])('%s', (description, map) => {
        processMap(map);
        expect(consoleOutput).toContain('Error');
    });
});

