import React, { useReducer, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
// import axios from 'axios';
import useHttp from '../../hooks/http';

const ingredientReducer = (ingredientState, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...ingredientState, action.ingredient];
    case 'DELETE':
      return ingredientState.filter(
        (ingredient) => ingredient.id !== action.id
      );
    default:
      throw new Error('Ingredients reducer error');
  }
};

const Ingredients = () => {
  const [userIngredients, dispatchIngredients] = useReducer(
    ingredientReducer,
    []
  );

  const {
    isLoading,
    data,
    error,
    sendRequest,
    reqParameter,
    reqIdentifier,
    clear,
  } = useHttp();

  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  const requestData = useCallback(() => {
    sendRequest(process.env.REACT_APP_FIREBASE_API_URL, 'GET');
    // axios
    //   .get(process.env.REACT_APP_FIREBASE_API_URL)
    //   .then((response) => response.data)
    //   .then((responseData) => {
    //     const loadedIngredients = [];
    //     for (const key in responseData) {
    //       loadedIngredients.push({
    //         id: key,
    //         title: responseData[key].title,
    //         amount: responseData[key].amount,
    //       });
    //     }
    //     // setUserIngredients(loadedIngredients);
    //     dispatchIngredients({ type: 'SET', ingredients: loadedIngredients });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatchHttp({ type: 'ERROR', errorMessage: error.message });
    //     // setError(error.message);
    //   });
  }, [sendRequest]);

  // useEffect(() => requestData(), [requestData]);
  useEffect(() => {
    requestData();
    if (!isLoading) {
      if (error && error.message) {
        console.log(error.message);
      } else if (data) {
        console.log(data);
        const loadedIngredients = [];
        for (const key in data) {
          loadedIngredients.push({
            id: key,
            title: data[key].title,
            amount: data[key].amount,
          });
        }
        console.log(loadedIngredients);
        dispatchIngredients({ type: 'SET', ingredients: loadedIngredients });
      }
    }
  }, [requestData, isLoading, error, data]);

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatchIngredients({ type: 'DELETE', id: reqParameter });
    } else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatchIngredients({
        type: 'ADD',
        ingredient: { id: data.name, ...reqParameter },
      });
    }
  }, [data, reqParameter, reqIdentifier, isLoading, error]);

  const addIngredientHandler = useCallback(
    (ingredient) => {
      sendRequest(
        process.env.REACT_APP_FIREBASE_API_URL,
        'POST',
        JSON.stringify(ingredient),
        null,
        'ADD_INGREDIENT'
      );
      // dispatchHttp({ type: 'SEND' });
      // // setIsLoading(true);
      // // URL from .env file
      // axios
      //   .post(process.env.REACT_APP_FIREBASE_DB_URL, JSON.stringify(ingredient))
      //   .then((response) => {
      //     dispatchHttp({ type: 'RESPONSE' });
      //     // setIsLoading(false);
      //     console.log(response);
      //     // setUserIngredients((prevIngredients) => [
      //     //   ...prevIngredients,
      //     //   { id: response.data.name, ...ingredient },
      //     // ]);
      //     dispatchIngredients({
      //       type: 'ADD',
      //       ingredient: { id: response.data.name, ...ingredient },
      //     });
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     dispatchHttp({ type: 'ERROR', errorMessage: error.message });
      //     // setError(error.message);
      //   });
    },
    [sendRequest]
  );

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setUserIngredients(filteredIngredients);
    dispatchIngredients({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const removeIngredientHandler = useCallback(
    (ingredientId) => {
      const dbDomain =
        'https://react-router-test-app-default-rtdb.firebaseio.com/';
      const dbName = 'ingredients';
      const dbExtension = '.json';

      sendRequest(
        `${dbDomain}${dbName}/${ingredientId}${dbExtension}`,
        'DELETE',
        null,
        ingredientId,
        'REMOVE_INGREDIENT'
      );

      // dispatchHttp({ type: 'SEND' });
      // setIsLoading(true);
    },
    [sendRequest]
  );

  // const clearError = useCallback(() => {
  //   clear();
  //   // setError(null);
  // }, [clear]);

  return (
    <div className='App'>
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
