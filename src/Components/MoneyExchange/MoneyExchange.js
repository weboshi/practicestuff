import React, { Component } from 'react';
import { Table, Thead, Modal, Header, Body, Button, Title, OverlayTrigger, Popover, Tooltip, InputGroup, FormGroup, FormControl} from 'react-bootstrap';
import { connect } from "react-redux";
import { UPDATE } from "../../js/actions/index";
import { INITIALIZE } from '../../js/actions/index';
import timestamp from 'unix-timestamp';
import './moneyexchange.css'
import axios from 'axios';
import { Navigation } from '../Navbar/Navbar';
import BootstrapTable from 'react-bootstrap-table-next';

const columns = [{
  dataField: 'currency',
  text: 'Currency'
}, {
  dataField: 'buy',
  text: 'Buy Rate'
}, {
  dataField: 'sell',
  text: 'Sell Rate'
}, {
  dataField: 'amount',
  text: 'Amount',
}];


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
      password: 'treehouse',
      notEnough: false
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
  

        const newArray = Object.keys(this.props.currencies)
        const amountArray = Object.values(this.props.currencies)
         
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
            sell: parseFloat((1/(((rate[i]) - (rate[i] * this.props.settings.margin)))).toFixed(4))
            };

            mainArray.push(currObj)

        }
        console.log(mainArray)
        console.log(results.data.timestamp)

        let timeStamp = (timestamp.toDate(results.data.timestamp)).toString()
        console.log(typeof(timeStamp))
       
        let newSettings = obj

        this.props.UPDATE(newSettings);
        this.setState({
          tableData: mainArray,
          timeStamp: timeStamp
        }, () => (console.log(this.state.timeStamp)))
      
      })
  }

  componentDidMount() {
    this.getCurrencyValue()
  }

  handleClose() {
    this.setState({ show: false, amountToBuy: '' }, (console.log(this.state.amountToBuy)));
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleChange(event) {
    console.log(this.props.settings.commission)
    this.setState({ amountToBuy: event.target.value }, () => {
 
      this.handleTotal();
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

  handlePurchase(){
    const newAmount = (this.props.settings.amount - this.state.totalPurchaseAmount)
    if(newAmount < 0) {

      console.log('not enough funds')
      this.setState({
        notEnough: 1,
      })
    }
    else{
      console.log(newAmount)
      this.props.UPDATE(newAmount)
    }
  
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

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      console.log(row)
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
      <span>Exchange rates shown as per {this.state.timeStamp}</span>
      <BootstrapTable keyField='id' data={ this.state.tableData } columns={ columns } rowEvents={ rowEvents } />
      <div className="table-div">
      <Modal show={this.state.show} onHide={this.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Buy {this.state.modalCurrency}</Modal.Title>
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
          <tr>
            <td style={{border:0}}>Exchange Rate</td>
            <td>{this.state.buyRate}</td>
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
          <tr>
            <td>Total</td>
            <td>{this.state.totalPurchaseAmount}</td>
          </tr>
        </tbody>
      </Table>
      </Modal.Body>
      <Modal.Footer> {this.state.notEnough == 1 && <span style={{color:'red',marginRight:'20px',fontWeight:'bold'}}>Not enough funds</span>}
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