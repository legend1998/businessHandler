import React from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';

import { makeStyles } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconLogout from '@material-ui/icons/ExitToApp';
import icon from '../assets/img/icon.png';
import { logout } from '../helpers/user-service';

const useStyles = makeStyles((theme) => ({
    toolbar: {
        display: 'flex',
        alignItems: 'center'
    },
    toolbarTitle: {
        margin: theme.spacing(0, 0, 0, 1),
        color: 'black'
    }
}));

const mapStateToProps = (state: any) => {
    return {
        isAuthenticated: !!state.auth.user,
        business: state.auth.business
    }
};

function Navigation(props: { isAuthenticated: boolean, business: any }) {
    const { isAuthenticated, business } = props;

    const classes = useStyles();
    const location = useLocation();

    return (
        <div style={{ display: 'contents' }}>
        {
            !['/login', '/register', '/recover-password', '/reset-password'].some(p => location.pathname.includes(p)) ? (
                <AppBar position="absolute" style={{ backgroundColor: '#CFD2D7', zIndex: 0 }} elevation={0}>
                    <Toolbar className={classes.toolbar}>
                        <img height="60" src={icon} alt="SOEN Solutions Icon"/>
                        {
                            isAuthenticated ?
                                (
                                    <div style={{ display: 'contents' }}>
                                        <Typography variant="h4" component="h1" className={classes.toolbarTitle}>
                                            {business.name}
                                        </Typography>
                                        <div style={{ flex: 1 }}/>
                                        <Button variant="outlined" color="secondary" onClick={logout} startIcon={<IconLogout/>}>
                                            Logout
                                        </Button>
                                    </div>
                                ) : null
                        }
                    </Toolbar>
                </AppBar>
            ) : null
        }
        </div>
    );
}

export default connect(mapStateToProps)(Navigation);
