import React from 'react';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import AsyncButton from '../../components/AsyncButton';
import IconDelete from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';

import { ItemObject } from '../../types';

interface DeleteItemDialogProps {
    open: boolean,
    items?: ItemObject[],
    onClose?: () => void,
    onDeleteItems?: (user: ItemObject[], callback: () => void) => void
}

export default function DeleteItemDialog(props: DeleteItemDialogProps) {
    const { open, onClose, items, onDeleteItems } = props;

    // Functions
    function handleClose() {
        if (onClose)
            onClose();
    }

    function deleteItems(callback: () => void) {
        if (onDeleteItems && items)
            onDeleteItems(items, callback);
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            {items?.length === 1 ?
                <DialogTitle>Deleting Item &mdash; <strong>{items[0].name}</strong></DialogTitle>
                :
                <DialogTitle>Deleting &mdash; <strong>{items?.length || 0} users</strong></DialogTitle>
            }
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete <strong>{items?.length === 1 ? `${items[0].name}` : `${items?.length} items`}</strong>?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <AsyncButton callback={deleteItems} color="primary" startIcon={<IconDelete/>}>
                    Delete
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
