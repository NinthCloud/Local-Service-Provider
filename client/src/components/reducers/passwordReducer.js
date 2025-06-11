export const INITIAL_PASSWORD_STATE = {
    password: "",
    newPassword: "",
    confirmPassword: "",
  };
  export const passwordReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_INPUT":
        return {
          ...state,
          [action.payload.name]: action.payload.value,
        };
      case "RESET_FORM":
        return INITIAL_STATE;
      case "SET_VALIDATION_ERROR":
        return {
          ...state,
          validationError: action.payload,
        };
      case "CLEAR_VALIDATION_ERROR":
        const { validationError, ...rest } = state;
        return rest;
      default:
        return state;
    }
  }; 