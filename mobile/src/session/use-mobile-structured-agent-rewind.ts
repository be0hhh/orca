import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AGENT_SESSION_CONVERSATION_COMMAND_TIMEOUT_MS } from '../../../src/shared/agent-session/agent-session-conversation-command'
import type { AgentSessionRewindResult } from '../../../src/shared/agent-session/lifecycle/agent-session-rewind'
import {
  createAgentSessionRewindHook,
  type AgentSessionRewindInput,
  type AgentSessionRewindSendOutcome
} from '../../../src/shared/agent-session/lifecycle/agent-session-rewind-request'
import type { StructuredAgentSessionState } from '../../../src/shared/agent-session/structured-agent-session-reducer'
import type { RpcClient } from '../transport/rpc-client'
import { sayMobileNativeChatRewind } from './native-chat/mobile-native-chat-rewind-copy'
import { requestStructuredAgentSessionMutation } from './mobile-structured-agent-session-rpc'
import { returnMobileNativeChatMessageToComposer } from './mobile-native-chat-message-hand-back'
import type { useMobileStructuredAgentOptions } from './use-mobile-structured-agent-options'

const useAgentSessionRewind = createAgentSessionRewindHook(
  { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState },
  sayMobileNativeChatRewind
)
const presentation = () => () => true

/** Desktop's "Rewind to here" for a phone chat; null `client` or a host without phone rewind offers none. */
export function useMobileStructuredAgentRewind(args: {
  client: RpcClient | null
  sessionId: string | null
  enabled: boolean
  /** The host lets a phone call agentSession.rewind. */
  offered: boolean
  state: StructuredAgentSessionState
  stateRef: { readonly current: StructuredAgentSessionState }
  options: Pick<
    ReturnType<typeof useMobileStructuredAgentOptions>,
    'rewindSupport' | 'rewindBlockedReason'
  >
  blocked: boolean
  composerScopeKey?: string | null
  agentName?: string
  notify: (text: string) => void
}) {
  const { agentName, blocked, client, composerScopeKey, enabled, notify, offered, sessionId } = args
  const { state, stateRef } = args
  const { rewindSupport, rewindBlockedReason } = args.options
  const send = useCallback(
    async (fields: {
      itemId: string
      expectedEpoch: string
    }): Promise<AgentSessionRewindSendOutcome> => {
      const fence = stateRef.current.fence
      if (!client || !sessionId || !enabled || fence === null) {
        return { kind: 'dropped' }
      }
      const result = await requestStructuredAgentSessionMutation<AgentSessionRewindResult>({
        client,
        method: 'agentSession.rewind',
        fingerprintMethod: 'agentSession.rewind',
        sessionId,
        expectedRuntimeFence: fence,
        fields,
        // The host may start an agent at rest before rewinding it, as it does for a command.
        timeoutMs: AGENT_SESSION_CONVERSATION_COMMAND_TIMEOUT_MS,
        ...(agentName ? { agentName } : {})
      })
      return result.status === 'accepted'
        ? { kind: 'done', value: result.value }
        : {
            kind: 'not-done',
            failure: result.status === 'unknown' ? { kind: 'unconfirmed' } : result.failure
          }
    },
    [agentName, client, enabled, sessionId, stateRef]
  )
  const input = useMemo<AgentSessionRewindInput>(
    () => ({
      sessionId: sessionId ?? '',
      capturePresentation: presentation,
      ...(composerScopeKey
        ? {
            returnToComposer: (itemId, blocks) =>
              returnMobileNativeChatMessageToComposer(composerScopeKey, `rewound-${itemId}`, blocks)
          }
        : {}),
      state,
      contextFloor: rewindSupport?.contextFloor,
      support: offered && enabled ? rewindSupport?.support : undefined,
      hostBlockedReason: rewindBlockedReason,
      blocked,
      send,
      notify: { error: notify, message: notify }
    }),
    [
      blocked,
      composerScopeKey,
      enabled,
      notify,
      offered,
      rewindBlockedReason,
      rewindSupport,
      send,
      sessionId,
      state
    ]
  )
  return useAgentSessionRewind(input)
}
