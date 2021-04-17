import React from 'react';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import AsyncButton from '../../components/AsyncButton';
import IconDelete from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';

import { UserObject } from '../../types';

interface DeleteUserDialogProps {
    open: boolean,
    userAccounts?: UserObject[],
    onClose?: () => void,
    onDeleteAccounts?: (user: UserObject[], callback: () => void) => void
}

export default function DeleteUserDialog(props: DeleteUserDialogProps) {
    const { open, onClose, userAccounts, onDeleteAccounts } = props;

    // Functions
    function handleClose() {
        if (onClose)
            onClose();
    }

    function deleteUserAccounts(callback: () => void) {
        if (onDeleteAccounts && userAccounts)
            onDeleteAccounts(userAccounts, callback);
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            {userAccounts?.length === 1 ?
                <DialogTitle>Deleting User &mdash; <strong>{userAccounts[0].first_name} {userAccounts[0].last_name}</strong></DialogTitle>
                :
                <DialogTitle>Deleting &mdash; <strong>{userAccounts?.length || 0} users</strong></DialogTitle>
            }
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete <strong>{userAccounts?.length === 1 ? `${userAccounts[0].first_name} ${userAccounts[0].last_name}` : `${userAccounts?.length} users`}</strong>?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <AsyncButton callback={deleteUserAccounts} color="primary" startIcon={<IconDelete/>}>
                    Delete
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
