import React from "react";
import { Button, Container, Form } from "react-bootstrap";
export default function AddChat(p) {
    return (
        <Container>
            <h1>Add Room</h1>
            <Form>
                <Form.Label>Name of Room</Form.Label>
                <Form.Control type="text" placeholder="Eg: Portal 2 mapping, TF2 matchmaking, etc" />
                <br />
                <Form.Label>Game</Form.Label>
                <Form.Control type="text" placeholder="Eg: Portal 2, Team Fortress 2, Counter Strike: Global Offensive, etc" />
                <br />
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" placeholder="Eg: This room is for meeting up for TF2 matchmaking, etc" />
                <br />
                <Button variant="success">Add Room</Button>
            </Form>
        </Container>
    );
}