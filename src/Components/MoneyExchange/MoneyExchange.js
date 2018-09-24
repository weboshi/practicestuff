import React, { Component } from 'react';
import { Table, Thead, Modal, Button, InputGroup, FormGroup, FormControl} from 'react-bootstrap';
import { connect } from "react-redux";
import { UPDATE, INITIALIZE, UPDATEAMOUNT } from "../../js/actions/index";

import timestamp from 'unix-timestamp';
import './moneyexchange.css'
import axios from 'axios';
import { Navigation } from '../Navbar/Navbar';


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
  },
  button: {
    backgroundColor: 'yellow'
  }
}

const mapDispatchToProps = dispatch => {
  return {
    UPDATE: newSettings => dispatch(UPDATE(newSettings)),
    INITIALIZE: (firstSettings) => dispatch(INITIALIZE(firstSettings)),
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
      symbols: {EUR: '€', CAD:'C$',  HKD: 'HK$', GBP: '£', JPY: '¥', AUD: 'A$' },
      error: '',
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
    this.getValidationState = this.getValidationState.bind(this)
    this.getExchangeRatesTimer = this.getExchangeRatesTimer.bind(this)
    this.updateRates = this.updateRates.bind(this)
  }

  // Password Authorization.
  authorize = (e) => {
    const password = e.target.querySelector('input[type="password"]').value;
    const auth = password == this.state.password;
    this.setState({
      authorized: auth
    });
  }

// Initializes the initial state in the Redux store, then calls the main function populates the table currency rates.
  makeTheState = () => {
    axios.get('config.json')
      .then(results => { 
        const firstSettings = results.data
        this.props.INITIALIZE(firstSettings)
      }).then(() => {
        this.getCurrencyValue()})
    
  }

//Calls the exchange rates according to the interval defined in the state/settings.
  getExchangeRatesTimer = () => {
    const rateInterval = (this.props.settings.interval * 60000)
    setInterval(this.updateRates(), rateInterval)

  }

  updateRates = () => {
    const access_key = 'b520f09438b3a39356b70de4949ce37c';

    //Getting the currencies for an update
    const currArray = Object.keys(this.props.currencies)

    //Setting the old values and currencies to compare with the new exchange rates later.
    const oldArray = this.state.tableData
    const currValues = currArray.toString()

    axios.get('http://www.apilayer.net/api/live?access_key=' + access_key + '&currencies=' + currValues )
    .then(results => {

      //Splitting the keys and values to update the values, having them in arrays maintains order and allows for them to be pushed together later.
      const newArray = Object.keys(results.data.quotes)
      const valueArray = Object.values(results.data.quotes)
  
      const newRatesArray = [];
      const compareRates = [];
      const finalArray = [];

      //Comparing old rates to new rates

      for (let i=0; i < newArray.length; i++) {
        // if the rates are different, meaning they changed, then push the values into an array to be merged later
        if (oldArray[i].rate == valueArray[i]){
          compareRates.push(newRatesArray[i])
       
        }
        else {
          // if they are the same, no updates have occurred, so we do stochastic to change the rates 
            const flip = Math.random()

            if (flip > .5) {

            let stochastic = (valueArray[i] - ((valueArray[i] * (Math.random() * (0.02 - 0.01) + 0.01))))
            newRatesArray[i] = stochastic

            }
            else {
          
              let stochastic = (valueArray[i] + ((valueArray[i] * (Math.random() * (0.02 - 0.01) + 0.01))))
              newRatesArray[i] = stochastic
            }
         

        }
      }

      //same as the getCurrency function, create new array with new rates that will populate the table

      for (let i=0; i < newArray.length; i++) {

        let currObj = {
        currency: newArray[i].substr(3,6),
          buy: parseFloat((1 / ((newRatesArray[i] * this.props.settings.margin) + (newRatesArray[i])))).toFixed(4),
          sell: parseFloat(1/(((newRatesArray[i]) - (newRatesArray[i] * this.props.settings.margin)))).toFixed(4)
        }

        let amountObj = {...oldArray[i], ...currObj}
        finalArray.push(amountObj)

      }
      
      //Setting the new values, and keeping the old values for another comparison at the next interval update.
      this.setState({
        tableData: finalArray,
        prevTableData: finalArray,
      })

    

    }).catch(error => {
        console.log(error)
        this.setState({
          error: 1
        })

    })

  }

  //The main function that makes the API call and sets the table currency rates.
  getCurrencyValue = () => { 

    const access_key = 'b520f09438b3a39356b70de4949ce37c';
    
    //Setting the main currency before making our API call
    const mainCurrency = this.props.settings.mainCurrency;
    
    axios.get('http://www.apilayer.net/api/live?access_key=' + access_key + '&source=' + mainCurrency)
      .then(results => {
   
        //Splitting the response of rates into keys and values, so we can take only the values we want as defined in the initial state.
        // After looking at the API documentation, we probably could've defined what rates we wanted before the call, but this works.
        const newArray = Object.keys(this.props.currencies)
        const amountArray = Object.values(this.props.currencies)
        const rate = []; 
        const mainCurr = this.props.settings.mainCurrency

        //Little messy, but this creates the string variable so that we can get the values and put them in an array. Relies on array maintaining order.
        const varD = 'results.data.quotes.' + mainCurr

        for (let i=0;i<newArray.length;i++){
            rate[i] = eval(varD + newArray[i])
          }

        var obj = {}
        var mainArray = []

        //After we have our values, we pair them with the proper keys and also fix them to a decimal point.

        for (let i = 0; i < newArray.length; i++) {

            let currObj = {
            currency: newArray[i],
            amount: amountArray[i],
            rate: rate[i],
            buy: parseFloat((1 / ((rate[i] * this.props.settings.margin) + (rate[i])))).toFixed(4),
            sell: parseFloat(1/(((rate[i]) - (rate[i] * this.props.settings.margin)))).toFixed(4)
            };

            mainArray.push(currObj)

        }
    
        //Used a npm package to change unix time for time stamp.
        let timeStamp = (timestamp.toDate(results.data.timestamp)).toString()
        
        const newSettings = obj

        //Here we set the state which will populate table, and also dispatch the rates to update the store state. 
        this.props.UPDATE(newSettings);
        this.setState({
          prevTableData: mainArray,
          tableData: mainArray,
          timeStamp: timeStamp
        }, () => (this.makeTable()))
      
      }).then(
        () => { this.getExchangeRatesTimer()}
      )
  }

  //We initialize the state with compponentDidMount as per react practices.
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

    this.setState({ amountToBuy: event.target.value }, () => {
 
      this.handleTotal();
    });
    console.log(this.props.settings.commission)

  }

  handleChange2(event) {

    this.setState({ amountToBuy: event.target.value }, () => {
 
      this.handleTotal2();
    });
    console.log(this.props.settings.commission)

  }

  //Here we handle the modal logic for buying or selling currencies. This updates the values so amounts are calculated as typed. 
  handleTotal(){
    let subTotal = Number(parseFloat((this.state.amountToBuy * this.state.buyRate)).toFixed(4))
    let totalPurchaseAmount = Number(parseFloat((subTotal + this.props.settings.commission)).toFixed(4))
    
    this.setState({
      subTotal: subTotal,
      totalPurchaseAmount: totalPurchaseAmount
    })
  }

  //Same logic as above but for selling modal.
  handleTotal2(){
    let subTotal = Number(parseFloat((this.state.amountToBuy * this.state.sellRate)).toFixed(4))
    let totalPurchaseAmount = Number(parseFloat((subTotal + this.props.settings.commission)).toFixed(4))
    this.setState({
      subTotal: subTotal,
      totalPurchaseAmount: totalPurchaseAmount
    })
  }

  //Logic for finishing the purchase transaction.
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

  //Logic for selling transaction.
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
      this.props.UPDATE(newObj)
      this.props.UPDATEAMOUNT(newTotal)
      alert('You exchanged ' + this.state.amountToBuy + " " + this.state.modalCurrency + ' for $' + this.state.totalPurchaseAmount)
      this.setState({
        amountToBuy: ''
      }, () => this.getCurrencyValue())
      this.handleClose2()
    }
  }

  //Handles cell clicks for the buying column.
  handleCellClick = (event,row) => {


      const handleString = (event.target.dataset.value).split(',');
      const label = (event.target.id + " " + handleString[0])
      this.setState({
      modalCurrency: handleString[0],
      buyRate: parseFloat(handleString[1]),
      amount: parseFloat(handleString[2]),
      label: label
    })
    this.handleShow()
    console.log(this.state.buyRate)
  
  
  }

  //Handles cell clicks for the selling column. 
  handleCellClick2 = (event,row) => {


    const handleString = (event.target.dataset.value).split(',');
    const label = (event.target.id + " " + handleString[0])

    this.setState({
      modalCurrency: handleString[0],
      sellRate: parseFloat(handleString[1]),
      amount: parseFloat(handleString[2]),
      label: label
    }, () => console.log(this.state.sellRate))
    this.handleShow2()
    
    
  }

  //Putting the symbol currency in the modal for the selected currency.
  makeSymbol(){
    const sign = this.state.modalCurrency
  
    return ( this.state.symbols[sign] )
  }

  //Makes the table by using a for loop to push the rows and the onclick functions so that calls can be clickeked.
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

  getValidationState() {
    const type = typeof(this.state.value)
    if (type == 'number') return 'success';
    else 
    return null;
  }

  render(){

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

    const theExchange = (
      <div className="exchangeMoney">
      <Navigation/>
      <span className='timestamp'>{this.state.error == '' && <span>Exchange rates shown as per {this.state.timeStamp}</span>}. {this.state.error == 1 && <span>Could not retrieve exchange rates.</span>} You have {this.state.amount} {this.props.settings.mainCurrency} left.</span>
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
                    <FormControl type='number' id='amountToBuy' onChange={this.handleChange} value={this.state.amountToBuy}/>
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
        <Button onClick={this.handleClose}>Cancel</Button> <Button style={styles.button} onClick={this.handlePurchase}>Buy</Button>
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
                  <FormControl type='number' id='amountToBuy' onChange={this.handleChange2} value={this.state.amountToBuy}/>
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
        <Button onClick={this.handleClose2}>Cancel</Button> <Button style={styles.button} onClick={this.handleSale}>Sell</Button>
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