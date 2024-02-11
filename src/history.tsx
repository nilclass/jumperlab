import React, { useContext } from 'react'
import stableStringify from 'json-stable-stringify'
import { sha256 } from 'js-sha256'
import { Netlist } from './jlctlapi'
import { JumperlessStateContext } from './JumperlessState'
import { ModalDialog } from './dialogs'
import { Patch, createPatch } from 'rfc6902'
import './history.scss'

export type NetlistVersion = {
  id: string
  parentId: string | null
  netlist: Netlist
}

export type NetlistHistory = {
  // List of versions. Newest version is first, oldest last.
  versions: Array<NetlistVersion>
  // Index within `versions` of the current version. Normally 0, unless "undo" was used.
  pointer: number
  // Is it possible to "undo"? (`versions[pointer]` does not point to the oldest version)
  canUndo: boolean
  // Is it possible to "redo"? (`versions[pointer]` does not point to the newest version)
  canRedo: boolean
}

// Create empty NetlistHistory, starting with the given netlist.
export function makeNetlistHistory(initialNetlist: Netlist): NetlistHistory {
  return {
    versions: [makeVersion(initialNetlist, null)],
    pointer: 0,
    canUndo: false,
    canRedo: false,
  }
}

export function netlistUndo({ versions, pointer, canUndo }: NetlistHistory): [NetlistHistory, Netlist] {
  if (!canUndo) {
    throw new Error('BUG: cannot undo')
  }
  pointer += 1
  return [
    { versions, pointer, canUndo: versions.length - 1 > pointer, canRedo: true },
    versions[pointer].netlist,
  ]
}

export function netlistRedo({ versions, pointer, canRedo }: NetlistHistory): [NetlistHistory, Netlist] {
  if (!canRedo) {
    throw new Error('BUG: cannot redo')
  }
  pointer -= 1
  return [
    { versions, pointer, canUndo: true, canRedo: pointer > 0 },
    versions[pointer].netlist,
  ]
}

export function historyAddVersion({ versions, pointer }: NetlistHistory, netlist: Netlist): NetlistHistory | null {
  const current = versions[pointer]
  const version = makeVersion(netlist, current.id)
  const retainVersions = pointer === 0 ? versions : versions.slice(pointer)
  if (current.id === version.id) {
    return null
  }
  return {
    versions: [version, ...retainVersions],
    pointer: 0,
    canUndo: true,
    canRedo: false,
  }
}

function makeVersion(netlist: Netlist, parentId: string | null): NetlistVersion {
  return {
    id: netlistId(netlist),
    parentId,
    netlist,
  }
}

function netlistId(netlist: Netlist): string {
  return sha256(stableStringify(netlist))
}

function versionsWithDiff(history: NetlistHistory): Array<{ version: NetlistVersion, diff: Patch | null, isCurrent: boolean }> {
  const versionMap = new Map()
  history.versions.forEach(version => {
    versionMap.set(version.id, version)
  })
  return history.versions.map((version, i) => {
    const parent = version.parentId && versionMap.get(version.parentId)
    const diff = parent ? createPatch(parent.netlist, version.netlist) : null
    return { version, diff, isCurrent: i === history.pointer }
  })
}

export const HistoryDialog: React.FC = () => {
  const { history } = useContext(JumperlessStateContext)

  return (
    <ModalDialog>
      <h3>History</h3>

      <table className='HistoryTable'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Parent ID</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          {versionsWithDiff(history).map(({ version, diff, isCurrent }) => (
            <tr key={version.id} className={`version ${isCurrent ? 'current' : ''}`}>
              <td className='id'>{version.id}</td>
              <td className='id'>{version.parentId || '-'}</td>
              <td>{diff ? <pre>{JSON.stringify(diff, null, 2)}</pre> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModalDialog>
  )
}
