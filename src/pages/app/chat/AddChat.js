import firebase from "firebase";
import React, { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import { fieldsClass } from "../../../constants/Classes";
export default function AddChat(p) {
    const ref = firebase.database().ref("rooms");
    const [notification, setNotification] = useState("");
    const [roomID, setRoomID] = useState("");
    const addRoom = () => {
        const name = document.getElementById(NAME).value;
        const game = document.getElementById(GAME).value;
        const description = document.getElementById(DESCRIPTION).value;
        if (name.length > 0 && game.length > 0 && description.length > 0)
            ref.push({
                name: name,
                game: game,
                description: description,
                managers: [firebase.auth().currentUser.uid]
            })
                .then(r => setRoomID(r.key))
                .catch(e => {
                    console.log(e);
                    setNotification("Adding room failed. Please check connection.")
                })
        else setNotification("Please check validity of fields.")

    }
    const NAME = "name";
    const GAME = "game";
    const DESCRIPTION = "description";
    if (roomID.length > 0)
        return <Redirect to={"/app/room/" + roomID} />
    return (
        <Container>
            <h1>Add Room</h1>
            <Form>
                <Form.Label>Name of Room</Form.Label>
                <Form.Control className={fieldsClass} type="text" placeholder="Eg: Portal 2 mapping, TF2 matchmaking, etc" id={NAME} />
                <br />
                <Form.Label>Game</Form.Label>
                <Form.Control className={fieldsClass} type="text" placeholder="Eg: Portal 2, Team Fortress 2, Counter Strike: Global Offensive, etc" id={GAME} />
                <br />
                <Form.Label>Description</Form.Label>
                <Form.Control className={fieldsClass} type="text" placeholder="Eg: This room is for meeting up for TF2 matchmaking, etc" id={DESCRIPTION} />
                <br />
                <Button variant="success" onClick={addRoom}>Add Room</Button>
                <br />
                <br />
                {notification.length > 0 ? <Alert variant="primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                    </svg>
                    {notification}
                </Alert> : ""}
            </Form>
        </Container>
    );
}