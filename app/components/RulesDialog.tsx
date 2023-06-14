import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from '@mui/material';
import { Rules } from './Rules.tsx';
import React from 'react';

export function RulesDialog({ open, handleClose }) {
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			aria-label='rules'
			maxWidth='xl'
			aria-describedby='alert-dialog-description'>
			<DialogContent>
				<Rules />
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} autoFocus>
					Done
				</Button>
			</DialogActions>
		</Dialog>
	);
}
