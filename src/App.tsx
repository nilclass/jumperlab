import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import './App.css';
import { BoardView } from './BoardView';
import { ConnectionWrapper } from './connection';
import { SettingsWrapper } from './Settings';
import { Toolbar } from './Toolbar';

function App() {
  return (
    <SettingsWrapper>
      <ConnectionWrapper baseUrl='http://localhost:8080'>
        <Toolbar />
        <BoardView />
      </ConnectionWrapper>
    </SettingsWrapper>
  );
}
export default App;

