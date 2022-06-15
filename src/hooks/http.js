import { useReducer, useCallback } from 'react';
import axios from 'axios';

const initialState = {
  loading: false,
  error: null,
  data: null,
  parameter: null,
  identifier: null,
};

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return {
        loading: true,
        error: null,
        data: null,
        parameter: null,
        identifier: action.identifier,
      };
    case 'RESPONSE':
      return {
        ...currentHttpState,
        loading: false,
        data: action.responseData,
        parameter: action.parameter,
      };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return initialState;
    default:
      throw new Error('Http reducer error');
  }
};

const useHttp = () => {
  const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

  const clear = useCallback(() => dispatchHttp({ type: 'CLEAR' }), []);

  //   ingredientId
  //   `${dbDomain}${dbName}/${ingredientId}${dbExtension}`,

  //   const dbDomain = 'https://react-router-test-app-default-rtdb.firebaseio.com/';
  //   const dbName = 'ingredients';
  //   const dbExtension = '.json';

  const sendRequest = useCallback(
    (reqUrl, reqMethod, reqBody, reqParameter, reqIdentifier) => {
      dispatchHttp({ type: 'SEND', identifier: reqIdentifier });
      axios({
        method: reqMethod,
        url: reqUrl,
        data: reqBody,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        //   .then((response) => response.data)
        .then((response) => {
          console.log(response);
          dispatchHttp({
            type: 'RESPONSE',
            responseData: response,
            parameter: reqParameter,
          });
          // setIsLoading(false);
          // if (response.status === 200 || response.statusText === 'OK') {
          // setUserIngredients((prevIngredients) =>
          //   prevIngredients.filter(
          //     (ingredient) => ingredient.id !== ingredientId
          //   )
          // );
          // dispatchIngredients({ type: 'DELETE', id: ingredientId });
          // }
        })
        .catch((error) => {
          console.log(error);
          dispatchHttp({ type: 'ERROR', errorMessage: error.message });
          // setError(error.message);
          // setIsLoading(false);
        });
    },
    []
  );

  return {
    isLoading: httpState.loading,
    data: httpState.data,
    error: httpState.error,
    sendRequest,
    reqParameter: httpState.parameter,
    reqIdentifier: httpState.identifier,
    clear,
  };
};

export default useHttp;
