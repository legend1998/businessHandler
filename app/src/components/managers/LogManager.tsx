import React, { useEffect, useState } from 'react';
import moment from 'moment';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import makeStyles from '@material-ui/core/styles/makeStyles';

import IntroPage from '../IntroPage';
import LoadingPage from '../LoadingPage';

import warehouse from '../../assets/img/warehouse.png';
import Network from '../../helpers/network';
import { LogObject } from '../../types';

const useStyles = makeStyles(theme => ({
    header: {
        margin: theme.spacing(2, 3, 0, 3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
}));

export default function LogManager() {

    // Hooks
    const classes = useStyles();

    // State
    const [loading, setLoading] = useState(false);
    const [logList, setLogList] = useState<LogObject[]>([]);

    // Effects
    useEffect(getLogs, []);

    const colorFromSeverity = (severity: 'info' | 'activity' | 'warning' | 'error') => {
        switch(severity) {
            case 'info':
                return '#007bffcc';
            case 'activity':
                return '#28a745cc';
            case 'warning':
                return '#ffc107ff';
            case 'error':
                return '#dc3545cc';
        }
    }

    // Table columns
    const columns: GridColDef[] =  [
        { field: 'severity', headerName: 'Severity', width: 110,
            renderCell: ({ value }) =>
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: 90, height: 30, borderRadius: 2, border: '2px solid #0007', color: 'white', backgroundColor: colorFromSeverity(value as ('info' | 'activity' | 'warning' | 'error')), display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {String(value).toUpperCase()}
                    </div>
                </div>
        },
        { field: 'message', headerName: 'Message', flex: 1 },
        { field: 'created_at', headerName: 'Created', width: 200, valueFormatter: ({ value }) => moment(String(value)).format('LLL') }
    ];

    // Functions
    function getLogs() {
        setLoading(true)
        Network.get('/logs')
            .then(res => setLogList(res.data))
            .finally(() => setLoading(false));
    }

    return (
        loading ?
            <LoadingPage/>
        :
        logList.length === 0 ?
            <IntroPage image={warehouse} description="This is where you will see important updates regarding the state of the system." actionLabel="" noAction />
        :
            <div style={{ flex: 1, alignSelf: 'stretch' }}>
                <div className={classes.header}>
                    <Typography variant="h4" component="div">
                        System Logs
                    </Typography>
                </div>
                <Box p={3}>
                    <Paper elevation={1}>
                        <DataGrid rows={logList} columns={columns} autoHeight/>
                    </Paper>
                </Box>
            </div>
    );
}
