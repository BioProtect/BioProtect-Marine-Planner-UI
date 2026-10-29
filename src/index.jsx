import CssBaseline from '@mui/material/CssBaseline'

import { ThemeProvider } from '@mui/material/styles'
import store from '@store/store'
import { SnackbarProvider } from 'notistack'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import brandTheme from './theme'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={brandTheme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={5}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        variant="filled" // optional
        preventDuplicate
      >
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </Provider>,
)
