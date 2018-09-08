import React, { Component } from 'react';
import { Table, Thead, Modal, Header, Body, Button, Title, OverlayTrigger, Popover, Tooltip, InputGroup, FormGroup, FormControl} from 'react-bootstrap';
import { connect } from "react-redux";
import { UPDATE } from "../../js/actions/index";
import { INITIALIZE } from '../../js/actions/index';
import './moneyexchange.css'
import axios from 'axios';
import { Navigation } from '../Navbar/Navbar';

const styles = {
  black: {
    color: 'black'
  },
  red: {
    color: '#ff0000'
  }
}

const mapDispatchToProps = dispatch => {
  return {
    UPDATE: newSettings => dispatch(UPDATE(newSettings)),
    INITIALIZE: firstSettings => dispatch(INITIALIZE(firstSettings))
  };
};


const mapStateToProps = (state) => {
  return { currencies: state.currencies, settings: state.settings};
};

class MoneyExchange extends Component {
  constructor(props){
    super(props);
    this.state = {
      amount: 15000,
      usd: '',
      data:'',
      ready: 0,
      show: false,
      showJPY: false,
      showEUR: false,
      commission: 2,
      subTotal: '',
      amountToBuy: '',
      refresh: 0,
      authorized: false,
      password: 'treehouse'
    }
    this.getCurrencyValue = this.getCurrencyValue.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleTotal = this.handleTotal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePurchase = this.handlePurchase.bind(this);
    this.makeTheState = this.makeTheState.bind(this);
    this.authorize = this.authorize.bind(this);
  }

  authorize = (e) => {
    console.log('hit')
    const password = e.target.querySelector('input[type="password"]').value;
    const auth = password == this.state.password;
    console.log(auth)
    this.setState({
      authorized: auth
    });
  }

  makeTheState = () => {
    console.log('hi')
    axios.get('config.json')
    .then(results => {
      const currencies = results.data.currencies
      const settings = results.data.settings
      const firstSettings = {currencies: currencies,
      settings: settings}
    
   
      this.props.INITIALIZE(firstSettings)
    })
    .then(
      setTimeout(this.getCurrencyValue(), 50000))


  }

  getCurrencyValue = () => {

    const access_key = 'b520f09438b3a39356b70de4949ce37c';

    axios.get('http://www.apilayer.net/api/live?access_key=' + access_key )
      .then(results => {
        console.log(this.props.currencies)
        const newArray = Object.keys(this.props.currencies)

        const rate = []; 

        const varD = 'results.data.quotes.USD'

        for (let i=0;i<newArray.length;i++){
            rate[i] = eval(varD + newArray[i])
          }

        var obj = {}

        for (let i = 0; i < newArray.length; i++) {
            let key = newArray[i] + 'buy'
            let key2 = newArray[i] + 'sell'
            
            obj[key2] = parseFloat(((rate[i] * this.props.settings.margin) + (rate[i])).toFixed(4))
            obj[key] = parseFloat(((rate[i]) - (rate[i] * this.props.settings.margin)).toFixed(4))
        }
        console.log(obj)

        let timeStamp = (results.data.timestamp * 1000)

        let newSettings = obj

        this.props.UPDATE(newSettings);
        this.setState({
          mapCurrencies: obj
        })
      
      })
  }

  componentDidMount() {
    this.getCurrencyValue()
  }

