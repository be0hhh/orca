import { createContext } from 'react'
import type { NativeChatMessage } from '../../../../../src/shared/native-chat/native-chat-types'
import type { MobileNativeChatImageSource } from '../visual/mobile-native-chat-image-preview'

export type MobileNativeChatViewedImage = { uri: string; label: string }

// Keep overlays above replaceable rows so echo/transcript swaps cannot close a selected image or actions sheet.
export type MobileNativeChatRowOverlays = {
  openImage: (image: MobileNativeChatViewedImage) => void
  /** `rewindable`: the row is one the chat may rewind to, as desktop's `nativeChatRowOffersRewind`. */
  openActions: (message: NativeChatMessage, rewindable?: boolean) => void
  /** Reads host image paths the phone cannot load itself. */
  imageSource?: MobileNativeChatImageSource
}

export const MobileNativeChatRowOverlaysContext = createContext<MobileNativeChatRowOverlays>({
  openImage: () => {},
  openActions: () => {}
})
