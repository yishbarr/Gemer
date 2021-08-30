import firebase from "firebase";
import { useEffect, useState } from "react";
import { Button, Container, Form, Modal } from "react-bootstrap";
import { Redirect, useParams } from "react-router-dom";
import { fieldsClass } from "../../../constants/Classes";

export default function RoomManager(p) {
    const roomID = useParams().id;
    const database = firebase.database();
    const user = firebase.auth().currentUser;
    const roomRef = database.ref("rooms/" + roomID);
    const [room, setRoom] = useState({ });
    const [description, setDescription] = useState();
    const [game, setGame] = useState();
    const [isValidRoom, setIsValidRoom] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [confirm, setConfirm] = useState("");
    const [managers, setManagers] = useState();
    const [deleted, setDeleted] = useState(false);
    const hideDelete = () => setShowDelete(false);
    useEffect(() => roomRef.get().then(d => {
        if (!d.exists())
            setIsValidRoom(false);
        else {
            setRoom(d.child("name").val());
            setDescription(d.child("description").val());
            setGame(d.child("game").val());
            setManagers(d.child("managers").val());
            setIsReady(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [])
    if (!isValidRoom)
        return <Redirect to="/app" />
    if (!isReady)
        return <div />
    let isManager;
    const managerKeys = Object.keys(managers);
    console.log(managerKeys);
    for (const key of managerKeys) {
        if (key === user.uid) {
            isManager = true;
            break;
        }
    }
    const errorMaker = e => console.log(e);
    const leaveRoom = () => database.ref("users/" + user.uid + "/joinedRooms/" + roomID).remove(errorMaker).then(() => setDeleted(true));
    const deleteRoom = () => roomRef.remove(errorMaker)
        .then(() => database.ref("users/" + user.uid + "/managedRooms/" + roomID).remove(errorMaker))
        .then(() => firebase.storage().ref("room_images/" + roomID).delete())
        .then(leaveRoom)
    if (deleted)
        return <Redirect to="/app/myRooms" />
    return (
        <Container>
            <h1>{room} Settings</h1>
            <Form.Group className="mb-3">
                <Form.Label>Room name</Form.Label>
                <Form.Control className={fieldsClass} value={room} onChange={e => setRoom(e.target.value)} disabled={!isManager} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Room description</Form.Label>
                <Form.Control className={fieldsClass} value={description} onChange={e => setDescription(e.target.value)} disabled={!isManager} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Game</Form.Label>
                <Form.Control className={fieldsClass} value={game} onChange={e => setGame(e.target.value)} disabled={!isManager} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Button variant="success" disabled={!isManager}>Apply</Button>
            </Form.Group>
            <Form.Group className="mb-3">
                <Button variant="danger" disabled={isManager && managerKeys.length === 1} onClick={leaveRoom}>Leave Room</Button>
            </Form.Group>
            <Button variant="danger" onClick={() => setShowDelete(true)} disabled={!isManager}>Delete Room</Button>
            <Modal show={showDelete} onHide={hideDelete} >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete your room? Type <b>{room}</b> to confirm.</p>
                    <Form.Control value={confirm} onChange={e => setConfirm(e.target.value)} className={fieldsClass} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={hideDelete}>Cancel</Button>
                    <Button disabled={confirm !== room} variant="danger" onClick={deleteRoom}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}