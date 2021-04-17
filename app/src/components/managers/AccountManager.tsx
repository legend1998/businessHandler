import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications'
import moment from 'moment'

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconAdd from '@material-ui/icons/Add';
import IconEdit from '@material-ui/icons/Edit';
import IconDelete from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/core/styles/makeStyles';

import IntroPage from '../IntroPage';

import user from '../../assets/img/user.png';
import Network from '../../helpers/network';
import { User, UserObject } from '../../types';

import CreateUserDialog from '../../dialogs/users/CreateUserDialog';
import EditUserDialog from '../../dialogs/users/EditUserDialog';
import DeleteUserDialog from '../../dialogs/users/DeleteUserDialog';
import LoadingPage from '../LoadingPage';

const useStyles = makeStyles(theme => ({
    header: {
        margin: theme.spacing(2, 3, 0, 3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    marginLeft: {
        marginLeft: theme.spacing(1)
    },
    marginRight: {
        marginRight: theme.spacing(1)
    }
}));

export default function AccountManager() {

    // Hooks
    const classes = useStyles();
    const { addToast } = useToasts();

    // State
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [currentUserAccount, setCurrentUserAccount] = useState<UserObject | undefined>(undefined);
    const [accountList, setAccountList] = useState<UserObject[]>([]);
    const [selection, setSelection] = useState<UserObject[]>([]);
    const [loading, setLoading] = useState(false);

    // Load accounts when mounted
    useEffect(getAccountList, []);

    // Table columns
    const columns: GridColDef[] =  [
        { field: 'first_name', headerName: 'First Name', width: 130 },
        { field: 'last_name', headerName: 'Last Name', width: 130 },
        { field: 'email', headerName: 'Email Address', flex: 1 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'created_at', headerName: 'Created', width: 200, valueFormatter: ({ value }) => moment(String(value)).format('LLL') },
        { field: 'actions', headerName: 'Actions', width: 120, disableClickEventBubbling: true,
            renderCell: ({ row }) =>
                <div style={{ display: 'flex' }}>
                    <IconButton size="small" color="secondary" onClick={() => { setCurrentUserAccount(row as UserObject); setShowEdit(true); }}>
                        <IconEdit/>
                    </IconButton>
                    <IconButton size="small" color="primary" className={classes.marginLeft} onClick={() => { setSelection([row as UserObject]); setShowDelete(true); }}>
                        <IconDelete/>
                    </IconButton>
                </div>
        }
    ];

    function getAccountList() {
        setLoading(true);
        Network.get('/accounts')
            .then(res => setAccountList(res.data))
            .finally(() => setLoading(false));
    }

    function createUserAccount(user: User, callback: () => void) {
        return Network.post('/accounts/create', user)
            .then(res => {
                setAccountList([...accountList, res.data]);
                setShowCreate(false);
                addToast('User account added', { appearance: 'success', autoDismiss: true });
            })
            .finally(callback);
    }

    function editUserAccount(user: UserObject, callback: () => void) {
        return Network.put(`/accounts/${user.id}`, user)
            .then(res => {
                const arr = [...accountList];
                arr.splice(arr.findIndex(u => u.id === user.id), 1, res.data);
                setAccountList(arr);
                setShowEdit(false);
                addToast('User account modified', { appearance: 'success', autoDismiss: true });
            })
            .finally(callback);
    }

    function deleteUserAccounts(users: UserObject[], callback: () => void) {
        const user_ids = users.map(u => u.id);
        return Network.post(`/accounts/delete-multiple`, { user_ids })
            .then(_ => {
                const arr = [...accountList].filter(u => !user_ids.includes(u.id));
                setSelection([]);
                setAccountList(arr);
                setShowDelete(false);
                addToast(`${users.length} user account${users.length > 1 ? 's' : ''} deleted`, { appearance: 'success', autoDismiss: true });
            })
            .finally(callback);
    }

    // @ts-ignore
    return (
        <div style={{ display: 'contents' }}>
            {
                loading ?
                    <LoadingPage/>
                :
                accountList.length === 0 ?
                    <IntroPage image={user} description="This is where you can manage other users." actionLabel="Add a user" onClickAction={() => setShowCreate(true)}/>
                :
                    <div style={{ flex: 1, alignSelf: 'stretch' }}>
                        <div className={classes.header}>
                            <Typography variant="h4" component="div">
                                User Accounts
                            </Typography>
                            <div style={{ display: 'flex' }}>
                                {selection.length > 0 &&
                                    <Button color="primary" variant="contained" className={classes.marginRight} onClick={() => setShowDelete(true)} startIcon={<IconDelete/>}>
                                        Delete {selection.length} item{selection.length > 1 ? 's' : ''}
                                    </Button>
                                }
                                <Button color="secondary" variant="contained" onClick={() => setShowCreate(true)} startIcon={<IconAdd/>}>
                                    Add New User
                                </Button>
                            </div>
                        </div>
                        <Box p={3}>
                            <Paper elevation={1}>
                                <DataGrid rows={accountList} columns={columns} autoHeight checkboxSelection
                                          selectionModel={selection.map(u => u.id)}
                                          onSelectionModelChange={({selectionModel}) => setSelection(selectionModel.map(id => accountList.find(u => u.id === id)) as UserObject[])} />
                            </Paper>
                        </Box>
                    </div>
            }
            <CreateUserDialog open={showCreate} onClose={() => setShowCreate(false)} onCreateAccount={createUserAccount}/>
            <EditUserDialog open={showEdit} onClose={() => setShowEdit(false)} userAccount={currentUserAccount} onEditAccount={editUserAccount}/>
            <DeleteUserDialog open={showDelete} onClose={() => setShowDelete(false)} userAccounts={selection} onDeleteAccounts={deleteUserAccounts}/>
        </div>
    );
}
