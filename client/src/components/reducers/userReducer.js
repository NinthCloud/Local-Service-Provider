export const INITIAL_STATE = {
  userId: null,
  username: "",
  fullName: "",
  email: "",
  password: "",
  image: "",
  city: "",
  address: "",
  pincode: "",
  phone: "",
  desc2: "",
  // provider specific details
  desc: "",
  isSeller: false,
  appliedForProvider: false,
  providerName: "",
  providerAddress: "",
  providerEmail: "",
  providerPhone: "",
  serviceLevel: "",
  experience: "",
  profession: "",
  serviceHours: "",
  verify: "",
  dob: "",
};

export const userReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_INPUT":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    case "SET_USER_INFO":
      const { _id, password, ...filteredData } = action.payload;
      return {
        ...state,
        ...filteredData,
      };
    case "ADD_IMAGE":
      return {
        ...state,
        image: action.payload,
      };
    case "ADD_VERIFY":
      return {
        ...state,
        verify: action.payload,
      };
    case "TOGGLE_SELLER_STATUS":
      return {
        ...state,
        isSeller: !state.isSeller,
        appliedForProvider: !state.isSeller,
      };
    default:
      return state;
  }
};
