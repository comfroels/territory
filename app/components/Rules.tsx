import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import ForestIcon from '@mui/icons-material/Forest';
import LandscapeIcon from '@mui/icons-material/Landscape';
import {
	Box,
	Card,
	CardContent,
	CardMedia,
	Divider,
	IconButton,
	Stack,
	Typography,
	useTheme,
} from '@mui/material';
import { green, grey } from '@mui/material/colors';
import { EXPENSE, TileAmounts, TileImages } from '../utils.ts';
import { TileTypes } from '../utils.ts';

const resources = [
	{ resourceName: 'Forest', resources: TileAmounts[TileTypes.FOREST] },
	{ resourceName: 'Mountain', resources: TileAmounts[TileTypes.MOUNTAIN] },
	{ resourceName: 'Water', resources: TileAmounts[TileTypes.WATER] },
	{ resourceName: 'Plains', resources: TileAmounts[TileTypes.PLAINS] },
];

export function Rules() {
	return (
		<>
			<Typography variant='h3' mb={2} fontFamily='VT323, monospace'>
				Rules
			</Typography>
			<Typography mb={2}>
				Select tiles to claim them as your own and gain their resources. Select
				opponent's claimed resource tiles to claim them along with their
				resources.
			</Typography>
			<Stack spacing={2}>
				{resources.map((resource) => (
					<ResourceCard resource={resource} />
				))}
			</Stack>
			<Typography my={2}>
				Build a fortress or castle to prevent your opponent from claiming your
				tile and gain points.
			</Typography>
			<Divider />
			<Typography my={1}>
				<strong>Fortress:</strong> 2 points
			</Typography>
			<Stack>
				<Typography>
					<strong>Cost:</strong>
				</Typography>
				<Stack direction='row' alignItems='center' spacing={2}>
					<Typography>{EXPENSE.fortress.wood}</Typography>
					<ForestIcon sx={{ color: green[600] }} />
				</Stack>
				<Stack direction='row' alignItems='center' spacing={2}>
					<Typography>{EXPENSE.fortress.stone}</Typography>
					<LandscapeIcon sx={{ color: grey[500] }} />
				</Stack>
			</Stack>
			<Divider sx={{ my: 2 }} />
			<Typography>
				<strong>Castle:</strong> 3 points
			</Typography>
			<Stack>
				<Typography my={1}>
					<strong>Cost:</strong>
				</Typography>
				<Stack direction='row' alignItems='center' spacing={2}>
					<Typography>{EXPENSE.castle.wood}</Typography>
					<ForestIcon sx={{ color: green[600] }} />
				</Stack>
				<Stack direction='row' alignItems='center' spacing={2}>
					<Typography>{EXPENSE.castle.stone}</Typography>
					<LandscapeIcon sx={{ color: grey[500] }} />
				</Stack>
			</Stack>
			<Divider sx={{ mt: 2 }} />
			<Typography my={2}>
				<strong>Winning:</strong> The game ends when there are a total of 4
				castles or 6 fortresses (whichever comes first). The player with the
				most points wins.
			</Typography>
		</>
	);
}

function ResourceCard({ resource }) {
	const theme = useTheme();
	return (
		<Card sx={{ display: 'flex', alignItems: 'center' }}>
			<CardMedia
				component='img'
				sx={{
					width: '64px',
					height: '64px',
					display: 'block',
					marginLeft: 'auto',
					marginRight: 'auto',
				}}
				image={TileImages[resource.resourceName.toUpperCase()]}
				alt={`${resource.resourceName} image`}
			/>
			<Box
				sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, pl: 3 }}>
				<CardContent sx={{ flex: '1 0 auto' }}>
					<Typography component='div' variant='h5'>
						{resource.resourceName}
					</Typography>

					<Stack>
						<Stack direction='row' alignItems='center' spacing={2}>
							{resource.resources.wood}{' '}
							<ForestIcon sx={{ ml: 2, color: green[600] }} />
						</Stack>
						<Stack direction='row' alignItems='center' spacing={2}>
							{resource.resources.stone}{' '}
							<LandscapeIcon sx={{ ml: 2, color: grey[500] }} />
						</Stack>
					</Stack>
				</CardContent>
			</Box>
		</Card>
	);
}
