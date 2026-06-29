import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';
import { logout } from '../store/authSlice';
import toast from 'react-hot-toast';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token: authToken, user } = useSelector((state) => state.auth);
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const inviteToken = searchParams.get('token');

  useEffect(() => {
    if (!inviteToken) {
      setStatus('error');
      setErrorMsg('No invitation token provided.');
    }
  }, [inviteToken]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authToken && inviteToken && status !== 'error') {
      const returnUrl = `/accept-invite?token=${encodeURIComponent(inviteToken)}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    }
  }, [authToken, inviteToken, navigate, status]);

  // Accept invitation
  useEffect(() => {
    if (!authToken || !inviteToken || status === 'error') return;

    const acceptInvitation = async () => {
      try {
        const res = await api.get(`/invitations/accept/${inviteToken}`);
        setStatus('success');
        toast.success('You have joined the workspace!');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to join workspace';
        const invited = err.response?.data?.invitedEmail || '';
        setInvitedEmail(invited);
        setErrorMsg(msg);
        setStatus('error');
        toast.error(msg);
      }
    };

    acceptInvitation();
  }, [authToken, inviteToken, navigate, status]);

  const handleLogoutAndRetry = () => {
    dispatch(logout());
    navigate(`/login?redirect=/accept-invite?token=${inviteToken}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Joining workspace...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              You've joined the workspace!
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Failed to join
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{errorMsg}</p>

            {invitedEmail && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  This invitation was sent to <strong>{invitedEmail}</strong>.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  You are currently logged in as <strong>{user?.email || 'unknown'}</strong>.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Please logout and login with the correct email address.
                </p>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <button
                onClick={handleLogoutAndRetry}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >
                Logout & Try Again
              </button>
              <br />
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;