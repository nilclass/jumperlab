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

function App() {
  return (
    <SettingsWrapper>
      <ConnectionWrapper baseUrl='http://localhost:8080'>
        <JumperlessState>
          <DialogWrapper>
            <InteractionController>
              <div className='App'>
                {/* <NodeDetails node={selectedNode} mode={mode} onSetMode={handleSetMode} /> */}
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
