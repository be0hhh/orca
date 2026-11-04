import { createContext } from 'react'

/** What a notice row needs: the Orca host behind the chat (null when unnamed), the agent, and a host terminal for its actions. */
export type MobileNativeChatNoticeNames = {
  hostName: string | null
  agentName?: string
  /** Opens a host terminal tab in the chat's workspace running `command`. */
  onRunInTerminal?: (command: string) => void
}

export const MobileNativeChatNoticeContext = createContext<MobileNativeChatNoticeNames>({
  hostName: null
})
