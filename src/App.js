import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route } from "react-router-dom";
import './App.css';
import "./config/firebaseConfig";
import Store from "./functions/Store";
import Landing from './pages/app/Landing';
import Logon from './pages/authentication/Logon';
import LogonRoute from './routes/LogonRoute';

function App() {
  return (
    <BrowserRouter>
      <Store>
        <div className="App">
          <LogonRoute path="/app"  component={Landing} />
          <Route path="/" component={Logon} />
        </div>
      </Store>
    </BrowserRouter>
  );
}

export default App;
