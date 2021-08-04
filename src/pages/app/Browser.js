import React from "react";
export default function Browser(p) {
    const rooms = [];
    return (
        <div className="Browser">
            <a className="btn btn-primary" href={"/app/addChat"}>Add Room</a>
            <div className="d-flex flex-wrap">
                {rooms.map(r =>
                    <div className="card" style={{ width: "18rem" }}>
                        <a href={"/room/" + r.id}>
                            <div className="card-body">
                                <h5 className="card-title">{r.name}</h5>
                                <p className="card-text">{r.description}</p>
                            </div>
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}