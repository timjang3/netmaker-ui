import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid'
import Fields from '../Utils/Fields'
import { Button } from '@material-ui/core';
import API from '../Utils/API'

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2em',
    marginBottom: '2em'
  },
  textFieldRight: {
    marginLeft: theme.spacing(1),
  },
  textFieldLeft: {
      marginRight: theme.spacing(1)
  },
  center: {
      textAlign: 'center'
  },
  main: {
      marginBottom: '3em',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
  },
  button: {
      marginLeft: '0.25em',
      marginRight: '0.25em',
      '&:hover': {
          backgroundColor: '#0000e4'
      }
  },
  button2: {
    marginLeft: '0.25em',
    marginRight: '0.25em',
    '&:hover': {
        backgroundColor: '#e40000'
    }
 }
}));

const readOnlyFields = [
    'nodeslastmodified',
    'networklastmodified',
]

const boolFields = [
    'defaultsaveconfig',
    'isdualstack',
]

const boolFieldValues = {
    defaultsaveconfig : 'Default SaveConfig',
    isdualstack: 'Dual Stack'
}

const intFields = [
    'defaultlistenport',
    'defaultkeepalive',
    'defaultcheckininterval'
]

const timeFields = [
    "nodeslastmodified",
    "networklastmodified"
]

export default function NetworkDetails({ networkData, setSelectedNetwork, back, setSuccess, setNetworkData }) {
  const classes = useStyles();
  const [isEditing, setIsEditing] = React.useState(false)
  const [settings, setSettings] = React.useState(null)
  const [currentSettings, setCurrentSettings] = React.useState(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState('')
  const [allowManual, setAllowManual] = React.useState(false)
  const [change, setChange] = React.useState(false)


  const handleSubmit = async event => {
    event.preventDefault()
    setIsProcessing(true)
    try {
        const response = await API.put(`/networks/${networkData.netid}`, { ...settings, allowmanualsignup: allowManual })
        if (response.status === 200) {
            setCurrentSettings(settings) // set what we've changed.
            setSuccess(`Successfully updated network ${networkData.displayname}`)
            setTimeout(() => {
                setSuccess('')
                API.get("/networks")
                .then(networksRes => {         
                    setNetworkData(networksRes.data)
                    setCurrentSettings(networksRes.data)
                    setIsProcessing(false)
                    setSettings(null)
                })
                .catch(error => {
                    setIsProcessing(false)
                })
            }, 1000)
        } else {
            setError(`Could not update network: ${networkData.displayname}.`)
        }
    } catch (err) {
        setError(`Could not update network: ${networkData.displayname}.`)
    }
    setIsProcessing(false)
  }

  const handleChange = event => {
    event.preventDefault()
    const { id, value } = event.target
    let newSettings = {...settings}
    if (intFields.indexOf(id) !== -1) {
        newSettings[id] = parseInt(value)
    } else {
        newSettings[id] = value
    }
    setSettings(newSettings)
    setChange(true)
  }

  const handleBoolChange = (event, fieldName) => {
    event.preventDefault()
    let newSettings = {...settings}
    newSettings[fieldName] = event.target.checked
    if (!event.target.checked && fieldName === 'isdualstack') {
        newSettings.addressrange6 = ''
    }
    setSettings(newSettings)
    setChange(true)
  }

  const toggleManual = event => {
      event.preventDefault()
      setAllowManual(!allowManual)
  }

  const removeNetwork = async networkName => {
    if (window.confirm(`Are you sure you want to remove network ${networkName}?`)) {
        setIsProcessing(true)
        try {
            const response = await API.delete(`/networks/${networkName}`) 
            if (response.status === 200) {
                setIsEditing(false); // return to network view
                setSuccess(`Succesfully removed network: ${networkName}!`)
                setSettings(null)
                setTimeout(() => {
                    setSuccess('')
                    window.location.reload()
                }, 1000)
            } else {
                setError(`Could not remove network: ${networkName}, please remove all nodes and try again.`)
            }
        } catch (err) {
            setError(`Server error occurred when removing: ${networkName}, please check connection and try again.`)
        }
    }
    setTimeout(() => {
        setSuccess('')
        setError('')
    }, 3000)
    setIsProcessing(false)
  }

  React.useEffect(() => {
        if (settings == null && networkData) {
            setAllowManual(networkData.allowmanualsignup)
            setSettings(networkData)
            setCurrentSettings(networkData)
        } else if (settings != null && networkData !== settings && !change) {
            setSettings(null)
        }
  }, [settings, networkData])

  return (
      <div>
          <form >
            <Grid justify='center' alignItems='center' container className={classes.main}>
                {isProcessing && 
                    <Grid item xs={10}>
                        <div className={classes.center}>
                            <CircularProgress />
                            <Typography variant='body1' color='textPrimary'>Loading...</Typography>
                        </div>
                    </Grid>
                }
                {error && 
                    <Grid item xs={10}>
                        <div className={classes.center}>
                            <Typography variant='body1' color='error'>{error}...</Typography>
                        </div>
                    </Grid>
                }
                <Grid item xs={12}>
                    <div className={classes.buttons}>
                        <Button className={classes.button} variant='outlined' disabled={isEditing} onClick={() => { setIsEditing(true) }}>
                            Edit
                        </Button>
                        <Button className={classes.button} variant='outlined' disabled={!isEditing} onClick={handleSubmit}>
                            Save
                        </Button>
                        <Button className={classes.button} variant='outlined' disabled={!isEditing} onClick={() => { setIsEditing(false); setSettings(currentSettings); }}>
                            Cancel
                        </Button>
                        <Button className={classes.button2} variant='outlined' onClick={() => removeNetwork(networkData.netid)}>
                            Delete
                        </Button>
                        {back && 
                            <Button className={classes.button} variant='outlined' onClick={() => setSelectedNetwork(null)}>
                                Back
                            </Button>
                        }
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div className={classes.center}>
                        <FormControlLabel
                            disabled={!isEditing}
                            control={<Switch checked={allowManual} disabled={!isEditing} onChange={toggleManual} color='primary' name="allowManual" />}
                            label={"Allow Node Signup Without Keys"}
                        />
                    </div>
                </Grid>
                { networkData && settings && Fields.NETWORK_FIELDS.map(fieldName => {
                    return fieldName !== 'accesskeys' ? 
                            <Grid item xs={12} md={5}>
                                {boolFields.indexOf(fieldName) >= 0 ? 
                                <div className={classes.center}>
                                <FormControlLabel
                                    control={
                                    <Switch
                                        checked={settings[fieldName]}
                                        onChange={(event) => handleBoolChange(event, fieldName)}
                                        name={fieldName}
                                        color="primary"
                                        disabled={!isEditing || readOnlyFields.indexOf(fieldName) >= 0}
                                        id={fieldName}
                                    />
                                    }
                                    label={boolFieldValues[fieldName]}
                                /></div> :
                                <TextField
                                    id={fieldName}
                                    label={fieldName === 'addressrange6' ? fieldName.toUpperCase() + ' (IPv6)' : fieldName.toUpperCase()}
                                    className={classes.textFieldLeft}
                                    placeholder={timeFields.indexOf(fieldName) >= 0 ? Fields.timeConverter(settings[fieldName]) : settings[fieldName]}
                                    value={timeFields.indexOf(fieldName) >= 0 ? Fields.timeConverter(settings[fieldName]) : settings[fieldName]}
                                    key={fieldName}
                                    fullWidth
                                    disabled={!isEditing || readOnlyFields.indexOf(fieldName) >= 0 || (!settings.isdualstack && fieldName === 'addressrange6')}
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    variant="outlined"
                                    onChange={handleChange}
                                />}
                            </Grid> : null
                    })}
            </Grid>
        </form>
      </div>
  );
}
