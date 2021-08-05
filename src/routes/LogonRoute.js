import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Context } from '../functions/Store';

const LogonRoute = ({ component: Component, ...rest }) => {
    const [state] = useContext(Context);
    return (
        // Show the component only when the user is logged in
        // Otherwise, redirect the user to /signin page
        <Route {...rest} render={props => (
            state.auth ? <Component {...props} /> : <Redirect to="/" />
        )} />
    );
};

export default LogonRoute;