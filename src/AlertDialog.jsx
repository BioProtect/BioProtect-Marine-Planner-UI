import { toggleDialog } from '@slices/uiSlice'

import { useDispatch, useSelector } from 'react-redux'
import BPDialog from './BPDialog'

function AlertDialog() {
  const dispatch = useDispatch()
  const dialogStates = useSelector(state => state.ui.dialogStates)

  return (
    <BPDialog
      open={dialogStates.alertDialogOpen}
      onOk={() =>
        dispatch(toggleDialog({ dialogName: 'alertDialogOpen', isOpen: false }))}
      contentWidth={500}
      offsetY={80}
      title="Alert"
    >
      <div key="k23">
        <div className="description">
          A new version of the WDPA is available.
          {' '}
          <br />
          Click on Help | Server Details for more information.
        </div>
      </div>
    </BPDialog>
  )
}

export default AlertDialog
