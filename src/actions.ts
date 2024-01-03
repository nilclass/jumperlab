import { NetlistEntry } from "./jlctlapi"

export type AddNet = { type: 'AddNet' }
export type UpdateNet = { type: 'UpdateNet', index: number, attributes: Partial<NetlistEntry> }
export type RemoveNet = { type: 'RemoveNet', index: number }

export type Action = AddNet | UpdateNet | RemoveNet
