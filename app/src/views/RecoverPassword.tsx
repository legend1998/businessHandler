import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Network from '../helpers/network';
import logo from '../assets/img/logo.png';
import AsyncButton from '../components/AsyncButton';
import useStyles from '../assets/style/FormStyles';
import TextInput from '../components/TextInput';

import validationRules, { validateForm } from '../helpers/validation';

export default function RecoverPassword() {
    const classes = useStyles();

    const emailRef = useRef<any>();

    function sendVerificationEmail(callback: () => void) {
        if (!validateForm([emailRef])) {
            callback();
            return;
        }

        Network.post('/users/send-verification', {
            email: emailRef.current.value()
        }).then(() => {
            callback();
            Swal.fire({
                title: 'Verification Sent',
                text: 'A verification email has been sent to your inbox. Follow the instructions on it to proceed.',
                icon: 'success'
            })
        }).catch(callback);
    }

    return (
        <Container component="main" maxWidth="sm" className={classes.container}>
            <CssBaseline/>
            <img src={logo} className={classes.logo} alt="SOEN Solutions Logo"/>
            <Card className={classes.card} elevation={4}>
                <CardContent>
                    <Typography component="h1" variant="h5">
                        Recover Password
                    </Typography>
                    <Typography component="p" variant="body1" className={classes.body}>
                        Provide the email address associated to your account below to receive a verification email. If
                        such an account exists, an email will be sent to your inbox with further instructions on how to
                        reset your password.
                    </Typography>
                    <form className={classes.form} noValidate>
                        <TextInput
                            ref={emailRef}
                            margin="normal"
                            fullWidth
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            validationRules={[validationRules.required, validationRules.validateEmail]}/>
                        <AsyncButton
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="secondary"
                            className={classes.submit}
                            callback={sendVerificationEmail}>
                            Send Email
                        </AsyncButton>
                        <Grid container>
                            <Grid item xs>
                            </Grid>
                            <Grid item>
                                <Link className="MuiTypography-colorPrimary" to="/login">
                                    Login instead?
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
}
