import React from "react";
import { Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";
export default function Room(p) {
    const location = useLocation();
    console.log(location);
    return (
        <Container>
            
        </Container>
    )
}