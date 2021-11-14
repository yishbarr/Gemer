import React, { useContext, useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import firebase from "firebase";
import { Context } from "../../../context/Store";
import { Redirect } from "react-router-dom";
import { fieldsClass } from "../../../constants/Classes";
import MyModal from "../../../components/MyModal";
export default function Admin(p) {
    const usersRef = firebase.database().ref("users");
    const [users, setUsers] = useState([])
    const [searchRes, setSearchRes] = useState([]);
    const [restrictModal, setRestrictModal] = useState({ key: "", type: "", show: false })
    const [state, dispatch] = useContext(Context);
    const DEFAULT_OPTION = "Please Choose Option";
    const search = word => {
        const filter = u => u.name.toLowerCase().includes(word.toLowerCase()) || u.key.toLowerCase().includes(word.toLowerCase());
        const joinedRes = users.filter(filter);
        setSearchRes(joinedRes)
    }
    useEffect(() => {
        const getUsers = users => {
            setUsers([]);
            Object.keys(users)
                .forEach(key => {
                    setUsers(usersState => usersState.concat([{
                        key: key,
                        name: users[key].profile.nickname,
                        restriction: users[key].restriction ? users[key].restriction : "None",
                        isAdmin: users[key].isAdmin
                    }]))
                })
            search("");
        }
        usersRef.on('value', d => getUsers(d.val()));
        dispatch({ type: "SET_MESSAGE_LISTENER", payload: [usersRef] })
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        , [])


    const restrict = (key, type) => usersRef.child(key).child("restriction").set(type).then(hideRestrictModal);
    const hideRestrictModal = () => setRestrictModal({ show: false })
    const searchArr = searchRes.length > 0 ? searchRes : users
    if (!state.isAdmin)
        return <Redirect to="/app" />
    return (
        <Container>
            <h1>Administration</h1>
            <Form.Group className="mb-3">
                <Form.Label>Search Users</Form.Label>
                <Form.Control id="searchBar" className={fieldsClass} onChange={e => search(e.target.value)} onClick={e => search(e.target.value)} />
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
                        {searchArr.map((m, i) =>
                            <tr key={i}>
                                <td>{m.name}</td>
                                <td>{m.key}</td>
                                <td>{m.restriction}</td>
                                <td><Button disabled={m.isAdmin} onClick={() => setRestrictModal({ key: m.key, show: true, type: DEFAULT_OPTION })}>{m.restriction === "None" ? "Restrict User" : "Change Restriction"}</Button></td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Form.Group>
            <MyModal
                title={"Restrict User"}
                footer={
                    <Modal.Footer>
                        <Button onClick={hideRestrictModal}>Cancel</Button>
                        <Button disabled={restrictModal.type === DEFAULT_OPTION} onClick={() => restrict(restrictModal.key, restrictModal.type)}>Restrict</Button>
                    </Modal.Footer>
                }
                body={
                    <Modal.Body>
                        <Form.Select className={fieldsClass} onChange={e => setRestrictModal({ ...restrictModal, type: e.target.value })}>
                            <option>Please Choose Option</option>
                            <option>Total</option>
                            <option>None</option>
                        </Form.Select>
                    </Modal.Body>}
                onHide={hideRestrictModal}
                show={restrictModal.show}
            />
        </Container>
    )
}