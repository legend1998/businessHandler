import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import moment from 'moment';

import flag from '../../assets/img/flag.png';

import { Item, ItemObject } from "../../types";

import { DataGrid, GridColDef } from "@material-ui/data-grid";
import IconButton from "@material-ui/core/IconButton";
import IconEdit from "@material-ui/icons/Edit";
import IconDelete from "@material-ui/icons/Delete";
import Network from "../../helpers/network";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconAdd from "@material-ui/icons/Add";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";

import IntroPage from '../IntroPage';
import LoadingPage from '../LoadingPage';

import CreateItemDialog from '../../dialogs/items/CreateItemDialog';
import EditItemDialog from '../../dialogs/items/EditItemDialog';
import DeleteItemDialog from '../../dialogs/items/DeleteItemDialog';

import { getItemList as updateItemList } from '../../helpers/actions';


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

export default function ProductManager() {

    // Hooks
    const classes = useStyles();
    const { addToast } = useToasts();

    // State
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(undefined);
    const [itemList, setItemList] = useState<ItemObject[]>([]);
    const [selection, setSelection] = useState<ItemObject[]>([]);
    const [loading, setLoading] = useState(false);

    // Load accounts when mounted
    useEffect(getItemList, []);

    // Table columns
    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Item Name', flex: 1 },
        { field: 'price', headerName: 'Price', width: 100, valueFormatter: ({ value }) => `$ ${Number(value).toFixed(2)}` },
        { field: 'created_at', headerName: 'Created', width: 200, valueFormatter: ({ value }) => moment(String(value)).format('LLL') },
        { field: 'actions', headerName: 'Actions', width: 120, disableClickEventBubbling: true,
            renderCell: ({ row }) =>
                <div style={{ display: 'flex' }}>
                    <IconButton size="small" color="secondary" onClick={() => { setCurrentItem(row); setShowEdit(true); }}>
                        <IconEdit/>
                    </IconButton>
                    <IconButton size="small" color="primary" className={classes.marginLeft} onClick={() => { setSelection([row as ItemObject]); setShowDelete(true); }}>
                        <IconDelete/>
                    </IconButton>
                </div>
        }
    ];

    function getItemList() {
        setLoading(true);
        Network.get('/items')
            .then(res => setItemList(res.data))
            .finally(() => setLoading(false));
    }

    function createItem(item: Item, callback: () => void) {
        return Network.post('/items/create', item)
            .then(res => {
                setItemList([...itemList, res.data]);
                setShowCreate(false);
                addToast('Item added', { appearance: 'success', autoDismiss: true });
                updateItemList(true);
            })
            .finally(callback);
    }

    function editItem(item: ItemObject, callback: () => void) {
        return Network.put(`/items/${item.id}`, item)
            .then(res => {
                const arr = [...itemList];
                arr.splice(arr.findIndex(i => i.id === item.id), 1, res.data);
                setItemList(arr);
                setShowEdit(false);
                addToast('Item modified', { appearance: 'success', autoDismiss: true });
                updateItemList(true);
            })
            .finally(callback);
    }

    function deleteItems(items: ItemObject[], callback: () => void) {
        const item_ids = items.map(i => i.id);
        return Network.post(`/items/delete-multiple`, { item_ids })
            .then(_ => {
                const arr = [...itemList].filter(i => !item_ids.includes(i.id));
                setSelection([]);
                setItemList(arr);
                setShowDelete(false);
                addToast(`${items.length} item${items.length > 1 ? 's' : ''} deleted`, { appearance: 'success', autoDismiss: true });
                updateItemList(true);
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
                itemList.length === 0 ?
                    <IntroPage image={flag} description="This is where you can add, edit, and remove items." actionLabel="Add an item" onClickAction={() => setShowCreate(true)}/>
                    :
                    <div style={{ flex: 1, alignSelf: 'stretch' }}>
                        <div className={classes.header}>
                            <Typography variant="h4" component="div">
                                Items
                            </Typography>
                            <div style={{ display: 'flex' }}>
                                {selection.length > 0 &&
                                <Button color="primary" variant="contained" className={classes.marginRight} onClick={() => setShowDelete(true)} startIcon={<IconDelete/>}>
                                    Delete {selection.length} item{selection.length > 1 ? 's' : ''}
                                </Button>
                                }
                                <Button color="secondary" variant="contained" onClick={() => setShowCreate(true)} startIcon={<IconAdd/>}>
                                    Add New Item
                                </Button>
                            </div>
                        </div>
                        <Box p={3}>
                            <Paper elevation={1}>
                                <DataGrid rows={itemList} columns={columns} autoHeight checkboxSelection
                                          selectionModel={selection.map(i => i.id)}
                                          onSelectionModelChange={({ selectionModel }) => setSelection(selectionModel.map(id => itemList.find(i => i.id === id)) as ItemObject[])}/>
                            </Paper>
                        </Box>
                    </div>
            }
            <CreateItemDialog open={showCreate} onClose={() => setShowCreate(false)} onCreateItem={createItem}/>
            <EditItemDialog open={showEdit} onClose={() => setShowEdit(false)} item={currentItem} onEditItem={editItem}/>
            <DeleteItemDialog open={showDelete} onClose={() => setShowDelete(false)} items={selection} onDeleteItems={deleteItems}/>
        </div>
    );
}
