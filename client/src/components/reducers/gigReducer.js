export const INITIAL_STATE = {
  providerId: null,
  title: "",
  cat: "",
  categoryId: null,
  cover: "",
  images: [],
  desc: "",
  shortTitle: "",
  shortDesc: "",
  avgServiceTime: "",
  revisionNumber: "0",
  features: [],
  price: 0,
  sales: 0,
  isUnlisted: false,
  availability: [], // New field for availability
  //not for display rather filtration based on location
  locationA: [],
  locationB: [],
};

export const gigReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER_ID":
      return {
        ...state,
        providerId: action.payload,
      };
    case "CHANGE_INPUT":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    case "SELECT_CATEGORY":
      return {
        ...state,
        categoryId: action.payload.id,
        cat: action.payload.name, // Still update the cat field for backward compatibility
      };
    case "ADD_IMAGES":
      return {
        ...state,
        cover: action.payload.cover,
        images: action.payload.images,
      };
    case "ADD_FEATURE":
      return {
        ...state,
        features: [...state.features, action.payload],
      };
    case "REMOVE_FEATURE":
      return {
        ...state,
        features: state.features.filter(
          (feature) => feature !== action.payload
        ),
      };
    case "SET_GIG": // New action type to set the gig data
      return {
        ...state,
        ...action.payload,
        locationB: action.payload.locationB || [],
        locationA: action.payload.locationA || [],
      };
    case "UPDATE_AVAILABILITY":
      return {
        ...state,
        availability: action.payload, // Update availability
      };
    case "ADD_PINCODE":
      return {
        ...state,
        locationA: [...(state.locationA || []), action.payload],
      };
    case "REMOVE_PINCODE":
      return {
        ...state,
        locationA: (state.locationA || []).filter(
          (pincode) => pincode !== action.payload
        ),
      };
    case "ADD_CITY":
      //console.log("Adding city:", action.payload);
      return {
        ...state,
        locationB: [...(state.locationB || []), action.payload], // Ensure state.locationB is an array
      };

    case "REMOVE_CITY":
      //console.log("Removing city:", action.payload);
      return {
        ...state,
        locationB: (state.locationB || []).filter(
          (city) => city !== action.payload
        ),
      };

    default:
      return state;
  }
};
