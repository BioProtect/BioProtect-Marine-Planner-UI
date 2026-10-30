import { ThemeProvider } from '@mui/material/styles'
import { makeStore } from '@store/store'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { Provider } from 'react-redux'
import brandTheme from '../theme'

/**
 * Renders with the real store, theme and snackbar provider, like index.jsx.
 * State is set by dispatching `actions` (not preloadedState, which would
 * replace whole slices and drop their defaults).
 */
export function renderWithProviders(ui, { actions = [] } = {}) {
  const store = makeStore()
  actions.forEach(store.dispatch)
  const user = userEvent.setup()
  const result = render(
    <Provider store={store}>
      <ThemeProvider theme={brandTheme}>
        <SnackbarProvider>{ui}</SnackbarProvider>
      </ThemeProvider>
    </Provider>,
  )
  return { store, user, ...result }
}
