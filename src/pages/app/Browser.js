import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Card, Container } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import Colours from "../../constants/Colours";
export default function Browser(p) {
    const [rooms, setRooms] = useState()
    const [roomSelected, setRoomSelected] = useState("");
    useEffect(() => {
        firebase.database().ref("rooms").get().then(d => setRooms(d.val())/*(r => setRooms(rooms => rooms.concat({ ...r.val(), key: r.key }))));*/)
    }, []);
    const roomsArr = [];
    if (rooms != null) {
        Object.keys(rooms).forEach(k => roomsArr.push({ ...rooms[k], key: k }))
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
    return (
        <Container>
            <h1>Room Browser</h1>
            <div className="d-flex flex-wrap align-items-stretch">
                {roomsArr.map((r, i) =>
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
                )}
            </div>
        </Container >
    )
}