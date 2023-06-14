export enum TileTypes {
	MOUNTAIN = 'MOUNTAIN',
	FOREST = 'FOREST',
	WATER = 'WATER',
	PLAINS = 'PLAINS',
	FORTRESS = 'FORTRESS',
	CASTLE = 'CASTLE',
}

export const TileImages = {
	[TileTypes.MOUNTAIN]: '/mountains.png',
	[TileTypes.FOREST]: '/forest.png',
	[TileTypes.WATER]: '/water.png',
	[TileTypes.PLAINS]: '/plains.png',
	[TileTypes.FORTRESS]: '/fort.png',
	[TileTypes.CASTLE]: '/castle.png',
};

export const TileAmounts: Record<TileTypes, { wood: number; stone: number }> = {
	[TileTypes.MOUNTAIN]: { wood: 0, stone: 3 },
	[TileTypes.FOREST]: { wood: 3, stone: 0 },
	[TileTypes.WATER]: { stone: 2, wood: 1 },
	[TileTypes.FORTRESS]: { wood: 0, stone: 0 },
	[TileTypes.PLAINS]: { wood: 2, stone: 1 },
	[TileTypes.CASTLE]: { wood: 0, stone: 0 },
};

export const EXPENSE = {
	castle: { wood: 4, stone: 6 },
	fortress: { wood: 4, stone: 2 },
};
