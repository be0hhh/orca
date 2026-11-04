import { describe, expect, it } from 'vitest'
import { mobileNativeChatHostOutage } from './mobile-native-chat-host-outage'

const connected = { kind: 'normal', label: 'Connected' } as const
const unreachable = { kind: 'unreachable', label: 'Unreachable', reason: 'stale' } as const

describe('mobileNativeChatHostOutage', () => {
  it.each([
    [
      'an offline desktop offers Reconnect',
      { pairedHostState: 'reconnecting', pairedVerdict: unreachable, canReconnect: true },
      { text: 'Studio Mac is offline', canReconnect: true }
    ],
    [
      'a desktop still retrying offers nothing yet',
      {
        pairedHostState: 'reconnecting',
        pairedVerdict: { kind: 'normal', label: 'Reconnecting…', dialing: true },
        canReconnect: false
      },
      { text: 'Studio Mac is reconnecting…', canReconnect: false }
    ],
    [
      'a stopped server distro is text only',
      {
        pairedHostState: 'connected',
        pairedVerdict: connected,
        canReconnect: true,
        server: { state: 'connecting', name: 'Ubuntu', stopped: true }
      },
      { text: 'Ubuntu is stopped. Start it on your computer.', canReconnect: false }
    ],
    [
      'an offline server cannot be redialled from the phone',
      {
        pairedHostState: 'connected',
        pairedVerdict: connected,
        canReconnect: true,
        server: { state: 'disconnected', name: 'Build box' }
      },
      { text: 'Build box is offline', canReconnect: false }
    ]
  ] as const)('%s', (_name, args, expected) => {
    expect(mobileNativeChatHostOutage({ hostName: 'Studio Mac', ...args })).toEqual(expected)
  })
})
