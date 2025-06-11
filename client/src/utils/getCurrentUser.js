
  const getCurrentUser = () => {
    const user = localStorage.getItem("currentUser");
    //console.log("👤 Current User:", user); // Debugging
    return user ? JSON.parse(user) : null;  // Return null if no user is found
  };
  
  export default getCurrentUser;
  