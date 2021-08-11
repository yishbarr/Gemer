import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Button, Container, Form, Image } from "react-bootstrap";
import { fieldsClass } from "../../../constants/Classes";
export default function Profile(p) {
    const user = firebase.auth().currentUser;
    const profileStorageRef = firebase.storage().ref().child(`profile_pics/${user.uid}/profile_picture`);
    const ref = firebase.database().ref(`users/${user.uid}`)
    const usesPhoto = ref.child("usesPhoto");
    const [nickname, setNickname] = useState(user.displayName);
    const [favGames, setFaveGames] = useState("");
    const samplePhoto = "/assets/img/profile_sample.png";
    const [profilePicture, setProfilePicture] = useState(samplePhoto)
    const isSample = profilePicture === "/assets/img/profile_sample.png";

    useEffect(() => usesPhoto.get().then(d => d.val() ? setProfilePicture(user.photoURL) : setProfilePicture(samplePhoto)), [user.photoURL]);
    const untickPhoto = () => {
        setProfilePicture(samplePhoto);
        document.getElementById("upload-button").value = "";
        usesPhoto.set(false);
    }
    const tickPhoto = () => {
        usesPhoto.set(true);
        setProfilePicture(user.photoURL);
    }
    const updateProfile = async () => {
        if (ref !== undefined) {
            console.log("update profile");
            user.updateProfile({ displayName: nickname })
            ref.child("profile").set({ nickName: nickname, favGames: favGames })
            console.log(document.getElementById("profilePhoto").src);
            try {
                profileStorageRef.put(await (await fetch(profilePicture)).blob()).then(() => console.log("Uploaded profile photo"))
                    .then(() => profileStorageRef.getDownloadURL())
                    .then(url => user.updateProfile({ photoURL: url }))
                    .then(() => usesPhoto.set(true))
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    useEffect(() => {
        const getProfile = () => {
            async function getter() {
                console.log("getting profile");
                let profile = await ref.child("profile").get();
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
                    <br />
                    <Image src={profilePicture} style={{ border: "3px black solid", width: "30%" }} alt="Profile" id="profilePhoto" />
                </Form.Group>
                <Form.Group controlId="usePhoto" className="mb-3">
                    <Form.Check id="sampleTick" checked={!isSample} label="Use profile photo" type="checkbox" onChange={e => e.target.checked ? tickPhoto() : untickPhoto()} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="btn btn-primary" style={{ width: "15%" }} htmlFor="upload-button">Upload Photo</Form.Label>
                    <input id="upload-button" type="file" accept="image/*" className="btn btn-primary" style={{ display: "none" }}
                        onChange={e => setProfilePicture(URL.createObjectURL(e.target.files[0]))} />
                </Form.Group>
                <Button disabled={isSample} onClick={updateProfile} variant="success" style={{ width: "10%" }}>Apply</Button>
            </Form>
        </Container >
    )
}