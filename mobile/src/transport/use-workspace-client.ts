import { createContext, useContext } from 'react'
import { useHostProtocolGates } from '../components/host-protocol-gates-context'
import { useHostClient } from './host-client-hooks'
import type { RpcClient } from './rpc-client'
import type { ConnectionState } from './types'

// WorkspaceRoute supplies server context; null means unreachable, absent means desktop routing.
type WorkspaceServer = {
  client: RpcClient | null
  state: ConnectionState
  desktopCapabilities: readonly string[]
  name?: string | null
  stopped?: boolean
}

export const WorkspaceServerContext = createContext<WorkspaceServer | undefined>(undefined)

/** The route's host has the capability; a relayed route also needs the paired desktop to forward it. */
export function useRouteCapability(capability: string): boolean {
  const { hostCapabilities } = useHostProtocolGates()
  const server = useContext(WorkspaceServerContext)
  return (
    hostCapabilities.includes(capability) &&
    (server?.desktopCapabilities.includes(capability) ?? true)
  )
}

export function useWorkspaceClient(hostId: string | undefined): ReturnType<typeof useHostClient> & {
  /** The route's own paired host, which stays the phone's peer when a server executes the workspace. */
  pairedHostClient: RpcClient | null
  pairedHostState: ConnectionState
  /** The server that executes this workspace; undefined on desktop routing. */
  workspaceServer: WorkspaceServer | undefined
} {
  const host = useHostClient(hostId)
  const server = useContext(WorkspaceServerContext)
  const pairedHostClient = host.client
  const pairedHostState = host.state
  const paired = { pairedHostClient, pairedHostState, workspaceServer: server }
  return server === undefined
    ? { ...host, ...paired }
    : { ...host, client: server.client, state: server.state, ...paired }
}
