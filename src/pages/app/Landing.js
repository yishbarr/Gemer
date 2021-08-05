import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { GroupAdd, Home, Person, Security, UnfoldLess, UnfoldMore } from "@material-ui/icons";
import React, { cloneElement, useState } from "react";
import { Container } from "react-bootstrap";
import { Link, Route, Switch } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Browser from "./Browser";
import AddChat from "./chat/AddChat";
import "./Landing.css";
export default function Landing(p) {
    const PATH = "/app";
    const PROFILE_PATH = PATH + "/profile";
    const SECURITY_PATH = PATH + "/security";
    const ADD_CHAT_PATH = PATH + "/addChat";
    const ROOM_PATH = PATH + "/room/:id";
    const iconStyle = { color: "white", fontSize: 35 }
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
            name: "Security",
            icon: <Security />,
            path: SECURITY_PATH
        },
        {
            name: "Add Room",
            icon: <GroupAdd />,
            path: ADD_CHAT_PATH
        }
    ]
    const containerStyle = { marginLeft: "15%" }
    const foldSideBar = () => {
        setComponentState({
            container: { ...containerStyle, marginLeft: "70px" },
            sidebar: { width: "70px" },
            buttonFunc: unfoldSideBar,
            buttonInnerHtml: <UnfoldMore />,
        })
    }
    const unfoldSideBar = () => {
        setComponentState({
            container: containerStyle,
            sidebar: { width: "13%" },
            buttonFunc: foldSideBar,
            buttonInnerHtml: <UnfoldLess />,
        })
    }
    const [componentState, setComponentState] = useState({
        container: containerStyle,
        sidebar: {},
        buttonFunc: foldSideBar,
        buttonInnerHtml: <UnfoldLess />,
    })
    return (
        <div className="Landing">
            <Sidebar style={componentState.sidebar}>
                <button onClick={componentState.buttonFunc} style={{ all: "unset" }} id="sidebarFolderButton">
                    {cloneElement(componentState.buttonInnerHtml, { style: { fontSize: 50, color: "white", transform: "rotate(90deg)", marginLeft: "10px" }, id: "sidebarFolder" })}
                </button>
                <List>
                    {pages.map((p, key) => {
                        return (
                            <Link to={p.path} style={{ cursor: "default" }} key={key}>
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
            <Container style={componentState.container} id="container">
                <Switch>
                    <Route path={PROFILE_PATH} />
                    <Route path={SECURITY_PATH} />
                    <Route path={ADD_CHAT_PATH} component={AddChat} />
                    <Route path={ROOM_PATH} />
                    <Route component={Browser} />
                </Switch>
            </Container>
        </div>
    )
}