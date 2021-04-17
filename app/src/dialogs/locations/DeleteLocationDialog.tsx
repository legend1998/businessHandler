import React from 'react';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import AsyncButton from '../../components/AsyncButton';
import IconDelete from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';

import { LocationObject } from '../../types';

interface DeleteLocationDialogProps {
    open: boolean,
    locations?: LocationObject[],
    onClose?: () => void,
    onDeleteLocations?: (user: LocationObject[], callback: () => void) => void
}

export default function DeleteUserDialog(props: DeleteLocationDialogProps) {
    const { open, onClose, locations, onDeleteLocations } = props;

    // Functions
    function handleClose() {
        if (onClose)
            onClose();
    }

    function deleteLocation(callback: () => void) {
        if (onDeleteLocations && locations)
            onDeleteLocations(locations, callback);
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            {locations?.length === 1 ?
                <DialogTitle>Deleting Location &mdash; <strong>{locations[0].name}</strong></DialogTitle>
                :
                <DialogTitle>Deleting &mdash; <strong>{locations?.length || 0} locations</strong></DialogTitle>
            }
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete <strong>{locations?.length === 1 ? `${locations[0].name}` : `${locations?.length} locations`}</strong>?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <AsyncButton callback={deleteLocation} color="primary" startIcon={<IconDelete/>}>
                    Delete
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
