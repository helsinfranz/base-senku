function shuffleNestedArrays(data) {
    // Extract all non-empty items into a single flat array
    const allItems = data.flat().filter(item => Object.keys(item).length);

    // Shuffle using Fisher-Yates
    for (let i = allItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
    }

    // Refill original structure without touching empty arrays
    let index = 0;
    return data.map(subArr => {
        if (subArr.length === 0) return []; // Keep empty array as is
        return subArr.map(() => allItems[index++]);
    });
}

// Example usage:
const input = [
    [
        { "color": "#B8860B", "id": 7 },
        { "color": "#B8860B", "id": 7 },
        { "color": "#B8860B", "id": 7 },
        { "color": "#8B0000", "id": 11 }
    ],
    [
        { "color": "#A52A2A", "id": 1 },
        { "color": "#9932CC", "id": 10 },
        { "color": "#7FFF00", "id": 3 },
        { "color": "#8B0000", "id": 11 }
    ],
    [
        { "color": "#008B8B", "id": 8 },
        { "color": "#7FFF00", "id": 3 },
        { "color": "#8B0000", "id": 11 },
        { "color": "#6495ED", "id": 6 }
    ],
    [
        { "color": "#5F9EA0", "id": 2 },
        { "color": "#556B2F", "id": 9 },
        { "color": "#9932CC", "id": 10 },
        { "color": "#9932CC", "id": 10 }
    ],
    [
        { "color": "#FF7F50", "id": 5 },
        { "color": "#5F9EA0", "id": 2 },
        { "color": "#FF7F50", "id": 5 },
        { "color": "#A52A2A", "id": 1 }
    ],
    [
        { "color": "#A52A2A", "id": 1 },
        { "color": "#6495ED", "id": 6 },
        { "color": "#008B8B", "id": 8 },
        { "color": "#008B8B", "id": 8 }
    ],
    [
        { "color": "#6495ED", "id": 6 },
        { "color": "#008B8B", "id": 8 },
        { "color": "#5F9EA0", "id": 2 },
        { "color": "#5F9EA0", "id": 2 }
    ],
    [
        { "color": "#D2691E", "id": 4 },
        { "color": "#6495ED", "id": 6 },
        { "color": "#FF7F50", "id": 5 },
        { "color": "#FF7F50", "id": 5 }
    ],
    [
        { "color": "#D2691E", "id": 4 },
        { "color": "#9932CC", "id": 10 },
        { "color": "#D2691E", "id": 4 },
        { "color": "#D2691E", "id": 4 }
    ],
    [
        { "color": "#B8860B", "id": 7 },
        { "color": "#8B0000", "id": 11 },
        { "color": "#556B2F", "id": 9 },
        { "color": "#A52A2A", "id": 1 }
    ],
    [
        { "color": "#7FFF00", "id": 3 },
        { "color": "#7FFF00", "id": 3 },
        { "color": "#556B2F", "id": 9 },
        { "color": "#556B2F", "id": 9 }
    ],
    [],
    [],
    []
];

console.log(shuffleNestedArrays(input));