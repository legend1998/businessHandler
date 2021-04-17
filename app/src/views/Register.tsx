import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReCAPTCHA from 'react-google-recaptcha';

import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import AsyncButton from '../components/AsyncButton';
import Grid from '@material-ui/core/Grid';
import useStyles from '../assets/style/FormStyles';

import logo from '../assets/img/logo.png';

import TextInput from '../components/TextInput';
import CurrencySelect from '../components/CurrencySelect';

import validationRules, { validateForm } from '../helpers/validation';
import * as UserService from '../helpers/user-service';

export default function Register() {
    const classes = useStyles();

    // State variables for each field
    const [currency, setCurrency] = useState('CAD');
    const [captcha, setCaptcha] = useState<string | null>(null);
    const [showCaptchaRequired, setShowCaptchaRequired] = useState(false);

    // References to each field
    const firstNameRef = useRef<any>();
    const lastNameRef = useRef<any>();
    const emailRef = useRef<any>();
    const passwordRef = useRef<any>();
    const password2Ref = useRef<any>();
    const businessNameRef = useRef<any>();
    const refList = [firstNameRef, lastNameRef, emailRef, passwordRef, password2Ref, businessNameRef];

    // Register and login the user
    async function register(callback: () => void) {
        if (!validateForm(refList)) {
            if (!captcha) {
                setShowCaptchaRequired(true);
            }
            callback();
            return;
        }

        if (!captcha) {
            callback();
            setShowCaptchaRequired(true);
            return;
        }

        try {
            const email = emailRef.current.value();
            const password = passwordRef.current.value();
            // Register user account and business
            await UserService.register(
                firstNameRef.current.value(),
                lastNameRef.current.value(),
                email,
                password,
                businessNameRef.current.value(),
                currency,
                captcha
            );
            callback();

            // Inform user that registration succeeded
            await Swal.fire({
                title: 'Registration Successful',
                text: 'You will now be redirected to your dashboard page.',
                icon: 'success'
            });

            // Log the user in
            await UserService.login(email, password);
        } catch (err) {
            console.error(err);
            callback();
            Swal.fire({
                title: 'Registration Failed',
                text: 'An error has occurred during the registration process. Please try again.',
                icon: 'error'
            });
        }
    }

    return (
        <Container component="main" maxWidth="sm" className={classes.container}>
            <CssBaseline/>
            <img src={logo} className={classes.logo} alt="SOEN Solutions Logo"/>
            <Card className={classes.card} elevation={4}>
                <Typography component="h1" variant="h5">
                    Register your Company
                </Typography>
                <Typography component="p" variant="body1" className={classes.body}>
                    Provide your name and email, create a password for your account, and enter your company's name and
                    preferred currency. You may change information pertaining to your company later. All fields are
                    required.
                </Typography>
                <form className={classes.form} noValidate>
                    <div style={{ display: 'flex' }}>
                        <TextInput
                            ref={firstNameRef}
                            className={classes.marginRight1}
                            margin="normal"
                            fullWidth
                            autoFocus
                            name="firstName"
                            label="First Name"
                            validationRules={[validationRules.required, validationRules.validateOnlyLetters]}/>
                        <TextInput
                            ref={lastNameRef}
                            className={classes.marginLeft1}
                            margin="normal"
                            fullWidth
                            name="lastName"
                            label="Last Name"
                            validationRules={[validationRules.required, validationRules.validateOnlyLetters]}/>
                    </div>
                    <TextInput
                        ref={emailRef}
                        margin="normal"
                        fullWidth
                        label="Email Address"
                        name="email"
                        validationRules={[validationRules.required, validationRules.validateEmail]}/>
                    <TextInput
                        ref={passwordRef}
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
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
                    <div style={{ display: 'flex' }}>
                        <TextInput
                            ref={businessNameRef}
                            margin="normal"
                            fullWidth
                            name="businessName"
                            label="Company Name"
                            style={{ flex: 2 }}
                            className={classes.marginRight1}
                            validationRules={[validationRules.required, validationRules.validateOnlyLetters]}/>
                        <CurrencySelect
                            formControlProps={{
                                style: { flex: 1 },
                                className: `${classes.select} ${classes.marginLeft1}`
                            }}
                            value={currency}
                            onChange={event => setCurrency(String(event.target.value))}
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left"
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left"
                                },
                                getContentAnchorEl: null
                            }}/>
                    </div>

                    <div className={classes.captcha}>
                        <ReCAPTCHA sitekey="6LdzKXYaAAAAAAXh6Oztu-HCi5nvdj_wWtV2M_85" onChange={value => { setCaptcha(value); setShowCaptchaRequired(false); }} />
                        {showCaptchaRequired &&
                            <Typography variant="caption" color="error" align="center" className={classes.captchaHint}>
                                Required.
                            </Typography>
                        }
                    </div>

                    <AsyncButton
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="secondary"
                        className={classes.submit}
                        callback={register}>
                        Register
                    </AsyncButton>
                    <Grid container>
                        <Grid item xs/>
                        <Grid item>
                            <Link className="MuiTypography-colorPrimary" to="/login">
                                Already have an account?
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </Card>
        </Container>
    );
}
