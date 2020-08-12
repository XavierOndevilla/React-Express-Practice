import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Header from './components/header/Header';
import Form from './components/form/Form';

ReactDOM.render(
  <React.StrictMode>
    <Header />
    {<Form />}
  </React.StrictMode>,
  document.getElementById('root')
);
