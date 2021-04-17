import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconDelete from '@material-ui/icons/Delete.js';

interface DeleteDialogProps {
    open: boolean,
    title: string | React.ReactNode,
    prompt: string | React.ReactNode,
    onClose?: () => void,
    onConfirmDelete?: () => void
}

export default function DeleteDialog(props: DeleteDialogProps) {
    const { open, title, prompt, onClose, onConfirmDelete } = props;

    function handleClose() {
        if (onClose)
            onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {prompt}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <Button onClick={onConfirmDelete} color="primary" startIcon={<IconDelete/>}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
