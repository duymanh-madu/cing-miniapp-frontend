import {
  showBusinessToast,
  showErrorToast,
  showSuccessToast,
} from "../components/toast/toastService";

/**
 * ============================================
 * USE TOAST
 * ============================================
 */

function useToast() {
  return {
    success:
      showSuccessToast,

    error:
      showErrorToast,

    business:
      showBusinessToast,
  };
}

export default useToast;