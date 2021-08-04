import firebase from "firebase";
import React, { useContext } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import { Context } from "../../functions/Store";
import "./Logon.css";
export default function Logon(p) {
    const [state, dispatch] = useContext(Context);
    const auth = firebase.auth();
    const logon = (email, password) => {
        auth.signInWithEmailAndPassword(email, password)
            .then(enter)
            .catch(() => { })
    }
    const register = (email, password) => {
        auth.createUserWithEmailAndPassword(email, password)
            .then(user => addUserToDataBase("email", document.getElementById.apply(NICKNAME).value, user.user.email))
            .then(enter)
            .catch(() => { })
    }
    const registerWithProvider = async (e) => {
        let provider;
        const account = e.target.value;
        switch (account) {
            case "google": provider = new firebase.auth.GoogleAuthProvider(); break;
            case "facebook": provider = new firebase.auth.FacebookAuthProvider(); break;
            case "twitter": provider = new firebase.auth.TwitterAuthProvider(); break;
            default:
        }
        let user;
        try {
            user = await (await auth.currentUser.linkWithPopup(provider)).user;
        } catch (e) {
            user = await (await auth.signInWithPopup(provider)).user;
        }
        addUserToDataBase(account, "", user.email);
        enter();


    }
    const addUserToDataBase = (account, nickName, email) => {
        const ref = firebase.database()
            .ref(`users/${auth.currentUser.uid}`);
        ref.child(account).set(
            {
                email: email
            }
        )
        ref.child("profile").set(
            {
                nickName: nickName,
                favGames: ""
            }
        )
    }
    const enter = () => {
        dispatch({ type: "SET_AUTH", payload: true });
    }
    const EMAIL = "email";
    const PASSWORD = "password";
    const NICKNAME = "nickname";
    const REGISTER_LINK = `/register`
    if (state.auth) {
        return <Redirect to="/app" />
    }
    return (
        <div className="Logon">
            <Container>
                <div style={{ textAlign: "center" }}>
                    <h1>Welcome to App</h1>
                    <h3>Sign up or Log in with existing account</h3>
                </div>
                <Form>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="eg: name@example.com" id={EMAIL} />
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" id={PASSWORD} />
                    <Switch>
                        <Route path={REGISTER_LINK} exact>
                            <Form.Label>Nickname</Form.Label>
                            <Form.Control type="text" placeholder="eg: masterGamer78" id={NICKNAME} />
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
                <Row>
                    <Col>
                        <input type="image" src="./assets/img/google_symbol.svg" style={{ 'width': '75px', 'height': '75px' }} value="google" onClick={registerWithProvider} alt="Google" />
                    </Col>
                </Row>
            </Container>
        </div >
    )
}