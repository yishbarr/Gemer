import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
export default function Room(p) {
    const roomID = useParams().id;
    console.log(roomID);
    const ref = firebase.database().ref("rooms/" + roomID);
    const [roomData, setRoomData] = useState();
    useEffect(() => ref.get().then(d => setRoomData(d.val())), [ref]);
    return (
        <Container>
            <h1>{roomData.name}</h1>
            {roomData.messages.map(m => <p>m.content</p>)}
            <Form.Control />
        </Container>
    )
}