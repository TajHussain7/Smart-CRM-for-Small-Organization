import { forwardRef, type ComponentRef } from 'react';
import { Text as NativeText, TextInput as NativeTextInput, StyleSheet, useWindowDimensions, type TextProps, type TextInputProps } from 'react-native';

// Modest width scaling keeps phones readable without oversized tablet headings.
export function fontSizeForWidth(size: number, width: number) {
  const scale = Math.min(1.08, Math.max(0.94, width / 390));
  return Math.round(Math.max(12, size * scale) * 10) / 10 - 1;
}

export const Text = forwardRef<ComponentRef<typeof NativeText>, TextProps>(function ResponsiveText({ style, ...props }, ref) {
  const { width } = useWindowDimensions();
  const flat = StyleSheet.flatten(style);
  const fontSize = fontSizeForWidth(flat?.fontSize ?? 14, width);
  const lineHeight = Math.max(fontSize * 1.3, (flat?.lineHeight ?? 0) * fontSize / (flat?.fontSize ?? 14));
  return <NativeText ref={ref} {...props} style={[{ flexShrink: 1 }, style, { fontSize, lineHeight }]} />;
});

export const TextInput = forwardRef<ComponentRef<typeof NativeTextInput>, TextInputProps>(function ResponsiveInput({ style, ...props }, ref) {
  const { width } = useWindowDimensions();
  const flat = StyleSheet.flatten(style);
  return <NativeTextInput ref={ref} {...props} style={[{ minWidth: 0 }, style, { fontSize: Math.max(15, fontSizeForWidth(flat?.fontSize ?? 16, width)) }]} />;
});
