import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Redirect, useParams } from "react-router-dom";
export default function Room(p) {
    const roomID = useParams().id;
    console.log(roomID);
    const database = firebase.database();
    const user = firebase.auth().currentUser;
    const roomRef = database.ref("rooms/" + roomID);
    const usersRef = database.ref("users")
    const [roomName, setRoomName] = useState("Loading");
    const [messages, setMessages] = useState();
    const [usersObj, setUsersObj] = useState({})
    const [ready, setReady] = useState(false);
    const [validRoom, setValidRoom] = useState(true);
    const getMessages = () =>
        roomRef.get()
            .then(d => {
                if (d.exists()) {
                    setRoomName(d.child("name").val())
                    setMessages(d.child("messages").val());
                    return d.child("joinedUsers").val()
                }
                else {
                    setValidRoom(false);
                    throw new Error("Room doesn't exist");
                }

            })
            .then(users => {
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
                userKeys.forEach(key => usersRef.child(users[key] + "/profile/nickname").get()
                    .then(d => setUsersObj(usersObj => { return { ...usersObj, [users[key]]: d.val() } })))
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => getMessages().then(() => setReady(true)).catch(e => console.log(e)), [roomID, user.uid])
    const sendMessage = e => {
        const target = e.target;
        const content = target.value;
        if (e.key === "Enter" && content.length > 0) {
            roomRef.child("messages").push({ content: content, userID: user.uid });
            messageArr.length = 0;
            target.value = "";
            getMessages();
        }
    }
    if (!validRoom)
        return <Redirect to="/app" />
    if (!ready)
        return <div />
    const messageArr = [];
    if (messages != null)
        Object.keys(messages).forEach(k => messageArr.push(messages[k]))
    return (
        <div style={{ marginLeft: p.folded ? "70px" : "13%", transition: ".5s" }}>
            <div style={{ paddingLeft: "5%", backgroundColor: "black", height: 60 }}>
                <h1>{roomName}</h1>
            </div>
            <div style={{ paddingLeft: "7%", overflowY: "auto", height: "85vh" }} id="chatbox">
                {messageArr.map((m, k) => <p key={k}>{usersObj[m.userID]}: {m.content}</p>)}
            </div>
            {/* eslint-disable-next-line eqeqeq*/}
            <Form.Control type="text" onKeyPress={sendMessage} />
        </div >
    )
}