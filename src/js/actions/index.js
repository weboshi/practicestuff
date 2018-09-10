import { initialSettings, updateSettings, updateAmount } from "../constants/action-types";

export const INITIALIZE = firstSettings => ({ type: initialSettings, payload: firstSettings })
export const UPDATE = newSettings => ({ type: updateSettings, payload: newSettings });
export const UPDATEAMOUNT = newTotal => ({ type:updateAmount, payload: newTotal});
