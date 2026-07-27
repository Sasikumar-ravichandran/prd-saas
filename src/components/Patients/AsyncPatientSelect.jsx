import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, Typography } from '@mui/material';
import { patientService } from '../../api/services/patientService'; 

export default function AsyncPatientSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    let active = true;

    if (!open) {
      setLoading(false); //Force the spinner off when closed
      return; 
    }

    // Set loading instantly! This stops the "No options" flash.
    setLoading(true);

    const fetchPatients = async () => {
      try {
        const response = await patientService.getAll({ 
          page: 1, 
          limit: 10, 
          search: inputValue 
        });

        if (active) {
          let fetchedOptions = response.patients || [];
          if (value && !fetchedOptions.find(p => p._id === value._id)) {
            fetchedOptions = [value, ...fetchedOptions];
          }
          setOptions(fetchedOptions);
        }
      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    // The API call is still delayed to save bandwidth, but the UI is now safely "Loading"
    const timer = setTimeout(() => { fetchPatients(); }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue, open, value]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, val) => option._id === val._id}
      
      //  FIX 2: Auto-fills the text box with "Name (ID)" when selected
      getOptionLabel={(option) => `${option.fullName} (${option.patientId || 'No ID'})`}
      
      options={options}
      loading={loading}
      loadingText="Searching..." // Looks much more professional than the default
      noOptionsText="No patients found"
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search patient..."
          size="small"
          fullWidth
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
      
      //  FIX 3: Clean, simplified dropdown UI showing only Name and ID
      renderOption={(props, option) => (
        <li {...props} key={option._id}>
          <Typography variant="body2" fontWeight="700" color="#0f172a">
            {option.fullName}
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: '500' }}>
              ID: {option.patientId}
            </Typography>
          </Typography>
        </li>
      )}
    />
  );
}