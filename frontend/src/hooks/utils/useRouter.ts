import queryString from 'query-string';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams, useResolvedPath } from 'react-router-dom';

export const useRouter = () => {
    const params = useParams();
    const location = useLocation();
    const history = useNavigate();
    const match = useResolvedPath('').pathname;

    return useMemo(() => {
        return {
            pathname: location.pathname,
            query: {
                ...queryString.parse(location.search),
                ...params,
            },
            match,
            location,
            history,
        };
    }, [params, match, location, history]);
};
