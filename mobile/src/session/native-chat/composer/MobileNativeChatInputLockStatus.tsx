import { Pressable, Text, View } from 'react-native'
import { useMobileTranslation } from '../../../i18n/use-mobile-translation'
import { styles } from '../mobile-native-chat-view-styles'
import type { MobileNativeChatHostOutage } from '../mobile-native-chat-host-outage'
import type { MobileNativeChatInputLockReason } from '../MobileNativeChatView'

/** The line above a locked composer: why it waits, or which host is out with Reconnect when that helps. */
export function MobileNativeChatInputLockStatus({
  lockReason,
  waitingText,
  hostOutage,
  onReconnect
}: {
  lockReason: MobileNativeChatInputLockReason | null
  waitingText: string
  hostOutage: MobileNativeChatHostOutage | null
  onReconnect?: () => void
}): React.JSX.Element {
  const t = useMobileTranslation()
  const outage = lockReason === 'disconnected' ? hostOutage : null
  const text = lockReason === 'waiting' ? waitingText : (outage?.text ?? null)
  // Why always mounted: the polite live region must exist before its text changes.
  return (
    <View style={text ? styles.inputLockStatusRow : undefined}>
      <Text style={text ? styles.inputLockStatus : undefined} accessibilityLiveRegion="polite">
        {text}
      </Text>
      {outage?.canReconnect && onReconnect ? (
        <Pressable
          accessibilityRole="button"
          onPress={onReconnect}
          style={({ pressed }) => [styles.retryPill, pressed && styles.retryPillPressed]}
        >
          <Text style={styles.retryPillLabel}>{t('chat.hostOutage.reconnect', 'Reconnect')}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}
