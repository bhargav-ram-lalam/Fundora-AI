import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setStartup } from '../../features/startup/startupSlice';
import { setNotifications } from '../../features/notifications/notificationSlice';
import { startupAPI, notificationAPI } from '../../api/services';

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const dispatch = useDispatch();

  // Load startup and notifications on auth
  useEffect(() => {
    if (isAuthenticated && user?.role === 'founder') {
      startupAPI.getMy().then(r => dispatch(setStartup(r.data.data))).catch(() => {});
    }
    if (isAuthenticated) {
      notificationAPI.getAll({ limit: 20 }).then(r => {
        dispatch(setNotifications({ notifications: r.data.data, unreadCount: r.data.unreadCount }));
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to={`/${user?.role}`} replace />;
  return <Outlet />;
}
