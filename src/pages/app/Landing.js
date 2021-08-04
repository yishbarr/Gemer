import React from "react";
import { Route } from "react-router-dom";
import Browser from "./Browser";
import { Container } from "react-bootstrap"
import "./Landing.css"
export default function Landing(p) {
    const PATH = new URL(window.location).pathname;
    return (
        <div className="Landing">
            <Container>
                <Route path={`/${PATH}`} component={Browser} />
                <Route path={`/${PATH}/profile`} />
                <Route path={`/${PATH}/security`} />
                <Route path={`/${PATH}/room/:id`} />
                <Route path={`/${PATH}/addChat`} />
            </Container>
        </div>
    )
}