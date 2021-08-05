import React from "react"
import { Button, Container, Form } from "react-bootstrap"
export default function Security(p) {
    return (
        <div className="Security">
            <Container>
                <h1>Security</h1>
                <Form>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" className="form-control fields" placeholder="Eg: name@domain.com" />
                    <br />
                    <Form.Label>New Password</Form.Label>
                    <Form.Control type="password" className="form-control fields" placeholder="Type password here" />
                    <br />
                    <Button variant="danger">Apply</Button>
                </Form>
            </Container>
        </div>
    )
}