import { createTheme } from '@mui/material/styles';
import { red, deepPurple } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: deepPurple[200],
		},
		secondary: {
			main: '#19857b',
		},
	},
});

export default theme;
