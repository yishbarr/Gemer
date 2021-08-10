import firebase from "firebase";
import React, { useContext, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import getProvider from "../../../../functions/getProvider";
import { Context } from "../../../../functions/Store";
export default function Security(p) {
    const EMAIL = "email";
    const PASSWORD = "password";
    const CONFIRM_PASSWORD = "confirmPassword";
    const RECENT_LOGIN_ERROR = 'auth/requires-recent-login';
    const auth = firebase.auth().currentUser;
    const [currentEmail, setCurrentEmail] = useState(auth.email);
    const ref = firebase.database().ref(`users/${auth.uid}`);
    const [state, dispatch] = useContext(Context)
    const provider = auth.providerData[0].providerId.split(".")[0];
    const isNotEmail = provider === PASSWORD ? false : true;
    const changeEmail = () => {
        const email = document.getElementById(EMAIL).value;
        auth.updateEmail(email)
            .then(() => ref.child(`${provider}/email`).set(email))
    }
    const changePassword = () => {
        //Make prompt
        const password = document.getElementById(PASSWORD).value;
        if (password === document.getElementById(CONFIRM_PASSWORD).value)
            auth.updatePassword(password).catch(e => {
                if (e.code === RECENT_LOGIN_ERROR) {
                    reauthenticate();
                    changePassword();
                }
            });
    }
    const deleteAccount = () => {
        //Make prompt
        ref.remove(() => auth.delete().then(() => dispatch({ type: "SET_AUTH", payload: false }))).catch(e => {
            if (e.code === RECENT_LOGIN_ERROR) {
                reauthenticate();
                deleteAccount();
            }
        });
    }
    const reauthenticate = () => {
        if (provider !== "password")
            auth.reauthenticateWithPopup(getProvider(provider));
        //Make email password option.
        else {

        }
    }
    if (!state.auth) {
        return <Redirect to="/" />
    }
    return (
        <Container>
            <h1>Security</h1>
            <Form>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" className="form-control fields" placeholder="Eg: name@domain.com" id={EMAIL} disabled={isNotEmail} value={currentEmail} onChange={e => setCurrentEmail(e.target.value)} />
                <br />
                <Button variant="danger" onClick={changeEmail} disabled={isNotEmail}>Change Email</Button>
                <br />
                <br />
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" className="form-control fields" placeholder="Type password here" id={PASSWORD} disabled={isNotEmail} />
                <br />
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" className="form-control fields" placeholder="Type password here" id={CONFIRM_PASSWORD} disabled={isNotEmail} />
                <br />
                <Button variant="danger" onClick={changePassword} disabled={isNotEmail}>Change Password</Button>
                <br />
                <br />
                <Button variant="danger" onClick={deleteAccount}>Delete Account</Button>
            </Form>
        </Container>
    )
}