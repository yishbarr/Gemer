import firebase from "firebase";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Container, Form, Modal, Alert, Table } from "react-bootstrap";
import { Redirect, useParams } from "react-router-dom";
import { fieldsClass } from "../../../constants/Classes";
import { Context } from "../../../context/Store";

export default function RoomManager(p) {
    const roomID = useParams().id;
    //Database
    const database = firebase.database();
    const user = firebase.auth().currentUser;
    const roomRef = database.ref("rooms/" + roomID);
    const managerRef = roomRef.child("managers");
    const usersRef = database.ref("users");
    //States
    const [room, setRoom] = useState({});
    const [description, setDescription] = useState();
    const [game, setGame] = useState();
    const [isValidRoom, setIsValidRoom] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [confirm, setConfirm] = useState("");
    const [managers, setManagers] = useState([]);
    const [owners, setOwners] = useState([]);
    const [showManagerNote, setShowManagerNote] = useState("");
    const [deleted, setDeleted] = useState(false);
    const [, dispatch] = useContext(Context)
    //References
    const isManager = useRef(false);
    const isOwner = useRef(false);
    //Functions and other hooks
    const hideDelete = () => setShowDelete(false);
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
            const isManagerCheck = (managersRes, owner) => {
                owner ? setOwners([]) : setManagers([])
                const managerKeys = Object.keys(managersRes);
                console.log(managerKeys);
                for (const key of managerKeys) {
                    if (key === user.uid) {
                        owner ? isOwner.current = true : isManager.current = true;
                        break;
                    }
                }
                managerKeys.forEach(manager => database.ref("users/" + manager + "/profile").child("nickname").get().then(d => {
                    if (d.exists()) {
                        const adder = managers => managers.concat({ name: d.val(), key: manager })
                        if (owner)
                            setOwners(adder)
                        else setManagers(adder)
                    }
                }))
            }
            managerRef.on("value", d => isManagerCheck(d.val(), false))
            roomRef.child("owners").on("value", d => isManagerCheck(d.val(), true))
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
    console.log(owners);
    return (
        <Container>
            <h1>{room} Settings</h1>
            <Form.Group className="mb-3">
                <Form.Label>Room name</Form.Label>
                <Form.Control className={fieldsClass} value={room} onChange={e => setRoom(e.target.value)} disabled={!isOwner.current} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Room description</Form.Label>
                <Form.Control className={fieldsClass} value={description} onChange={e => setDescription(e.target.value)} disabled={!isOwner.current} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Game</Form.Label>
                <Form.Control className={fieldsClass} value={game} onChange={e => setGame(e.target.value)} disabled={!isOwner.current} />
            </Form.Group>
            {isOwner.current ?
                <Form.Group className="mb-3">
                    <Button variant="success" >Apply</Button>
                </Form.Group> : null}
            <Form.Group className="mb-3">
                <Button variant="danger" disabled={isOwner.current && owners.length === 1} onClick={leaveRoom}>Leave Room</Button>
            </Form.Group>
            <Form.Label>Managers</Form.Label>
            {isOwner.current ?
                <Form.Group className="mb-3">
                    <Form.Label>Add Manager</Form.Label>
                    <Form.Control id="addManagerField" className={fieldsClass + " mb-3"} placeholder="Type in user ID" disabled={!isOwner.current} />
                    <Button variant="info" onClick={addManager}>Add</Button>
                </Form.Group> : null}
            <Alert variant="primary" show={showManagerNote.length > 0}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
                {showManagerNote}
            </Alert>
            <Table variant="dark">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>User ID</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {managers.map(m => <tr>
                        <td>{m.name}</td>
                        <td>{m.key}</td>
                        {!owners.includes(m) ? <td><Button variant="danger" onClick={() => managerRef.child(m.key).remove()}>Remove Manager</Button></td> : <td />}
                    </tr>)}
                </tbody>
            </Table>
            {isOwner.current ? <Button variant="danger" onClick={() => setShowDelete(true)} >Delete Room</Button> : null}
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