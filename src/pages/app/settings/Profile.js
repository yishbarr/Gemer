import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
export default function Profile(p) {
    const user = firebase.auth().currentUser;
    const profileStorageRef = firebase.storage().ref().child(`profile_pics/${user.uid}/profile_picture`);
    const ref = firebase.database().ref(`users/${user.uid}`)
    const [nickname, setNickname] = useState(user.displayName);
    const [favGames, setFaveGames] = useState("");
    const [profilePicture, setProfilePicture] = useState("/assets/img/profile_sample.png")

    const updateProfile = async () => {
        if (ref !== undefined) {
            console.log("update profile");
            user.updateProfile({ displayName: nickname })
            ref.child("profile").set({ nickName: nickname, favGames: favGames })
            console.log(document.getElementById("profilePhoto").src);
            try {
                profileStorageRef.put(await (await fetch(profilePicture)).blob()).then(() => console.log("Uploaded profile photo"));
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
                profileStorageRef.getDownloadURL()
                    .then(url =>
                        url !== "https://firebasestorage.googleapis.com/v0/b/gemer-4648e.appspot.com/o/profile_pics%2FuumpSNyLZje1dABs4fpPPHSLSFA3%2Fprofile_picture?alt=media&token=8139b73a-3ce7-4c4c-b795-1248ee9edcc6"
                            ? setProfilePicture(url) : null)
                    .catch(e => console.log(e));
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
                <Form.Label>Nickname</Form.Label>
                <Form.Control onChange={e => setNickname(e.target.value)} className="form-control fields" type="text" placeholder="Eg: Muselk, ster_, Jerma985, etc" value={nickname} />
                <br />
                <Form.Label>Favourite Games</Form.Label>
                <Form.Control onChange={e => setFaveGames(e.target.value)} className="form-control fields" type="text" placeholder="Eg: Portal 2, Team Fortress 2, etc" value={favGames} />
                <br />
                <Form.Label>Profile Photo</Form.Label>
                <br />
                <img src={profilePicture} style={{ border: "3px black solid", width: "30%" }} alt="Profile" id="profilePhoto" />
                <br />
                <br />
                <label className="btn btn-primary" style={{ width: "15%" }} htmlFor="upload-button">Upload Photo</label>
                <input id="upload-button" type="file" accept="image/*" className="btn btn-primary" style={{ display: "none" }}
                    onChange={e => setProfilePicture(URL.createObjectURL(e.target.files[0]))}></input>
                <br />
                <br />
                <Button onClick={updateProfile} variant="success" style={{ width: "10%" }}>Apply</Button>
            </Form>
        </Container>
    )
}