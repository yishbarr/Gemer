import React from "react";
import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
export default function Room(p) {
    const roomID = useParams().id;
    console.log(roomID);
    return (
        <Container>
        </Container>
    )
}