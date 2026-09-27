import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export interface VoiceSpeakerRef {
  speak: (text: string, langCode?: string) => void;
  stop: () => void;
}

export const VoiceAdvisorySpeaker = forwardRef<VoiceSpeakerRef, {}>((props, ref) => {
  const webViewRef = useRef<any>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <script>
          window.speakText = function(text, lang) {
            if (!window.speechSynthesis) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang || 'hi-IN';
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          };

          window.stopSpeaking = function() {
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          };

          document.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.action === 'speak') {
                window.speakText(data.text, data.lang);
              } else if (data.action === 'stop') {
                window.stopSpeaking();
              }
            } catch(e) {}
          });
        </script>
      </body>
    </html>
  `;

  useImperativeHandle(ref, () => ({
    speak: (text: string, langCode: string = 'hi-IN') => {
      const code = langCode.startsWith('en') ? 'en-IN' : 'hi-IN';
      const payload = JSON.stringify({ action: 'speak', text, lang: code });
      webViewRef.current?.postMessage(payload);
    },
    stop: () => {
      const payload = JSON.stringify({ action: 'stop' });
      webViewRef.current?.postMessage(payload);
    },
  }));

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      {/* @ts-ignore */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 0,
    height: 0,
    opacity: 0,
    position: 'absolute',
  },
});
