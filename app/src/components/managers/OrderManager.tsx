import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconAdd from '@material-ui/icons/Add.js';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import makeStyles from '@material-ui/core/styles/makeStyles';

import receipt from '../../assets/img/receipt.png';
import Network from '../../helpers/network';
import { Order, OrderObject } from '../../types.js';
import IntroPage from '../IntroPage';

import store from '../../store/root';
import CreateOrderDialog from '../../dialogs/orders/CreateOrderDialog';
import { useToasts } from 'react-toast-notifications';
import InventoryEditor from '../InventoryEditor';
import LoadingPage from '../LoadingPage';
import { formatAmount } from '../../helpers/filters';

const phoneUtil = PhoneNumberUtil.getInstance();

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

export default function OrderManager() {

    // Hooks
    const classes = useStyles();
    const { addToast } = useToasts();

    // State
    const [orderList, setOrderList] = useState<OrderObject[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<OrderObject | undefined>();

    // Effects
    useEffect(() => {
        setLoading(true);
        Promise.all<Promise<any>>([getOrderList()])
            .finally(() => setLoading(false));
    }, []);

    const columns: GridColDef[] =  [
        { field: 'name', headerName: 'Customer', flex: 1, valueGetter: ({ row }) => `${row.customer.first_name} ${row.customer.last_name}` },
        { field: 'phone_number', headerName: 'Phone Number', width: 150, valueGetter: ({ row }) => phoneUtil.format(phoneUtil.parse(row.customer.phone_number), PhoneNumberFormat.INTERNATIONAL) },
        { field: 'total_items', headerName: 'Items', width: 100 },
        { field: 'subtotal_amount', headerName: 'Subtotal', width: 130, valueFormatter: ({ value, row }) => formatAmount(row.currency as string, value as number, true) },
        { field: 'tax_rate', headerName: 'Tax', width: 130, valueFormatter: ({ value, row }) => `${formatAmount(row.currency as string, row.subtotal_amount * (value as number), true)} (${value as number * 100}%)` },
        { field: 'total_amount', headerName: 'Total', width: 130, valueFormatter: ({ value, row }) => formatAmount(row.currency as string, value as number) },
        { field: 'created_at', headerName: 'Ordered On', width: 200, valueFormatter: ({ value }) => moment(String(value)).format('LLL') },
    ];

    function getOrderList() {
        return Network.get(`/orders`)
            .then(res => setOrderList(res.data));
    }

    function createOrder(order: Order, callback: () => void) {
        return Network.post(`/orders/create`, {
            ...order,
            items: order.items.map(i => ({ item_id: i.item.id, quantity: i.quantity, variants: i.variants
        }))})
        .then(res => {
            setOrderList([...orderList, res.data]);
            setShowCreate(false);
            addToast('Order placed', { appearance: 'success', autoDismiss: true });
        })
        .finally(callback);
    }

    function onOrderClick(order: OrderObject) {
        setCurrentOrder(order);
        setShowOrder(true);
    }

    return (
        <div style={{ display: 'contents' }}>
            {
                loading ?
                    <LoadingPage/>
                :
                orderList.length === 0 ?
                    <IntroPage image={receipt} description="This is where you can create orders for customers."
                               actionLabel="Create an Order" onClickAction={() => setShowCreate(true)}/>
                :
                    <div style={{ flex: 1, alignSelf: 'stretch' }}>
                        <div className={classes.header}>
                            <Typography variant="h4" component="div">
                                Orders
                            </Typography>
                            <div style={{ display: 'flex' }}>
                                <Button color="secondary" variant="contained" onClick={() => setShowCreate(true)}
                                        startIcon={<IconAdd/>}>
                                    Create new Order
                                </Button>
                            </div>
                        </div>
                        <Box p={3}>
                            <Paper elevation={1}>
                                <DataGrid rows={orderList} columns={columns} autoHeight onRowClick={({ row }) => onOrderClick(row as OrderObject)}/>
                            </Paper>
                        </Box>
                    </div>
            }
            <CreateOrderDialog open={showCreate} onClose={() => setShowCreate(false)} onCreateOrder={createOrder}/>
            <InventoryEditor open={showOrder} onClose={() => setShowOrder(false)} title={`Order Items — ${currentOrder?.customer.first_name} ${currentOrder?.customer.last_name}`}
                             items={currentOrder?.items || []} itemList={store.getState().items} currency={currentOrder?.currency} showItemPrices readonly/>
        </div>
    );
}
