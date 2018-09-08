import { updateSettings } from "../constants/action-types";
import { initialSettings } from "../constants/action-types";


const initialState = {
  currencies: {EUR: 1000, CAD: 1000, GBP: 1000, VND: 1000, HKD: 1000, AUD: 1000, JPY: 1000},
  settings: {margin: .02, commission: '', eurbuy: '9', eursell: '9', cadbuy: '9', cadsell: '9', exchangeRate: '9', amount: '100'}
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case initialSettings:
      return {...state, currencies:{...action.payload}, settings: {...action.payload}}
    case updateSettings:
      return {...state, settings: {...state.settings, ...action.payload}}
    default:
      return state;
  }
};
export default rootReducer;