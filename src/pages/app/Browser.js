import firebase from "firebase";
import React, { useContext, useEffect, useState } from "react";
import { Card, Container } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import Colours from "../../constants/Colours";
import { Context } from "../../context/Store";
export default function Browser(p) {
    const [state, dispatch] = useContext(Context)
    const [roomSelected, setRoomSelected] = useState("")
    useEffect(() => {
        dispatch({ type: 'CLEAR_ROOMS', payload: null })
        firebase.database().ref("rooms").get().then(d => d.forEach(r => dispatch({ type: "ADD_ROOM", payload: { ...r.val(), key: r.key } })/*.forEach(async room => dispatch({ type: "ADD_ROOM", payload: await room.val() }))*/))
    }, []);
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
            <div className="flex-wrap">
                {state.rooms.map((r, i) =>
                    <button onClick={() => setRoomSelected("/app/room/" + r.key)} style={{ all: "unset" }}>
                        <Card style={{ width: "18rem", marginRight: 3, marginBottom: 3, color: Colours.white }} bg={getColour(i)}>
                            <Card.Img variant="top" src="/assets/img/profile_sample.png"/>
                            <Card.Body>
                                <Card.Title>{r.name}</Card.Title>
                                <Card.Text>{r.description}</Card.Text>
                            </Card.Body>
                        </Card>
                    </button>
                )}
            </div>
        </Container >
    )
}