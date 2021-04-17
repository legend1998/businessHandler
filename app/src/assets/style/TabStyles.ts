import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    panel: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        height: 224,
    },
    tabList: {
        padding: theme.spacing(2, 0)
    },
    tabLabel: {
        display: 'flex',
        fontWeight: 'bold',
        alignItems: 'center',
        fontSize: 16,
        padding: theme.spacing(0, 3, 0, 1),
    },
    tabIcon: {
        marginRight: theme.spacing(3)
    },
    tabIndicator: {
        left: 10,
        width: 3,
        height: '38px !important',
        marginTop: 5,
        marginBottom: 5,
        borderRadius: 3
    }
}));

export default useStyles;
