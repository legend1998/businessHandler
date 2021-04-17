import React from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(theme => ({
    actionButton: {
        marginTop: theme.spacing(2)
    }
}));

interface IntroPageProps {
    image: string,
    description: string,
    actionLabel: string,
    noAction?: boolean,
    onClickAction?: () => void
}

export default function IntroPage(props: IntroPageProps) {
    const { image, description, actionLabel, noAction, onClickAction } = props;

    const classes = useStyles();

    function onClick() {
        if (onClickAction)
            onClickAction();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}>
            <img src={image} alt="map" width="250"/><br/>
            <Typography component="h1" variant="h6" align="center" style={{ maxWidth: 400 }}>
                {description}
            </Typography>
            {!noAction &&
                <Button
                    className={classes.actionButton}
                    type="submit"
                    variant="contained"
                    color="secondary"
                    onClick={onClick}>
                    {actionLabel}
                </Button>
            }
        </div>
    );
}
