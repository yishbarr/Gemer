import React, { useContext, useEffect, useState } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import firebase from "firebase";
import { Context } from "../../../context/Store";
import { Redirect } from "react-router-dom";
import { fieldsClass } from "../../../constants/Classes";
export default function Admin(p) {
    const usersRef = firebase.database().ref("users");
    const [users, setUsers] = useState([])
    const [state] = useContext(Context);
    useEffect(() => usersRef.get()
        .then(async d => {
            setUsers([]);
            const users = await d.val();
            Object.keys(users)
                .forEach(key => {
                    setUsers(usersState => usersState.concat([{
                        key: key,
                        name: users[key].profile.nickname,
                        restriction: users[key].restriction ? users[key].restriction : "None",
                        isAdmin: users[key].isAdmin
                    }]))
                })
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }), [])
    if (!state.isAdmin)
        return <Redirect to="/app" />
    return (
        <Container>
            <h1>Administration</h1>
            <Form.Group className="mb-3">
                <Form.Label>Search Users</Form.Label>
                <Form.Control className={fieldsClass} />
                <Table variant="dark">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>User ID</th>
                            <th>Restriction</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((m, i) =>
                            <tr key={i}>
                                <td>{m.name}</td>
                                <td>{m.key}</td>
                                <td>{m.restriction}</td>
                                <td><Button disabled={m.isAdmin}>Restrict User</Button></td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Form.Group>
        </Container>
    )
}