import { FormControlLabel, Switch } from "@material-ui/core";
import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Card, Container, Form } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import { fieldsClass } from "../../constants/Classes";
import Colours from "../../constants/Colours";
export default function Browser(p) {
    const INITIAL_ROOM_TYPE = "Managed Rooms"
    const GAME_FILTER = "Game";
    const DESCRIPTION_FILTER = "Description";
    const NAME_FILTER = "Name";
    //Database
    const user = firebase.auth().currentUser;
    const database = firebase.database();
    const userRef = database.ref("users/" + user.uid);
    //States
    const [rooms, setRooms] = useState();
    const [userRooms, setUserRooms] = useState();
    const [roomsState, setRoomsState] = useState({
        rooms: [],
        joinedRooms: [],
        managedRooms: []
    })
    const [filterValues, setFilterValues] = useState([]);
    const [roomSelected, setRoomSelected] = useState("");
    const [roomSearchType, setRoomSearchType] = useState(INITIAL_ROOM_TYPE);
    //Functions, other hooks and variables.
    useEffect(() => {
        const roomsRef = database.ref("rooms");
        roomsRef.get()
            .then(d => d.val())
            .then(rooms => {
                if (rooms) {
                    Object.keys(rooms)
                        .forEach(key => {
                            if (!rooms[key].owners) {
                                roomsRef.child(key).remove();
                                delete rooms[key]
                            }
                        })
                    setRooms(rooms)
                }
            });
        userRef.get().then(d => setUserRooms({
            joined: d.child("joinedRooms").val(),
            managed: d.child("managedRooms").val()
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.uid]);
    const noRoomsComponent =
        <Container>
            <h1>You have no rooms. Add a room to use the Room Browser.</h1>
        </Container>
    if (rooms == null)
        return noRoomsComponent;
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
    const roomCards = rooms => rooms.map((r, i) =>
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
    )
    let roomsArr = [];
    let joinedRooms = [];
    let managedRooms = [];
    const extractRooms = roomKeys => Object.keys(roomKeys).map(key => { return { ...rooms[key], key: key } })
    const search = word => {
        word = word.toLowerCase();
        const filter = r => {
            if (filterValues.includes(NAME_FILTER)) {
                if (r.name.toLowerCase().includes(word))
                    return true;
            }
            if (filterValues.includes(DESCRIPTION_FILTER)) {
                if (r.description.toLowerCase().includes(word))
                    return true;
            }
            if (filterValues.includes(GAME_FILTER)) {
                if (r.game.toLowerCase().includes(word))
                    return true;
            }
            return false;
        }
        setRoomsState({
            rooms: roomsArr.filter(filter),
            joinedRooms: joinedRooms.filter(filter),
            managedRooms: managedRooms.filter(filter)
        })
    }
    const initialise = (roomsState, rooms) => roomsState.length > 0 ? roomsState : rooms;
    const searchFilter = async (checked, param) => {
        checked ? setFilterValues(filterValues => filterValues.concat([param])) : setFilterValues(filterValues => filterValues.filter(f => f !== param))
    };
    const searchBar =
        <Form.Group className="mb-4">
            <Form.Control id="searchBar" className={"mb-3 " + fieldsClass} onChange={e => search(e.target.value)} placeholder="Search room by name, game or description." />
            <Form.Label >Filter Search</Form.Label>
            <br />
            <FormControlLabel label={NAME_FILTER} control={<Switch onChange={e => searchFilter(e.target.checked, NAME_FILTER)} />} />
            <FormControlLabel label={GAME_FILTER} control={<Switch onChange={e => searchFilter(e.target.checked, GAME_FILTER)} />} />
            <FormControlLabel label={DESCRIPTION_FILTER} control={<Switch onChange={e => searchFilter(e.target.checked, DESCRIPTION_FILTER)} />} />
        </Form.Group>
    if (window.location.pathname.startsWith("/app/myRooms")) {
        if (userRooms != null) {
            if (userRooms.joined != null) {
                joinedRooms = extractRooms(userRooms.joined)
            }
            if (userRooms.managed != null) {
                managedRooms = extractRooms(userRooms.managed);
            }
        }
        if (managedRooms.length === 0 && joinedRooms.length === 0)
            return noRoomsComponent;
        joinedRooms = joinedRooms.filter(room => {
            const key = room.key
            console.log(Object.keys(rooms).includes(key));
            if (Object.keys(rooms).includes(key))
                return true;
            userRef.child("joinedRooms").child(key).remove();
            return false;
        })
        managedRooms = managedRooms.filter(room => {
            const key = room.key
            console.log(Object.keys(rooms).includes(key));
            if (Object.keys(rooms).includes(key))
                return true;
            userRef.child("managedRooms").child(key).remove();
            return false;
        })
        return (
            <Container>
                <h1>Your Rooms</h1>
                <Form.Select size="lg" onChange={e => setRoomSearchType(e.target.value)} className={"mb-3 " + fieldsClass}>
                    <option>{INITIAL_ROOM_TYPE}</option>
                    <option>Other Joined Rooms</option>
                </Form.Select>
                {searchBar}
                <div className="d-flex flex-wrap align-items-stretch">
                    {INITIAL_ROOM_TYPE === roomSearchType
                        ?
                        roomCards(initialise(roomsState.managedRooms, managedRooms))
                        :
                        roomCards(initialise(roomsState.joinedRooms, joinedRooms))
                    }
                </div>
            </Container>
        )
    }
    roomsArr = extractRooms(rooms);
    return (
        <Container>
            <h1>Room Browser</h1>
            {searchBar}
            <div className="d-flex flex-wrap align-items-stretch">
                {roomCards(initialise(roomsState.rooms, roomsArr))}
            </div>
        </Container >
    )
}