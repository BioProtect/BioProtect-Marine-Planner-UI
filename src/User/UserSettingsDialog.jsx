import Checkbox from '@mui/material/Checkbox'

import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import { selectCurrentUser } from '@slices/authSlice'
import { toggleDialog } from '@slices/uiSlice'
import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BPDialog from '../BPDialog'

function UserSettingsDialog(props) {
  const dispatch = useDispatch()
  // accumulates across saves; nothing renders it
  const optionsRef = useRef({})
  const userData = useSelector(selectCurrentUser)

  const setOption = (key, value) => {
    optionsRef.current = { ...optionsRef.current, [key]: value }
    props.saveOptions(optionsRef.current)
  }

  const toggleUseFeatureColors = (event) => {
    setOption('USEFEATURECOLORS', event.target.checked)
  }

  return (
    <BPDialog
      {...props}
      maxWidth="md"
      showCancelButton={false}
      onOk={() =>
        dispatch(
          toggleDialog({
            dialogName: 'userSettingsDialogOpen',
            isOpen: false,
          }),
        )}
      title="Settings"
    >
      <div key="k14">
        <FormGroup>
          <FormControlLabel
            control={(
              <Checkbox
                checked={userData?.use_feature_colors}
                onChange={toggleUseFeatureColors}
              />
            )}
            label="Use Feature Colours"
          />
        </FormGroup>
      </div>
    </BPDialog>
  )
}

export default UserSettingsDialog
