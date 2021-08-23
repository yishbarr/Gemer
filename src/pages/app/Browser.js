import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Card, Container } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import Colours from "../../constants/Colours";
export default function Browser(p) {
    const user = firebase.auth().currentUser;
    const [rooms, setRooms] = useState();
    const [roomSelected, setRoomSelected] = useState("");
    useEffect(() => {
        firebase.database().ref("rooms").get().then(d => setRooms(d.val()));
    }, []);
    const roomsArr = [];
    if (rooms != null) {
        Object.keys(rooms).forEach(k => roomsArr.push({ ...rooms[k], key: k }));
    }
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
    if (window.location.pathname.startsWith("/app/myRooms")) {
        const checkIfUserJoined = userArr => {
            for (let key of Object.keys(userArr))
                if (userArr[key] === user.uid)
                    return true;
            return false;
        }
        const managedRooms = roomsArr.filter(r => checkIfUserJoined(r.managers))
        const joinedRooms = roomsArr.filter(r => checkIfUserJoined(r.joinedUsers) && !managedRooms.includes(r))
        return (
            <Container>
                <h1>Your Rooms</h1>
                <h2>Managed Rooms</h2>
                <div className="d-flex flex-wrap align-items-stretch">
                    {roomCards(managedRooms)}
                </div>
                <br/>
                <h2>Other Joined Rooms</h2>
                <div className="d-flex flex-wrap align-items-stretch">
                    {roomCards(joinedRooms)}
                </div>
            </Container>
        )
    }
    return (
        <Container>
            <h1>Room Browser</h1>
            <div className="d-flex flex-wrap align-items-stretch">
                {roomCards(roomsArr)}
            </div>
        </Container >
    )
}