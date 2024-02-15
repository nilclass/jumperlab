import React from 'react';
import './App.scss';
import { BoardView } from './BoardView';
import { ConnectionWrapper } from './connection';
import { DialogWrapper } from './dialogs';
import { InteractionController } from './interaction';
import { JumperlessState } from './JumperlessState';
import { SettingsWrapper } from './Settings';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';

const defaultJlctlUrl = 'http://localhost:8080'

function App() {
  const jlctlUrl = new URLSearchParams(document.location.search).get('jlctl') || defaultJlctlUrl

  return (
    // Provides UI settings
    <SettingsWrapper>

      {/* Provides connection to the jlctl server */}
      <ConnectionWrapper baseUrl={jlctlUrl}>

        {/* Manages the board state (in-memory state and synchronization) */}
        <JumperlessState>

          {/* Manages modal dialogs */}
          <DialogWrapper>

            {/* Manages interactions with the board (mode, selection, highlight) */}
            <InteractionController>

              <div className='App'>
                <Toolbar />
                <div className='main'>
                  <BoardView />
                  <Sidebar />
                </div>
              </div>

            </InteractionController>
          </DialogWrapper>
        </JumperlessState>
      </ConnectionWrapper>
    </SettingsWrapper>
  );
}
export default App;
