import firebase from "firebase";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
import { fieldsClass } from "../../../constants/Classes";
import Colours from "../../../constants/Colours";
import { Context } from "../../../context/Store";
function Room(p) {
    const roomID = useParams().id;
    const database = firebase.database();
    const user = firebase.auth().currentUser;
    const roomRef = database.ref("rooms/" + roomID);
    const usersRef = database.ref("users")
    const [roomData, setRoomData] = useState({
        name: "Loading",
        messages: ""
    });
    const [usersObj, setUsersObj] = useState({})
    const [ready, setReady] = useState(false);
    const [validRoom, setValidRoom] = useState(true);
    const chatbox = useRef(null);
    const [, dispatch] = useContext(Context);
    const getMessages = async d => {
        setRoomData({
            name: d.child("name").val(),
            messages: d.child("messages").val()
        })
        const users = await d.child("joinedUsers").val()
        let userExists;
        const userKeys = Object.keys(users);
        for (const key of userKeys) {
            if (users[key] === user.uid) {
                userExists = true;
                break;
            }
        }
        if (!userExists) {
            roomRef.child("joinedUsers").push(user.uid);
            usersRef.child("joinedRooms").push(roomID);
        }
        userKeys.forEach(key => usersRef.child(users[key] + "/profile").get()
            .then(d => setUsersObj(usersObj => { return { ...usersObj, [users[key]]: d.val() } })))
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
        , [])
    const sendMessage = e => {
        const target = e.target;
        const content = target.value;
        if (e.key === "Enter" && content.length > 0) {
            roomRef.child("messages").push({ content: content, userID: user.uid });
            messageArr.length = 0;
            target.value = null;
            setTimeout(() => chatbox.current.scroll({ top: chatbox.current.scrollHeight, behavior: "smooth" }), 1);
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
            <div style={{ paddingLeft: "3%", backgroundColor: Colours.header, height: 60, borderBottomColor: Colours.white, borderWidth: 3, borderBottomStyle: "solid" }}>
                <h1>{roomData.name}</h1>
            </div>
            <div style={{ paddingLeft: "7%", overflowY: "auto", height: "80vh" }} ref={chatbox}>
                {messageArr.map((m, k) =>
                    <div key={k}>
                        <p style={{ fontSize: 18 }}><a href="" style={{ fontWeight: "bolder" }}>{usersObj[m.userID] != null ? usersObj[m.userID].nickname : "Deleted User"}</a>: {m.content}</p>
                    </div>)}
            </div>
            {/* eslint-disable-next-line eqeqeq*/}
            <textarea style={{ marginLeft: "3%", width: "50%", resize: "none" }} type="text" onKeyPress={sendMessage} className={fieldsClass + " form-control"} placeholder="Type your message here." />
        </div >
    )
}
export default memo(Room);