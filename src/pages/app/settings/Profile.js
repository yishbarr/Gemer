import { FormControlLabel, Switch } from "@material-ui/core";
import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Button, Container, Form, Image } from "react-bootstrap";
import { fieldsClass } from "../../../constants/Classes";
import Colours from "../../../constants/Colours";
export default function Profile(p) {
    //Constants
    const samplePhoto = "/assets/img/profile_sample.png";
    //Database
    const user = firebase.auth().currentUser;
    const profileStorageRef = firebase.storage().ref().child(`profile_pics/${user.uid}/profile_picture`);
    const ref = firebase.database().ref(`users/${user.uid}`);
    const profileRef = ref.child("profile");
    const usesPhoto = ref.child("usesPhoto");
    //States
    const [nickname, setNickname] = useState(user.displayName);
    const [favGames, setFaveGames] = useState("");
    const [profilePicture, setProfilePicture] = useState(samplePhoto)
    //Functions, other hooks and variables
    const isSample = profilePicture === "/assets/img/profile_sample.png";
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => usesPhoto.get().then(d => d.val() ? setProfilePicture(user.photoURL) : setProfilePicture(samplePhoto)), [user.photoURL]);
    const untickPhoto = () => {
        setProfilePicture(samplePhoto);
        document.getElementById("upload-button").value = "";
    }
    const tickPhoto = () => {
        console.log(user.photoURL);
        setProfilePicture(user.photoURL);
    }
    const updateProfile = async () => {
        if (ref !== undefined) {
            console.log("update profile");
            let url = user.photoURL;
            user.updateProfile({ displayName: nickname })
            try {
                if (!isSample) {
                    usesPhoto.set(true);
                    const res = await fetch(profilePicture);
                    if (res.ok) {
                        console.log("pootis");
                        await profileStorageRef.put(await (res).blob());
                        const url = await profileStorageRef.getDownloadURL()
                        user.updateProfile({ photoURL: url })
                    }
                }
                else usesPhoto.set(false);
            }
            catch (e) {
                console.log(e);
            }
            profileRef.set({ nickname: nickname, favGames: favGames, profilePhoto: url })
        }
    }
    useEffect(() => {
        const getProfile = () => {
            async function getter() {
                console.log("getting profile");
                let profile = await profileRef.get();
                if (profile.exists()) {
                    setFaveGames(profile.child("favGames").val());
                }
                console.log(user.uid);
            }
            if (ref !== undefined)
                getter();
        }
        getProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <Container>
            <h1>Profile</h1>
            <Form>
                <Form.Group className="mb-3" controlId="nicknameGroup" >
                    <Form.Label>Nickname</Form.Label>
                    <Form.Control onChange={e => setNickname(e.target.value)} className={fieldsClass} type="text" placeholder="Eg: Muselk, ster_, Jerma985, etc" value={nickname} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="favGroup">
                    <Form.Label>Favourite Games</Form.Label>
                    <Form.Control onChange={e => setFaveGames(e.target.value)} className={fieldsClass} type="text" placeholder="Eg: Portal 2, Team Fortress 2, etc" value={favGames} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Profile Photo</Form.Label>
                    <Form.Group controlId="usePhoto" className="mb-3">
                        <FormControlLabel label="Use profile photo" control={
                            <Switch color="primary" id="sampleTick" checked={!isSample} onChange={e => e.target.checked ? tickPhoto() : untickPhoto()} />
                        } />
                    </Form.Group>
                    <Image src={profilePicture} style={{ border: "3px solid", borderColor: Colours.gray, borderRadius: 20, width: "30%" }} alt="Profile" id="profilePhoto" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="btn btn-primary" style={{ width: "15%", minWidth: "75px" }} htmlFor="upload-button">Upload Photo</Form.Label>
                    <input id="upload-button" type="file" accept="image/*" className="btn btn-primary" style={{ display: "none" }}
                        onChange={e => setProfilePicture(URL.createObjectURL(e.target.files[0]))} />
                </Form.Group>
                <Button onClick={updateProfile} variant="success" style={{ width: "10%", minWidth: "65px" }}>Apply</Button>
            </Form>
        </Container >
    )
}