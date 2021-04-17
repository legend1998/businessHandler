interface Action {
    type: string,
    payload: any
}

interface ActionList<ModuleState> {
    [actionName: string]: (state: ModuleState, payload: any) => void
}

interface ModuleList {
    [moduleName: string]: StoreModule<any>
}

export interface StoreModule<ModuleState> {
    state: ModuleState,
    actions?: ActionList<ModuleState>,
    modules?: ModuleList
}

function executeAction(module: StoreModule<any>, state: any, action: Action) {
    const firstDelimiterIndex = action.type.indexOf('/');
    if (firstDelimiterIndex >= 0) {
        const moduleName = action.type.substr(0, firstDelimiterIndex);
        if (module.modules && module.modules[moduleName]) {
            const childModule = module.modules[moduleName];
            executeAction(childModule, state[moduleName],
                {
                    type: action.type.substring(firstDelimiterIndex + 1),
                    payload: action.payload
                });
        }
    } else if (module.actions && module.actions[action.type]) {
        module.actions[action.type](state, action.payload);
    }
}

function computeState(module: StoreModule<any>) {
    const moduleState = {
        ...module.state
    };

    // Compute children module states
    if (module.modules !== undefined) {
        Object.entries(module.modules).forEach(([name, module]) => {
            moduleState[name] = computeState(module);
        });
    }

    return moduleState;
}

export function createReducer<ModuleState>(module: StoreModule<ModuleState>) {
    return (state: any, action: Action) => {
        if (state === undefined)
            state = computeState(module);

        executeAction(module, state, action);

        return JSON.parse(JSON.stringify(state));
    }
}
