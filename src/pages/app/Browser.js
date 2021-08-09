import React from "react";
import { Button, Card, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
export default function Browser(p) {
    const rooms = [];
    return (
            <Container>
                <Link to={`/app/addChat`} >
                    <Button variant="primary" >Add Room</Button>
                </Link>
                <div className="d-flex flex-wrap">
                    {rooms.map(r =>
                        <Card style={{ width: "18rem" }}>
                            <a href={"/room/" + r.id}>
                                <Card.Body>
                                    <Card.Title>{r.name}</Card.Title>
                                    <Card.Text>{r.description}</Card.Text>
                                </Card.Body>
                            </a>
                        </Card>
                    )}
                </div>
            </Container>
    )
}