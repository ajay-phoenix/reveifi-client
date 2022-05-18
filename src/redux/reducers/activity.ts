const initialActivities = {
    activities: [],
};

const activities = (state = initialActivities, action: any) => {
    switch (action.type) {
        case "ACTIVITIES_SET":
            return {...state, activities: action.payload};

        case "ACTIVITIES_GET":
            return state.activities;

        default:
            return state;
    }
};

export default activities;
