import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { C } from "../styles/colors";

export default function Button({
  title,
  onPress,
  disabled = false,
  outline = false
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        s.button,
        outline && s.outline,
        disabled && { opacity: 0.4 }
      ]}
    >
      <Text
        style={[
          s.buttonText,
          outline && { color: C.white }
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    backgroundColor: C.lime,
    padding: 13,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 9
  },
  buttonText: {
    color: C.bg,
    fontWeight: "900"
  },
  outline: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.muted
  }
});