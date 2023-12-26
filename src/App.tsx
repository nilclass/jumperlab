import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import './App.css';
import { BoardView } from './BoardView';
import { ConnectionWidget, ConnectionWrapper } from './connection';
import { SettingsWrapper } from './Settings';

function App() {
  return (
    <SettingsWrapper>
      <ConnectionWrapper baseUrl='http://localhost:8080'>
        <ConnectionWidget pollIntervalMs={2000} />
        <BoardView />
      </ConnectionWrapper>
    </SettingsWrapper>
  );
}
export default App;

