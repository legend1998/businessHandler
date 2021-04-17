import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Network from '../helpers/network';
import { FilterOptionsState } from '@material-ui/lab/useAutocomplete/useAutocomplete.js';

interface AsyncAutocompleteProps {
    idField: string,
    labelFormatter: (option: any) => string,
    labelRenderer?: (option: any, state: object) => React.ReactNode,
    filterOptions?: (options: any[], state: FilterOptionsState<any>) => any[],
    url: string,
    debounceTime: number,
    inputLabel: string,
    inputPlaceholder: string,
    [key: string]: any
}

const AsyncAutocomplete = forwardRef((props: AsyncAutocompleteProps, ref) => {

    const { idField, labelFormatter, labelRenderer, filterOptions, url, debounceTime, inputLabel, inputPlaceholder, ...otherProps } = props;

    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState<any | undefined>();
    const [loading, setLoading] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | undefined>();

    useEffect(() => {
        let cancelled = false;
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        if (!cancelled) {
            setDebounceTimeout(setTimeout(() => {
                setLoading(true);
                if (!cancelled)
                    Network.get(`${url}?q=${inputValue}`)
                        .then(res => {
                            if (!cancelled)
                                setOptions(res.data)
                        })
                        .finally(() => {
                            if (!cancelled)
                                setLoading(false);
                        });
            }, debounceTime));
        }
        return () => {
            cancelled = true;
        }
        // eslint-disable-next-line
    }, [inputValue]);

    function getValue() {
        return value;
    }

    // Ref properties
    useImperativeHandle(ref, () => ({
        value: () => getValue()
    }));

    return (
        <Autocomplete
            id="asynchronous-demo"
            {...otherProps}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            onChange={(_, newValue) => setValue(newValue)}
            inputValue={inputValue}
            onInputChange={(_, value) => setInputValue(value)}
            getOptionSelected={(option, value) => option[idField] === value[idField]}
            getOptionLabel={labelFormatter}
            renderOption={labelRenderer}
            filterOptions={filterOptions}
            options={options as any[]}
            loading={loading}
            clearOnBlur={false}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={inputLabel}
                    placeholder={inputPlaceholder}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
});

export default AsyncAutocomplete;
