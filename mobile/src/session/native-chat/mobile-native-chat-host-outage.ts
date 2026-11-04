import { isConnectionOutage, type ConnectionVerdict } from '../../transport/connection-health'
import type { ConnectionState } from '../../transport/types'
import { translate, type Translate } from '../../i18n/mobile-i18n'

/** The composer's status line while the chat's host is out, and whether Reconnect can help. */
export type MobileNativeChatHostOutage = { text: string; canReconnect: boolean }

/** Name the link that is down: the paired desktop, or the server behind it that the phone cannot start or redial. */
export function mobileNativeChatHostOutage(
  args: {
    pairedHostState: ConnectionState
    /** The session's verdict on the paired desktop link. */
    pairedVerdict: ConnectionVerdict
    hostName: string
    /** The session header's Reconnect is offered, so the composer can offer it too. */
    canReconnect: boolean
    server?: { state: ConnectionState; name?: string | null; stopped?: boolean }
  },
  t: Translate = translate
): MobileNativeChatHostOutage | null {
  const { pairedVerdict: verdict } = args
  if (args.pairedHostState !== 'connected') {
    if (verdict.kind === 'auth-failed') {
      return { text: verdict.label, canReconnect: false }
    }
    const offline = isConnectionOutage(verdict)
    return {
      text: offline
        ? t('chat.hostOutage.offline', '{{hostName}} is offline', { hostName: args.hostName })
        : t('chat.hostOutage.reconnecting', '{{hostName}} is reconnecting…', {
            hostName: args.hostName
          }),
      canReconnect: offline && args.canReconnect
    }
  }
  const { server } = args
  if (!server || server.state === 'connected') {
    return null
  }
  const hostName = server.name || t('chat.hostOutage.server', 'The server')
  // Why no action: a phone never starts or redials the desktop's servers.
  if (server.stopped) {
    return {
      text: t('chat.hostOutage.stopped', '{{hostName}} is stopped. Start it on your computer.', {
        hostName
      }),
      canReconnect: false
    }
  }
  return {
    text:
      server.state === 'disconnected'
        ? t('chat.hostOutage.offline', '{{hostName}} is offline', { hostName })
        : t('chat.hostOutage.reconnecting', '{{hostName}} is reconnecting…', { hostName }),
    canReconnect: false
  }
}
