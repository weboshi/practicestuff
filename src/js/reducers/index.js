import { updateSettings } from "../constants/action-types";
import { initialSettings } from "../constants/action-types";
import { updateAmount } from "../constants/action-types";


const initialState = {
  currencies: {},
  settings: {},
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case initialSettings:
      return {...action.payload}
    case updateSettings:
      return {...state,  settings: {...state.settings, ...action.payload}}
      case updateAmount:
      return {...state, currencies:{...state.currencies, ...action.payload}}
    default:
      return state;
  }
};
export default rootReducer;