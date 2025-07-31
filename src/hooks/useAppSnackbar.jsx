// hooks/useAppSnackbar.js
import { useSnackbar } from 'notistack';

const useAppSnackbar = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showMessage = (message, variant = 'default') => {
    if (!message) return;
    enqueueSnackbar(message, { variant }); // variant: success, error, warning, info, default
  };

  return { showMessage };
};

export default useAppSnackbar;
