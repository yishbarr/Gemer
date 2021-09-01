import firebase from "firebase";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Container, Form, Modal } from "react-bootstrap";
import { Redirect, useParams } from "react-router-dom";
import { fieldsClass } from "../../../constants/Classes";
import { Context } from "../../../context/Store";

export default function RoomManager(p) {
    const roomID = useParams().id;
    const database = firebase.database();
    const user = firebase.auth().currentUser;
    const roomRef = database.ref("rooms/" + roomID);
    const managerRef = roomRef.child("managers");
    const usersRef = database.ref("users");
    const [room, setRoom] = useState({ });
    const [description, setDescription] = useState();
    const [game, setGame] = useState();
    const [isValidRoom, setIsValidRoom] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [confirm, setConfirm] = useState("");
    const [managers, setManagers] = useState([]);
    const [showManagerNote, setShowManagerNote] = useState("");
    const [deleted, setDeleted] = useState(false);
    const [, dispatch] = useContext(Context)
    const hideDelete = () => setShowDelete(false);
    const isManager = useRef(false);
    useEffect(() => roomRef.get().then(d => {
        if (!d.exists())
            setIsValidRoom(false);
        else {
            setRoom(d.child("name").val());
            setDescription(d.child("description").val());
            setGame(d.child("game").val());
        }
    })
        .then(() => {
            const isManagerCheck = managersRes => {
                console.log("sdfsdf");
                setManagers([])
                const managerKeys = Object.keys(managersRes);
                console.log(managerKeys);
                for (const key of managerKeys) {
                    if (key === user.uid) {
                        isManager.current = true;
                        break;
                    }
                }
                managerKeys.forEach(manager => database.ref("users/" + manager + "/profile").child("nickname").get().then(d => d.exists() ? setManagers(managers => managers.concat({ name: d.val(), key: manager })) : null))
            }
            managerRef.on("value", d => isManagerCheck(d.val()))
            dispatch({ type: "SET_MESSAGE_LISTENER", payload: managerRef })
            setIsReady(true);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
        , [user.uid])
    if (!isValidRoom)
        return <Redirect to="/app" />
    if (!isReady)
        return <div />
    const errorMaker = e => console.log(e);
    const leaveRoom = () => database.ref("users/" + user.uid + "/joinedRooms/" + roomID).remove(errorMaker).then(() => setDeleted(true));
    const deleteRoom = () => roomRef.remove(errorMaker)
        .then(() => usersRef.child(user.uid).child("managedRooms").child(roomID).remove(errorMaker))
        .then(() => firebase.storage().ref("room_images/" + roomID).delete())
        .then(leaveRoom)
    const addManager = () => {
        const manager = document.getElementById("addManagerField").value;
        if (manager.length > 0)
            usersRef.child(manager).get()
                .then(d => d.exists())
                .then(exists => exists ? managerRef.child(manager).set(manager) : setShowManagerNote("User ID doesn't exist. Please check you typed the correct ID."));
        else setShowManagerNote("Please type user ID in the field.")
    }
    if (deleted)
        return <Redirect to="/app/myRooms" />
    console.log(managers);
    return (
        <Container>
            <h1>{room} Settings</h1>
            <Form.Group className="mb-3">
                <Form.Label>Room name</Form.Label>
                <Form.Control className={fieldsClass} value={room} onChange={e => setRoom(e.target.value)} disabled={!isManager.current} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Room description</Form.Label>
                <Form.Control className={fieldsClass} value={description} onChange={e => setDescription(e.target.value)} disabled={!isManager.current} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Game</Form.Label>
                <Form.Control className={fieldsClass} value={game} onChange={e => setGame(e.target.value)} disabled={!isManager.current} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Button variant="success" disabled={!isManager.current}>Apply</Button>
            </Form.Group>
            <Form.Group className="mb-3">
                <Button variant="danger" disabled={isManager.current && managers.length === 1} onClick={leaveRoom}>Leave Room</Button>
            </Form.Group>
            <Form.Label>Managers</Form.Label>
            <Form.Group className="mb-3">
                <Form.Label>Add Manager</Form.Label>
                <Form.Control id="addManagerField" className={fieldsClass + " mb-3"} placeholder="Type in user ID" disabled={!isManager.current} />
                <Button variant="info" onClick={addManager} disabled={!isManager.current}>Add</Button>
            </Form.Group>
            {managers.map(m => <p>{m.name} - {m.key}</p>)}
            <Button variant="danger" onClick={() => setShowDelete(true)} disabled={!isManager.current}>Delete Room</Button>
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