import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
export default function Profile(p) {
    const user = firebase.auth().currentUser;
    const profileStorageRef = firebase.storage().ref().child(`profile_pics/${user.uid}/profile_picture`);
    let fireRef;
    if (user !== null)
        fireRef = firebase.database().ref(`users/${user.uid}`)
    const userDataObj = { nickName: "", favGames: "", profile_picture: "" };
    const [userData, setUserData] = useState(userDataObj);
    const nickNameInputHandler = e => setUserData({ ...userData, nickName: e.target.value });
    const favGameInputHandler = e => setUserData({ ...userData, favGames: e.target.value });
    const getProfile = () => {
        async function getter() {
            console.log("getting profile");
            let profile = await fireRef.child("profile").get();
            if (profile.exists())
                profile = await profile.val()
            setUserData({ ...userData, ...profile, profile_picture: await profileStorageRef.getDownloadURL().catch(() => "/assets/img/profile_sample.png") });
            console.log(user.uid);
        }
        if (fireRef !== undefined)
            getter();
    }
    const updateProfile = async () => {
        if (fireRef !== undefined) {
            console.log("update profile");
            fireRef.child("profile").set({ nickName: userData.nickName, favGames: userData.favGames })
            profileStorageRef.put(userData.profile_picture_file).then(() => console.log("Uploaded profile photo"));
        }
    }
    const changeImage = e => setUserData({ ...userData, profile_picture_file: e.target.files[0], profile_picture: URL.createObjectURL(e.target.files[0]) })
    useEffect(getProfile, []);
    return (
        <div className="Profile">
            <Container>
                <h1>Profile</h1>
                <Form>
                    <Form.Label>Nickname</Form.Label>
                    <Form.Control onChange={nickNameInputHandler} className="form-control fields" type="text" placeholder="Eg: Muselk, ster_, Jerma985, etc" value={userData.nickName} />
                    <br />
                    <Form.Label>Favourite Games</Form.Label>
                    <Form.Control onChange={favGameInputHandler} className="form-control fields" type="text" placeholder="Eg: Portal 2, Team Fortress 2, etc" value={userData.favGames} />
                    <br />
                    <Form.Label>Profile Photo</Form.Label>
                    <img src={userData.profile_picture} style={{ border: "3px black solid", width: "30%" }} alt="Profile" />
                    <br />
                    <label className="btn btn-primary" style={{ width: "15%" }} htmlFor="upload-button">Upload Photo</label>
                    <input id="upload-button" type="file" accept="image/*" className="btn btn-primary" style={{ display: "none" }}
                        onChange={changeImage}></input>
                    <br />
                    <Button onClick={updateProfile} variant="success" style={{ width: "10%" }}>Apply</Button>
                </Form>
            </Container>
        </div>
    )
}