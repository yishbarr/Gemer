import { TextareaAutosize } from "@material-ui/core";
import { SettingsOutlined } from "@material-ui/icons";
import firebase from "firebase";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { Link, Redirect, useParams } from "react-router-dom";
import { ButtonToolTip } from "../../../components/Tooltips";
import { fieldsClass } from "../../../constants/Classes";
import Colours from "../../../constants/Colours";
import { Context } from "../../../context/Store";
function Room(p) {
    const roomID = useParams().id;
    //Database
    const database = firebase.database();
    const user = firebase.auth().currentUser;
    const roomRef = database.ref("rooms/" + roomID);
    const usersRef = database.ref("users")
    //States
    const [roomData, setRoomData] = useState({
        name: "Loading",
        messages: ""
    });
    const [usersObj, setUsersObj] = useState({})
    const [ready, setReady] = useState(false);
    const [validRoom, setValidRoom] = useState(true);
    const [settingsButtonColour, setSettingsButtonColour] = useState(Colours.white)
    const chatbox = useRef(null);
    const [, dispatch] = useContext(Context);
    //Functions, other hooks and variables.
    const getMessages = async d => {
        console.log("gggg");
        setRoomData({
            name: d.child("name").val(),
            messages: d.child("messages").val(),
            game: d.child("game").val()
        })
        const users = await d.child("joinedUsers").val();
        let userKeys = [];
        if (users != null) {
            userKeys = Object.keys(users);
        }
        roomRef.child("joinedUsers/" + user.uid).set(user.uid);
        usersRef.child(user.uid + "/joinedRooms/" + roomID).set(roomID);
        userKeys.forEach(key => usersRef.child(key + "/profile").get()
            .then(d => setUsersObj(usersObj => { return { ...usersObj, [key]: d.val() } })))
    }
    useEffect(() =>
        roomRef.get()
            .then(d => {
                if (d.exists())
                    getMessages(d);
                else {
                    setValidRoom(false);
                    throw new Error("Room doesn't exist");
                }
            })
            .then(() => setReady(true))
            .then(() => roomRef.on("value", d => d.exists() ? getMessages(d) : null))
            .then(() => dispatch({ type: "SET_MESSAGE_LISTENER", payload: roomRef }))
            .catch(e => console.log(e))
        // eslint-disable-next-line react-hooks/exhaustive-deps
        , [dispatch])
    const sendMessage = e => {
        const target = e.target;
        const content = target.value;
        if (e.key === "Enter") {
            e.preventDefault()
            if (content.length > 0) {
                if (e.shiftKey) {
                    target.value += "\n";
                }
                else {
                    let uploadContent = ""
                    const strArr = content.split("\n")
                    while (strArr.length > 0) {
                        const line = strArr.pop();
                        // eslint-disable-next-line eqeqeq
                        if (!line == "") {
                            strArr.push(line);
                            break;
                        }
                    }
                    const breaker = str => {
                        if (str.length < 70) {
                            console.log("end");
                            return str + "\n";
                        }
                        return str.substring(0, 70) + "\n" + breaker(str.substring(70));
                    }
                    strArr.forEach(line => uploadContent += breaker(line));
                    roomRef.child("messages").push({ content: uploadContent, userID: user.uid });
                    messageArr.length = 0;
                    setTimeout(() => {
                        target.value = null;
                        chatbox.current.scroll({ top: chatbox.current.scrollHeight, behavior: "smooth" })
                    }, 1);
                }
            }
        }
    }
    if (!validRoom)
        return <Redirect to="/app" />
    if (!ready)
        return <div />
    const messageArr = [];
    if (roomData.messages != null)
        Object.keys(roomData.messages).forEach(k => messageArr.push(roomData.messages[k]))
    return (
        <div style={{ marginLeft: p.folded ? "70px" : "13%", transition: ".5s" }}>
            <div style={{ paddingLeft: "3%", backgroundColor: Colours.header, height: 60, borderBottomColor: Colours.white, borderWidth: 3, borderBottomStyle: "solid", display: "flex", justifyContent: "space-between", paddingRight: "5%", alignItems: "center" }}>
                <h1>{roomData.name}</h1>
                <h2>{roomData.game}</h2>
                <ButtonToolTip arrow title="Room Settings" placeholder="bottom" >
                    <Link to={"/app/roomSettings/" + roomID} style={{ all: "unset" }} onMouseEnter={() => setSettingsButtonColour(Colours.blue)} onMouseLeave={() => setSettingsButtonColour(Colours.white)}>
                        <SettingsOutlined style={{ color: settingsButtonColour, fontSize: 50 }} />
                    </Link>
                </ButtonToolTip>
            </div>
            <div style={{ paddingLeft: "7%", overflowX: "auto", height: "80vh" }} ref={chatbox}>
                {messageArr.map((m, k) =>
                    <div key={k}>
                        <p style={{ fontSize: 18, whiteSpace: "pre-line" }}>
                            <Link style={{ fontWeight: "bolder" }}>{usersObj[m.userID] != null ? usersObj[m.userID].nickname : "Deleted User"}</Link>: {m.content.split(" ").map((t, k) => t.match(/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/) ? <span key={k}><a href={"https://" + t}>{t}</a> </span> : t + " ")}
                        </p>
                    </div>)}
            </div>
            <TextareaAutosize style={{ marginLeft: "3%", width: "50%", resize: "none" }} type="text" onKeyDown={sendMessage} className={fieldsClass + " form-control"} placeholder="Type your message here." wrap="hard" />
        </div >
    )
}
export default memo(Room);