import { initialSettings, updateSettings } from "../constants/action-types";

export const INITIALIZE = firstSettings => ({ type: initialSettings, payload: firstSettings })
export const UPDATE = newSettings => ({ type: updateSettings, payload: newSettings });
