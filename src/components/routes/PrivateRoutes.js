import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function PrivateRoutes({ children }) {
    const isLoggedIn = useAuth();
    return isLoggedIn ? children : <Navigate to="/" />;
}
