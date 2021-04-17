import React from 'react';

import IconPeople from '@material-ui/icons/People';
import IconLocalOffer from '@material-ui/icons/LocalOffer';
import IconGpsFixed from '@material-ui/icons/GpsFixed';
import IconList from '@material-ui/icons/List';
import IconLocalAtm from '@material-ui/icons/LocalAtm';
import IconLocalShipping from '@material-ui/icons/LocalShipping';
import IconLibraryBooks from '@material-ui/icons/LibraryBooks';

import Tabs from '../components/Tabs';
import AccountManager from '../components/managers/AccountManager';
import LocationManager from '../components/managers/LocationManager';
import ProductManager from '../components/managers/ProductManager';
import InventoryManager from '../components/managers/InventoryManager';
import OrderManager from '../components/managers/OrderManager';
import ShipmentManager from '../components/managers/ShipmentManager';
import LogManager from '../components/managers/LogManager';
import RulesManager from '../components/managers/RulesManager';

export default function Dashboard() {

    const tabs = [
        { label: 'Accounts', component: AccountManager, icon: IconPeople },
        { label: 'Products', component: ProductManager, icon: IconLocalOffer },
        { label: 'Rules', component: RulesManager, icon: IconLocalOffer },
        { label: 'Locations', component: LocationManager, icon: IconGpsFixed },
        { label: 'Inventory', component: InventoryManager, icon: IconList },
        { label: 'Orders', component: OrderManager, icon: IconLocalAtm },
        { label: 'Shipments', component: ShipmentManager, icon: IconLocalShipping },
        { label: 'Logs', component: LogManager, icon: IconLibraryBooks }
    ]

    return (
        <Tabs orientation="vertical"
              variant="scrollable"
              tabs={tabs}/>
    );
}

