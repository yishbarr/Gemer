import { Button, Container, Form } from "react-bootstrap";
import { fieldsClass } from "../../../constants/Classes";
import firebase from "firebase";
import { Redirect, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RoomManager(p) {
    const roomID = useParams().id;
    const database = firebase.database();
    const roomRef = database.ref("rooms/" + roomID);
    const [room, setRoom] = useState({});
    const [isValidRoom, setIsValidRoom] = useState(true);
    const [isReady, setIsReady] = useState(false);
    useEffect(() => roomRef.get().then(d => {
        if (!d.exists())
            setIsValidRoom(false);
        else {
            setIsReady(true);
            setRoom(d.val());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [])
    if (!isValidRoom)
        return <Redirect to="/app" />
    if (!isReady)
        return <div />
    return (
        <Container>
            <h1>{room.name} Settings</h1>
            <Form.Group>
                <Form.Label>Room name</Form.Label>
                <Form.Control className={fieldsClass} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Room description</Form.Label>
                <Form.Control className={fieldsClass} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Game</Form.Label>
                <Form.Control className={fieldsClass} />
            </Form.Group>
            <Button variant="danger">Leave Room</Button>
            <Button variant="danger">Delete Room</Button>
        </Container>
    )
}