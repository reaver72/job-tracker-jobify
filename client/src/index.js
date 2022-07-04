import React from 'react'
import ReactDOM from 'react-dom'
import 'normalize.css'
import './index.css'
import App from './App'
import { AppProvider } from './context/appContext'

ReactDOM.render(
    <AppProvider>
      <App />
    </AppProvider>,
  document.getElementById('root')
)
