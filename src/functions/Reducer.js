const Reducer = (state, action) => {
    switch (action.type) {
        case 'SET_AUTH':
            return {
                ...state,
                auth: action.payload
            };
        case 'SET_PATH':
            return {
                ...state,
                appPath: action.payload
            };
        default:
            return state;
    }
};
export default Reducer;