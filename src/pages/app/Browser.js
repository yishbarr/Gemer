import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Browser.css"
export default function Browser(p) {
    const rooms = [];
    return (
        <div className="Browser">
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
        </div>
    )
}