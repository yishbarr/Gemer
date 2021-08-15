import firebase from "firebase";
import React, { useContext, useState } from "react";
import { Button, Container, Form, Modal } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import { fieldsClass } from "../../../../constants/Classes";
import { Context } from "../../../../context/Store";
import getProvider from "../../../../functions/getProvider";
export default function Security(p) {
    const EMAIL = "email";
    const PASSWORD = "password";
    const CONFIRM_PASSWORD = "confirmPassword";
    const RECENT_LOGIN_ERROR = 'auth/requires-recent-login';
    const user = firebase.auth().currentUser;
    const [currentEmail, setCurrentEmail] = useState(user.email);
    const ref = firebase.database().ref(`users/${user.uid}`);
    const [state, dispatch] = useContext(Context)
    const provider = user.providerData[0].providerId.split(".")[0];
    const isNotEmail = provider === PASSWORD ? false : true;
    const [confirm, setConfirm] = useState("");
    const [showDelete, setShowDelete] = useState(false);
    const hideDelete = () => setShowDelete(false);
    const changeEmail = () => {
        const email = document.getElementById(EMAIL).value;
        user.updateEmail(email)
            .then(() => ref.child(`${provider}/email`).set(email))
    }
    const changePassword = () => {
        //Make prompt
        const password = document.getElementById(PASSWORD).value;
        if (password === document.getElementById(CONFIRM_PASSWORD).value)
            user.updatePassword(password).catch(e => {
                if (e.code === RECENT_LOGIN_ERROR) {
                    reauthenticate();
                    changePassword();
                }
            });
    }
    const deleteAccount = () => {
        firebase.storage().ref(`profile_pics/${user.uid}/profile_picture`).delete()
            .catch(e => console.log(e))
            .finally(() =>
                ref.remove()
                    .catch(e => console.log(e))
                    .finally(() =>
                        user.delete()
                            .then(() => dispatch({ type: "SET_AUTH", payload: false }))
                            .catch(e => {
                                if (e.code === RECENT_LOGIN_ERROR)
                                    reauthenticate().then(() => deleteAccount());
                            })))

        /*.catch(async e => {
            if (e.code === RECENT_LOGIN_ERROR) {
                console.log("sss");
                await reauthenticate();
            }
        }));*/
    }
    const reauthenticate = async () => {
        if (provider !== "password")
            await user.reauthenticateWithPopup(getProvider(provider)).catch(e => console.log(e));
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
                <Form.Group controlId="emailGroup" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control className={fieldsClass} type="email" placeholder="Eg: name@domain.com" id={EMAIL} disabled={isNotEmail} value={currentEmail} onChange={e => setCurrentEmail(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-4">
                    <Button variant="danger" onClick={changeEmail} disabled={isNotEmail}>Change Email</Button>
                </Form.Group>
                <Form.Group controlId="passwordGroup" className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control className={fieldsClass} type="password" placeholder="Type password here" id={PASSWORD} disabled={isNotEmail} />
                </Form.Group>
                <Form.Group controlId="confirmGroup" className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" className={fieldsClass} placeholder="Type password here" id={CONFIRM_PASSWORD} disabled={isNotEmail} />
                </Form.Group>
                <Form.Group className="mb-4">
                    <Button variant="danger" onClick={changePassword} disabled={isNotEmail}>Change Password</Button>
                </Form.Group>
                <Button variant="danger" onClick={() => setShowDelete(true)}>Delete Account</Button>
            </Form>
            <Modal show={showDelete} onHide={hideDelete} >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete your account? Type <b>{user.email}</b> to confirm.</p>
                    <p>You might have to reauthenticate if a long time has passed since you signed in.</p>
                    <Form.Control value={confirm} onChange={e => setConfirm(e.target.value)} className={fieldsClass} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={hideDelete}>Cancel</Button>
                    <Button disabled={confirm !== user.email} variant="danger" onClick={deleteAccount}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}