  handleClose() {
    this.setState({ show: false, amountToBuy: '' });
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleShowJPY() {
    this.setState({ show: true });
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value }, () => {
      console.log(this.state.amountToBuy)
      console.log(this.state.subTotal)
      console.log(this.state.totalPurchaseAmount)
    });
    this.handleTotal();
  }

  
  handleTotal(){
    let subTotal = (this.state.amountToBuy * this.props.settings.EURbuy)
    let totalPurchaseAmount = (subTotal + this.props.settings.commission)
    this.setState({
      subTotal: subTotal,
      totalPurchaseAmount: totalPurchaseAmount
    }, () => {
      console.log(this.state.amountToBuy)
      console.log(this.state.subTotal)
      console.log(this.state.totalPurchaseAmount)
    })
  }

  handlePurchase(){
    let newAmount = {amount: (this.props.settings.amount - this.state.totalPurchaseAmount)}
    console.log(newAmount)
    this.props.UPDATE(newAmount)
  }

  render(){
    const popover = (
      <Popover id="modal-popover" title="popover">
        very popover. such engagement
      </Popover>
    );
    const login = (
      <div className='password-splash'>
      <form action="#" onSubmit={this.authorize}>
          <input
              type='password'
              placeholder='Password' />
          <input type='submit' />
      </form>
      </div>
  );
  

    const theExchange = (
      <div className="exchangeMoney">
      <Navigation/>
      <span>Exchange rates shown as per {this.props.settings.commission}</span>
      <div className="table-div">
      <Table striped bordered={false} condensed hover>
  <thead>
    <tr>
      <th>Currency</th>
      <th>Buy</th>
      <th>Sell</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr onClick={this.handleShow}>
      <td>EUR</td>
      <td>{this.props.settings.EURbuy}</td>
      <td>{this.props.settings.EURsell}</td>
      <td style={(this.props.settings.amount < 3750) ? styles.red : styles.black}>{this.props.settings.amount}</td>
    </tr>
    <tr onClick={this.handleShow}>
      <td>CAD</td>
      <td>{this.props.settings.CADbuy}</td>
      <td>{this.props.settings.CADsell}</td>
      <td style={(this.props.settings.amount < 3750) ? styles.red : styles.black}>{this.props.settings.amount}</td>
    </tr>
    <tr onClick={this.handleShow}>
      <td>GBP</td>
      <td>{this.props.settings.GBPbuy}</td>
      <td>{this.props.settings.GBPsell}</td>
      <td style={(this.props.settings.amount < 3750) ? styles.red : styles.black}>{this.props.settings.amount}</td>
    </tr>
    <tr onClick={this.handleShow}>
      <td>VND</td>
      <td>{this.props.settings.VNDbuy}</td>
      <td>{this.props.settings.VNDsell}</td>
      <td style={(this.props.settings.amount < 3750) ? styles.red : styles.black}>{this.props.settings.amount}</td>
    </tr>
    <tr onClick={this.handleShow}>
      <td>HKD</td>
      <td>{this.props.settings.HKDbuy}</td>
      <td>{this.props.settings.HKDsell}</td>
      <td style={(this.props.settings.amount < 3750) ? styles.red : styles.black}>{this.props.settings.amount}</td>
    </tr>
    <tr onClick={this.handleShow}>
      <td>AUD</td>
      <td>{this.props.settings.AUDbuy}</td>
      <td>{this.props.settings.AUDsell}</td>
      <td style={(this.props.settings.amount < 3750) ? styles.red : styles.black}>{this.props.settings.amount}</td>
    </tr>
    <tr onClick={this.handleShow}>
      <td>JPY</td>
      <td>{this.props.settings.JPYbuy}</td>
      <td>{this.props.settings.JPYsell}</td>
      <td style={(this.props.settings.amount < 3750) ? styles.red : styles.black}>{this.props.settings.amount}</td>
    </tr>
  </tbody>
</Table>
</div>
    <div>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Buy EUR</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <FormGroup>
                    <InputGroup >
                    <InputGroup.Addon>€</InputGroup.Addon>
                      <FormControl type='text' id='amountToBuy' onChange={this.handleChange} value={this.state.amountToBuy}/>
                        <InputGroup.Addon>.00</InputGroup.Addon>
                    </InputGroup>
          </FormGroup>
          <Table className='tableModal'>
            <tbody>
              <tr onClick={this.handleShow}>
                <td style={{border:0}}>Exchange Rate</td>
                <td>{this.props.settings.EURbuy}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>{this.state.subTotal}</td>
              </tr>
              <tr>
                <td>Commission</td>
                <td>{this.props.settings.commission}</td>
              </tr>
            </tbody>
      
            <tbody>
              <tr onClick={this.handleShow}>
                <td>Total</td>
                <td>{this.state.totalPurchaseAmount}</td>
              </tr>
            </tbody>
          </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Cancel</Button> <Button onClick={this.handlePurchase}>Buy</Button>
          </Modal.Footer>
        </Modal>
    </div>
    <div>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Buy CAD</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <FormGroup>
                    <InputGroup >
                    <InputGroup.Addon></InputGroup.Addon>
                      <FormControl type='text' id='amountToBuy' onChange={this.handleChange} value={this.state.amountToBuy}/>
                        <InputGroup.Addon>.00</InputGroup.Addon>
                    </InputGroup>
          </FormGroup>
          <Table className='tableModal'>
            <tbody>
              <tr onClick={this.handleShow}>
                <td style={{border:0}}>Exchange Rate</td>
                <td>{this.props.settings.CADbuy}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>{this.state.subTotal}</td>
              </tr>
              <tr>
                <td>Commission</td>
                <td>{this.props.settings.commission}</td>
              </tr>
            </tbody>
      
            <tbody>
              <tr onClick={this.handleShow}>
                <td>Total</td>
                <td>{this.state.totalPurchaseAmount}</td>
              </tr>
            </tbody>
          </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Cancel</Button> <Button onClick={this.handlePurchase}>Buy</Button>
          </Modal.Footer>
        </Modal>
    </div>
    <div>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Buy GBP</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <FormGroup>
                    <InputGroup >
                    <InputGroup.Addon>€</InputGroup.Addon>
                      <FormControl type='text' id='amountToBuy' onChange={this.handleChange} value={this.state.amountToBuy}/>
                        <InputGroup.Addon>.00</InputGroup.Addon>
                    </InputGroup>
          </FormGroup>
          <Table className='tableModal'>
            <tbody>
              <tr onClick={this.handleShow}>
                <td style={{border:0}}>Exchange Rate</td>
                <td>{this.props.settings.EURbuy}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>{this.state.subTotal}</td>
              </tr>
              <tr>
                <td>Commission</td>
                <td>{this.props.settings.commission}</td>
              </tr>
            </tbody>
      
            <tbody>
              <tr onClick={this.handleShow}>
                <td>Total</td>
                <td>{this.state.totalPurchaseAmount}</td>
              </tr>
            </tbody>
          </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Cancel</Button> <Button onClick={this.handlePurchase}>Buy</Button>
          </Modal.Footer>
        </Modal>
    </div>
    <div>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Buy HKD</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <FormGroup>
                    <InputGroup >
                    <InputGroup.Addon>€</InputGroup.Addon>
                      <FormControl type='text' id='amountToBuy' onChange={this.handleChange} value={this.state.amountToBuy}/>
                        <InputGroup.Addon>.00</InputGroup.Addon>
                    </InputGroup>
          </FormGroup>
          <Table className='tableModal'>
            <tbody>
              <tr onClick={this.handleShow}>
                <td style={{border:0}}>Exchange Rate</td>
                <td>{this.props.settings.HKDbuy}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>{this.state.subTotal}</td>
              </tr>
              <tr>
                <td>Commission</td>
                <td>{this.props.settings.commission}</td>
              </tr>
            </tbody>
      
            <tbody>
              <tr onClick={this.handleShow}>
                <td>Total</td>
                <td>{this.state.totalPurchaseAmount}</td>
              </tr>
            </tbody>
          </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Cancel</Button> <Button onClick={this.handlePurchase}>Buy</Button>
          </Modal.Footer>
        </Modal>
    </div>
    <div>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Buy JPY</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <FormGroup>
                    <InputGroup >
                    <InputGroup.Addon>¥</InputGroup.Addon>
                      <FormControl type='text' id='amountToBuy' onChange={this.handleChange} value={this.state.amountToBuy}/>
                        <InputGroup.Addon>.00</InputGroup.Addon>
                    </InputGroup>
          </FormGroup>
          <Table className='tableModal'>
            <tbody>
              <tr onClick={this.handleShow}>
                <td style={{border:0}}>Exchange Rate</td>
                <td>{this.props.settings.JPYbuy}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>{this.state.subTotal}</td>
              </tr>
              <tr>
                <td>Commission</td>
                <td>{this.props.settings.commission}</td>
              </tr>
            </tbody>
      
            <tbody>
              <tr onClick={this.handleShow}>
                <td>Total</td>
                <td>{this.state.totalPurchaseAmount}</td>
              </tr>
            </tbody>
          </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Cancel</Button> <Button onClick={this.handlePurchase}>Buy</Button>
          </Modal.Footer>
        </Modal>
    </div>
    <div>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Buy VND</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <FormGroup>
                    <InputGroup >
                    <InputGroup.Addon>€</InputGroup.Addon>
                      <FormControl type='text' id='amountToBuy' onChange={this.handleChange} value={this.state.amountToBuy}/>
                        <InputGroup.Addon>.00</InputGroup.Addon>
                    </InputGroup>
          </FormGroup>
          <Table className='tableModal'>
            <tbody>
              <tr onClick={this.handleShow}>
                <td style={{border:0}}>Exchange Rate</td>
                <td>{this.props.settings.VNDbuy}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>{this.state.subTotal}</td>
              </tr>
              <tr>
                <td>Commission</td>
                <td>{this.props.settings.commission}</td>
              </tr>
            </tbody>
      
            <tbody>
              <tr onClick={this.handleShow}>
                <td>Total</td>
                <td>{this.state.totalPurchaseAmount}</td>
              </tr>
            </tbody>
          </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Cancel</Button> <Button onClick={this.handlePurchase}>Buy</Button>
          </Modal.Footer>
        </Modal>
    </div>
</div>
    )
    
    return(
      <div>
      {this.state.authorized ? theExchange : login }
      </div>
    )
  }}


const Exchange = connect(mapStateToProps, mapDispatchToProps)(MoneyExchange);
export default Exchange;