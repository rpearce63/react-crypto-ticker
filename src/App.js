import React, { Component } from "react";
import Header from "./components/Header";
import { Switch, Route } from "react-router-dom";

import BodyWSS from "./components/Body-WSS";
import Body from "./components/Body";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/style.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header branding="Real-Time Cryptocurrency Dashboard" />
        <div className="container">
          <Switch>
            <Route exact path="/single">
              <Body />
            </Route>
            <Route exact path="/dual">
              <BodyWSS />
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
