import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#922238',
        },
        secondary: {
            main: '#274B65',
        }
    },
    typography: {
        fontFamily: [
            'Quicksand',
            'Roboto',
            'Arial',
            'sans-serif'
        ].join(','),
        h5: {
            fontWeight: 600
        }
    }
});

export default theme;
