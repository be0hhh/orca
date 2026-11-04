import { useMemo } from 'react'
import type { NativeChatMessage } from '../../../../../src/shared/native-chat/native-chat-types'
import { triggerMediumImpact } from '../../../platform/haptics'
import { MobileNativeChatImageViewer } from '../visual/MobileNativeChatImageViewer'
import { MobileNativeChatMessageActionsSheet } from './MobileNativeChatMessageActionsSheet'
import {
  MobileNativeChatRowOverlaysContext,
  type MobileNativeChatViewedImage
} from './mobile-native-chat-row-overlays'
import {
  useMobileNativeChatConversationState,
  type MobileNativeChatConversation
} from '../use-mobile-native-chat-conversation-state'
import type { MobileNativeChatImageSource } from '../visual/mobile-native-chat-image-preview'
import type { AgentSessionRewindSurface } from '../../../../../src/shared/agent-session/lifecycle/agent-session-rewind-request'

export function MobileNativeChatRowOverlaysHost({
  conversation,
  imageSource,
  rewind,
  children
}: {
  conversation: MobileNativeChatConversation
  imageSource?: MobileNativeChatImageSource
  rewind?: AgentSessionRewindSurface
  children?: React.ReactNode
}): React.JSX.Element {
  // Keep pressed message text with its conversation so streaming cannot rewrite an open sheet.
  const [shown, setShown] = useMobileNativeChatConversationState<{
    image?: MobileNativeChatViewedImage
    actionsFor?: NativeChatMessage
    rewindable?: boolean
  }>(conversation)
  const overlays = useMemo(
    () => ({
      openImage: (image: MobileNativeChatViewedImage) => setShown({ image }),
      openActions: (actionsFor: NativeChatMessage, rewindable?: boolean) => {
        triggerMediumImpact()
        setShown({ actionsFor, rewindable })
      },
      imageSource
    }),
    [setShown, imageSource]
  )
  // Memoize overlay callbacks so streamed words cannot rebuild them.
  const opened = useMemo(() => {
    const close = () => setShown(null)
    return shown?.image ? (
      <MobileNativeChatImageViewer {...shown.image} onClose={close} />
    ) : shown?.actionsFor ? (
      <MobileNativeChatMessageActionsSheet
        message={shown.actionsFor}
        rewind={
          shown.rewindable && rewind?.eligibleItemIds?.has(shown.actionsFor.id) !== false
            ? rewind
            : undefined
        }
        onClose={close}
      />
    ) : null
  }, [shown, setShown, rewind])
  return (
    <MobileNativeChatRowOverlaysContext.Provider value={overlays}>
      {children}
      {opened}
    </MobileNativeChatRowOverlaysContext.Provider>
  )
}
