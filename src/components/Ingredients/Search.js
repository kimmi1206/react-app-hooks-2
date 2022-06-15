import React, { useState, useEffect, useCallback, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';
// import axios from 'axios';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

const Search = React.memo((props) => {
  const { onLoadIngredients } = props;
  const [filterWord, setFilterWord] = useState('');
  const [isFirstRun, setIsFirstRun] = useState(true);
  const inputRef = useRef();
  const { isLoading, data, error, sendRequest, clear } = useHttp();

  const requestData = useCallback(() => {
    const isNotEmptyFilter = filterWord.length > 0;

    const timerId = setTimeout(() => {
      if (!isFirstRun) {
        if (filterWord === inputRef.current.value) {
          const query = isNotEmptyFilter
            ? `&orderBy="title"&equalTo="${filterWord}"`
            : '';
          sendRequest(process.env.REACT_APP_FIREBASE_API_URL + query, 'GET');

          // axios
          //   .get(process.env.REACT_APP_FIREBASE_API_URL + query)
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
          //     onLoadIngredients(loadedIngredients);
          //   })
          //   .catch((error) => {
          //     console.log(error);
          //   });
        }
      } else if (isNotEmptyFilter) {
        setIsFirstRun(false);
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [filterWord, inputRef, isFirstRun, sendRequest]);

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
        onLoadIngredients(loadedIngredients);
      }
    }
  }, [requestData, isLoading, error, data, onLoadIngredients]);

  return (
    <section className='search'>
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <Card>
        <div className='search-input'>
          <label>Filter by Title</label>
          {isLoading && <span>Loading...</span>}
          <input
            ref={inputRef}
            type='text'
            value={filterWord}
            onChange={(event) => setFilterWord(event.target.value)}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
