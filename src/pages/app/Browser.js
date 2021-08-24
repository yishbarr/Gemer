import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Card, Container } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import Colours from "../../constants/Colours";
export default function Browser(p) {
    const user = firebase.auth().currentUser;
    const database = firebase.database();
    const [rooms, setRooms] = useState();
    const [userRooms, setUserRooms] = useState();
    const [roomSelected, setRoomSelected] = useState("");
    useEffect(() => {
        database.ref("rooms").get().then(d => setRooms(d.val()));
        database.ref("users/" + user.uid).get().then(d => setUserRooms({
            joined: d.child("joinedRooms").val(),
            managed: d.child("managedRooms").val()
        }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.uid]);
    if (rooms == null)
        return (
            <Container>
                <h1>You have no rooms. Add a room to use the Room Browser.</h1>
            </Container>
        )
    const BGs = [
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'dark',
    ]
    const getColour = i => {
        const times = Math.floor(i / BGs.length);
        return BGs[i - times * BGs.length]
    }
    if (roomSelected.length > 0)
        return <Redirect to={roomSelected} />
    const roomCards = rooms => rooms.map((r, i) =>
        <button onClick={() => setRoomSelected("/app/room/" + r.key)} style={{ all: "unset" }} key={i}>
            <Card style={{ width: "18rem", height: "100%", marginRight: 3, marginBottom: 3, color: Colours.white }} bg={getColour(i)}>
                <Card.Header>
                    <Card.Title>{r.name}</Card.Title>
                </Card.Header>
                <Card.Img variant="top" src={r.photo} />
                <Card.Body >
                    <Card.Subtitle>{r.game}</Card.Subtitle>
                    <Card.Text>{r.description}</Card.Text>
                </Card.Body>
            </Card>
        </button>
    )
    const extractRooms = roomKeys => roomKeys.map(key => { return { ...rooms[key], key: key } })
    if (window.location.pathname.startsWith("/app/myRooms")) {
        const extractUserRooms = roomArr => extractRooms(Object.keys(roomArr))
        let joinedRooms = [];
        let managedRooms = [];
        if (userRooms != null) {
            if (userRooms.joined != null)
                joinedRooms = extractUserRooms(userRooms.joined)
            if (userRooms.managed != null)
                managedRooms = extractUserRooms(userRooms.managed)
        }
        return (
            <Container>
                <h1>Your Rooms</h1>
                <h2>Managed Rooms</h2>
                <div className="d-flex flex-wrap align-items-stretch">
                    {roomCards(managedRooms)}
                </div>
                <br />
                <h2>Other Joined Rooms</h2>
                <div className="d-flex flex-wrap align-items-stretch">
                    {roomCards(joinedRooms)}
                </div>
            </Container>
        )
    }
    const roomsArr = extractRooms(Object.keys(rooms));
    return (
        <Container>
            <h1>Room Browser</h1>
            <div className="d-flex flex-wrap align-items-stretch">
                {roomCards(roomsArr)}
            </div>
        </Container >
    )
}