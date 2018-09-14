import React, { Component } from 'react';
import { FormGroup, InputGroup, FormControl, Button, Form, Col, ControlLabel, Glyphicon } from 'react-bootstrap';
import { connect } from "react-redux";
import { UPDATE } from "../../js/actions/index";
import { Navigation } from "../Navbar/Navbar";
import './settings.css'

const styles = {
    col: {
        textAlign: 'left'
    }
}

const mapDispatchToProps = dispatch => {
    return {
      UPDATE: newSettings => dispatch(UPDATE(newSettings))
    };
  };

class Settings extends Component {
    constructor(props){
        super(props);
        this.state = {
            interval: '',
            commission: '',
            surcharge: '',
            minimalCommission: '',
            margin: '',
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.id]: event.target.value });
      }

      handleSubmit(event) {
        event.preventDefault();
        const newSettings = this.state;
        console.log(newSettings)

        this.props.UPDATE(newSettings);
        this.setState({ interval: '', commission: '', surcharge: '', minimalCommission: '', margin: '' });
      }
      
    render(){
        return (
            <div className='settings-container'>
                <Navigation/>
                <div className="form-div">
                <h1 style={{marginBottom:'50px', marginTop:'50px'}}><Glyphicon glyph='cog'/> Settings </h1>
                    <Form horizontal>
                    <FormGroup>
                            <Col componentClass={ControlLabel} xs={3} style={styles.col}> 
                                Interval for Updating Rates (Minutes)
                            </Col>
                            <Col xs={3}>
                            <InputGroup >
                                    <FormControl type='number' id='interval' onChange={this.handleChange}/>
                                    <InputGroup.Addon>MIN</InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} xs={3} style={styles.col}> 
                                Commission
                            </Col>
                            <Col xs={3}>
                            <InputGroup >
                                    <FormControl type='number' id='commission' onChange={this.handleChange}/>
                                    <InputGroup.Addon>%</InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} xs={3} style={styles.col}>
                                Surcharge
                            </Col>
                            <Col xs={3}>
                            <InputGroup>
                                    <FormControl type="number" id='surcharge' onChange={this.handleChange} />
                                    <InputGroup.Addon>$</InputGroup.Addon>
                            </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} xs={3} style={styles.col}>
                                Minimal Commission
                            </Col>
                            <Col xs={3}>
                                <InputGroup>
                                    <FormControl type="number" id='minimalCommission' onChange={this.handleChange}/>
                                    <InputGroup.Addon>$</InputGroup.Addon>
                                </InputGroup>
                                </Col>
                            </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} xs={3} style={styles.col}>
                                Buy/Sell Rate Margin
                                </Col>
                            <Col xs={3}>
                                <InputGroup >
                                    <FormControl type="number" id='margin' onChange={this.handleChange} />
                                    <InputGroup.Addon>%</InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <Button onClick={this.handleSubmit}>Update</Button>
                    </Form>
                </div>
            </div>
        )
    }
}

const Admin = connect(null, mapDispatchToProps)(Settings);

export default Admin;