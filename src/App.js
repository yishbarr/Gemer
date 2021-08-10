import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "react-bootstrap";
import { Offline } from "react-detect-offline";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import './App.css';
import "./config/firebaseConfig";
import Store from "./context/Store";
import Landing from './pages/app/Landing';
import Logon from './pages/authentication/Logon';
import LogonRoute from './routes/LogonRoute';

function App() {
  return (
    <BrowserRouter>
      <Store>
        <div className="App">
          <Switch>
            <LogonRoute path={"/app"} component={Landing} />
            <Route component={Logon} />
          </Switch>
          <Offline>
            <Modal show backdrop="static">
              <Modal.Header>
                <Modal.Title>Connection Offline</Modal.Title>
              </Modal.Header>
              <Modal.Body>You're currently offline. Please check your connection.</Modal.Body>
              <Modal.Footer>
                <Button variant="info" onClick={() => window.location.reload()}>Reload</Button>
              </Modal.Footer>
            </Modal>
          </Offline>
        </div>
      </Store>
    </BrowserRouter>
  );
}

export default App;
