import React from "react";
import {
  View,
  Text,
  Pressable
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { C } from "../styles/colors";

export default function ProductCard({
  product,
  isFavorite,
  onOpen,
  onToggleFavorite,
  onAdd,
  money
}) {
  return (
    <View style={s.product}>

      <Pressable
        onPress={onOpen}
        style={s.productPic}
      >
        <Text style={{ fontSize: 48 }}>
          {product.icon}
        </Text>
      </Pressable>

      <Pressable
        onPress={onToggleFavorite}
        style={s.heart}
      >
        <Text style={s.heartText}>
          {isFavorite ? "♥" : "♡"}
        </Text>
      </Pressable>

      <Text
        style={s.productName}
        onPress={onOpen}
      >
        {product.name}
      </Text>

      <Text style={s.productCategory}>
        {product.category}
      </Text>

      <Text
        style={[
          s.availability,
          {
            color: product.stock > 0 ? "#83B900" : "#FF6B9D"
          }
        ]}
      >
        {product.stock > 0 ? "● Disponible" : "● Agotado"}
      </Text>

      <View style={s.productBottom}>

        <Text style={s.productPrice}>
          {money(product.price)}
        </Text>

        <Pressable
          onPress={onAdd}
          disabled={!product.stock}
          style={[
            s.cartButton,
            !product.stock && { opacity: 0.4 }
          ]}
        >
          <Text style={s.cartButtonText}>
            <Ionicons
              name="cart-outline"
              size={20}
              color={C.bg}
            />
          </Text>
        </Pressable>

      </View>
    </View>
  );
}

const s = {
  product: {
    width: "48%",
    backgroundColor: "#F7F3FC",
    borderRadius: 20,
    padding: 9,
    marginBottom: 15
  },

  productPic: {
    height: 105,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  heart: {
    position: "absolute",
    top: 10,
    right: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2
  },

  heartText: {
    fontSize: 25,
    color: "purple",
    fontWeight: "600"
  },

  productName: {
    fontWeight: "800",
    color: C.bg,
    marginTop: 8
  },

  productCategory: {
    color: "#A69BB8",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600"
  },

  availability: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 5
  },

  productPrice: {
    fontWeight: "900",
    color: "#83B900",
    fontSize: 16
  },

  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8
  },

  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.lime,
    justifyContent: "center",
    alignItems: "center"
  },

  cartButtonText: {
    fontSize: 18
  }
};