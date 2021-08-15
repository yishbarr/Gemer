import firebase from "firebase";
import React, { useContext, useState } from "react";
import { Alert, Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import { fieldsClass } from "../../constants/Classes";
import { Context } from "../../context/Store";
import getProvider from "../../functions/getProvider";
export default function Logon(p) {
    //
    const providerLogins = [
        {
            src: "./assets/img/google_symbol.svg",
            value: "google"
        },
        {
            src: "./assets/img/GitHub-Mark-Light-120px-plus.png",
            value: "github"
        }
    ]
    //States
    const [state, dispatch] = useContext(Context);
    const [notification, setNotification] = useState("");
    const [linkPopup, setLinkPopup] = useState(false);
    const [accountOptions, setAccountOptions] = useState([]);
    const [credential, setCredential] = useState();

    const auth = firebase.auth();
    //Check if user signed in or is already signed in.
    auth.onAuthStateChanged(async a => {
        if (a != null) {
            dispatch({ type: "SET_AUTH", payload: true });
        }
    })
    const connectionMessage = "Please check your connection.";
    //Functions
    const logon = async (email, password) => {
        auth.signInWithEmailAndPassword(email, password)
            .catch(e => {
                const message = "Login failed. ";
                switch (e.code) {
                    case 'auth/wrong-password': setNotification(message + "Please check your password."); break;
                    case 'auth/invalid-email':
                    case 'auth/user-not-found': setNotification(message + "User doesn't exist."); break;
                    default: setNotification(message + connectionMessage)

                }
            })
    };
    const register = async (email, password) => {
        auth.createUserWithEmailAndPassword(email, password)
            .then(user => addUserToDataBase(user.providerData[0].providerId, document.getElementById.apply(NICKNAME).value, user.email))
            .catch(e => {
                const message = "Registration failed. ";
                switch (e.code) {
                    case 'auth/weak-password': setNotification(message + "Password is too weak."); break;
                    case 'auth/invalid-email': setNotification(message + "Email is invalid."); break;
                    case 'auth/email-already-in-use': setNotification(message + "Account with this email already exists. Check if you already registered with a third party account."); break;
                    default: setNotification(message + connectionMessage);
                }
            })
    };
    const registerWithProvider = async p => {
        const provider = getProvider(p);
        try {
            const user = (await auth.signInWithPopup(provider)).user;
            addUserToDataBase(splitFromTopDomain(user.providerData[0].providerId), "", user.email)
            return user;
        }
        catch (e) {
            switch (e.code) {
                case 'auth/account-exists-with-different-credential':
                    setAccountOptions(await auth.fetchSignInMethodsForEmail(e.email));
                    setLinkPopup(true);
                    setCredential(e.credential);
                    break;
                default:
                    console.log(e);
            }
        }
    };
    const linkWithUser = () => registerWithProvider(splitFromTopDomain(document.getElementById("providerSelector").value)).then(user => user.linkWithCredential(credential));
    const addUserToDataBase = async (account, nickname, email) => {
        const ref = firebase.database()
            .ref(`users/${auth.currentUser.uid}`);
        const profile = ref.child("profile");
        if (!(await ref.get()).exists()) {
            if (nickname.length > 0)
                auth.currentUser.updateProfile({ displayName: nickname });
            ref.child(account).set(
                {
                    email: email
                }
            )
            profile.set(
                {
                    nickName: nickname.length > 0 ? nickname : auth.currentUser.displayName,
                    favGames: "",
                    profilePhoto: auth.currentUser.photoURL
                }
            )
        }
        else
            auth.currentUser.updateProfile({
                photoURL: await (await profile.child("profilePhoto").get()).val(),
                displayName: await (await profile.child("nickName").get()).val()
            })
    };
    const hidePopup = () => setLinkPopup(false);
    const splitFromTopDomain = str => str.split(".")[0]
    //ID constants
    const EMAIL = "email";
    const PASSWORD = "password";
    const NICKNAME = "nickname";
    const REGISTER_LINK = `/register`;
    if (state.auth) {
        return <Redirect to={state.appPath} />;
    }
    return (
        <Container>
            <div style={{ textAlign: "center" }}>
                <h1>Welcome to App</h1>
                <h3>Sign up or Log in with existing account</h3>
            </div>
            <Form>
                <Form.Group >
                    <Form.Label>Email</Form.Label>
                    <Form.Control className={fieldsClass} type="email" placeholder="eg: name@example.com" id={EMAIL} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control className={fieldsClass} type="password" placeholder="Password" id={PASSWORD} />
                </Form.Group>
                <Switch>
                    <Route path={REGISTER_LINK} exact>
                        <Form.Group>
                            <Form.Label>Nickname (Optional. Can be easily changed later.)</Form.Label>
                            <Form.Control className={fieldsClass} type="text" placeholder="eg: masterGamer78" id={NICKNAME} />
                        </Form.Group>
                        <br />
                        <Row xs={"auto"}>
                            <Col>
                                <Link to="/">
                                    <Button variant="danger" >Back</Button>
                                </Link>
                            </Col>
                            <Col>
                                <Button
                                    variant="success"
                                    onClick={() =>
                                        register(document.getElementById(EMAIL).value,
                                            document.getElementById(PASSWORD).value)}>
                                    Sign Up
                                </Button>
                            </Col>
                        </Row>
                    </Route>
                    <Route path={`/`} >
                        <br />
                        <Row xs={"auto"}>
                            <Col>
                                <Button
                                    variant="success"
                                    onClick={() =>
                                        logon(document.getElementById(EMAIL).value,
                                            document.getElementById(PASSWORD).value)}>
                                    Login
                                </Button>
                            </Col>
                            <Col>
                                <Link to={REGISTER_LINK}>
                                    <Button variant="primary" >Sign Up</Button>
                                </Link>
                            </Col>
                        </Row>
                    </Route>
                </Switch>
            </Form>
            <br />
            <Row xs="auto">
                {providerLogins.map(l =>
                    <Col>
                        <input type="image" src={l.src} style={{ 'width': '75px', 'height': '75px' }} value={l.value} onClick={e => registerWithProvider(e.target.value)} alt={l.value} />
                    </Col>
                )}
            </Row>
            <br />
            {notification.length > 0 ? <Alert variant="primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
                {notification}
            </Alert> : ""}
            <Modal show={linkPopup} onHide={hidePopup} backdrop="static">
                <Modal.Header closeButton >
                    <Modal.Title>Duplicate email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>An account with that email address already exists. You might have logged into a third party account with a higher priority over your first account. Please log in to one of your accounts to link the new and old accounts.</p>
                    <Form.Select id="providerSelector">
                        {accountOptions.map(a => <option value={a}>{a.charAt(0).toUpperCase() + splitFromTopDomain(a.slice(1))}</option>)}
                    </Form.Select>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={hidePopup}>Cancel</Button>
                    <Button variant="success" onClick={linkWithUser}>Login</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}