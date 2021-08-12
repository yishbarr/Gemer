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
        case 'ADD_ROOM':
            return {
                ...state,
                rooms: state.rooms.concat(action.payload)
            }
        case 'CLEAR_ROOMS':
            return {
                ...state,
                rooms: []
            }
        default:
            return state;
    }
};
export default Reducer;