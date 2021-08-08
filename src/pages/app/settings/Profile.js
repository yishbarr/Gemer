import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
export default function Profile(p) {
    const user = firebase.auth().currentUser;
    const profileStorageRef = firebase.storage().ref().child(`profile_pics/${user.uid}/profile_picture`);
    let fireRef;
    if (user !== null)
        fireRef = firebase.database().ref(`users/${user.uid}`)
    const [userData, setUserData] = useState({ nickName: "", favGames: "", profile_picture: "/assets/img/profile_sample.png" });
    const nickNameInputHandler = e => setUserData({ ...userData, nickName: e.target.value });
    const favGameInputHandler = e => setUserData({ ...userData, favGames: e.target.value });
    const getProfile = () => {
        async function getter() {
            console.log("getting profile");
            let profile = await fireRef.child("profile").get();
            if (profile.exists())
                profile = await profile.val()
            profileStorageRef.getDownloadURL()
                .then(url => {
                    if (url !== "https://firebasestorage.googleapis.com/v0/b/gemer-4648e.appspot.com/o/profile_pics%2FuumpSNyLZje1dABs4fpPPHSLSFA3%2Fprofile_picture?alt=media&token=8139b73a-3ce7-4c4c-b795-1248ee9edcc6")
                        setUserData({ ...userData, ...profile, profile_picture: url });
                })
                .catch(e => console.log(e));
            console.log(user.uid);
        }
        if (fireRef !== undefined)
            getter();
    }
    const updateProfile = async () => {
        if (fireRef !== undefined) {
            console.log("update profile");
            fireRef.child("profile").set({ nickName: userData.nickName, favGames: userData.favGames })
            console.log(document.getElementById("profilePhoto").src);
            try {
                profileStorageRef.put(await (await fetch(userData.profile_picture)).blob()).then(() => console.log("Uploaded profile photo"));
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    const changeImage = e => setUserData({ ...userData, profile_picture: URL.createObjectURL(e.target.files[0]) })
    useEffect(getProfile, [user.uid]);
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
                    <br />
                    <img src={userData.profile_picture} style={{ border: "3px black solid", width: "30%" }} alt="Profile" id="profilePhoto" />
                    <br />
                    <br />
                    <label className="btn btn-primary" style={{ width: "15%" }} htmlFor="upload-button">Upload Photo</label>
                    <input id="upload-button" type="file" accept="image/*" className="btn btn-primary" style={{ display: "none" }}
                        onChange={changeImage}></input>
                    <br />
                    <br />
                    <Button onClick={updateProfile} variant="success" style={{ width: "10%" }}>Apply</Button>
                </Form>
            </Container>
        </div>
    )
}