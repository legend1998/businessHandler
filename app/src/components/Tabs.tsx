import React, { useState } from 'react';
import { AliveScope } from 'react-activation';

import MaterialTabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import useStyles from '../assets/style/TabStyles';
import TabPanel from './TabPanel';

import '../assets/style/tabs.scss';

interface TabInfo {
    label: string,
    component: React.ComponentType<any>,
    icon: React.ComponentType<any>
}

interface TabsProps {
    tabs: TabInfo[],
    orientation?: 'horizontal' | 'vertical',
    variant?: 'standard' | 'scrollable' | 'fullWidth',

}

function tabProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function Tabs(props: TabsProps) {
    const { tabs, orientation, variant } = props;

    const [tabIndex, setTabIndex] = useState(0);
    const classes = useStyles();

    return (
        <div className={classes.panel}>
            <AliveScope>
                <MaterialTabs orientation={orientation}
                      variant={variant}
                      value={tabIndex}
                      onChange={(_, value) => setTabIndex(value)}
                      classes={{ indicator: classes.tabIndicator }}
                      className={`${classes.tabList} tab-list`}>
                    {tabs.map((t, index) =>
                        <Tab key={`t${index}`} className="tab"
                             label={
                                 <div className={classes.tabLabel}>
                                     <t.icon className={classes.tabIcon} fontSize="large"/>{t.label}
                                 </div>
                             }
                             {...tabProps(index)} />
                     )}
                </MaterialTabs>
                {tabs.map((t, index) =>
                    <TabPanel key={`tc${index}`} value={tabIndex} index={index}>
                        <t.component/>
                    </TabPanel>
                )}
            </AliveScope>
        </div>
    );
}
