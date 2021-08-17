import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Colours from "../../../constants/Colours";
export default function Room(p) {
    const roomID = useParams().id;
    console.log(roomID);
    const ref = firebase.database().ref("rooms/" + roomID);
    const [roomName, setRoomName] = useState("Loading");
    const [messages, setMessages] = useState();
    const getMessages = () =>
        ref.get()
            .then(d => {
                setRoomName(d.child("name").val())
                setMessages(d.child("messages").val());
            })
    useEffect(getMessages, [])
    const user = firebase.auth().currentUser;
    const sendMessage = e => {
        const target = e.target;
        const content = target.value;
        if (e.key === "Enter" && content.length > 0) {
            ref.child("messages").push({ content: content, userID: user.uid });
            messageArr.length = 0;
            target.value = "";
            getMessages();
        }
    }
    const messageArr = [];
    if (messages != null)
        Object.keys(messages).forEach(k => messageArr.push(messages[k]))
    return (
        <Container style={{backgroundColor:Colours.gray}}>
            <h1 >{roomName}</h1>
            {messageArr.map(m => <p>{m.content}</p>)}
            {/* eslint-disable-next-line eqeqeq*/}
            <Form.Control type="text" onKeyPress={sendMessage} />
        </Container>
    )
}