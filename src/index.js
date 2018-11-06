import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import CAIDeckCreator from "./CAIDeckCreator";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<CAIDeckCreator />, document.getElementById("root"));

// If you want your CAIDeckCreator to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
