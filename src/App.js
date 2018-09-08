import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import Exchange from './Components/MoneyExchange/MoneyExchange'
import Settings from './Components/Settings/Settings'
import { Navigation } from './Components/Navbar/Navbar'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <div className="App">
        <div>
        <Route exact path="/" component={Exchange}/>
        <Route path="/settings" component={Settings}/>
      </div>
      </div>
      </BrowserRouter>
    );
  }
}

export default App;
