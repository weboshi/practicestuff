import React, { Component } from 'react';
import { Table, Thead, Modal, Header, Body, Button, Title, OverlayTrigger, Popover, Tooltip, InputGroup, FormGroup, FormControl} from 'react-bootstrap';
import { connect } from "react-redux";
import { UPDATE, INITIALIZE, UPDATEAMOUNT } from "../../js/actions/index";

import timestamp from 'unix-timestamp';
import './moneyexchange.css'
import axios from 'axios';
import { Navigation } from '../Navbar/Navbar';
import { combineReducers } from 'redux';




const styles = {
  black: {
    color: 'black'
  },
  red: {
    color: '#ff0000'
  },
  modal: {
    textAlign: 'center',
    width: '200px'
  }
}

const mapDispatchToProps = dispatch => {
  return {
    UPDATE: newSettings => dispatch(UPDATE(newSettings)),
    INITIALIZE: (firstSettings, cb) => dispatch(INITIALIZE(firstSettings, cb)),
    UPDATEAMOUNT: newTotal => dispatch(UPDATEAMOUNT(newTotal))
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
      show2: false,
      commission: 2,
      subTotal: '',
      amountToBuy: '',
      refresh: 0,
      authorized: false,
      password: 'treehouse',
      notEnough: false,
      symbols: {EUR: '€', CAD:'C$',  HKD: 'HK$', GBP: '£', JPY: '¥', AUD: 'A$' }
    }
    this.getCurrencyValue = this.getCurrencyValue.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleShow2 = this.handleShow2.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleClose2 = this.handleClose2.bind(this);
    this.handleTotal = this.handleTotal.bind(this);
    this.handleTotal2 = this.handleTotal2.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
    this.handlePurchase = this.handlePurchase.bind(this);
    this.makeTheState = this.makeTheState.bind(this);
    this.authorize = this.authorize.bind(this);
    this.makeTable = this.makeTable.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this)
    this.handleCellClick2 = this.handleCellClick2.bind(this)
    this.handleSale = this.handleSale.bind(this)
    this.makeSymbol = this.makeSymbol.bind(this)
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
      console.log(results.data)
     
      const newObj = results.data
    
   
      this.props.INITIALIZE(newObj, this.getCurrencyValue())
    })
 
  }

  getCurrencyValue = () => {

    const access_key = 'b520f09438b3a39356b70de4949ce37c';

    axios.get('http://www.apilayer.net/api/live?access_key=' + access_key )
      .then(results => {
  
        console.log(this.props.currencies)
        console.log(this.props.settings)
        const newArray = Object.keys(this.props.currencies)
        const amountArray = Object.values(this.props.currencies)
        console.log(newArray)
         console.log(amountArray)
        const rate = []; 
        const varD = 'results.data.quotes.USD'

        for (let i=0;i<newArray.length;i++){
            rate[i] = eval(varD + newArray[i])
          }

        var obj = {}
        var mainArray = []

        for (let i = 0; i < newArray.length; i++) {

            let currObj = {
            currency: newArray[i],
            amount: amountArray[i],
            buy: parseFloat((1 / ((rate[i] * this.props.settings.margin) + (rate[i])))).toFixed(4),
            sell: parseFloat(1/(((rate[i]) - (rate[i] * this.props.settings.margin)))).toFixed(4)
            };

            mainArray.push(currObj)

        }
        console.log(mainArray)


        let timeStamp = (timestamp.toDate(results.data.timestamp)).toString()
        
       
        let newSettings = obj
        console.log(newSettings)

        this.props.UPDATE(newSettings);
        this.setState({
          tableData: mainArray,
          timeStamp: timeStamp
        }, () => (this.makeTable()))
      
      })
      
  }

  componentDidMount() {
    this.makeTheState()
  }

  handleClose() {
    this.setState({ show: false, amountToBuy: '', subTotal: '', totalPurchaseAmount: '' }, (console.log(this.state.amountToBuy)));
  }

  handleClose2() {
    this.setState({ show2: false, amountToBuy: '', subTotal: '', totalPurchaseAmount: '' }, (console.log(this.state.amountToBuy)));
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleShow2() {
    this.setState({ show2: true });
  }

  handleChange(event) {
    console.log(this.props.settings.commission)
    this.setState({ amountToBuy: event.target.value }, () => {
 
      this.handleTotal();
    });
    console.log(this.props.settings.commission)

  }

  handleChange2(event) {
    console.log(this.props.settings.commission)
    this.setState({ amountToBuy: event.target.value }, () => {
 
      this.handleTotal2();
    });
    console.log(this.props.settings.commission)

  }


  handleTotal(){
    let subTotal = parseFloat((this.state.amountToBuy * this.state.buyRate)).toFixed(4)
    let totalPurchaseAmount = parseFloat((subTotal + this.props.settings.commission)).toFixed(4)
    this.setState({
      subTotal: subTotal,
      totalPurchaseAmount: totalPurchaseAmount
    })
  }

  handleTotal2(){
    let subTotal = parseFloat((this.state.amountToBuy * this.state.sellRate)).toFixed(4)
    let totalPurchaseAmount = parseFloat((subTotal + this.props.settings.commission)).toFixed(4)
    this.setState({
      subTotal: subTotal,
      totalPurchaseAmount: totalPurchaseAmount
    })
  }


  handlePurchase(){
    const newAmount = (this.state.amount - this.state.amountToBuy)
    if(this.state.amountToBuy > this.state.amount){
      this.setState({
        notEnough:1,
      })
    }

    else {
 
      let newCurr = this.state.modalCurrency
      const newTotal = {[newCurr]: newAmount}

      this.props.UPDATEAMOUNT(newTotal)
      alert('You purchased ' + this.state.amountToBuy + " " + this.state.modalCurrency + ' for $' + this.state.totalPurchaseAmount)
      this.setState({ 
        amountToBuy: ''
      }, () => this.getCurrencyValue())
      this.handleClose()
    }
  }

  handleSale(){
    const newAmount = (this.props.settings.amount + this.state.totalPurchaseAmount)
    
    const currTotal = (this.state.amount - this.state.amountToBuy)

    if (currTotal < 0) {
      this.setState({
        notEnough: 1,
      })
    }
    else {
      const total = (parseFloat(this.state.amountToBuy) + this.state.amount)
      const newTotal = {[this.state.modalCurrency]: total}
      const newObj = {amount: newAmount}
      console.log(newTotal)
  
      this.props.UPDATE(newObj)
      this.props.UPDATEAMOUNT(newTotal)
      alert('You exchanged ' + this.state.amountToBuy + " " + this.state.modalCurrency + ' for $' + this.state.totalPurchaseAmount)
      this.setState({
        amountToBuy: ''
      }, () => this.getCurrencyValue())
      this.handleClose2()
    }
  }

  handleCellClick = (event,row) => {
      console.log(event.target.dataset.value)

      const handleString = (event.target.dataset.value).split(',');
    
      console.log(handleString)

      const label = (event.target.id + " " + handleString[0])
      console.log(label)
      console.log(parseFloat(handleString[1]))


      this.setState({
      modalCurrency: handleString[0],
      buyRate: parseFloat(handleString[1]),
      amount: parseFloat(handleString[2]),
      label: label
    })
    this.handleShow()
    console.log(this.state.buyRate)
  
  
  }

  handleCellClick2 = (event,row) => {
    console.log(event.target.dataset.value)

    const handleString = (event.target.dataset.value).split(',');
  
    console.log(handleString)

    const label = (event.target.id + " " + handleString[0])
    console.log(label)
    console.log(parseFloat(handleString[1]))


 
    this.setState({
      modalCurrency: handleString[0],
      sellRate: parseFloat(handleString[1]),
      amount: parseFloat(handleString[2]),
      label: label
    }, () => console.log(this.state.sellRate))
    this.handleShow2()
    
    
  }

  makeSymbol(){
    const sign = this.state.modalCurrency
    console.log(sign)
    return ( this.state.symbols[sign] )
  }

  makeTable(){

    const tableStuff = this.state.tableData
    const listItems = [];
    for (let i=0; i<tableStuff.length;i++){
    listItems.push(
      <tbody key={i}>
      <tr id={i}>
      <td>{tableStuff[i].currency}</td>
      <td id='Buy'  onClick={this.handleCellClick} data-value={[tableStuff[i].currency,tableStuff[i].buy,tableStuff[i].amount]}>{tableStuff[i].buy}</td>
      <td id='Sell' onClick={this.handleCellClick2} data-value={[tableStuff[i].currency,tableStuff[i].sell,tableStuff[i].amount]}>{tableStuff[i].sell}</td>
      <td style={(tableStuff[i].amount < 250) ? styles.red : styles.black}>{tableStuff[i].amount}</td>
    </tr>
      </tbody>
    );
    }
    
    this.setState({
      table: listItems
    })
  }

  render(){
    const popover = (
      <Popover id="modal-popover" title="popover">
        very popover. such engagement
      </Popover>
    );
    const login = (
      <div className='password-container'>
      <div className='password-splash'>
      <form action="#" onSubmit={this.authorize}>
          <input
              type='password'
              placeholder='Password' />
          <input type='submit' />
      </form>
      </div>
      </div>
  );

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      console.log(row.currency)
      this.setState({
        modalCurrency: row.currency,
        buyRate: row.buy,
        sellRate: row.sell,
        amount: row.amount
      })
      this.handleShow();
      

    }
  };

    const theExchange = (
      <div className="exchangeMoney">
      <Navigation/>
      <span className='timestamp'>Exchange rates shown as per {this.state.timeStamp}. You have {this.state.amount} {this.props.settings.mainCurrency} left.</span>
      <div className="table-div">
    
  <Table striped={true} bordered={false} condensed hover>
  <thead>
    <tr>
      <th>Currency</th>
      <th>Buy Rate</th>
      <th>Sell Rate</th>
      <th>Amount</th>
    </tr>
  </thead>

  {this.state.table}
  </Table>
      <Modal show={this.state.show} onHide={this.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{this.state.label}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <FormGroup>
                <InputGroup >
                <InputGroup.Addon>{this.makeSymbol()}</InputGroup.Addon>
                  <FormControl type='text' id='amountToBuy' onChange={this.handleChange} value={this.state.amountToBuy}/>
                    <InputGroup.Addon>.00</InputGroup.Addon>
                </InputGroup>
      </FormGroup>
      <Table className='tableModal'>
        <tbody>
          <tr>
            <td style={{border:0}}>Exchange Rate</td>
            <td style={styles.modal}>{this.state.buyRate}</td>
          </tr>
          <tr>
            <td>Subtotal</td>
            <td style={styles.modal}>{this.state.subTotal}</td>
          </tr>
          <tr>
            <td>Commission</td>
            <td style={styles.modal}>{this.props.settings.commission}</td>
          </tr>
        </tbody>
  
        <tbody>
          <tr>
            <td>Total</td>
            <td style={styles.modal}>{this.state.totalPurchaseAmount}</td>
          </tr>
        </tbody>
      </Table>
      </Modal.Body>
      <Modal.Footer> {this.state.notEnough == 1 && <span style={{color:'red',marginRight:'20px',fontWeight:'bold'}}>Not enough funds</span>}
        <Button onClick={this.handleClose}>Cancel</Button> <Button onClick={this.handlePurchase}>Buy</Button>
      </Modal.Footer>
    </Modal>

    <Modal show={this.state.show2} onHide={this.handleClose2}>
      <Modal.Header closeButton>
        <Modal.Title>{this.state.label}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <FormGroup>
                <InputGroup >
                <InputGroup.Addon>{this.makeSymbol()}</InputGroup.Addon>
                  <FormControl type='text' id='amountToBuy' onChange={this.handleChange2} value={this.state.amountToBuy}/>
                    <InputGroup.Addon>.00</InputGroup.Addon>
                </InputGroup>
      </FormGroup>
      <Table className='tableModal'>
        <tbody>
          <tr>
            <td style={{border:0}}>Exchange Rate</td>
            <td style={styles.modal}>{this.state.sellRate}</td>
          </tr>
          <tr>
            <td>Subtotal</td>
            <td style={styles.modal}>{this.state.subTotal}</td>
          </tr>
          <tr>
            <td>Commission</td>
            <td style={styles.modal}>{this.props.settings.commission}</td>
          </tr>
        </tbody>
  
        <tbody>
          <tr>
            <td>Total</td>
            <td style={styles.modal}>{this.state.totalPurchaseAmount}</td>
          </tr>
        </tbody>
      </Table>
      </Modal.Body>
      <Modal.Footer> {this.state.notEnough == 1 && <span style={{color:'red',marginRight:'20px',fontWeight:'bold'}}>Not enough inventory</span>}
        <Button onClick={this.handleClose2}>Cancel</Button> <Button onClick={this.handleSale}>Sell</Button>
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