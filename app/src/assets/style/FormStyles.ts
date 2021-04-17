import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex !important',
        flexDirection: 'column',
        alignItems: 'center'
    },
    body: {
        margin: theme.spacing(2, 0, 0, 0)
    },
    logo: {
        height: 120,
        margin: theme.spacing(3, 0)
    },
    card: {
        padding: theme.spacing(5),
        margin: theme.spacing(0, 0, 5, 0),
        backgroundColor: theme.palette.background.paper
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(0),
    },
    submit: {
        fontSize: 16,
        margin: theme.spacing(3, 0, 2, 0)
    },
    select: {
        margin: theme.spacing(2, 0, 1, 0)
    },
    marginLeft1: {
        margin: theme.spacing(2, 0, 1, 1)
    },
    marginRight1: {
        margin: theme.spacing(2, 1, 1, 0)
    },
    padRight: {
        margin: theme.spacing(2, 2, 0, 0)
    },
    padLeft: {
        margin: theme.spacing(2, 0, 0, 2)
    },
    padTop: {
        margin: theme.spacing(5, 0, 0, 0)
    },
    padBottom: {
        margin: theme.spacing(0, 0, 5, 0)
    },
    captcha: {
        marginTop: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    captchaHint: {
        marginTop: theme.spacing(0.5),
    }
}));

export default useStyles;
