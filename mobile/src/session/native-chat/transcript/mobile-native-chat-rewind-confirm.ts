import { Alert } from 'react-native'
import { translate } from '../../../i18n/mobile-i18n'

/** Desktop's Rewind confirmation, as a native alert; dismissing it cancels. */
export function confirmMobileNativeChatRewind(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      translate('chat.rewind.title', 'Rewind to here?'),
      translate(
        'chat.rewind.confirmation',
        'Discard this message and everything after it? The message returns to the composer so you can edit and resend it. File changes on disk are kept.'
      ),
      [
        {
          text: translate('common.cancel', 'Cancel'),
          style: 'cancel',
          onPress: () => resolve(false)
        },
        {
          text: translate('chat.rewind.confirm', 'Rewind'),
          style: 'destructive',
          onPress: () => resolve(true)
        }
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    )
  })
}
