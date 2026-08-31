import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, hideLoginModal } from '../../features/auth/authSlice.js';
import { googleLoginApi, getErrorMessage } from '../../utils/api.js';
import { GoogleLogin } from '@react-oauth/google';
import { syncCartWithBackend } from '../../features/cart/cartSlice.js';
import { useToast } from '../ui/Toast.jsx';
import Modal from '../ui/Modal.jsx';
import InAppBrowserNotice from '../common/InAppBrowserNotice.jsx';

const LoginModal = () => {
  const { isLoginModalOpen } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleClose = () => {
    dispatch(hideLoginModal());
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(authStart());
    try {
      const response = await googleLoginApi(credentialResponse.credential);
      dispatch(authSuccess(response));
      showToast(`Welcome back, ${response.user.name}!`, 'success');
      dispatch(syncCartWithBackend());
      handleClose();

      if (response.user.role === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      dispatch(authFailure(errorMsg));
      showToast(errorMsg, 'error');
    }
  };

  const handleGoogleError = () => {
    showToast('Google Sign-In failed. Please try again.', 'error');
  };

  return (
    <Modal isOpen={isLoginModalOpen} onClose={handleClose} title="Sign In to CuraCare" size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-md shadow-primary-500/15 flex items-center justify-center mb-4 border border-bdr-main/20">
          <img
            src="/logo.png"
            alt="CuraCare Icon"
            className="w-10 h-10 object-contain scale-[1.1]"
          />
        </div>

        <h3 className="font-display font-bold text-lg text-txt-title mb-1">
          Continue with Google
        </h3>
        <p className="text-xs text-txt-muted max-w-xs mb-4">
          Sign in or create an account with Google to manage your cart, orders, and prescriptions seamlessly.
        </p>

        {/* In-App Browser detection & platform selection */}
        <InAppBrowserNotice className="mb-4" />

        <div className="flex justify-center w-full py-1">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            shape="rectangular"
            size="large"
          />
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
