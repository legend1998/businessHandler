import React, { useRef } from 'react';
import { useHistory, useParams } from 'react-router';
import Swal from 'sweetalert2';

import CssBaseline from '@material-ui/core/CssBaseline';
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
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
    const classes = useStyles();
    const { resetGUID } = useParams<{ resetGUID: string }>();

    const passwordRef = useRef<any>();
    const password2Ref = useRef<any>();
    const refList = [passwordRef, password2Ref];

    const history = useHistory();

    function resetPassword(callback: () => void) {
        if (!validateForm(refList)) {
            callback();
            return;
        }

        Network.post('/users/reset-password', {
            reset_guid: resetGUID,
            password: passwordRef.current.value()
        }).then(async () => {
            callback();
            await Swal.fire({
                title: 'Password Reset',
                text: 'Your password has successfully been reset. You will now be redirected to the login page.',
                icon: 'success'
            });
            history.push('/login');
        }).catch((err) => {
            console.error(err);
            callback();
            Swal.fire({
                title: 'Password Reset Failed',
                text: 'An error has occurred during the password reset process. Please try again.',
                icon: 'error'
            });
        });
    }

    return (
        <Container component="main" maxWidth="sm" className={classes.container}>
            <CssBaseline/>
            <img src={logo} className={classes.logo} alt="SOEN Solutions Logo"/>
            <Card className={classes.card} elevation={4}>
                <CardContent>
                    <Typography component="h1" variant="h5">
                        Reset Password
                    </Typography>
                    <Typography component="p" variant="body1" className={classes.body}>
                        Please enter and confirm the new password you would like to use to login to your account.
                    </Typography>
                    <form className={classes.form} noValidate>
                        <TextInput
                            ref={passwordRef}
                            margin="normal"
                            fullWidth
                            name="password"
                            label="New Password"
                            type="password"
                            autoFocus
                            validationRules={[
                                validationRules.required,
                                validationRules.validateMinLength(8),
                                validationRules.validateMaxLength(50),
                                validationRules.validateLowercaseLetters,
                                validationRules.validateUppercaseLetters,
                                validationRules.validateNumbers,
                                validationRules.validateSpecialCharacters
                            ]}/>
                        <TextInput
                            ref={password2Ref}
                            margin="normal"
                            fullWidth
                            name="password2"
                            label="Confirm Password"
                            type="password"
                            validationRules={[
                                validationRules.required,
                                value => value === passwordRef.current.value() || `Passwords do not match.`
                            ]}/>
                        <AsyncButton
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="secondary"
                            className={classes.submit}
                            callback={resetPassword}>
                            Reset My Password
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
