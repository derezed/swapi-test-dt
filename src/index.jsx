import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) throw new Error('The Force is not strong with this one.');

const root = createRoot(container);

root.render(<App />);
