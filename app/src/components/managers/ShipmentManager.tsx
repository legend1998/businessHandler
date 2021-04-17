import React, { useState } from 'react';


import IntroPage from '../IntroPage';
import LoadingPage from '../LoadingPage';

import warehouse from '../../assets/img/warehouse.png';
import { ScheduledShipmentObject } from '../../types';
import Network from '../../helpers/network';

export default function ShipmentManager() {

    // State
    const [loading, setLoading] = useState(false);
    const [scheduledShipmentList, setScheduledShipmentList] = useState<ScheduledShipmentObject[]>([]);

    function getScheduledShipments() {
        setLoading(true);
        Network.get('/shipments')
            .then(res => setScheduledShipmentList(res.data))
            .finally(() => setLoading(false));
    }

    return (
        loading ?
            <LoadingPage/>
        : scheduledShipmentList.length === 0 ?
            <IntroPage image={warehouse} description="This is where you can schedule recurring shipments and transfer inventory between locations." actionLabel="Schedule a Shipment" onClickAction={() => {}}/>
        :
            <div style={{ flex: 1, alignSelf: 'stretch' }}>
                {/*<div className={classes.header}>*/}
                {/*    <Typography variant="h4" component="div">*/}
                {/*        Orders*/}
                {/*    </Typography>*/}
                {/*    <div style={{ display: 'flex' }}>*/}
                {/*        <Button color="secondary" variant="contained" onClick={() => setShowCreate(true)}*/}
                {/*                startIcon={<IconAdd/>}>*/}
                {/*            Create new Order*/}
                {/*        </Button>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<Box p={3}>*/}
                {/*    <Paper elevation={1}>*/}
                {/*        <DataGrid rows={scheduledShipmentList} columns={columns} autoHeight onRowClick={({ row }) => onOrderClick(row as OrderObject)}/>*/}
                {/*    </Paper>*/}
                {/*</Box>*/}
            </div>
    );
}
