import api from '../utils/api';
import { userLoaded, authError } from '../slices/authSlice';

// Load User
export const loadUser = () => async (dispatch) => {
    try {
        const res = await api.get('/auth/me');
        dispatch(userLoaded(res.data));
    } catch (err) {
        dispatch(authError());
    }
};
