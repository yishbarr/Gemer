import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { ExitToApp, ForumOutlined, GroupAdd, Home, Person, Security, UnfoldLess, UnfoldMore } from "@material-ui/icons";
import firebase from "firebase";
import React, { cloneElement, useContext, useEffect, useState } from "react";
import { Button, Container, Modal } from "react-bootstrap";
import { Offline, Online } from "react-detect-offline";
import { Link, Route, Switch } from "react-router-dom";
import Logout from "../../components/Logout";
import Sidebar from "../../components/Sidebar";
import Colours from "../../constants/Colours";
import { Context } from "../../context/Store";
import Browser from "./Browser";
import AddChat from "./chat/AddChat";
import ChatManager from "./chat/ChatManager";
import Room from "./chat/Room";
import "./Landing.css";
import Profile from "./settings/Profile";
import SecurityComponent from "./settings/security/Security";
export default function Landing(p) {
    const [state, dispatch] = useContext(Context);
    const PATH = "/app";
    const PROFILE_PATH = PATH + "/profile";
    const SECURITY_PATH = PATH + "/security";
    const MY_ROOMS_PATH = PATH + "/myRooms";
    const ADD_CHAT_PATH = PATH + "/addChat";
    const ROOM_PATH = PATH + "/room/:id";
    const EXIT_PATH = PATH + "/exit";
    const iconStyle = { color: Colours.white, fontSize: 35 }
    const pages = [
        {
            name: "Home",
            icon: <Home />,
            path: PATH
        },
        {
            name: "Profile",
            icon: <Person />,
            path: PROFILE_PATH
        },
        {
            name: "Your Rooms",
            icon: <ForumOutlined />,
            path: MY_ROOMS_PATH
        },
        {
            name: "Add Room",
            icon: <GroupAdd />,
            path: ADD_CHAT_PATH
        },
        {
            name: "Security",
            icon: <Security />,
            path: SECURITY_PATH
        },
        {
            name: "Logout",
            icon: <ExitToApp />,
            path: EXIT_PATH
        }
    ]
    const routes = [
        {
            path: PROFILE_PATH,
            component: Profile
        },
        {
            path: SECURITY_PATH,
            component: SecurityComponent
        },
        {
            path: ADD_CHAT_PATH,
            component: AddChat
        },
        {
            path: ROOM_PATH,
        },
        {
            path: MY_ROOMS_PATH,
            component: ChatManager
        },
        {
            path: EXIT_PATH,
            component: Logout
        },
        {
            path: PATH,
            component: Browser
        },

    ]
    const containerStyle = { marginLeft: "15%" };
    const foldSideBar = () => {
        setComponentState({
            ...componentState,
            container: { ...containerStyle, marginLeft: "80px" },
            sidebar: { width: "70px" },
            buttonInnerHtml: <UnfoldMore />,
        })
    }
    const unfoldSideBar = () => {
        setComponentState({
            ...componentState,
            container: containerStyle,
            sidebar: { width: "13%" },
            buttonInnerHtml: <UnfoldLess />,
        })
    }
    const [buttonState, setButtonState] = useState({ colour: "", func: null });
    const [componentState, setComponentState] = useState({
        container: containerStyle,
        sidebar: {},
        buttonInnerHtml: <UnfoldLess />,
    })
    const [folded, setFolded] = useState(false);
    const sidebarUserSetting = firebase.database().ref(`users/${firebase.auth().currentUser.uid}/sidebar`);
    useEffect(() => sidebarUserSetting.get().then(setting => setting.val() ? triggerFold() : null)
        .catch(() => setOffline(true))
        .catch(e => console.log(e))
        // eslint-disable-next-line react-hooks/exhaustive-deps
        , [])
    const triggerFold = () => {
        foldSideBar();
        setFolded(true);
        setButtonState(state => ({ ...state, func: triggerUnfold }));
        sidebarUserSetting.set(true).catch(e => console.log(e));
    }
    const triggerUnfold = () => {
        unfoldSideBar();
        setFolded(false);
        setButtonState(state => ({ ...state, func: triggerFold }));
        sidebarUserSetting.set(false).catch(e => console.log(e));
    }
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    window.addEventListener('resize', () => setWindowWidth(window.innerWidth));
    useEffect(() => {
        const screen = window.screen.availWidth
        if (screen - windowWidth > screen / 100 * 15) {
            foldSideBar();
            setButtonState(state => ({ ...state, func: null, colour: Colours.red }));
        }
        else {
            if (!folded) {
                unfoldSideBar();
                setButtonState(state => ({ ...state, func: triggerFold, colour: Colours.white }));
            }
            else
                setButtonState(state => ({ ...state, func: triggerUnfold, colour: Colours.white }));

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowWidth])
    useEffect(() => dispatch({ type: "SET_MESSAGE_LISTENER", payload: sidebarUserSetting }), [])
    const [offline, setOffline] = useState(false);
    const offlineModal = (show, message) =>
        <Modal show={show} backdrop="static">
            <Modal.Header>
                <Modal.Title>Connection Offline</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={() => window.location.reload()}>Reload</Button>
            </Modal.Footer>
        </Modal>
    return (
        <div className="Landing">
            <Sidebar style={componentState.sidebar}>
                <button
                    onClick={buttonState.func}
                    onMouseEnter={() => {
                        if (buttonState.func != null)
                            setButtonState(state => ({ ...state, colour: Colours.blue }))
                    }}
                    onMouseLeave={() => {
                        if (buttonState.func != null)
                            setButtonState(state => ({ ...state, colour: Colours.white }))
                    }}
                    style={{ all: "unset" }} id="sidebarFolderButton">
                    {cloneElement(componentState.buttonInnerHtml, { style: { fontSize: 50, color: buttonState.colour, transform: "rotate(90deg)", marginLeft: "10px" }, id: "sidebarFolder" })}
                </button>
                <List>
                    {pages.map((p, key) => {
                        return (
                            <Link to={p.path} style={{ cursor: "default" }} key={key} onClick={() => state.messageListener.off("value")}>
                                <div className="navItem">
                                    <ListItem>
                                        <ListItemIcon>
                                            {cloneElement(p.icon, { style: iconStyle })}
                                        </ListItemIcon>
                                        <ListItemText   >
                                            <label style={{ fontSize: 25, whiteSpace: "nowrap" }}>{p.name}</label>
                                        </ListItemText>
                                    </ListItem>
                                </div>
                            </Link>
                        )
                    }
                    )}
                </List>
            </Sidebar>
            <Container style={{ ...componentState.container, transition: ".5s" }} id="container">
                <Switch>
                    {routes.map((r, k) => <Route path={r.path} component={r.component} key={k} />)}
                </Switch>
            </Container>
            <Route path={ROOM_PATH}>
                <Room folded={buttonState.colour === Colours.red || folded} />
            </Route>
            <Online>
                {offlineModal(offline, "There's a problem with the server. Please try again later.")}
            </Online>
            <Offline>
                {offlineModal(true, "You're currently offline. Please check your connection.")}
            </Offline>
        </div >
    )
}