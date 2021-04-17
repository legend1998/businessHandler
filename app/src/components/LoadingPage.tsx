import React from 'react';

import IconCached from '@material-ui/icons/Cached';
import Typography from '@material-ui/core/Typography';

export default function LoadingPage() {
    return (
        <div style={{ flex: 1, alignSelf: 'stretch', display: 'flex', flexDirection: 'column',  justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
            <IconCached className="spin-animation" style={{ fontSize: 45 }}/>
            <Typography component="div" variant="h6">Loading</Typography>
        </div>
    );
}
