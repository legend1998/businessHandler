import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';

import AsyncButton from '../components/AsyncButton';

import * as UserService from '../helpers/user-service';

import logo from '../assets/img/logo.png';
import useStyles from '../assets/style/FormStyles';

export default function Login() {
    const classes = useStyles();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function login(callback: () => void) {
        return UserService.login(email, password)
            .catch(err => {
                console.error(err);
                callback();
                Swal.fire({
                    title: 'Invalid Credentials',
                    icon: 'error'
                });
            });
    }

    return (
        <Container component="main" maxWidth="sm" className={classes.container}>
            <CssBaseline/>
            <img src={logo} className={classes.logo} alt="SOEN Solutions Logo"/>
            <Card className={classes.card} elevation={4}>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={event => setEmail(event.target.value)}/>
                    <TextField
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        onChange={event => setPassword(event.target.value)}/>
                    <AsyncButton
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="secondary"
                        className={classes.submit}
                        callback={login}>
                        Login
                    </AsyncButton>
                    <Grid container>
                        <Grid item xs>
                            <Link className="MuiTypography-colorPrimary" to="/recover-password">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link className="MuiTypography-colorPrimary" to="/register">
                                Don't have an account?
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </Card>
        </Container>
    );
}
