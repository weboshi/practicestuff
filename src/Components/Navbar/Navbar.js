import React from 'react';
import {Navbar, Brand, Header, Nav, NavItem, MenuItem }from 'react-bootstrap'
import './navbar.css'


export const Navigation = () => {
    return (
    <Navbar>
  <Navbar.Header>
    <Navbar.Brand>
      <a style={{fontSize:'2.2em'}} href="/">Airport Currency Exchange Office</a>
    </Navbar.Brand>
  </Navbar.Header>
  <Nav pullRight>
    <NavItem eventKey={1} href="/">
      Home
    </NavItem>
    <NavItem eventKey={2} href="/settings">
      Admin
    </NavItem>
    <NavItem>
      <img style={{height:'70px'}} src='logo.jpg'/>
    </NavItem>
  </Nav>

</Navbar>

    )}